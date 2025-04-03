const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const { userService } = require('../services/firebaseService');
const { db } = require('../config/firebase');
const admin = require('firebase-admin');

// Obtenir le profil d'un utilisateur
router.get('/:userId', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Mettre à jour le profil d'un utilisateur
router.put('/:userId', authenticateUser, async (req, res) => {
  try {
    await db.collection('users').doc(req.params.userId).update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    const updatedUser = await db.collection('users').doc(req.params.userId).get();
    res.json({ id: updatedUser.id, ...updatedUser.data() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Obtenir le profil d'un utilisateur public
router.get('/:id/profile', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du profil' });
  }
});

// Mettre à jour son propre profil
router.put('/profile-update', authenticateUser, async (req, res) => {
  try {
    const {
      name,
      bio,
      skills,
      location,
      phone,
      socialLinks,
      profileImage
    } = req.body;
    
    await db.collection('users').doc(req.user.uid).update({
      name,
      bio,
      skills,
      location,
      phone,
      socialLinks,
      profileImage,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const updatedUser = await db.collection('users').doc(req.user.uid).get();
    res.json({ id: updatedUser.id, ...updatedUser.data() });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du profil' });
  }
});

// Rechercher des experts
router.get('/experts/search', async (req, res) => {
  try {
    const { skills, categories, location } = req.query;
    
    let query = db.collection('users').where('role', '==', 'expert');
    
    if (skills) {
      query = query.where('skills', 'array-contains-any', Array.isArray(skills) ? skills : [skills]);
    }
    
    if (location) {
      query = query.where('location', '==', location);
    }
    
    const snapshot = await query.get();
    const experts = [];
    snapshot.forEach(doc => {
      const expert = { id: doc.id, ...doc.data() };
      delete expert.password;
      experts.push(expert);
    });
    
    res.json({ experts });
  } catch (error) {
    console.error('Erreur lors de la recherche d\'experts:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la recherche d\'experts' });
  }
});

// Rechercher des créateurs
router.get('/creators/search', async (req, res) => {
  try {
    const { type, subscribersMin } = req.query;
    
    let query = db.collection('users').where('role', '==', 'creator');
    
    if (type) {
      query = query.where('channelInfo.type', '==', type);
    }
    
    const snapshot = await query.get();
    const creators = [];
    snapshot.forEach(doc => {
      const creator = { id: doc.id, ...doc.data() };
      if (!subscribersMin || creator.channelInfo?.subscribers >= parseInt(subscribersMin)) {
        delete creator.password;
        creators.push(creator);
      }
    });
    
    res.json({ creators });
  } catch (error) {
    console.error('Erreur lors de la recherche de créateurs:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la recherche de créateurs' });
  }
});

// Changer le mot de passe
router.put('/password', authenticateUser, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    await admin.auth().updateUser(req.user.uid, {
      password: newPassword,
    });
    
    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({ message: 'Erreur serveur lors du changement de mot de passe' });
  }
});

// Récupérer un utilisateur
router.get('/:id', async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un utilisateur
router.put('/:id', async (req, res) => {
  try {
    await db.collection('users').doc(req.params.id).update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Créer un utilisateur
router.post('/', async (req, res) => {
  try {
    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 