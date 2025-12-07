const oracledb = require('oracledb');
const db = require('../config/db.js');

class PatientModel {

  // Get database connection
  async getConnection() {
    return await db.getConnection();
  }

  // Get all patients
  async getAllPatients() {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          patient_id,
          patient_name,
          phone_number,
          date_of_birth,
          gender,
          age
        FROM Patients
        ORDER BY patient_name`
      );
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Get patient by ID
  async getPatientById(patientId) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          patient_id,
          patient_name,
          phone_number,
          date_of_birth,
          gender,
          age
        FROM Patients
        WHERE patient_id = :patientId`,
        [patientId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Create new patient
  async createPatient(patientData) {
    const connection = await this.getConnection();
    try {
      await connection.execute(
        `INSERT INTO Patients (
          patient_id,
          patient_name,
          phone_number,
          date_of_birth,
          gender,
          age
        ) VALUES (
          :patient_id,
          :patient_name,
          :phone_number,
          TO_DATE(:date_of_birth, 'YYYY-MM-DD'),
          :gender,
          :age
        )`,
        {
          patient_id: patientData.patient_id,
          patient_name: patientData.patient_name,
          phone_number: patientData.phone_number,
          date_of_birth: patientData.date_of_birth,
          gender: patientData.gender,
          age: patientData.age
        },
        { autoCommit: true }
      );

      return { success: true, patientId: patientData.patient_id };
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Update patient
  async updatePatient(patientId, patientData) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `UPDATE Patients 
        SET 
          patient_name = :patient_name,
          phone_number = :phone_number,
          date_of_birth = TO_DATE(:date_of_birth, 'YYYY-MM-DD'),
          gender = :gender,
          age = :age
        WHERE patient_id = :patient_id`,
        {
          patient_id: patientId,
          patient_name: patientData.patient_name,
          phone_number: patientData.phone_number,
          date_of_birth: patientData.date_of_birth,
          gender: patientData.gender,
          age: patientData.age
        },
        { autoCommit: true }
      );

      return { success: true, rowsAffected: result.rowsAffected };
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  
  // Get patient appointments
  async getPatientAppointments(patientId) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          a.appointment_id,
          a.doctor_id,
          d.doctor_name,
          d.department,
          a.appointment_date,
          a.appointment_time,
          a.status
        FROM Appointment a
        JOIN Doctors d ON a.doctor_id = d.doctor_id
        WHERE a.patient_id = :patientId
        ORDER BY a.appointment_date DESC`,
        [patientId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Search patients by name
  async searchPatients(searchTerm) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          patient_id,
          patient_name,
          phone_number,
          date_of_birth,
          gender,
          age
        FROM Patients
        WHERE UPPER(patient_name) LIKE UPPER(:searchTerm)
        ORDER BY patient_name`,
        [`%${searchTerm}%`]
      );
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }
}

module.exports = new PatientModel();