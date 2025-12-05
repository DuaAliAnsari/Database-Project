const DoctorModel = require('../models/DoctorModel');

class DoctorController {

  // Get all doctors
  async getAllDoctors(req, res) {
    try {
      const doctors = await DoctorModel.getAllDoctors();
      res.status(200).json({ success: true, data: doctors });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get doctor by ID
  async getDoctorById(req, res) {
    try {
      const doctorId = req.params.id;
      const doctor = await DoctorModel.getDoctorById(doctorId);

      if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }

      res.status(200).json({ success: true, data: doctor });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get doctors by department
  async getDoctorsByDepartment(req, res) {
    try {
      const department = req.params.department;
      const doctors = await DoctorModel.getDoctorsByDepartment(department);
      res.status(200).json({ success: true, data: doctors });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Create a new doctor
  async createDoctor(req, res) {
    try {
      const newDoctor = req.body;

      if (!newDoctor.doctor_id || !newDoctor.doctor_name) {
        return res.status(400).json({
          success: false,
          message: "doctor_id and doctor_name are required"
        });
      }

      const result = await DoctorModel.createDoctor(newDoctor);
      res.status(201).json({ 
        success: true, 
        message: "Doctor created successfully", 
        doctorId: result.doctorId 
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Update doctor
  async updateDoctor(req, res) {
    try {
      const doctorId = req.params.id;
      const updateData = req.body;

      const result = await DoctorModel.updateDoctor(doctorId, updateData);

      if (result.rowsAffected === 0) {
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }

      res.status(200).json({ success: true, message: "Doctor updated successfully" });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Delete doctor
  async deleteDoctor(req, res) {
    try {
      const doctorId = req.params.id;
      const result = await DoctorModel.deleteDoctor(doctorId);

      if (result.rowsAffected === 0) {
        return res.status(404).json({ success: false, message: "Doctor not found" });
      }

      res.status(200).json({ success: true, message: "Doctor deleted successfully" });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get doctor appointments
  async getDoctorAppointments(req, res) {
    try {
      const doctorId = req.params.id;
      const appointments = await DoctorModel.getDoctorAppointments(doctorId);
      res.status(200).json({ success: true, data: appointments });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get doctor prescriptions
  async getDoctorPrescriptions(req, res) {
    try {
      const doctorId = req.params.id;
      const prescriptions = await DoctorModel.getDoctorPrescriptions(doctorId);
      res.status(200).json({ success: true, data: prescriptions });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get doctor schedule (appointments for a specific date)
  async getDoctorSchedule(req, res) {
    try {
      const doctorId = req.params.id;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: "date query parameter is required (YYYY-MM-DD)"
        });
      }

      const schedule = await DoctorModel.getDoctorSchedule(doctorId, date);
      res.status(200).json({ success: true, data: schedule });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Search doctor by name
  async searchDoctors(req, res) {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Query parameter 'q' is required"
        });
      }

      const results = await DoctorModel.searchDoctors(q);
      res.status(200).json({ success: true, data: results });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new DoctorController();