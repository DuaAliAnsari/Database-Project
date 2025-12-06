// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/AppointmentController');

// Get all appointments
router.get('/', AppointmentController.getAllAppointments.bind(AppointmentController));

// Get upcoming appointments (must be before /:id route)
router.get('/upcoming', AppointmentController.getUpcomingAppointments.bind(AppointmentController));

// Get appointments by status
router.get('/status/:status', AppointmentController.getAppointmentsByStatus.bind(AppointmentController));

// Get appointments by date
router.get('/date/:date', AppointmentController.getAppointmentsByDate.bind(AppointmentController));

// Get appointments by doctor
router.get('/doctor/:doctorId', AppointmentController.getAppointmentsByDoctor.bind(AppointmentController));

// Get appointments by patient
router.get('/patient/:patientId', AppointmentController.getAppointmentsByPatient.bind(AppointmentController));

// Get appointment by ID
router.get('/:id', AppointmentController.getAppointmentById.bind(AppointmentController));

// Create new appointment
router.post('/', AppointmentController.createAppointment.bind(AppointmentController));

// Update appointment
router.put('/:id', AppointmentController.updateAppointment.bind(AppointmentController));

// Update appointment status
router.patch('/:id/status', AppointmentController.updateAppointmentStatus.bind(AppointmentController));

// Delete appointment
router.delete('/:id', AppointmentController.deleteAppointment.bind(AppointmentController));

module.exports = router;