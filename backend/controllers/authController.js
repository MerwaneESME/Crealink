const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Inscription d'un nouvel utilisateur
exports.register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Créer un nouvel utilisateur
    const user = new User({
      email,
      password,
      name,
      role
    });

    // Si l'utilisateur est un créateur, ajouter les informations de chaîne
    if (role === 'creator' && req.body.channelInfo) {
      user.channelInfo = {
        name: req.body.channelInfo.name || '',
        subscribers: req.body.channelInfo.subscribers || 0,
        type: req.body.channelInfo.type || ''
      };
    }

    // Si l'utilisateur est un expert, ajouter les informations d'expertise
    if (role === 'expert' && req.body.expertise) {
      user.expertise = {
        categories: req.body.expertise.categories || [],
        yearsOfExperience: req.body.expertise.yearsOfExperience || 0,
        portfolioUrl: req.body.expertise.portfolioUrl || ''
      };
    }

    // Sauvegarder l'utilisateur
    await user.save();

    // Générer un token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retourner l'utilisateur sans le mot de passe
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;

    res.status(201).json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
};

// Connexion d'un utilisateur
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Trouver l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Email ou mot de passe incorrect' });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retourner l'utilisateur sans le mot de passe
    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;

    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
};

// Récupérer les informations de l'utilisateur actuel
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}; 