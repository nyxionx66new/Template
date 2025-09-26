'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  reload,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User, Principal } from '@/types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  emailVerified: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Partial<Principal>) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  checkEmailVerification: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Register new principal
  async function register(email: string, password: string, userData: Partial<Principal>) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Send email verification
    await sendEmailVerification(user);

    // Create user document in Firestore
    const userDoc = {
      id: user.uid,
      email: user.email!,
      role: 'principal' as const,
      emailVerified: user.emailVerified,
      createdAt: serverTimestamp(),
      ...userData,
    };

    await setDoc(doc(db, 'users', user.uid), userDoc);

    // Create school document
    const schoolDoc = {
      id: `school_${user.uid}`,
      name: userData.schoolName!,
      address: '',
      principalId: user.uid,
      settings: {
        departments: [
          'Mathematics',
          'Science',
          'English',
          'Social Studies',
          'Physical Education',
          'Arts',
          'Music',
        ],
        gradeLevels: [
          'Grade 1',
          'Grade 2',
          'Grade 3',
          'Grade 4',
          'Grade 5',
          'Grade 6',
          'Grade 7',
          'Grade 8',
          'Grade 9',
          'Grade 10',
          'Grade 11',
          'Grade 12',
        ],
        subjects: [
          'Mathematics',
          'Physics',
          'Chemistry',
          'Biology',
          'English Literature',
          'English Language',
          'History',
          'Geography',
          'Physical Education',
          'Art',
          'Music',
          'Computer Science',
        ],
      },
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'schools', `school_${user.uid}`), schoolDoc);
    
    // Set email verification state
    setEmailVerified(user.emailVerified);
  }

  // Login user
  async function login(email: string, password: string): Promise<void> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Set email verification state
    setEmailVerified(user.emailVerified);
    
    // Only fetch user data if email is verified
    if (user.emailVerified) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          ...data,
          createdAt: data.createdAt?.toDate(),
          lastLogin: data.lastLogin?.toDate(),
        } as User);
      } else {
        setUserData(null);
      }
    } else {
      setUserData(null);
    }
  }

  // Logout user
  async function logout() {
    await signOut(auth);
    setUserData(null);
    setEmailVerified(false);
  }

  // Reset password
  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  // Send verification email
  async function sendVerificationEmail() {
    if (currentUser) {
      await sendEmailVerification(currentUser);
    } else {
      throw new Error('No user is currently signed in');
    }
  }

  // Check email verification status
  async function checkEmailVerification() {
    if (currentUser) {
      // Reload the user to get the latest email verification status
      await reload(currentUser);
      setEmailVerified(currentUser.emailVerified);
      
      // If email is now verified and we don't have user data, fetch it
      if (currentUser.emailVerified && !userData) {
        await fetchUserData(currentUser.uid);
      }
      
      // Update the emailVerified field in Firestore
      if (currentUser.emailVerified) {
        await setDoc(
          doc(db, 'users', currentUser.uid),
          { emailVerified: true },
          { merge: true }
        );
      }
    }
  }

  // Fetch user data from Firestore
  async function fetchUserData(uid: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          ...data,
          createdAt: data.createdAt?.toDate(),
          lastLogin: data.lastLogin?.toDate(),
        } as User);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setEmailVerified(user.emailVerified);
        
        // Only fetch user data and update last login if email is verified
        if (user.emailVerified) {
          await fetchUserData(user.uid);
          // Update last login
          await setDoc(
            doc(db, 'users', user.uid),
            { lastLogin: serverTimestamp() },
            { merge: true }
          );
        } else {
          setUserData(null);
        }
      } else {
        setUserData(null);
        setEmailVerified(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    emailVerified,
    loading,
    login,
    register,
    logout,
    resetPassword,
    sendVerificationEmail,
    checkEmailVerification,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}