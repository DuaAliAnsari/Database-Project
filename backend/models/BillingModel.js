const db = require("../config/db");
const oracledb = require("oracledb");

class BillingModel {
  async getConnection() {
    return await db.getConnection();
  }

  // Get all bills
  async getAllBills() {
    const conn = await this.getConnection();
    try {
      const result = await conn.execute(
        `SELECT billing_id, patient_id, appointment_id, walkin_id,
                bill_date, total_amount, tax_amount, payment_status,
                payment_method, payment_date, bill_type
         FROM Billing
         ORDER BY bill_date DESC`
      );
      return result.rows;
    } finally {
      await conn.close();
    }
  }

  // Get bill by ID
  async getBillById(billId) {
    const conn = await this.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM Billing WHERE billing_id = :id`,
        [billId]
      );
      return result.rows[0];
    } finally {
      await conn.close();
    }
  }

  // Create a new bill
  async createBill(data) {
    const conn = await this.getConnection();
    try {
      await conn.execute(
        `INSERT INTO Billing (
            billing_id, patient_id, appointment_id, walkin_id,
            bill_date, total_amount, tax_amount, payment_status,
            payment_method, payment_date, bill_type
         ) VALUES (
            :billing_id, :patient_id, :appointment_id, :walkin_id,
            TO_DATE(:bill_date, 'YYYY-MM-DD'), :total_amount, :tax_amount,
            :payment_status, :payment_method,
            TO_DATE(:payment_date, 'YYYY-MM-DD'), :bill_type
         )`,
        data,
        { autoCommit: true }
      );
      return { success: true, billingId: data.billing_id };
    } finally {
      await conn.close();
    }
  }

  // Update bill
  async updateBill(id, data) {
    const conn = await this.getConnection();
    try {
      const result = await conn.execute(
        `UPDATE Billing
         SET total_amount = :total_amount,
             tax_amount = :tax_amount,
             payment_status = :payment_status,
             payment_method = :payment_method,
             payment_date = TO_DATE(:payment_date, 'YYYY-MM-DD'),
             bill_type = :bill_type
         WHERE billing_id = :billing_id`,
        {
          ...data,
          billing_id: id
        },
        { autoCommit: true }
      );
      return { rowsAffected: result.rowsAffected };
    } finally {
      await conn.close();
    }
  }

  // Delete bill
  async deleteBill(id) {
    const conn = await this.getConnection();
    try {
      const result = await conn.execute(
        `DELETE FROM Billing WHERE billing_id = :id`,
        [id],
        { autoCommit: true }
      );
      return { rowsAffected: result.rowsAffected };
    } finally {
      await conn.close();
    }
  }

  // Get bills of a patient
  async getBillsByPatient(patientId) {
    const conn = await this.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM Billing WHERE patient_id = :id ORDER BY bill_date DESC`,
        [patientId]
      );
      return result.rows;
    } finally {
      await conn.close();
    }
  }

  // Get pending bills
  async getPendingBills() {
    const conn = await this.getConnection();
    try {
      const result = await conn.execute(
        `SELECT * FROM Billing WHERE payment_status = 'Pending' ORDER BY bill_date DESC`
      );
      return result.rows;
    } finally {
      await conn.close();
    }
  }

  async getBillsByPatientAppointment(patientId, appointmentId) {
  const conn = await this.getConnection();
  try {
    const result = await conn.execute(
      `SELECT billing_id, bill_date, total_amount, tax_amount,
              payment_status, payment_method, payment_date, bill_type
       FROM Billing
       WHERE patient_id = :patientId
         AND appointment_id = :appointmentId
       ORDER BY bill_date DESC`,
      { patientId, appointmentId }
    );
    return result.rows;
  } finally {
    await conn.close();
  }
}
}


module.exports = new BillingModel();
