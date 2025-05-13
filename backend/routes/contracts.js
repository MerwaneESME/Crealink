const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const admin = require('firebase-admin');

// Créer un contrat
router.post('/', async (req, res) => {
  try {
    const contractRef = await db.collection('contracts').add({
      ...req.body,
      creatorId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).json({ id: contractRef.id, ...req.body });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Récupérer un contrat
router.get('/:id', async (req, res) => {
  try {
    const contractDoc = await db.collection('contracts').doc(req.params.id).get();
    if (!contractDoc.exists) {
      return res.status(404).json({ error: 'Contrat non trouvé' });
    }
    res.json({ id: contractDoc.id, ...contractDoc.data() });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Mettre à jour un contrat
router.put('/:id', async (req, res) => {
  try {
    await db.collection('contracts').doc(req.params.id).update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 