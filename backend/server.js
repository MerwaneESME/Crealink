const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const jobRoutes = require('./routes/jobs');
const messageRoutes = require('./routes/messages');
const contractRoutes = require('./routes/contracts');

// Configuration des variables d'environnement
dotenv.config();

// Création de l'application Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/marketplace', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connecté à MongoDB'))
  .catch(err => console.error('Erreur de connexion à MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/contracts', contractRoutes);

// Route d'accueil pour l'API
app.get('/api', (req, res) => {
  res.json({
    message: 'Bienvenue sur l\'API CREALINK',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      jobs: '/api/jobs',
      messages: '/api/messages',
      contracts: '/api/contracts'
    }
  });
});

// Route racine
app.get('/', (req, res) => {
  res.json({
    message: 'Serveur CREALINK en ligne. Veuillez accéder à /api pour utiliser l\'API.'
  });
});

// Port du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
}); 