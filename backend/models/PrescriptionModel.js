// models/PrescriptionModel.js
const db = require("../config/db");
const oracledb = require("oracledb");

class PrescriptionModel {
  async getConnection() {
    return await db.getConnection();
  }

  // Get all prescriptions
  async getAllPrescriptions() {
  const conn = await this.getConnection();
  try {
    const result = await conn.execute(
      `SELECT prescription_id, appointment_id, walkin_id, patient_id,
              doctor_id, medication_name, dosage, frequency, duration,
              DBMS_LOB.SUBSTR(instructions, 4000, 1) AS instructions,
              TO_CHAR(issue_date, 'YYYY-MM-DD') AS issue_date
       FROM Prescription
       ORDER BY issue_date DESC`
    );
    return result.rows.map(r => ({ ...r }));
  } finally {
    await conn.close();
  }
}
  // Get prescription by ID
  async getPrescriptionById(id) {
    const conn = await this.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM Prescription WHERE prescription_id = :id`,
        [id]
      );
      return result.rows.length ? { ...result.rows[0] } : null;
    } finally {
      await conn.close();
    }
  }

  // Create prescription
  async createPrescription(data) {
    const conn = await this.getConnection();
    try {
      await conn.execute(
        `INSERT INTO Prescription (
           prescription_id, appointment_id, walkin_id, patient_id,
           doctor_id, medication_name, dosage, frequency, duration,
           instructions, issue_date
         ) VALUES (
           :prescription_id, :appointment_id, :walkin_id, :patient_id,
           :doctor_id, :medication_name, :dosage, :frequency, :duration,
           :instructions,
           TO_DATE(:issue_date, 'YYYY-MM-DD')
         )`,
        data,
        { autoCommit: true }
      );
      return { success: true, prescriptionId: data.prescription_id };
    } finally {
      await conn.close();
    }
  }

  // Update prescription
  async updatePrescription(id, data) {
    const conn = await this.getConnection();
    try {
      const result = await conn.execute(
        `UPDATE Prescription
         SET appointment_id = :appointment_id,
             walkin_id = :walkin_id,
             patient_id = :patient_id,
             doctor_id = :doctor_id,
             medication_name = :medication_name,
             dosage = :dosage,
             frequency = :frequency,
             duration = :duration,
             instructions = :instructions,
             issue_date = TO_DATE(:issue_date, 'YYYY-MM-DD')
         WHERE prescription_id = :prescription_id`,
        {
          ...data,
          prescription_id: id
        },
        { autoCommit: true }
      );
      return { rowsAffected: result.rowsAffected };
    } finally {
      await conn.close();
    }
  }

  // Delete prescription
  async deletePrescription(id) {
    const conn = await this.getConnection();
    try {
      const result = await conn.execute(
        `DELETE FROM Prescription WHERE prescription_id = :id`,
        [id],
        { autoCommit: true }
      );
      return { rowsAffected: result.rowsAffected };
    } finally {
      await conn.close();
    }
  }

  // Get prescriptions by patient
  async getPrescriptionsByPatient(patientId) {
    const conn = await this.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM Prescription
         WHERE patient_id = :id
         ORDER BY issue_date DESC`,
        [patientId]
      );
      return result.rows.map(r => ({ ...r }));
    } finally {
      await conn.close();
    }
  }

  // Get prescriptions by patient + appointment
  async getPrescriptionsByPatientAppointment(patientId, appointmentId) {
    const conn = await this.getConnection();
    try {
      const result = await conn.execute(
        `SELECT prescription_id, appointment_id, walkin_id, patient_id,
                doctor_id, medication_name, dosage, frequency, duration,
                instructions, issue_date
         FROM Prescription
         WHERE patient_id = :patientId
           AND appointment_id = :appointmentId
         ORDER BY issue_date DESC`,
        { patientId, appointmentId }
      );
      return result.rows.map(r => ({ ...r }));
    } finally {
      await conn.close();
    }
  }
}

module.exports = new PrescriptionModel();