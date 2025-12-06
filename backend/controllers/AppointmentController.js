// controllers/AppointmentController.js
const AppointmentModel = require('../models/AppointmentModel');

class AppointmentController {
  
  // Get all appointments
  async getAllAppointments(req, res) {
    try {
      const appointments = await AppointmentModel.getAllAppointments();
      res.status(200).json({
        success: true,
        data: appointments,
        count: appointments.length
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch appointments',
        error: error.message
      });
    }
  }

  // Get appointment by ID
  async getAppointmentById(req, res) {
    try {
      const { id } = req.params;
      const appointment = await AppointmentModel.getAppointmentById(id);
      
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      res.status(200).json({
        success: true,
        data: appointment
      });
    } catch (error) {
      console.error('Error fetching appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch appointment',
        error: error.message
      });
    }
  }

  // Create new appointment
  async createAppointment(req, res) {
    try {
      const appointmentData = req.body;
      
      // Validation
      if (!appointmentData.appointment_id || !appointmentData.patient_id || 
          !appointmentData.doctor_id || !appointmentData.appointment_date || 
          !appointmentData.appointment_time) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: appointment_id, patient_id, doctor_id, appointment_date, appointment_time'
        });
      }

      const result = await AppointmentModel.createAppointment(appointmentData);
      
      res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: result
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create appointment',
        error: error.message
      });
    }
  }

  // Update appointment
  async updateAppointment(req, res) {
    try {
      const { id } = req.params;
      const appointmentData = req.body;

      // Check if appointment exists
      const existingAppointment = await AppointmentModel.getAppointmentById(id);
      if (!existingAppointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      const result = await AppointmentModel.updateAppointment(id, appointmentData);
      
      res.status(200).json({
        success: true,
        message: 'Appointment updated successfully',
        data: result
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update appointment',
        error: error.message
      });
    }
  }

  // Delete appointment
  async deleteAppointment(req, res) {
    try {
      const { id } = req.params;

      // Check if appointment exists
      const existingAppointment = await AppointmentModel.getAppointmentById(id);
      if (!existingAppointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      const result = await AppointmentModel.deleteAppointment(id);
      
      res.status(200).json({
        success: true,
        message: 'Appointment deleted successfully',
        data: result
      });
    } catch (error) {
      console.error('Error deleting appointment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete appointment',
        error: error.message
      });
    }
  }

  // Get appointments by status
  async getAppointmentsByStatus(req, res) {
    try {
      const { status } = req.params;
      const appointments = await AppointmentModel.getAppointmentsByStatus(status);
      
      res.status(200).json({
        success: true,
        data: appointments,
        count: appointments.length
      });
    } catch (error) {
      console.error('Error fetching appointments by status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch appointments by status',
        error: error.message
      });
    }
  }

  // Get appointments by date
  async getAppointmentsByDate(req, res) {
    try {
      const { date } = req.params;
      
      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      const appointments = await AppointmentModel.getAppointmentsByDate(date);
      
      res.status(200).json({
        success: true,
        data: appointments,
        count: appointments.length
      });
    } catch (error) {
      console.error('Error fetching appointments by date:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch appointments by date',
        error: error.message
      });
    }
  }

  // Update appointment status
  async updateAppointmentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      // Check if appointment exists
      const existingAppointment = await AppointmentModel.getAppointmentById(id);
      if (!existingAppointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found'
        });
      }

      const result = await AppointmentModel.updateAppointmentStatus(id, status);
      
      res.status(200).json({
        success: true,
        message: 'Appointment status updated successfully',
        data: result
      });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update appointment status',
        error: error.message
      });
    }
  }

  // Get upcoming appointments
  async getUpcomingAppointments(req, res) {
    try {
      const appointments = await AppointmentModel.getUpcomingAppointments();
      
      res.status(200).json({
        success: true,
        data: appointments,
        count: appointments.length
      });
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch upcoming appointments',
        error: error.message
      });
    }
  }

  // Get appointments by doctor
  async getAppointmentsByDoctor(req, res) {
    try {
      const { doctorId } = req.params;
      const appointments = await AppointmentModel.getAppointmentsByDoctor(doctorId);
      
      res.status(200).json({
        success: true,
        data: appointments,
        count: appointments.length
      });
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch doctor appointments',
        error: error.message
      });
    }
  }

  // Get appointments by patient
  async getAppointmentsByPatient(req, res) {
    try {
      const { patientId } = req.params;
      const appointments = await AppointmentModel.getAppointmentsByPatient(patientId);
      
      res.status(200).json({
        success: true,
        data: appointments,
        count: appointments.length
      });
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch patient appointments',
        error: error.message
      });
    }
  }
}

module.exports = new AppointmentController();