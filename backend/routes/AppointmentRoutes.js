/*const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/AppointmentController');

// Filtering (MUST come before /:id)
router.get('/status/:status', AppointmentController.getAppointmentsByStatus);
router.get('/date', AppointmentController.getAppointmentsByDate);

// Basic CRUD
router.get('/', AppointmentController.getAllAppointments);
router.get('/:id', AppointmentController.getAppointmentById);
router.post('/', AppointmentController.createAppointment);
router.put('/:id', AppointmentController.updateAppointment);
router.delete('/:id', AppointmentController.deleteAppointment);

// Status update
router.patch('/:id/status', AppointmentController.updateAppointmentStatus);

module.exports = router;*/