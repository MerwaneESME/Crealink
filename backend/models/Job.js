const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobType: {
    type: String,
    enum: ['creator-post', 'expert-post'],
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['editing', 'filming', 'scriptwriting', 'thumbnail', 'voiceover', 'animation', 'other']
  },
  budget: {
    type: Number,
    required: true
  },
  duration: {
    type: String,
    required: true // e.g., "1-2 weeks", "1 month", etc.
  },
  location: {
    type: String,
    enum: ['remote', 'on-site', 'hybrid'],
    default: 'remote'
  },
  skills: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'canceled'],
    default: 'open'
  },
  applicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    coverLetter: String,
    proposedBudget: Number,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  views: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Mise à jour de la date de modification avant chaque sauvegarde
JobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Job', JobSchema); 