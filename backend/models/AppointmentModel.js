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
          a.appointment_id,
          a.patient_id,
          a.doctor_id,
          a.appointment_time,
          a.diagnosis,
          a.symptoms,
          a.status,
          p.patient_name,
          d.doctor_name,
          d.department
        FROM Appointment a
        LEFT JOIN patient_id p ON a.patient_id = p.patient_id
        LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
        ORDER BY a.appointment_time DESC`
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
          a.appointment_id,
          a.patient_id,
          a.doctor_id,
          a.appointment_time,
          a.diagnosis,
          a.symptoms,
          a.status,
          p.patient_name,
          p.phone_number,
          d.doctor_name,
          d.department,
          d.email as doctor_email
        FROM Appointment a
        LEFT JOIN patient_id p ON a.patient_id = p.patient_id
        LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
        WHERE a.appointment_id = :appointmentId`,
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
        `INSERT INTO Appointment (
          appointment_id,
          patient_id,
          doctor_id,
          appointment_time,
          diagnosis,
          symptoms,
          status
        ) VALUES (
          :appointment_id,
          :patient_id,
          :doctor_id,
          TO_DATE(:appointment_time, 'YYYY-MM-DD HH24:MI:SS'),
          :diagnosis,
          :symptoms,
          :status
        )`,
        {
          appointment_id: appointmentData.appointment_id,
          patient_id: appointmentData.patient_id,
          doctor_id: appointmentData.doctor_id,
          appointment_time: appointmentData.appointment_time,
          diagnosis: appointmentData.diagnosis || null,
          symptoms: appointmentData.symptoms || null,
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
        `UPDATE Appointment 
        SET 
          patient_id = :patient_id,
          doctor_id = :doctor_id,
          appointment_time = TO_DATE(:appointment_time, 'YYYY-MM-DD HH24:MI:SS'),
          diagnosis = :diagnosis,
          symptoms = :symptoms,
          status = :status
        WHERE appointment_id = :appointment_id`,
        {
          appointment_id: appointmentId,
          patient_id: appointmentData.patient_id,
          doctor_id: appointmentData.doctor_id,
          appointment_time: appointmentData.appointment_time,
          diagnosis: appointmentData.diagnosis,
          symptoms: appointmentData.symptoms,
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
        `DELETE FROM Appointment WHERE appointment_id = :appointment_id`,
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
          a.appointment_id,
          a.appointment_time,
          a.diagnosis,
          a.symptoms,
          a.status,
          p.patient_name,
          d.doctor_name,
          d.department
        FROM Appointment a
        LEFT JOIN patient_id p ON a.patient_id = p.patient_id
        LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
        WHERE a.status = :status
        ORDER BY a.appointment_time DESC`,
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
          a.appointment_id,
          a.appointment_time,
          a.status,
          p.patient_name,
          d.doctor_name,
          d.department
        FROM Appointment a
        LEFT JOIN patient_id p ON a.patient_id = p.patient_id
        LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
        WHERE TRUNC(a.appointment_time) = TRUNC(TO_DATE(:date, 'YYYY-MM-DD'))
        ORDER BY a.appointment_time`,
        [date]
      );
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Get appointment's visit-specific records
  async getAppointmentVisitRecords(appointmentId) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          vsr.*
        FROM visit_specific_record vsr
        WHERE vsr.appointment_id = :appointmentId`,
        [appointmentId]
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
        `UPDATE Appointment 
        SET status = :status
        WHERE appointment_id = :appointment_id`,
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
          a.appointment_id,
          a.appointment_time,
          a.status,
          p.patient_name,
          p.phone_number,
          d.doctor_name,
          d.department
        FROM Appointment a
        LEFT JOIN patient_id p ON a.patient_id = p.patient_id
        LEFT JOIN Doctors d ON a.doctor_id = d.doctor_id
        WHERE a.appointment_time > SYSDATE
        AND a.status = 'Scheduled'
        ORDER BY a.appointment_time ASC`
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