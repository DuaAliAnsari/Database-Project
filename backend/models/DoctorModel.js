const oracledb = require('oracledb');
const db= require('../config/db.js');

class DoctorModel {

  // Get database connection
  async getConnection() {
    return await db.getConnection();
  }

  // Get all doctors
  async getAllDoctors() {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          doctor_id,
          doctor_name,
          department,
          phone_number,
          email
        FROM Doctors
        ORDER BY doctor_name`
      );
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Get doctor by ID
  async getDoctorById(doctorId) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          doctor_id,
          doctor_name,
          department,
          phone_number,
          email
        FROM Doctors
        WHERE doctor_id = :doctorId`,
        [doctorId]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Get doctors by department
  async getDoctorsByDepartment(department) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          doctor_id,
          doctor_name,
          department,
          phone_number,
          email
        FROM Doctors
        WHERE department = :department
        ORDER BY doctor_name`,
        [department]
      );
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Create new doctor
  async createDoctor(doctorData) {
    const connection = await this.getConnection();
    try {
      await connection.execute(
        `INSERT INTO Doctors (
          doctor_id,
          doctor_name,
          department,
          phone_number,
          email
        ) VALUES (
          :doctor_id,
          :doctor_name,
          :department,
          :phone_number,
          :email
        )`,
        {
          doctor_id: doctorData.doctor_id,
          doctor_name: doctorData.doctor_name,
          department: doctorData.department,
          phone_number: doctorData.phone_number,
          email: doctorData.email
        },
        { autoCommit: true }
      );

      return { success: true, doctorId: doctorData.doctor_id };
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Update doctor
  async updateDoctor(doctorId, doctorData) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `UPDATE Doctors 
        SET 
          doctor_name = :doctor_name,
          department = :department,
          phone_number = :phone_number,
          email = :email
        WHERE doctor_id = :doctor_id`,
        {
          doctor_id: doctorId,
          doctor_name: doctorData.doctor_name,
          department: doctorData.department,
          phone_number: doctorData.phone_number,
          email: doctorData.email
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

  // Delete doctor
  async deleteDoctor(doctorId) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `DELETE FROM Doctors WHERE doctor_id = :doctor_id`,
        [doctorId],
        { autoCommit: true }
      );

      return { success: true, rowsAffected: result.rowsAffected };
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Get doctor's appointments
  async getDoctorAppointments(doctorId) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          a.appointment_id,
          a.patient_id,
          a.appointment_date,
          a.appointment_time,
          a.status,
          p.patient_name
        FROM Appointment a
        JOIN Patients p ON a.patient_id = p.patient_id
        WHERE a.doctor_id = :doctorId
        ORDER BY a.appointment_date DESC`,
        [doctorId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Get doctor's prescriptions
  async getDoctorPrescriptions(doctorId) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          pr.prescription_id,
          pr.appointment_id,
          pr.walkin_id,
          pr.patient_id,
          pr.medication_name,
          pr.dosage,
          pr.frequency,
          pr.duration,
          pr.instructions,
          pr.issue_date,
          p.patient_name
        FROM Prescription pr
        JOIN Patients p ON pr.patient_id = p.patient_id
        WHERE pr.doctor_id = :doctorId
        ORDER BY pr.issue_date DESC`,
        [doctorId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Get doctor's schedule for a specific date
  async getDoctorSchedule(doctorId, date) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          a.appointment_id,
          a.appointment_date,
          a.appointment_time,
          a.patient_id,
          p.patient_name,
          a.status
        FROM Appointment a
        JOIN Patients p ON a.patient_id = p.patient_id
        WHERE a.doctor_id = :doctorId
          AND TRUNC(a.appointment_date) = TRUNC(TO_DATE(:date, 'YYYY-MM-DD'))
        ORDER BY a.appointment_time`,
        {
          doctorId: doctorId,
          date: date
        }
      );
      return result.rows;
    } catch (error) {
      throw error;
    } finally {
      await connection.close();
    }
  }

  // Search doctors by name
  async searchDoctors(searchTerm) {
    const connection = await this.getConnection();
    try {
      const result = await connection.execute(
        `SELECT 
          doctor_id,
          doctor_name,
          department,
          phone_number,
          email
        FROM Doctors
        WHERE UPPER(doctor_name) LIKE UPPER(:searchTerm)
        ORDER BY doctor_name`,
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

module.exports = new DoctorModel();