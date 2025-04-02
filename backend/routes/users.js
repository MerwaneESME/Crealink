const express = require('express');
const router = express.Router();
const { authenticateUser, authorizeRoles } = require('../middleware/auth');
const User = require('../models/User');

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
router.put('/profile', authenticateUser, async (req, res) => {
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
    
    // Trouver l'utilisateur à mettre à jour
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    // Mettre à jour les champs de base
    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (skills) user.skills = skills;
    if (location) user.location = location;
    if (phone) user.phone = phone;
    if (profileImage) user.profileImage = profileImage;
    
    // Mettre à jour les liens sociaux
    if (socialLinks) {
      user.socialLinks = {
        ...user.socialLinks,
        ...socialLinks
      };
    }
    
    // Mettre à jour les champs spécifiques au rôle
    if (user.role === 'creator' && req.body.channelInfo) {
      user.channelInfo = {
        ...user.channelInfo,
        ...req.body.channelInfo
      };
    }
    
    if (user.role === 'expert' && req.body.expertise) {
      user.expertise = {
        ...user.expertise,
        ...req.body.expertise
      };
    }
    
    // Sauvegarder les modifications
    await user.save();
    
    // Renvoyer l'utilisateur sans le mot de passe
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du profil' });
  }
});

// Rechercher des experts par compétences
router.get('/experts/search', async (req, res) => {
  try {
    const { skills, categories, location, page = 1, limit = 10 } = req.query;
    
    // Construire la requête
    const query = { role: 'expert' };
    
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : [skills];
      query.skills = { $in: skillsArray };
    }
    
    if (categories) {
      const categoriesArray = Array.isArray(categories) ? categories : [categories];
      query['expertise.categories'] = { $in: categoriesArray };
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Exécuter la requête avec pagination
    const experts = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'rating.average': -1 });
      
    // Obtenir le nombre total d'experts correspondant aux critères
    const total = await User.countDocuments(query);
    
    res.json({
      experts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la recherche d\'experts:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la recherche d\'experts' });
  }
});

// Rechercher des créateurs
router.get('/creators/search', async (req, res) => {
  try {
    const { type, subscribersMin, page = 1, limit = 10 } = req.query;
    
    // Construire la requête
    const query = { role: 'creator' };
    
    if (type) {
      query['channelInfo.type'] = type;
    }
    
    if (subscribersMin) {
      query['channelInfo.subscribers'] = { $gte: parseInt(subscribersMin) };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Exécuter la requête avec pagination
    const creators = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'channelInfo.subscribers': -1 });
      
    // Obtenir le nombre total de créateurs correspondant aux critères
    const total = await User.countDocuments(query);
    
    res.json({
      creators,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la recherche de créateurs:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la recherche de créateurs' });
  }
});

// Changer le mot de passe
router.put('/password', authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Trouver l'utilisateur
    const user = await User.findById(req.user.id);
    
    // Vérifier l'ancien mot de passe
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
    }
    
    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Mot de passe mis à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({ message: 'Erreur serveur lors du changement de mot de passe' });
  }
});

module.exports = router; 