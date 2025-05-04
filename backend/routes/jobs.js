const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const admin = require('firebase-admin');

// Lister toutes les offres d'emploi
router.get('/', async (req, res) => {
  try {
    const jobsSnapshot = await db.collection('jobs').get();
    const jobs = jobsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer une offre d'emploi
router.get('/:id', async (req, res) => {
  try {
    const jobDoc = await db.collection('jobs').doc(req.params.id).get();
    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }
    res.json({ id: jobDoc.id, ...jobDoc.data() });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Créer une offre d'emploi
router.post('/', async (req, res) => {
  try {
    const jobRef = await db.collection('jobs').add({
      ...req.body,
      creatorId: req.user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).json({ id: jobRef.id, ...req.body });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Mettre à jour une offre d'emploi
router.put('/:id', async (req, res) => {
  try {
    await db.collection('jobs').doc(req.params.id).update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Supprimer une offre d'emploi
router.delete('/:id', async (req, res) => {
  try {
    await db.collection('jobs').doc(req.params.id).delete();
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router; 