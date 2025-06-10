import { db } from '@/config/firebase';
import { collection, query, where, onSnapshot, orderBy, Timestamp, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

export interface Notification {
  id: string;
  type: 'message' | 'offer' | 'system';
  title: string;
  content: string;
  createdAt: Timestamp;
  read: boolean;
  userId: string;
  senderId?: string;
  senderName?: string;
  link?: string;
  conversationId?: string;
}

interface MessageNotificationData {
  userId: string;
  message: {
    content: string;
    senderId: string;
    senderDetails: {
      name: string;
      avatar?: string;
    };
    conversationId: string;
  };
}

export const notificationService = {
  // Créer une notification de message
  async createMessageNotification(data: MessageNotificationData) {
    try {
      console.log('Creating message notification with data:', JSON.stringify(data, null, 2));
      
      const notificationData = {
        type: 'message' as const,
        title: `Nouveau message de ${data.message.senderDetails.name}`,
        content: data.message.content,
        userId: data.userId,
        senderId: data.message.senderId,
        senderName: data.message.senderDetails.name,
        link: `/messages?id=${data.message.conversationId}`,
        conversationId: data.message.conversationId,
        createdAt: serverTimestamp(),
        read: false
      };

      console.log('Notification data to be saved:', JSON.stringify(notificationData, null, 2));
      const docRef = await addDoc(collection(db, 'notifications'), notificationData);
      console.log('Notification successfully created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Detailed error in createMessageNotification:', error);
      throw error;
    }
  },

  // Écouter les notifications pour un utilisateur
  subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt || Timestamp.now()
        };
      }) as Notification[];

      callback(notifications);
    });
  },

  // Marquer une notification comme lue
  async markAsRead(notificationId: string) {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      throw error;
    }
  },

  // Supprimer une notification
  async deleteNotification(notificationId: string) {
    try {
      console.log('Deleting notification:', notificationId);
      const notificationRef = doc(db, 'notifications', notificationId);
      await deleteDoc(notificationRef);
      console.log('Notification deleted successfully');
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      throw error;
    }
  },

  // Réinitialiser les notifications affichées
  resetDisplayedNotifications() {
    // Réinitialiser l'état des notifications affichées
    // Cette méthode est appelée lors de la déconnexion
  }
}; 