// routes/PrescriptionRoutes.js
const express = require("express");
const router = express.Router();

const PrescriptionController = require("../controllers/PrescriptionController");

router.get("/", PrescriptionController.getAllPrescriptions);
router.get("/:id", PrescriptionController.getPrescriptionById);
router.post("/", PrescriptionController.createPrescription);
router.put("/:id", PrescriptionController.updatePrescription);
router.delete("/:id", PrescriptionController.deletePrescription);

router.get("/patient/:id", PrescriptionController.getPrescriptionsByPatient);
router.get(
  "/patient/:patientId/appointment/:appointmentId",
  PrescriptionController.getPrescriptionsByPatientAppointment
);

module.exports = router;
