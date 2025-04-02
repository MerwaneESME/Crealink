const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['montage', 'cadrage', 'editing', 'autre'],
    required: true
  },
  createur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prestataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  statut: {
    type: String,
    enum: ['ouvert', 'en_cours', 'termine', 'annule'],
    default: 'ouvert'
  },
  candidatures: [{
    prestataire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    prix: Number,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  delai: {
    type: Date,
    required: true
  },
  fichiers: [{
    type: String // URLs des fichiers
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema); 