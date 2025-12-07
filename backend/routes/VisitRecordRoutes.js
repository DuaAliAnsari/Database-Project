const express = require("express");
const router = express.Router();
const VisitRecordController = require("../controllers/VisitRecordController");

router.get("/", VisitRecordController.getAll);
router.get("/:id", VisitRecordController.getById);
router.get("/patient/:id", VisitRecordController.getByPatient);
router.get("/:id/gap", VisitRecordController.getVisitGap);

router.post("/", VisitRecordController.create);
router.put("/:id", VisitRecordController.update);
router.delete("/:id", VisitRecordController.delete);

module.exports = router;
