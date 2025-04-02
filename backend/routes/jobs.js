const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateUser, authorizeRoles } = require('../middleware/auth');

// Routes publiques
router.get('/', jobController.getJobs);
router.get('/:id', jobController.getJobById);

// Routes protégées
router.post('/', authenticateUser, jobController.createJob);
router.put('/:id', authenticateUser, jobController.updateJob);
router.delete('/:id', authenticateUser, jobController.deleteJob);

// Routes pour les candidatures
router.post('/:id/apply', authenticateUser, jobController.applyToJob);
router.patch('/:id/accept/:applicantId', authenticateUser, jobController.acceptApplicant);
router.patch('/:id/reject/:applicantId', authenticateUser, jobController.rejectApplicant);
router.patch('/:id/complete', authenticateUser, jobController.completeJob);

module.exports = router; 