const db = require("../config/db");
const oracledb = require("oracledb");
oracledb.fetchAsString = [oracledb.CLOB]; // convert CLOB → string

class VisitRecordModel {
  async getConnection() {
    return await db.getConnection();
  }

  // Get all visit records
  async getAll() {
    const conn = await this.getConnection();
    try {
      const result = await conn.execute(
        `SELECT record_id, appointment_id, doctor_id, patient_id,
                TO_CHAR(visit_date,'YYYY-MM-DD') AS visit_date,
                DBMS_LOB.SUBSTR(diagnosis,4000,1) AS diagnosis,
                DBMS_LOB.SUBSTR(symptoms,4000,1) AS symptoms,
                DBMS_LOB.SUBSTR(treatment_notes,4000,1) AS treatment_notes,
                blood_pressure, temperature, weight, time
         FROM Visit_specific_record
         ORDER BY visit_date DESC`
      );
      return result.rows.map(r => ({ ...r }));
    } finally {
      await conn.close();
    }
  }

  // Get visit by ID
  async getById(id) {
    const conn = await this.getConnection();
    try {
      const result = await conn.execute(
        `SELECT record_id, appointment_id, doctor_id, patient_id,
                TO_CHAR(visit_date,'YYYY-MM-DD') AS visit_date,
                DBMS_LOB.SUBSTR(diagnosis,4000,1) AS diagnosis,
                DBMS_LOB.SUBSTR(symptoms,4000,1) AS symptoms,
                DBMS_LOB.SUBSTR(treatment_notes,4000,1) AS treatment_notes,
                blood_pressure, temperature, weight, time
         FROM Visit_specific_record
         WHERE record_id = :id`,
        [id]
      );
      return result.rows.length ? { ...result.rows[0] } : null;
    } finally {
      await conn.close();
    }
  }

  // Get visits by patient
  async getByPatient(patientId) {
    const conn = await this.getConnection();
    try {
      const result = await conn.execute(
        `SELECT record_id, appointment_id, doctor_id,
                TO_CHAR(visit_date,'YYYY-MM-DD') AS visit_date,
                DBMS_LOB.SUBSTR(diagnosis,4000,1) AS diagnosis
         FROM Visit_specific_record
         WHERE patient_id = :id
         ORDER BY visit_date DESC`,
        [patientId]
      );
      return result.rows.map(r => ({ ...r }));
    } finally {
      await conn.close();
    }
  }

  // Create visit record using stored procedure
  async create(data) {
    const conn = await this.getConnection();
    try {
      await conn.execute(
        `BEGIN ADD_VISIT_RECORD(
          :appointment_id,
          :patient_id,
          :doctor_id,
          :diagnosis,
          :symptoms,
          :treatment_notes,
          TO_DATE(:visit_date, 'YYYY-MM-DD'),
          :blood_pressure,
          :temperature,
          :weight,
          :time
        ); END;`,
        {
          appointment_id: data.appointment_id,
          patient_id: data.patient_id,
          doctor_id: data.doctor_id,
          diagnosis: data.diagnosis,
          symptoms: data.symptoms,
          treatment_notes: data.treatment_notes,
          visit_date: data.visit_date,
          blood_pressure: data.blood_pressure,
          temperature: data.temperature,
          weight: data.weight,
          time: data.time
        },
        { autoCommit: true }
      );

      return { success: true };
    } finally {
      await conn.close();
    }
  }

  // Update record
  async update(id, data) {
  const conn = await this.getConnection();
  try {
    const result = await conn.execute(
      `UPDATE Visit_specific_record
       SET diagnosis = :diagnosis,
           symptoms = :symptoms,
           treatment_notes = :treatment_notes,
           weight = :weight,
           temperature = :temperature,
           blood_pressure = :blood_pressure,
           time = :time
       WHERE record_id = :id`,
      {
        diagnosis: data.diagnosis,
        symptoms: data.symptoms,
        treatment_notes: data.treatment_notes,
        weight: data.weight,
        temperature: data.temperature,
        blood_pressure: data.blood_pressure,
        time: data.time,
        id
      },
      { autoCommit: true }
    );
    return result.rowsAffected;
  } finally {
    await conn.close();
  }
}


  // Delete record
  async delete(id) {
    const conn = await this.getConnection();
    try {
      const result = await conn.execute(
        `DELETE FROM Visit_specific_record WHERE record_id = :id`,
        [id],
        { autoCommit: true }
      );
      return result.rowsAffected;
    } finally {
      await conn.close();
    }
  }

  // Get visit gap
  async getVisitGap(patientId) {
    const conn = await this.getConnection();
    try {
      const result = await conn.execute(
        `SELECT GET_VISIT_GAP(:id) AS days FROM dual`,
        { id: patientId }
      );
      return result.rows[0].DAYS;
    } finally {
      await conn.close();
    }
  }
}

module.exports = new VisitRecordModel();
