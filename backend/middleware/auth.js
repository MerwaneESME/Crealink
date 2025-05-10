const admin = require('firebase-admin');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token non fourni' });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Format de token invalide' });
    }

    // Vérifier le token avec Firebase
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (firebaseError) {
      return res.status(401).json({ error: 'Token Firebase invalide' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur d\'authentification' });
  }
};

// Middleware pour vérifier le rôle de l'utilisateur
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    next();
  };
};

module.exports = { authenticateUser, authorizeRoles }; 