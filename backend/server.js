const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

// Charger les variables d'environnement
dotenv.config();

// Initialiser Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.log('Firebase déjà initialisé');
}

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware d'authentification Firebase
const authenticateFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Token non fourni' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'API CREALINK' });
});

// Routes d'authentification (non protégées)
app.use('/api/auth', require('./routes/auth'));

// Routes protégées
app.use('/api/jobs', authenticateFirebaseToken, require('./routes/jobs'));
app.use('/api/users', authenticateFirebaseToken, require('./routes/users'));
app.use('/api/messages', authenticateFirebaseToken, require('./routes/messages'));
app.use('/api/contracts', authenticateFirebaseToken, require('./routes/contracts'));

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur' });
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
}); 