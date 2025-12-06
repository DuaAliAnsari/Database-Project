// models/AppointmentModel.js
const oracledb = require('oracledb');
const db = require('../config/db.js');

class AppointmentModel {
  
  async getConnection() {
    return await db.getConnection();
  }

  // Get all appointments
  async getAllAppointments() {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          a.APPOINTMENT_ID,
          a.PATIENT_ID,
          a.DOCTOR_ID,
          a.APPOINTMENT_DATE,
          a.APPOINTMENT_TIME,
          a.STATUS,
          p.PATIENT_NAME,
          p.PHONE_NUMBER,
          d.DOCTOR_NAME,
          d.DEPARTMENT
        FROM APPOINTMENT a
        LEFT JOIN PATIENTS p ON a.PATIENT_ID = p.PATIENT_ID
        LEFT JOIN DOCTORS d ON a.DOCTOR_ID = d.DOCTOR_ID
        ORDER BY a.APPOINTMENT_DATE DESC, a.APPOINTMENT_TIME DESC`
      );
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Get appointment by ID
  async getAppointmentById(appointmentId) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          a.APPOINTMENT_ID,
          a.PATIENT_ID,
          a.DOCTOR_ID,
          a.APPOINTMENT_DATE,
          a.APPOINTMENT_TIME,
          a.STATUS,
          p.PATIENT_NAME,
          p.PHONE_NUMBER,
          p.DATE_OF_BIRTH,
          p.GENDER,
          p.AGE,
          d.DOCTOR_NAME,
          d.DEPARTMENT,
          d.PHONE_NUMBER as DOCTOR_PHONE,
          d.EMAIL as DOCTOR_EMAIL
        FROM APPOINTMENT a
        LEFT JOIN PATIENTS p ON a.PATIENT_ID = p.PATIENT_ID
        LEFT JOIN DOCTORS d ON a.DOCTOR_ID = d.DOCTOR_ID
        WHERE a.APPOINTMENT_ID = :appointmentId`,
        [appointmentId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Create new appointment
  async createAppointment(appointmentData) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `INSERT INTO APPOINTMENT (
          APPOINTMENT_ID,
          PATIENT_ID,
          DOCTOR_ID,
          APPOINTMENT_DATE,
          APPOINTMENT_TIME,
          STATUS
        ) VALUES (
          :appointment_id,
          :patient_id,
          :doctor_id,
          TO_DATE(:appointment_date, 'YYYY-MM-DD'),
          :appointment_time,
          :status
        )`,
        {
          appointment_id: appointmentData.appointment_id,
          patient_id: appointmentData.patient_id,
          doctor_id: appointmentData.doctor_id,
          appointment_date: appointmentData.appointment_date,
          appointment_time: appointmentData.appointment_time,
          status: appointmentData.status || 'Scheduled'
        },
        { autoCommit: true }
      );
      return { success: true, appointmentId: appointmentData.appointment_id };
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Update appointment
  async updateAppointment(appointmentId, appointmentData) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `UPDATE APPOINTMENT 
        SET 
          PATIENT_ID = :patient_id,
          DOCTOR_ID = :doctor_id,
          APPOINTMENT_DATE = TO_DATE(:appointment_date, 'YYYY-MM-DD'),
          APPOINTMENT_TIME = :appointment_time,
          STATUS = :status
        WHERE APPOINTMENT_ID = :appointment_id`,
        {
          appointment_id: appointmentId,
          patient_id: appointmentData.patient_id,
          doctor_id: appointmentData.doctor_id,
          appointment_date: appointmentData.appointment_date,
          appointment_time: appointmentData.appointment_time,
          status: appointmentData.status
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

  // Delete appointment
  async deleteAppointment(appointmentId) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `DELETE FROM APPOINTMENT WHERE APPOINTMENT_ID = :appointment_id`,
        [appointmentId],
        { autoCommit: true }
      );
      return { success: true, rowsAffected: result.rowsAffected };
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Get appointments by status
  async getAppointmentsByStatus(status) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          a.APPOINTMENT_ID,
          a.APPOINTMENT_DATE,
          a.APPOINTMENT_TIME,
          a.STATUS,
          p.PATIENT_NAME,
          p.PHONE_NUMBER,
          d.DOCTOR_NAME,
          d.DEPARTMENT
        FROM APPOINTMENT a
        LEFT JOIN PATIENTS p ON a.PATIENT_ID = p.PATIENT_ID
        LEFT JOIN DOCTORS d ON a.DOCTOR_ID = d.DOCTOR_ID
        WHERE a.STATUS = :status
        ORDER BY a.APPOINTMENT_DATE DESC, a.APPOINTMENT_TIME DESC`,
        [status]
      );
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Get appointments for a specific date
  async getAppointmentsByDate(date) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          a.APPOINTMENT_ID,
          a.APPOINTMENT_DATE,
          a.APPOINTMENT_TIME,
          a.STATUS,
          p.PATIENT_NAME,
          p.PHONE_NUMBER,
          d.DOCTOR_NAME,
          d.DEPARTMENT
        FROM APPOINTMENT a
        LEFT JOIN PATIENTS p ON a.PATIENT_ID = p.PATIENT_ID
        LEFT JOIN DOCTORS d ON a.DOCTOR_ID = d.DOCTOR_ID
        WHERE TRUNC(a.APPOINTMENT_DATE) = TO_DATE(:date, 'YYYY-MM-DD')
        ORDER BY a.APPOINTMENT_TIME`,
        [date]
      );
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Update appointment status
  async updateAppointmentStatus(appointmentId, status) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `UPDATE APPOINTMENT 
        SET STATUS = :status
        WHERE APPOINTMENT_ID = :appointment_id`,
        {
          appointment_id: appointmentId,
          status: status
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

  // Get upcoming appointments
  async getUpcomingAppointments() {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          a.APPOINTMENT_ID,
          a.APPOINTMENT_DATE,
          a.APPOINTMENT_TIME,
          a.STATUS,
          p.PATIENT_NAME,
          p.PHONE_NUMBER,
          d.DOCTOR_NAME,
          d.DEPARTMENT
        FROM APPOINTMENT a
        LEFT JOIN PATIENTS p ON a.PATIENT_ID = p.PATIENT_ID
        LEFT JOIN DOCTORS d ON a.DOCTOR_ID = d.DOCTOR_ID
        WHERE a.APPOINTMENT_DATE >= TRUNC(SYSDATE)
        AND a.STATUS = 'Scheduled'
        ORDER BY a.APPOINTMENT_DATE ASC, a.APPOINTMENT_TIME ASC`
      );
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Get appointments by doctor
  async getAppointmentsByDoctor(doctorId) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          a.APPOINTMENT_ID,
          a.APPOINTMENT_DATE,
          a.APPOINTMENT_TIME,
          a.STATUS,
          p.PATIENT_NAME,
          p.PHONE_NUMBER
        FROM APPOINTMENT a
        LEFT JOIN PATIENTS p ON a.PATIENT_ID = p.PATIENT_ID
        WHERE a.DOCTOR_ID = :doctorId
        ORDER BY a.APPOINTMENT_DATE DESC, a.APPOINTMENT_TIME DESC`,
        [doctorId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Get appointments by patient
  async getAppointmentsByPatient(patientId) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          a.APPOINTMENT_ID,
          a.APPOINTMENT_DATE,
          a.APPOINTMENT_TIME,
          a.STATUS,
          d.DOCTOR_NAME,
          d.DEPARTMENT,
          d.PHONE_NUMBER as DOCTOR_PHONE
        FROM APPOINTMENT a
        LEFT JOIN DOCTORS d ON a.DOCTOR_ID = d.DOCTOR_ID
        WHERE a.PATIENT_ID = :patientId
        ORDER BY a.APPOINTMENT_DATE DESC, a.APPOINTMENT_TIME DESC`,
        [patientId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }
}

module.exports = new AppointmentModel();