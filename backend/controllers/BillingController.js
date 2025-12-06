const BillingModel = require("../models/BillingModel");

class BillingController {
  async getAllBills(req, res) {
    try {
      const bills = await BillingModel.getAllBills();
      res.status(200).json({ success: true, data: bills });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getBillById(req, res) {
    try {
      const billId = req.params.id;
      const bill = await BillingModel.getBillById(billId);

      if (!bill) {
        return res.status(404).json({ success: false, message: "Bill not found" });
      }

      res.status(200).json({ success: true, data: bill });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createBill(req, res) {
    try {
      const billData = req.body;

      if (!billData.billing_id || !billData.patient_id || !billData.bill_date) {
        return res.status(400).json({
          success: false,
          message: "billing_id, patient_id, and bill_date are required"
        });
      }

      const result = await BillingModel.createBill(billData);
      res.status(201).json({
        success: true,
        message: "Bill created successfully",
        billingId: result.billingId
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async updateBill(req, res) {
    try {
      const billId = req.params.id;
      const updateData = req.body;

      const result = await BillingModel.updateBill(billId, updateData);

      if (result.rowsAffected === 0) {
        return res.status(404).json({ success: false, message: "Bill not found" });
      }

      res.status(200).json({ success: true, message: "Bill updated successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async deleteBill(req, res) {
    try {
      const billId = req.params.id;
      const result = await BillingModel.deleteBill(billId);

      if (result.rowsAffected === 0) {
        return res.status(404).json({ success: false, message: "Bill not found" });
      }

      res.status(200).json({ success: true, message: "Bill deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getBillsByPatient(req, res) {
    try {
      const patientId = req.params.id;
      const bills = await BillingModel.getBillsByPatient(patientId);
      res.status(200).json({ success: true, data: bills });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getPendingBills(req, res) {
    try {
      const bills = await BillingModel.getPendingBills();
      res.status(200).json({ success: true, data: bills });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getBillsByPatientAppointment(req, res) {
    try {
      const { patientId, appointmentId } = req.params;
      const bills = await BillingModel.getBillsByPatientAppointment(patientId, appointmentId);

      if (!bills || bills.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No bills found for this patient and appointment"
        });
      }

      res.status(200).json({ success: true, data: bills });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new BillingController();
