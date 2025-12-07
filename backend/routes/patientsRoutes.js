const express = require('express');
const router = express.Router();
const PatientController = require('../controllers/patientsController');

// Search (MUST come before /:id)
router.get('/search', PatientController.searchPatients);

// Basic CRUD
router.get('/', PatientController.getAllPatients);
router.get('/:id', PatientController.getPatientById);
router.post('/', PatientController.createPatient);
router.put('/:id', PatientController.updatePatient);

// Related data
router.get('/:id/appointments', PatientController.getPatientAppointments);

module.exports = router;