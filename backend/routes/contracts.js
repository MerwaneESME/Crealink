const express = require('express');
const router = express.Router();
const Contract = require('../models/Contract');
const Job = require('../models/Job');
const User = require('../models/User');
const { authenticateUser } = require('../middleware/auth');

// Toutes les routes nécessitent une authentification
router.use(authenticateUser);

// Créer un nouveau contrat
router.post('/', async (req, res) => {
  try {
    const {
      jobId,
      expertId,
      title,
      description,
      amount,
      startDate,
      endDate,
      deliverables,
      terms
    } = req.body;
    
    // Vérifier si le job existe
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Offre d\'emploi non trouvée' });
    }
    
    // Vérifier si l'utilisateur est le créateur du job
    if (job.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à créer un contrat pour cette offre' });
    }
    
    // Créer un nouveau contrat
    const contract = new Contract({
      job: jobId,
      creator: req.user.id,
      expert: expertId,
      title,
      description,
      amount,
      startDate,
      endDate,
      deliverables,
      terms,
      creatorApproved: true // Le créateur approuve automatiquement le contrat qu'il crée
    });
    
    await contract.save();
    
    // Mettre à jour le statut du job
    job.status = 'in-progress';
    await job.save();
    
    // Renvoyer le contrat avec les détails des participants
    const populatedContract = await Contract.findById(contract._id)
      .populate('creator', 'name profileImage')
      .populate('expert', 'name profileImage')
      .populate('job', 'title');
    
    res.status(201).json(populatedContract);
  } catch (error) {
    console.error('Erreur lors de la création du contrat:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du contrat' });
  }
});

// Obtenir tous les contrats d'un utilisateur
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    // Construire la requête
    const query = {
      $or: [
        { creator: req.user.id },
        { expert: req.user.id }
      ]
    };
    
    if (status) {
      query.status = status;
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Exécuter la requête avec pagination et tri
    const contracts = await Contract.find(query)
      .populate('creator', 'name profileImage')
      .populate('expert', 'name profileImage')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Obtenir le nombre total de contrats
    const total = await Contract.countDocuments(query);
    
    res.json({
      contracts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des contrats:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des contrats' });
  }
});

// Obtenir un contrat par son ID
router.get('/:id', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate('creator', 'name profileImage')
      .populate('expert', 'name profileImage')
      .populate('job', 'title');
    
    if (!contract) {
      return res.status(404).json({ message: 'Contrat non trouvé' });
    }
    
    // Vérifier si l'utilisateur est impliqué dans le contrat
    if (contract.creator.toString() !== req.user.id && contract.expert.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à accéder à ce contrat' });
    }
    
    res.json(contract);
  } catch (error) {
    console.error('Erreur lors de la récupération du contrat:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du contrat' });
  }
});

// Approuver un contrat (par l'expert)
router.patch('/:id/approve', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: 'Contrat non trouvé' });
    }
    
    // Vérifier si l'utilisateur est l'expert impliqué dans le contrat
    if (contract.expert.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à approuver ce contrat' });
    }
    
    // Approuver le contrat
    contract.expertApproved = true;
    
    // Si les deux parties ont approuvé, changer le statut du contrat
    if (contract.creatorApproved) {
      contract.status = 'active';
    }
    
    await contract.save();
    
    res.json({ message: 'Contrat approuvé avec succès', contract });
  } catch (error) {
    console.error('Erreur lors de l\'approbation du contrat:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'approbation du contrat' });
  }
});

// Compléter un livrable
router.patch('/:id/deliverables/:deliverableIndex/complete', async (req, res) => {
  try {
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: 'Contrat non trouvé' });
    }
    
    // Vérifier si l'utilisateur est impliqué dans le contrat
    if (contract.creator.toString() !== req.user.id && contract.expert.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à modifier ce contrat' });
    }
    
    // Vérifier si le contrat est actif
    if (contract.status !== 'active') {
      return res.status(400).json({ message: 'Ce contrat n\'est pas actif' });
    }
    
    // Vérifier si le livrable existe
    const deliverableIndex = parseInt(req.params.deliverableIndex);
    if (!contract.deliverables[deliverableIndex]) {
      return res.status(404).json({ message: 'Livrable non trouvé' });
    }
    
    // Vérifier que l'expert est celui qui marque le livrable comme complété
    if (req.user.role === 'expert' && contract.expert.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Seul l\'expert assigné peut marquer le livrable comme complété' });
    }
    
    // Marquer le livrable comme complété
    contract.deliverables[deliverableIndex].isCompleted = true;
    contract.deliverables[deliverableIndex].completedAt = Date.now();
    
    // Vérifier si tous les livrables sont complétés
    const allCompleted = contract.deliverables.every(deliverable => deliverable.isCompleted);
    if (allCompleted) {
      contract.status = 'completed';
      
      // Mettre à jour le statut du job
      const job = await Job.findById(contract.job);
      if (job) {
        job.status = 'completed';
        job.endDate = Date.now();
        await job.save();
      }
    }
    
    await contract.save();
    
    res.json({ message: 'Livrable marqué comme complété', contract });
  } catch (error) {
    console.error('Erreur lors de la complétion du livrable:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la complétion du livrable' });
  }
});

// Ajouter un feedback
router.post('/:id/feedback', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const contract = await Contract.findById(req.params.id);
    
    if (!contract) {
      return res.status(404).json({ message: 'Contrat non trouvé' });
    }
    
    // Vérifier si l'utilisateur est impliqué dans le contrat
    if (contract.creator.toString() !== req.user.id && contract.expert.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à ajouter un feedback à ce contrat' });
    }
    
    // Vérifier si le contrat est complété
    if (contract.status !== 'completed') {
      return res.status(400).json({ message: 'Le feedback ne peut être ajouté qu\'à un contrat complété' });
    }
    
    // Ajouter le feedback selon l'utilisateur
    if (contract.creator.toString() === req.user.id) {
      contract.feedback.creatorToExpert = {
        rating,
        comment,
        date: Date.now()
      };
      
      // Mettre à jour la note de l'expert
      const expert = await User.findById(contract.expert);
      if (expert) {
        const totalRating = expert.rating.average * expert.rating.count;
        expert.rating.count += 1;
        expert.rating.average = (totalRating + rating) / expert.rating.count;
        await expert.save();
      }
    } else {
      contract.feedback.expertToCreator = {
        rating,
        comment,
        date: Date.now()
      };
    }
    
    await contract.save();
    
    res.json({ message: 'Feedback ajouté avec succès', contract });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du feedback:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'ajout du feedback' });
  }
});

module.exports = router; 