const admin = require('firebase-admin');
const db = admin.firestore();

// Service pour les utilisateurs
const userService = {
  async createUser(userData) {
    try {
      const userRef = await db.collection('users').add({
        ...userData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id: userRef.id, ...userData };
    } catch (error) {
      throw new Error('Erreur lors de la création de l\'utilisateur');
    }
  },

  async getUser(userId) {
    try {
      const userDoc = await db.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        throw new Error('Utilisateur non trouvé');
      }
      return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
      throw new Error('Erreur lors de la récupération de l\'utilisateur');
    }
  },

  async updateUser(userId, userData) {
    try {
      await db.collection('users').doc(userId).update({
        ...userData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id: userId, ...userData };
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour de l\'utilisateur');
    }
  }
};

// Service pour les offres d'emploi
const jobService = {
  async createJob(jobData) {
    try {
      const jobRef = await db.collection('jobs').add({
        ...jobData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id: jobRef.id, ...jobData };
    } catch (error) {
      throw new Error('Erreur lors de la création de l\'offre');
    }
  },

  async getJob(jobId) {
    try {
      const jobDoc = await db.collection('jobs').doc(jobId).get();
      if (!jobDoc.exists) {
        throw new Error('Offre non trouvée');
      }
      return { id: jobDoc.id, ...jobDoc.data() };
    } catch (error) {
      throw new Error('Erreur lors de la récupération de l\'offre');
    }
  },

  async updateJob(jobId, jobData) {
    try {
      await db.collection('jobs').doc(jobId).update({
        ...jobData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id: jobId, ...jobData };
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour de l\'offre');
    }
  },

  async deleteJob(jobId) {
    try {
      await db.collection('jobs').doc(jobId).delete();
      return { id: jobId };
    } catch (error) {
      throw new Error('Erreur lors de la suppression de l\'offre');
    }
  },

  async listJobs(filters = {}) {
    try {
      let query = db.collection('jobs');
      
      // Appliquer les filtres
      if (filters.category) {
        query = query.where('category', '==', filters.category);
      }
      if (filters.type) {
        query = query.where('type', '==', filters.type);
      }
      if (filters.status) {
        query = query.where('status', '==', filters.status);
      }
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Erreur lors de la récupération des offres');
    }
  }
};

// Service pour les messages
const messageService = {
  async createMessage(messageData) {
    try {
      const messageRef = await db.collection('messages').add({
        ...messageData,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id: messageRef.id, ...messageData };
    } catch (error) {
      throw new Error('Erreur lors de l\'envoi du message');
    }
  },

  async getConversation(userId1, userId2) {
    try {
      const messages = await db.collection('messages')
        .where('participants', 'array-contains', userId1)
        .where('participants', 'array-contains', userId2)
        .orderBy('createdAt', 'desc')
        .get();
      
      return messages.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw new Error('Erreur lors de la récupération de la conversation');
    }
  }
};

// Service pour les contrats
const contractService = {
  async createContract(contractData) {
    try {
      const contractRef = await db.collection('contracts').add({
        ...contractData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id: contractRef.id, ...contractData };
    } catch (error) {
      throw new Error('Erreur lors de la création du contrat');
    }
  },

  async getContract(contractId) {
    try {
      const contractDoc = await db.collection('contracts').doc(contractId).get();
      if (!contractDoc.exists) {
        throw new Error('Contrat non trouvé');
      }
      return { id: contractDoc.id, ...contractDoc.data() };
    } catch (error) {
      throw new Error('Erreur lors de la récupération du contrat');
    }
  },

  async updateContract(contractId, contractData) {
    try {
      await db.collection('contracts').doc(contractId).update({
        ...contractData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return { id: contractId, ...contractData };
    } catch (error) {
      throw new Error('Erreur lors de la mise à jour du contrat');
    }
  }
};

module.exports = {
  userService,
  jobService,
  messageService,
  contractService
}; 