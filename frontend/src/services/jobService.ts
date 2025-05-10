import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Job {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  jobType: 'fixed' | 'hourly';
  category: string;
  budget: number;
  duration: string;
  location: string;
  skills: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export const jobService = {
  // Créer une nouvelle offre
  async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'jobs'), {
        ...jobData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer toutes les offres
  async getAllJobs() {
    try {
      const querySnapshot = await getDocs(collection(db, 'jobs'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
    } catch (error) {
      throw error;
    }
  },

  // Récupérer une offre par son ID
  async getJobById(jobId: string) {
    try {
      const docRef = doc(db, 'jobs', jobId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Job;
      }
      return null;
    } catch (error) {
      throw error;
    }
  },

  // Mettre à jour une offre
  async updateJob(jobId: string, jobData: Partial<Job>) {
    try {
      const docRef = doc(db, 'jobs', jobId);
      await updateDoc(docRef, {
        ...jobData,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      throw error;
    }
  },

  // Supprimer une offre
  async deleteJob(jobId: string) {
    try {
      const docRef = doc(db, 'jobs', jobId);
      await deleteDoc(docRef);
    } catch (error) {
      throw error;
    }
  },

  // Rechercher des offres
  async searchJobs(filters: {
    category?: string;
    jobType?: 'fixed' | 'hourly';
    minBudget?: number;
    maxBudget?: number;
    location?: string;
  }) {
    try {
      let q = collection(db, 'jobs');
      
      if (filters.category) {
        q = query(q, where('category', '==', filters.category));
      }
      
      if (filters.jobType) {
        q = query(q, where('jobType', '==', filters.jobType));
      }
      
      if (filters.location) {
        q = query(q, where('location', '==', filters.location));
      }

      q = query(q, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      let jobs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];

      // Filtrer par budget si nécessaire
      if (filters.minBudget || filters.maxBudget) {
        jobs = jobs.filter(job => {
          if (filters.minBudget && job.budget < filters.minBudget) return false;
          if (filters.maxBudget && job.budget > filters.maxBudget) return false;
          return true;
        });
      }

      return jobs;
    } catch (error) {
      throw error;
    }
  }
}; 