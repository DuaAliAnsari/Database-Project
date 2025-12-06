const express = require("express");
const router = express.Router();
const BillingController = require("../controllers/BillingController");

router.get("/", BillingController.getAllBills);
router.get("/:id", BillingController.getBillById);
router.post("/", BillingController.createBill);
router.put("/:id", BillingController.updateBill);
router.delete("/:id", BillingController.deleteBill);

router.get("/patient/:id", BillingController.getBillsByPatient);
router.get("/pending/all", BillingController.getPendingBills);
router.get("/patient/:patientId/appointment/:appointmentId",
  BillingController.getBillsByPatientAppointment
);

module.exports = router;
