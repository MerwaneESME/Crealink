const express = require('express');
const router = express.Router();
const { auth, db } = require('../config/firebase');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { authenticateUser } = require('../middleware/auth');

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, profileImage } = req.body;

    // Créer l'utilisateur dans Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
      photoURL: profileImage
    });

    // Créer le profil utilisateur dans Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      name,
      profileImage,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        profileImage: userRecord.photoURL
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Générer un token personnalisé (comme Firebase ne fournit pas directement cette fonctionnalité via Admin SDK)
    const userRecord = await auth.getUserByEmail(email);
    
    // Générer un token JWT
    const token = jwt.sign(
      { uid: userRecord.uid },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
        profileImage: userRecord.photoURL
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }
});

// Récupérer le profil utilisateur
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    const userData = userDoc.data();
    delete userData.password; // Ne pas renvoyer le mot de passe
    res.json({ id: userDoc.id, ...userData });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Mettre à jour le profil utilisateur
router.put('/profile-update', authenticateUser, async (req, res) => {
  try {
    await db.collection('users').doc(req.user.uid).update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    const updatedUser = await db.collection('users').doc(req.user.uid).get();
    res.json({ id: updatedUser.id, ...updatedUser.data() });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer le compte utilisateur
router.delete('/profile', authenticateUser, async (req, res) => {
  try {
    await auth.deleteUser(req.user.uid);
    await db.collection('users').doc(req.user.uid).delete();
    res.json({ message: 'Compte supprimé avec succès' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 