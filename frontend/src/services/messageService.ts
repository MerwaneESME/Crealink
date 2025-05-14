import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { notificationService } from './notificationService';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: any;
  read: boolean;
  senderDetails?: UserDetails | null;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantsDetails?: Record<string, UserDetails>;
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: any;
  };
  updatedAt: any;
}

export interface UserDetails {
  name: string;
  avatar?: string;
  role?: string;
}

export const messageService = {
  // Récupérer les détails d'un utilisateur
  async getUserDetails(userId: string): Promise<UserDetails | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: userDoc.id,
          name: userData.fullName || userData.name || `${userData.firstName} ${userData.lastName}`,
          avatar: userData.photoURL || userData.avatar,
          role: userData.role
        };
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails de l\'utilisateur:', error);
      return null;
    }
  },

  // Récupérer les détails de plusieurs utilisateurs
  async getMultipleUserDetails(userIds: string[]): Promise<Record<string, UserDetails>> {
    try {
      const userDetails: Record<string, UserDetails> = {};
      const uniqueUserIds = [...new Set(userIds)];
      
      await Promise.all(
        uniqueUserIds.map(async (userId) => {
          const details = await this.getUserDetails(userId);
          if (details) {
            userDetails[userId] = details;
          }
        })
      );
      
      return userDetails;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails des utilisateurs:', error);
      return {};
    }
  },

  // Créer ou récupérer une conversation entre deux utilisateurs
  async getOrCreateConversation(userId1: string, userId2: string): Promise<string> {
    try {
      console.log('Tentative de récupération/création de conversation entre:', userId1, 'et', userId2);
      
      const conversationId = [userId1, userId2].sort().join('_');
      console.log('ID de conversation généré:', conversationId);
      
      // Vérifier si la conversation est fermée et la rouvrir si nécessaire
      const userRef = doc(db, 'users', userId1);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData?.closedConversations?.includes(conversationId)) {
          console.log('Réouverture de la conversation fermée');
          await this.reopenConversation(conversationId, userId1);
        }
      }
      
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        console.log('Création d\'une nouvelle conversation');
        // Récupérer les détails des utilisateurs
        const [user1Details, user2Details] = await Promise.all([
          this.getUserDetails(userId1),
          this.getUserDetails(userId2)
        ]);

        // Créer une nouvelle conversation
        await setDoc(conversationRef, {
          participants: [userId1, userId2],
          participantsDetails: {
            [userId1]: {
              name: user1Details?.name || 'Utilisateur inconnu',
              avatar: user1Details?.avatar || null,
              role: user1Details?.role || null
            },
            [userId2]: {
              name: user2Details?.name || 'Utilisateur inconnu',
              avatar: user2Details?.avatar || null,
              role: user2Details?.role || null
            }
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastMessage: null
        });
        
        console.log('Nouvelle conversation créée avec succès');
      } else {
        console.log('Conversation existante trouvée');
        
        // Mettre à jour les détails des participants
        const [user1Details, user2Details] = await Promise.all([
          this.getUserDetails(userId1),
          this.getUserDetails(userId2)
        ]);
        
        await updateDoc(conversationRef, {
          participantsDetails: {
            [userId1]: {
              name: user1Details?.name || 'Utilisateur inconnu',
              avatar: user1Details?.avatar || null,
              role: user1Details?.role || null
            },
            [userId2]: {
              name: user2Details?.name || 'Utilisateur inconnu',
              avatar: user2Details?.avatar || null,
              role: user2Details?.role || null
            }
          },
          updatedAt: serverTimestamp()
        });
        
        console.log('Détails des participants mis à jour');
      }
      
      return conversationId;
    } catch (error) {
      console.error('Erreur lors de la création/récupération de la conversation:', error);
      throw error;
    }
  },

  // Envoyer un message
  async sendMessage(conversationId: string, senderId: string, content: string) {
    try {
      console.log('Sending message:', { conversationId, senderId, content });
      
      // Récupérer les détails de l'expéditeur
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      const senderData = senderDoc.data();
      console.log('Sender details:', senderData);

      // Récupérer les détails de la conversation pour trouver le destinataire
      const conversationDoc = await getDoc(doc(db, 'conversations', conversationId));
      const conversationData = conversationDoc.data();
      console.log('Conversation details:', conversationData);

      if (!conversationData) {
        throw new Error('Conversation not found');
      }

      // Trouver l'ID du destinataire (l'autre participant)
      const recipientId = conversationData.participants.find((id: string) => id !== senderId);
      console.log('Recipient ID:', recipientId);

      const messageData = {
        content,
        senderId,
        createdAt: serverTimestamp(),
        read: false,
        senderDetails: {
          name: senderData?.name || 'Utilisateur',
          avatar: senderData?.avatar
        }
      };

      console.log('Creating message with data:', messageData);
      const messageRef = await addDoc(
        collection(db, 'conversations', conversationId, 'messages'),
        messageData
      );
      console.log('Message created successfully:', messageRef.id);

      // Créer une notification pour le destinataire
      try {
        const notificationData = {
          userId: recipientId,
          message: {
            content,
            senderId,
            senderDetails: {
              name: senderData?.name || 'Utilisateur',
              avatar: senderData?.avatar
            },
            conversationId
          }
        };
        console.log('Creating notification for recipient:', notificationData);
        await notificationService.createMessageNotification(notificationData);
      } catch (error) {
        console.error('Error creating notification:', error);
      }

      // Mettre à jour la conversation
      const conversationRef = doc(db, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        lastMessage: {
          content,
          senderId,
          createdAt: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });
      console.log('Conversation updated with last message');

      return messageRef.id;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Récupérer les messages d'une conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const q = query(
        collection(db, 'conversations', conversationId, 'messages'),
        orderBy('createdAt', 'asc')
      );

      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];

      // Récupérer les détails des utilisateurs pour tous les messages
      const userIds = [...new Set(messages.map(msg => msg.senderId))];
      const userDetails = await this.getMultipleUserDetails(userIds);

      // Enrichir les messages avec les détails des utilisateurs
      return messages.map(msg => ({
        ...msg,
        senderDetails: userDetails[msg.senderId] || null
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      throw error;
    }
  },

  // Initialiser le champ closedConversations pour un utilisateur
  async initializeUserConversations(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (!userData.hasOwnProperty('closedConversations')) {
          await updateDoc(userRef, {
            closedConversations: []
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des conversations:', error);
    }
  },

  // Récupérer toutes les conversations d'un utilisateur
  async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      // Récupérer d'abord le document utilisateur pour les conversations fermées
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const closedConversations = userData?.closedConversations || [];

      // Récupérer toutes les conversations où l'utilisateur est participant
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const allConversations = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Conversation[];
      
      // Filtrer les conversations fermées
      const filteredConversations = allConversations.filter(
        conv => !closedConversations.includes(conv.id)
      );

      // Récupérer les détails des participants
      const participantIds = [...new Set(filteredConversations.flatMap(conv => conv.participants))];
      const participantDetails = await this.getMultipleUserDetails(participantIds);

      return filteredConversations.map(conv => ({
        ...conv,
        participantsDetails: conv.participants.reduce((acc: Record<string, UserDetails>, participantId: string) => ({
          ...acc,
          [participantId]: participantDetails[participantId] || { name: 'Utilisateur inconnu' }
        }), {})
      }));

    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      throw error;
    }
  },

  // Écouter les nouveaux messages en temps réel
  subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void) {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, async (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];

      // Récupérer les détails des utilisateurs pour tous les messages
      const userIds = [...new Set(messages.map(msg => msg.senderId))];
      const userDetails = await this.getMultipleUserDetails(userIds);

      // Enrichir les messages avec les détails des utilisateurs
      const enrichedMessages = messages.map(msg => ({
        ...msg,
        senderDetails: userDetails[msg.senderId] || null
      }));

      callback(enrichedMessages);
    });
  },

  // Écouter les conversations en temps réel
  subscribeToConversations(userId: string, callback: (conversations: Conversation[]) => void) {
    console.log('Démarrage de l\'écoute des conversations pour l\'utilisateur:', userId);
    
    // Créer une référence au document utilisateur
    const userRef = doc(db, 'users', userId);
    let conversationsUnsubscribe: (() => void) | null = null;
    
    // Écouter les changements du document utilisateur pour les conversations fermées
    const userUnsubscribe = onSnapshot(userRef, (userDoc) => {
      const userData = userDoc.data();
      const closedConversations = userData?.closedConversations || [];
      console.log('Conversations fermées actuelles:', closedConversations);
      
      // Nettoyer l'ancien listener des conversations s'il existe
      if (conversationsUnsubscribe) {
        conversationsUnsubscribe();
      }
      
      // Écouter les conversations
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );

      // Écouter les changements des conversations
      conversationsUnsubscribe = onSnapshot(q, async (snapshot) => {
        console.log('Changement détecté dans les conversations');
        console.log('Nombre total de conversations:', snapshot.docs.length);
        
        const conversations = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(conv => !closedConversations.includes(conv.id)) as Conversation[];

        console.log('Conversations après filtrage:', conversations.length);

        // Récupérer les détails de tous les participants
        const participantIds = [...new Set(conversations.flatMap(conv => conv.participants))];
        const participantDetails = await this.getMultipleUserDetails(participantIds);

        // Enrichir les conversations avec les détails des participants
        const enrichedConversations = conversations.map(conv => ({
          ...conv,
          participantsDetails: conv.participants.reduce((acc: Record<string, UserDetails>, participantId: string) => ({
            ...acc,
            [participantId]: participantDetails[participantId] || { name: 'Utilisateur inconnu' }
          }), {})
        }));

        console.log('Conversations enrichies:', enrichedConversations.length);
        callback(enrichedConversations);
      });
    });

    // Retourner une fonction de nettoyage qui arrête les deux listeners
    return () => {
      userUnsubscribe();
      if (conversationsUnsubscribe) {
        conversationsUnsubscribe();
      }
    };
  },

  // Marquer les messages comme lus
  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'conversations', conversationId, 'messages'),
        where('read', '==', false),
        where('senderId', '!=', userId)
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return;

      const batch = writeBatch(db);
      querySnapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });

      await batch.commit();
    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
      // Ne pas propager l'erreur pour éviter d'interrompre l'expérience utilisateur
      // throw error;
    }
  },

  // Fermer une conversation pour un utilisateur
  async closeConversation(conversationId: string, userId: string): Promise<void> {
    try {
      console.log('Tentative de fermeture de la conversation:', conversationId, 'pour l\'utilisateur:', userId);
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Créer le document utilisateur avec le tableau closedConversations
        await setDoc(userRef, {
          closedConversations: [conversationId],
          updatedAt: serverTimestamp()
        });
      } else {
        const userData = userDoc.data();
        const currentClosedConversations = userData?.closedConversations || [];
        
        // Vérifier si la conversation n'est pas déjà fermée
        if (!currentClosedConversations.includes(conversationId)) {
          // Utiliser arrayUnion pour ajouter l'ID sans dupliquer
          await updateDoc(userRef, {
            closedConversations: arrayUnion(conversationId),
            updatedAt: serverTimestamp()
          });
        }
      }

      // Vérification après la mise à jour
      const updatedDoc = await getDoc(userRef);
      const updatedData = updatedDoc.data();
      console.log('Document après mise à jour:', updatedData);
      console.log('Conversations fermées:', updatedData?.closedConversations || []);

    } catch (error) {
      console.error('Erreur lors de la fermeture de la conversation:', error);
      throw error;
    }
  },

  // Réouvrir une conversation pour un utilisateur
  async reopenConversation(conversationId: string, userId: string): Promise<void> {
    try {
      console.log('Tentative de réouverture de la conversation:', conversationId, 'pour l\'utilisateur:', userId);
      
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        console.log('Document utilisateur non trouvé');
        return;
      }
      
      const userData = userDoc.data();
      console.log('État actuel des conversations fermées:', userData?.closedConversations);
      
      // Vérifier si la conversation est dans la liste des conversations fermées
      if (userData?.closedConversations?.includes(conversationId)) {
        console.log('Suppression de la conversation de la liste des conversations fermées');
        
        // Utiliser arrayRemove pour retirer la conversation de la liste
        await updateDoc(userRef, {
          closedConversations: arrayRemove(conversationId),
          updatedAt: serverTimestamp()
        });
        
        // Vérifier la mise à jour
        const updatedDoc = await getDoc(userRef);
        const updatedData = updatedDoc.data();
        console.log('Conversations fermées après réouverture:', updatedData?.closedConversations);
        
        // Mettre à jour la conversation elle-même pour forcer un rafraîchissement
        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, {
          updatedAt: serverTimestamp()
        });
      } else {
        console.log('La conversation n\'était pas dans la liste des conversations fermées');
      }
    } catch (error) {
      console.error('Erreur lors de la réouverture de la conversation:', error);
      throw error;
    }
  },

  // Écouter les changements du document utilisateur
  subscribeToUserDocument(userId: string, callback: (closedConversations: string[]) => void) {
    const userRef = doc(db, 'users', userId);
    
    return onSnapshot(userRef, (doc) => {
      const userData = doc.data();
      callback(userData?.closedConversations || []);
    });
  },
}; 