const model = require("../models/MedicalHistoryModel");

function handleOracleErrors(err) {
  if (err.errorNum === 1) {
    return "Patient's Record already exists";
  }
  if (err.errorNum === 2291) {
    return "Patient with this id does not exist";
  }
  if (err.errorNum === 2292) {
    return "Cannot delete because related records exist.";
  }
  return err.message;
}

exports.create = async (req, res) => {
  try {
    const result = await model.createMedicalHistory(req.body);
    res.status(201).json({ message: "Medical history created", result });
  } catch (err) {
    res.status(400).json({ error: handleOracleErrors(err) });
  }
};

exports.getById = async (req, res) => {
    // console.log('goe med his?');
  try {
    
    const data = await model.getMedicalHistoryById(req.params.id);
    if (!data.blood_group) {
      return res.status(404).json({ error: "Medical history not found" });
    }

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: handleOracleErrors(err) });
  }
};

exports.update = async (req, res) => {
  try {
    await model.updateMedicalHistory(req.body);
    res.json({ message: "Medical history updated successfully" });
  } catch (err) {
    res.status(400).json({ error: handleOracleErrors(err) });
  }
};

exports.remove = async (req, res) => {
  try {
    await model.deleteMedicalHistory(req.params.id);
    res.json({ message: "Medical history deleted" });
  } catch (err) {
    res.status(400).json({ error: handleOracleErrors(err) });
  }
};
