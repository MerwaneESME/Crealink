const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Job = require('../models/Job');

// Créer une nouvelle conversation
exports.createConversation = async (req, res) => {
  try {
    const { jobId, receiverId } = req.body;
    
    // Vérifier si le job existe
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Offre d\'emploi non trouvée' });
    }
    
    // Vérifier si l'utilisateur est impliqué dans le job (soit créateur soit assigné)
    const isCreator = job.creator.toString() === req.user.id;
    const isAssigned = job.assignedTo && job.assignedTo.toString() === req.user.id;
    
    if (!isCreator && !isAssigned) {
      return res.status(403).json({ message: 'Non autorisé à créer une conversation pour cette offre' });
    }
    
    // Vérifier si le destinataire existe
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Destinataire non trouvé' });
    }
    
    // Vérifier si le destinataire est impliqué dans le job
    const isReceiverCreator = job.creator.toString() === receiverId;
    const isReceiverAssigned = job.assignedTo && job.assignedTo.toString() === receiverId;
    
    if (!isReceiverCreator && !isReceiverAssigned) {
      return res.status(400).json({ message: 'Le destinataire n\'est pas impliqué dans cette offre' });
    }
    
    // Vérifier si une conversation existe déjà pour ce job entre ces utilisateurs
    const existingConversation = await Conversation.findOne({
      job: jobId,
      participants: { $all: [req.user.id, receiverId] }
    });
    
    if (existingConversation) {
      return res.status(400).json({ message: 'Une conversation existe déjà pour cette offre' });
    }
    
    // Créer une nouvelle conversation
    const conversation = new Conversation({
      participants: [req.user.id, receiverId],
      job: jobId,
      lastMessage: {
        text: 'Conversation démarrée',
        sender: req.user.id,
        createdAt: Date.now(),
        isRead: false
      }
    });
    
    await conversation.save();
    
    // Créer le premier message
    const message = new Message({
      conversation: conversation._id,
      sender: req.user.id,
      text: 'Bonjour, je souhaite discuter de cette offre.'
    });
    
    await message.save();
    
    // Mettre à jour la conversation avec le premier message
    conversation.lastMessage = {
      text: message.text,
      sender: req.user.id,
      createdAt: message.createdAt,
      isRead: false
    };
    
    await conversation.save();
    
    // Renvoyer la conversation avec les détails des participants
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name profileImage')
      .populate('job', 'title');
      
    res.status(201).json(populatedConversation);
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la conversation' });
  }
};

// Obtenir toutes les conversations d'un utilisateur
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user.id
    })
    .populate('participants', 'name profileImage')
    .populate('job', 'title')
    .sort({ updatedAt: -1 });
    
    res.json(conversations);
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des conversations' });
  }
};

// Obtenir une conversation par son ID
exports.getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'name profileImage')
      .populate('job', 'title');
      
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    // Vérifier si l'utilisateur est un participant
    if (!conversation.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Non autorisé à accéder à cette conversation' });
    }
    
    res.json(conversation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de la conversation' });
  }
};

// Envoyer un message dans une conversation
exports.sendMessage = async (req, res) => {
  try {
    const { text, attachments } = req.body;
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    // Vérifier si l'utilisateur est un participant
    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Non autorisé à envoyer un message dans cette conversation' });
    }
    
    // Créer un nouveau message
    const message = new Message({
      conversation: conversation._id,
      sender: req.user.id,
      text,
      attachments: attachments || []
    });
    
    await message.save();
    
    // Mettre à jour la dernière activité de la conversation
    conversation.lastMessage = {
      text,
      sender: req.user.id,
      createdAt: message.createdAt,
      isRead: false
    };
    
    await conversation.save();
    
    // Renvoyer le message avec les détails de l'expéditeur
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name profileImage');
      
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'envoi du message' });
  }
};

// Obtenir tous les messages d'une conversation
exports.getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    // Vérifier si l'utilisateur est un participant
    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Non autorisé à accéder aux messages de cette conversation' });
    }
    
    // Récupérer les messages avec pagination, du plus récent au plus ancien
    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name profileImage')
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));
      
    // Compter le nombre total de messages
    const total = await Message.countDocuments({ conversation: req.params.id });
    
    // Marquer les messages comme lus
    await Message.updateMany(
      { 
        conversation: req.params.id,
        sender: { $ne: req.user.id },
        'readBy.user': { $ne: req.user.id }
      },
      { 
        $push: { 
          readBy: { 
            user: req.user.id,
            readAt: Date.now()
          } 
        },
        $set: { isRead: true }
      }
    );
    
    res.json({
      messages: messages.reverse(), // Renvoyer du plus ancien au plus récent pour l'affichage
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des messages' });
  }
};

// Marquer une conversation comme lue
exports.markConversationAsRead = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    // Vérifier si l'utilisateur est un participant
    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Non autorisé à accéder à cette conversation' });
    }
    
    // Marquer tous les messages non lus comme lus
    await Message.updateMany(
      { 
        conversation: req.params.id,
        sender: { $ne: req.user.id },
        'readBy.user': { $ne: req.user.id }
      },
      { 
        $push: { 
          readBy: { 
            user: req.user.id,
            readAt: Date.now()
          } 
        },
        $set: { isRead: true }
      }
    );
    
    // Mettre à jour le statut de lecture du dernier message
    if (conversation.lastMessage && conversation.lastMessage.sender.toString() !== req.user.id) {
      conversation.lastMessage.isRead = true;
      await conversation.save();
    }
    
    res.json({ message: 'Conversation marquée comme lue' });
  } catch (error) {
    console.error('Erreur lors du marquage de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur lors du marquage de la conversation' });
  }
};

// Archiver une conversation
exports.archiveConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation non trouvée' });
    }
    
    // Vérifier si l'utilisateur est un participant
    if (!conversation.participants.some(p => p.toString() === req.user.id)) {
      return res.status(403).json({ message: 'Non autorisé à archiver cette conversation' });
    }
    
    conversation.status = 'archived';
    await conversation.save();
    
    res.json({ message: 'Conversation archivée avec succès' });
  } catch (error) {
    console.error('Erreur lors de l\'archivage de la conversation:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'archivage de la conversation' });
  }
};

// Obtenir les messages non lus
exports.getUnreadMessages = async (req, res) => {
  try {
    // Trouver toutes les conversations où l'utilisateur est participant
    const conversations = await Conversation.find({
      participants: req.user.id
    });
    
    const conversationIds = conversations.map(c => c._id);
    
    // Compter les messages non lus par conversation
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          conversation: { $in: conversationIds },
          sender: { $ne: req.user.id },
          isRead: false
        }
      },
      {
        $group: {
          _id: '$conversation',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Formater les résultats
    const unreadMessages = {};
    unreadCounts.forEach(item => {
      unreadMessages[item._id] = item.count;
    });
    
    res.json({
      unreadMessages,
      totalUnread: unreadCounts.reduce((total, item) => total + item.count, 0)
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des messages non lus:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des messages non lus' });
  }
}; 