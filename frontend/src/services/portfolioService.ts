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
import { MediaFile } from './storageService';
import { auth } from '../config/firebase';

export interface Project {
  id: string;
  title: string;
  description: string;
  media: MediaFile[];
  tags: string[];
  expertId: string;
  expertName: string;
  createdAt: string;
  updatedAt: string;
}

export const portfolioService = {
  // Récupérer tous les projets d'un expert
  async getExpertProjects(expertId: string) {
    try {
      // Requête simplifiée sans tri pour éviter l'erreur d'index
      const q = query(
        collection(db, 'projects'),
        where('expertId', '==', expertId)
      );
      const querySnapshot = await getDocs(q);
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      // Tri côté client
      return projects.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error("Erreur lors de la récupération des projets:", error);
      throw error;
    }
  },

  // Récupérer tous les projets (pour la découverte)
  async getAllProjects() {
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
    } catch (error) {
      console.error("Erreur lors de la récupération des projets:", error);
      throw error;
    }
  },

  // Récupérer un projet par son ID
  async getProjectById(projectId: string) {
    try {
      const docRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Project;
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de la récupération du projet:", error);
      throw error;
    }
  },

  // Créer un nouveau projet
  async createProject(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    try {
      const projectRef = collection(db, 'projects');
      const now = new Date().toISOString(); // Utiliser une chaîne ISO pour être cohérent avec le type Project
      
      // Vérifier que l'utilisateur est connecté avant de créer un projet
      if (!auth.currentUser) {
        throw new Error('Vous devez être connecté pour créer un projet');
      }
      
      const newProject = {
        ...projectData,
        expertId: auth.currentUser.uid, // Ici, on est sûr que c'est une chaîne de caractères
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(projectRef, newProject);
      return {
        id: docRef.id,
        ...newProject
      };
    } catch (error) {
      console.error('Erreur lors de la création du projet:', error);
      throw new Error('Impossible de créer le projet');
    }
  },

  // Mettre à jour un projet
  async updateProject(projectId: string, projectData: Partial<Project>) {
    try {
      const docRef = doc(db, 'projects', projectId);
      await updateDoc(docRef, {
        ...projectData,
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du projet:", error);
      throw error;
    }
  },

  // Supprimer un projet
  async deleteProject(projectId: string) {
    try {
      const docRef = doc(db, 'projects', projectId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error("Erreur lors de la suppression du projet:", error);
      throw error;
    }
  },

  // Rechercher des projets
  async searchProjects(query: string) {
    try {
      // Note: Cette fonction est une simplification
      // Firestore ne supporte pas nativement la recherche en texte intégral
      // Pour une vraie solution, considérez Algolia ou une solution côté client
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const projects = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      // Filtre côté client
      return projects.filter(project => 
        project.title.toLowerCase().includes(query.toLowerCase()) ||
        project.description.toLowerCase().includes(query.toLowerCase()) ||
        project.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
    } catch (error) {
      console.error("Erreur lors de la recherche de projets:", error);
      throw error;
    }
  }
}; 