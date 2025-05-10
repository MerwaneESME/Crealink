import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  jobId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export const messageService = {
  // Envoyer un message
  async sendMessage(messageData: Omit<Message, 'id' | 'createdAt' | 'read'>) {
    try {
      const docRef = await addDoc(collection(db, 'messages'), {
        ...messageData,
        createdAt: new Date().toISOString(),
        read: false
      });
      return docRef.id;
    } catch (error) {
      throw error;
    }
  },

  // Récupérer les messages d'une conversation
  async getConversation(jobId: string, userId1: string, userId2: string) {
    try {
      const q = query(
        collection(db, 'messages'),
        where('jobId', '==', jobId),
        where('senderId', 'in', [userId1, userId2]),
        where('receiverId', 'in', [userId1, userId2]),
        orderBy('createdAt', 'asc')
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
    } catch (error) {
      throw error;
    }
  },

  // Écouter les nouveaux messages en temps réel
  subscribeToMessages(jobId: string, userId1: string, userId2: string, callback: (messages: Message[]) => void) {
    const q = query(
      collection(db, 'messages'),
      where('jobId', '==', jobId),
      where('senderId', 'in', [userId1, userId2]),
      where('receiverId', 'in', [userId1, userId2]),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      callback(messages);
    });
  },

  // Marquer un message comme lu
  async markAsRead(messageId: string) {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        read: true
      });
    } catch (error) {
      throw error;
    }
  }
}; 