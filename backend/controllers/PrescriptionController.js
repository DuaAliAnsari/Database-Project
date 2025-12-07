// controllers/PrescriptionController.js
const PrescriptionModel = require("../models/PrescriptionModel");

class PrescriptionController {
    async getAllPrescriptions(req, res) {
  try {
    const prescriptions = await PrescriptionModel.getAllPrescriptions();

    console.log("📌 RAW PRESCRIPTIONS VALUE BELOW");
    console.dir(prescriptions, { depth: 5 }); // <-- ADD THIS LINE

    res.status(200).json({ success: true, data: prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}


  async getPrescriptionById(req, res) {
    try {
      const id = req.params.id;
      const prescription = await PrescriptionModel.getPrescriptionById(id);

      if (!prescription) {
        return res
          .status(404)
          .json({ success: false, message: "Prescription not found" });
      }

      res.status(200).json({ success: true, data: prescription });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createPrescription(req, res) {
    try {
      const data = req.body;

      if (
        !data.prescription_id ||
        !data.patient_id ||
        !data.doctor_id ||
        !data.medication_name ||
        !data.issue_date
      ) {
        return res.status(400).json({
          success: false,
          message:
            "prescription_id, patient_id, doctor_id, medication_name, issue_date are required"
        });
      }

      const result = await PrescriptionModel.createPrescription(data);
      res.status(201).json({
        success: true,
        message: "Prescription created successfully",
        prescriptionId: result.prescriptionId
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updatePrescription(req, res) {
    try {
      const id = req.params.id;
      const updateData = req.body;

      const result = await PrescriptionModel.updatePrescription(id, updateData);

      if (result.rowsAffected === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Prescription not found" });
      }

      res
        .status(200)
        .json({ success: true, message: "Prescription updated successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deletePrescription(req, res) {
    try {
      const id = req.params.id;
      const result = await PrescriptionModel.deletePrescription(id);

      if (result.rowsAffected === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Prescription not found" });
      }

      res
        .status(200)
        .json({ success: true, message: "Prescription deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPrescriptionsByPatient(req, res) {
    try {
      const patientId = req.params.id;
      const prescriptions =
        await PrescriptionModel.getPrescriptionsByPatient(patientId);
      res.status(200).json({ success: true, data: prescriptions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPrescriptionsByPatientAppointment(req, res) {
    try {
      const { patientId, appointmentId } = req.params;
      const prescriptions =
        await PrescriptionModel.getPrescriptionsByPatientAppointment(
          patientId,
          appointmentId
        );

      if (!prescriptions || prescriptions.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No prescriptions found for this patient and appointment"
        });
      }

      res.status(200).json({ success: true, data: prescriptions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PrescriptionController();