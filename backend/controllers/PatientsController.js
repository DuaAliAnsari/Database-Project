const PatientModel = require('../models/PatientModel');

class PatientController {

  // Get all patients
  async getAllPatients(req, res) {
    try {
      const patients = await PatientModel.getAllPatients();
      res.status(200).json({ success: true, data: patients });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get patient by ID
  async getPatientById(req, res) {
    try {
      const patientId = req.params.id;
      const patient = await PatientModel.getPatientById(patientId);

      if (!patient) {
        return res.status(404).json({ success: false, message: "Patient not found" });
      }

      res.status(200).json({ success: true, data: patient });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Create a new patient
  async createPatient(req, res) {
    try {
      const newPatient = req.body;

      if (!newPatient.patient_id || !newPatient.patient_name) {
        return res.status(400).json({
          success: false,
          message: "patient_id and patient_name are required"
        });
      }

      const result = await PatientModel.createPatient(newPatient);
      res.status(201).json({ 
        success: true, 
        message: "Patient created successfully", 
        patientId: result.patientId 
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Update patient
  async updatePatient(req, res) {
    try {
      const patientId = req.params.id;
      const updateData = req.body;

      const result = await PatientModel.updatePatient(patientId, updateData);

      if (result.rowsAffected === 0) {
        return res.status(404).json({ success: false, message: "Patient not found" });
      }

      res.status(200).json({ success: true, message: "Patient updated successfully" });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Delete patient
  async deletePatient(req, res) {
    try {
      const patientId = req.params.id;
      const result = await PatientModel.deletePatient(patientId);

      if (result.rowsAffected === 0) {
        return res.status(404).json({ success: false, message: "Patient not found" });
      }

      res.status(200).json({ success: true, message: "Patient deleted successfully" });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get patient appointments
  async getPatientAppointments(req, res) {
    try {
      const patientId = req.params.id;
      const appointments = await PatientModel.getPatientAppointments(patientId);
      res.status(200).json({ success: true, data: appointments });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Search patient by name
  async searchPatients(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Query parameter 'q' is required"
        });
      }

      const results = await PatientModel.searchPatients(q);
      res.status(200).json({ success: true, data: results });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PatientController();