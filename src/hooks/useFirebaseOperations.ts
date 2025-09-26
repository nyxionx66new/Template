import { useState } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useFirebaseOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeOperation = async <T>(operation: () => Promise<T>): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      console.error('Firebase operation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Generic CRUD operations
  const createDocument = async (collectionName: string, data: any) => {
    return executeOperation(async () => {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    });
  };

  const updateDocument = async (collectionName: string, docId: string, data: any) => {
    return executeOperation(async () => {
      await updateDoc(doc(db, collectionName, docId), {
        ...data,
        updatedAt: serverTimestamp(),
      });
      return true;
    });
  };

  const deleteDocument = async (collectionName: string, docId: string) => {
    return executeOperation(async () => {
      await deleteDoc(doc(db, collectionName, docId));
      return true;
    });
  };

  const getDocument = async (collectionName: string, docId: string) => {
    return executeOperation(async () => {
      const docSnap = await getDoc(doc(db, collectionName, docId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    });
  };

  const getDocuments = async (
    collectionName: string, 
    conditions?: Array<{ field: string; operator: any; value: any }>,
    orderByField?: string,
    limitCount?: number
  ) => {
    return executeOperation(async () => {
      let q = collection(db, collectionName);
      let queryConstraints: any[] = [];

      if (conditions) {
        conditions.forEach(condition => {
          queryConstraints.push(where(condition.field, condition.operator, condition.value));
        });
      }

      if (orderByField) {
        queryConstraints.push(orderBy(orderByField, 'desc'));
      }

      if (limitCount) {
        queryConstraints.push(limit(limitCount));
      }

      if (queryConstraints.length > 0) {
        q = query(collection(db, collectionName), ...queryConstraints) as any;
      }

      const snapshot = await getDocs(q as any);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
  };

  // Specific operations for the app
  const createAttendanceRecord = async (teacherId: string, schoolId: string, status: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return createDocument('attendance', {
      teacherId,
      schoolId,
      date: today,
      checkIn: status === 'present' ? new Date() : null,
      checkOut: null,
      status,
    });
  };

  const createFeedback = async (data: {
    teacherId: string;
    fromUserId: string;
    fromRole: string;
    type: string;
    rating: number;
    comment: string;
    categories: any;
    schoolId: string;
  }) => {
    return createDocument('feedback', {
      ...data,
      acknowledged: false,
    });
  };

  const createTrainingEnrollment = async (teacherId: string, trainingId: string) => {
    return createDocument('trainingEnrollments', {
      teacherId,
      trainingId,
      enrolledAt: new Date(),
      progress: 0,
    });
  };

  const createLessonPlan = async (data: {
    teacherId: string;
    title: string;
    subject: string;
    gradeLevel: string;
    duration: number;
    objectives: string[];
    materials: string[];
    activities: string[];
    assessment: string;
    schoolId: string;
  }) => {
    return createDocument('lessonPlans', {
      ...data,
      fileUrls: [],
      shared: false,
    });
  };

  return {
    loading,
    error,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    getDocuments,
    createAttendanceRecord,
    createFeedback,
    createTrainingEnrollment,
    createLessonPlan,
  };
}