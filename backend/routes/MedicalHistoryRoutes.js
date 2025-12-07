const express = require("express");
const router = express.Router();
const controller = require("../controllers/MedicalHistoryController");

// CREATE
router.post("", controller.create);

// GET BY ID
router.get("/:id", controller.getById);

// UPDATE
router.put("", controller.update);

// DELETE
router.delete("/:id", controller.remove);

module.exports = router;
