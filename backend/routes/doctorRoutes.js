const express = require('express');
const router = express.Router();
const DoctorController = require('../controllers/DoctorController');

// Search + Filtering (MUST come before /:id)
router.get('/search', DoctorController.searchDoctors);
router.get('/department/:department', DoctorController.getDoctorsByDepartment);

// Basic CRUD
router.get('/', DoctorController.getAllDoctors);
router.get('/:id', DoctorController.getDoctorById);
router.post('/', DoctorController.createDoctor);
router.put('/:id', DoctorController.updateDoctor);
router.delete('/:id', DoctorController.deleteDoctor);

// Related data
router.get('/:id/appointments', DoctorController.getDoctorAppointments);
router.get('/:id/prescriptions', DoctorController.getDoctorPrescriptions);
router.get('/:id/schedule', DoctorController.getDoctorSchedule);

module.exports = router;