const VisitRecordModel = require("../models/VisitRecordModel");

class VisitRecordController {
  async getAll(req, res) {
    try {
      const data = await VisitRecordModel.getAll();
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const data = await VisitRecordModel.getById(req.params.id);
      if (!data) {
        return res.status(404).json({ success: false, message: "Visit not found" });
      }
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getByPatient(req, res) {
    try {
      const data = await VisitRecordModel.getByPatient(req.params.id);
      res.status(200).json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req, res) {
    try {
      await VisitRecordModel.create(req.body);
      res.status(201).json({ success: true, message: "Visit record added successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const affected = await VisitRecordModel.update(req.params.id, req.body);
      if (!affected) {
        return res.status(404).json({ success: false, message: "Visit not found" });
      }
      res.status(200).json({ success: true, message: "Visit updated successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const affected = await VisitRecordModel.delete(req.params.id);
      if (!affected) {
        return res.status(404).json({ success: false, message: "Visit not found" });
      }
      res.status(200).json({ success: true, message: "Visit deleted successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getVisitGap(req, res) {
    try {
      const days = await VisitRecordModel.getVisitGap(req.params.id);
      res.status(200).json({ success: true, days });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new VisitRecordController();
