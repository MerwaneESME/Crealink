const Job = require('../models/Job');
const User = require('../models/User');

// Créer une nouvelle offre d'emploi
exports.createJob = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      jobType, 
      category, 
      budget, 
      duration, 
      location, 
      skills,
      attachments
    } = req.body;

    // Créer une nouvelle offre d'emploi
    const job = new Job({
      title,
      description,
      creator: req.user.id,
      jobType,
      category,
      budget,
      duration,
      location,
      skills,
      attachments
    });

    // Sauvegarder l'offre d'emploi
    await job.save();

    // Retourner l'offre d'emploi créée
    res.status(201).json(job);
  } catch (error) {
    console.error('Erreur lors de la création de l\'offre d\'emploi:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de l\'offre d\'emploi' });
  }
};

// Obtenir toutes les offres d'emploi avec filtres et pagination
exports.getJobs = async (req, res) => {
  try {
    const { 
      jobType, 
      category, 
      minBudget, 
      maxBudget, 
      location, 
      status, 
      skills,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Construire la requête de filtre
    const query = {};

    if (jobType) query.jobType = jobType;
    if (category) query.category = category;
    if (status) query.status = status;
    if (location) query.location = location;
    
    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = parseInt(minBudget);
      if (maxBudget) query.budget.$lte = parseInt(maxBudget);
    }

    if (skills) {
      query.skills = { $in: Array.isArray(skills) ? skills : [skills] };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Tri
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Exécuter la requête avec pagination et tri
    const jobs = await Job.find(query)
      .populate('creator', 'name profileImage role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Obtenir le nombre total de résultats pour la pagination
    const total = await Job.countDocuments(query);

    res.json({
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des offres d\'emploi:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des offres d\'emploi' });
  }
};

// Obtenir une offre d'emploi par son ID
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('creator', 'name profileImage role')
      .populate('applicants.user', 'name profileImage role')
      .populate('assignedTo', 'name profileImage role');

    if (!job) {
      return res.status(404).json({ message: 'Offre d\'emploi non trouvée' });
    }

    // Incrémenter le compteur de vues
    job.views += 1;
    await job.save();

    res.json(job);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'offre d\'emploi:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de l\'offre d\'emploi' });
  }
};

// Mettre à jour une offre d'emploi
exports.updateJob = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      budget, 
      duration, 
      location, 
      skills,
      status,
      attachments
    } = req.body;

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Offre d\'emploi non trouvée' });
    }

    // Vérifier si l'utilisateur est le créateur de l'offre
    if (job.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à modifier cette offre d\'emploi' });
    }

    // Mettre à jour les champs
    if (title) job.title = title;
    if (description) job.description = description;
    if (category) job.category = category;
    if (budget) job.budget = budget;
    if (duration) job.duration = duration;
    if (location) job.location = location;
    if (skills) job.skills = skills;
    if (status) job.status = status;
    if (attachments) job.attachments = attachments;

    // Sauvegarder les modifications
    await job.save();

    res.json(job);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'offre d\'emploi:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de l\'offre d\'emploi' });
  }
};

// Supprimer une offre d'emploi
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Offre d\'emploi non trouvée' });
    }

    // Vérifier si l'utilisateur est le créateur de l'offre
    if (job.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à supprimer cette offre d\'emploi' });
    }

    // Supprimer l'offre
    await job.remove();

    res.json({ message: 'Offre d\'emploi supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'offre d\'emploi:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de l\'offre d\'emploi' });
  }
};

// Postuler à une offre d'emploi
exports.applyToJob = async (req, res) => {
  try {
    const { coverLetter, proposedBudget } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Offre d\'emploi non trouvée' });
    }

    // Vérifier si l'utilisateur n'est pas le créateur de l'offre
    if (job.creator.toString() === req.user.id) {
      return res.status(400).json({ message: 'Vous ne pouvez pas postuler à votre propre offre d\'emploi' });
    }

    // Vérifier si l'utilisateur a déjà postulé
    const alreadyApplied = job.applicants.some(applicant => 
      applicant.user.toString() === req.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({ message: 'Vous avez déjà postulé à cette offre d\'emploi' });
    }

    // Ajouter la candidature
    job.applicants.push({
      user: req.user.id,
      coverLetter,
      proposedBudget,
      status: 'pending',
      appliedAt: Date.now()
    });

    await job.save();

    res.json({ message: 'Candidature envoyée avec succès', job });
  } catch (error) {
    console.error('Erreur lors de la candidature:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la candidature' });
  }
};

// Accepter une candidature
exports.acceptApplicant = async (req, res) => {
  try {
    const { applicantId } = req.params;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Offre d\'emploi non trouvée' });
    }

    // Vérifier si l'utilisateur est le créateur de l'offre
    if (job.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à accepter des candidats pour cette offre' });
    }

    // Trouver l'applicant
    const applicant = job.applicants.find(app => app.user.toString() === applicantId);

    if (!applicant) {
      return res.status(404).json({ message: 'Candidat non trouvé' });
    }

    // Accepter le candidat
    applicant.status = 'accepted';
    job.status = 'in-progress';
    job.assignedTo = applicantId;

    // Rejeter tous les autres candidats
    job.applicants.forEach(app => {
      if (app.user.toString() !== applicantId) {
        app.status = 'rejected';
      }
    });

    await job.save();

    res.json({ message: 'Candidat accepté avec succès', job });
  } catch (error) {
    console.error('Erreur lors de l\'acceptation du candidat:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'acceptation du candidat' });
  }
};

// Rejeter une candidature
exports.rejectApplicant = async (req, res) => {
  try {
    const { applicantId } = req.params;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Offre d\'emploi non trouvée' });
    }

    // Vérifier si l'utilisateur est le créateur de l'offre
    if (job.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à rejeter des candidats pour cette offre' });
    }

    // Trouver l'applicant
    const applicant = job.applicants.find(app => app.user.toString() === applicantId);

    if (!applicant) {
      return res.status(404).json({ message: 'Candidat non trouvé' });
    }

    // Rejeter le candidat
    applicant.status = 'rejected';
    await job.save();

    res.json({ message: 'Candidat rejeté avec succès', job });
  } catch (error) {
    console.error('Erreur lors du rejet du candidat:', error);
    res.status(500).json({ message: 'Erreur serveur lors du rejet du candidat' });
  }
};

// Marquer une offre comme terminée
exports.completeJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Offre d\'emploi non trouvée' });
    }

    // Vérifier si l'utilisateur est le créateur de l'offre
    if (job.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Non autorisé à terminer cette offre' });
    }

    // Vérifier si l'offre est en cours
    if (job.status !== 'in-progress') {
      return res.status(400).json({ message: 'Cette offre n\'est pas en cours' });
    }

    // Marquer comme terminée
    job.status = 'completed';
    job.endDate = Date.now();
    await job.save();

    // Mettre à jour le compteur de missions terminées de l'expert
    if (job.assignedTo) {
      const expert = await User.findById(job.assignedTo);
      if (expert) {
        expert.completedJobs += 1;
        await expert.save();
      }
    }

    res.json({ message: 'Offre d\'emploi marquée comme terminée', job });
  } catch (error) {
    console.error('Erreur lors de la complétion de l\'offre:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la complétion de l\'offre' });
  }
}; 