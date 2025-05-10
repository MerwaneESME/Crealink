const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const admin = require('firebase-admin');
const { authenticateUser } = require('../middleware/auth');

// Créer une nouvelle conversation
router.post('/conversations', authenticateUser, async (req, res) => {
  try {
    const { participantId, jobId } = req.body;
    
    // Créer la conversation dans Firestore
    const conversationRef = await db.collection('conversations').add({
      participants: [req.user.uid, participantId],
      jobId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessage: null
    });
    
    res.status(201).json({
      id: conversationRef.id,
      participants: [req.user.uid, participantId],
      jobId,
      messages: []
    });
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir toutes les conversations d'un utilisateur
router.get('/conversations', authenticateUser, async (req, res) => {
  try {
    const conversationsSnapshot = await db.collection('conversations')
      .where('participants', 'array-contains', req.user.uid)
      .get();
    
    const conversations = [];
    for (const doc of conversationsSnapshot.docs) {
      const conversation = { id: doc.id, ...doc.data() };
      
      // Obtenir les détails des participants
      const participantsDetails = await Promise.all(
        conversation.participants.map(async (participantId) => {
          const userDoc = await db.collection('users').doc(participantId).get();
          return userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : { id: participantId };
        })
      );
      
      conversation.participants = participantsDetails;
      conversations.push(conversation);
    }
    
    res.json(conversations);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir une conversation spécifique
router.get('/conversations/:conversationId', authenticateUser, async (req, res) => {
  try {
    const conversationDoc = await db.collection('conversations').doc(req.params.conversationId).get();
    
    if (!conversationDoc.exists) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    const conversation = { id: conversationDoc.id, ...conversationDoc.data() };
    
    // Vérifier que l'utilisateur fait partie de la conversation
    if (!conversation.participants.includes(req.user.uid)) {
      return res.status(403).json({ message: 'Accès non autorisé à cette conversation' });
    }
    
    // Obtenir les messages de la conversation
    const messagesSnapshot = await db.collection('conversations')
      .doc(req.params.conversationId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .get();
    
    const messages = messagesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    conversation.messages = messages;
    
    res.json(conversation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Marquer une conversation comme lue
router.put('/conversations/:conversationId/read', authenticateUser, async (req, res) => {
  try {
    const conversationRef = db.collection('conversations').doc(req.params.conversationId);
    const conversationDoc = await conversationRef.get();
    
    if (!conversationDoc.exists) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    const conversation = conversationDoc.data();
    
    // Vérifier que l'utilisateur fait partie de la conversation
    if (!conversation.participants.includes(req.user.uid)) {
      return res.status(403).json({ message: 'Accès non autorisé à cette conversation' });
    }
    
    // Mettre à jour les messages non lus
    await conversationRef.update({
      lastReadBy: {
        ...conversation.lastReadBy,
        [req.user.uid]: admin.firestore.FieldValue.serverTimestamp()
      }
    });
    
    res.json({ message: 'Conversation marquée comme lue' });
  } catch (error) {
    console.error('Erreur lors du marquage de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Obtenir les messages non lus
router.get('/unread', authenticateUser, async (req, res) => {
  try {
    const conversationsSnapshot = await db.collection('conversations')
      .where('participants', 'array-contains', req.user.uid)
      .get();
    
    let unreadCount = 0;
    const unreadConversations = [];
    
    for (const doc of conversationsSnapshot.docs) {
      const conversation = { id: doc.id, ...doc.data() };
      
      // Vérifier si le dernier message existe et n'a pas été lu par l'utilisateur
      if (conversation.lastMessage && 
          (!conversation.lastReadBy || 
           !conversation.lastReadBy[req.user.uid] ||
           conversation.lastMessage.createdAt > conversation.lastReadBy[req.user.uid])) {
        unreadCount++;
        unreadConversations.push(conversation);
      }
    }
    
    res.json({
      unreadCount,
      conversations: unreadConversations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages non lus:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Envoyer un message
router.post('/conversations/:conversationId/messages', authenticateUser, async (req, res) => {
  try {
    const { content } = req.body;
    const conversationRef = db.collection('conversations').doc(req.params.conversationId);
    const conversationDoc = await conversationRef.get();
    
    if (!conversationDoc.exists) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    const conversation = conversationDoc.data();
    
    // Vérifier que l'utilisateur fait partie de la conversation
    if (!conversation.participants.includes(req.user.uid)) {
      return res.status(403).json({ message: 'Accès non autorisé à cette conversation' });
    }
    
    // Ajouter le message
    const messageRef = await conversationRef.collection('messages').add({
      content,
      senderId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Mettre à jour le dernier message de la conversation
    await conversationRef.update({
      lastMessage: {
        content,
        senderId: req.user.uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const messageDoc = await messageRef.get();
    res.status(201).json({
      id: messageDoc.id,
      ...messageDoc.data()
    });
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 