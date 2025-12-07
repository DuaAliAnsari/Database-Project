// routes/appointmentRoutes.js
const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/AppointmentController');

// Check available slots (must be before /:id routes)
router.get('/available-slots', appointmentController.checkAvailableSlots);

// Get all appointments
router.get('/', appointmentController.getAllAppointments);

// Get upcoming appointments
router.get('/upcoming', appointmentController.getUpcomingAppointments);

// Get appointments by status
router.get('/status/:status', appointmentController.getAppointmentsByStatus);

// Get appointments by date
router.get('/date/:date', appointmentController.getAppointmentsByDate);

// Get appointments by doctor
router.get('/doctor/:doctorId', appointmentController.getAppointmentsByDoctor);

// Get appointments by patient
router.get('/patient/:patientId', appointmentController.getAppointmentsByPatient);

// Get appointment by ID
router.get('/:id', appointmentController.getAppointmentById);

// Create new appointment
router.post('/', appointmentController.createAppointment);

// Update appointment
router.put('/:id', appointmentController.updateAppointment);

// Update appointment status
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

// Delete appointment
router.delete('/:id', appointmentController.deleteAppointment);

module.exports = router;