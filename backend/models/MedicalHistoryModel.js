const oracledb = require("oracledb");
const db = require("../config/db"); // your pool file

// CREATE
async function createMedicalHistory(data) {
  const conn = await db.getConnection();
  try {
    await conn.execute(
      `
      BEGIN 
        add_medical_history(
          :patient_id,
          :blood_group,
          :allergies,
          :past_surgeries_operations,
          :vaccination_history,
          :family_history,
          :medical_checks
        ); 
      END;
      `,
      {
        patient_id: data.patient_id,
        blood_group: data.blood_group,
        allergies: data.allergies,
        past_surgeries_operations: data.past_surgeries_operations,
        vaccination_history: data.vaccination_history,
        family_history: data.family_history,
        medical_checks: data.medical_checks
      }
    );
    return { success: true };
  } catch (err) {
    throw err;
  } finally {
    await conn.close();
  }
}

// GET BY ID
async function getMedicalHistoryById(patient_id) {
  const conn = await db.getConnection();
  try {
    const result = await conn.execute(
      `
      BEGIN
        get_medical_history(
          :p_patient_id,
          :o_blood_group,
          :o_allergies,
          :o_surgeries,
          :o_vaccination,
          :o_family,
          :o_medical_checks
        );
      END;
      `,
      {
        p_patient_id: patient_id,
        o_blood_group: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
        o_allergies: { dir: oracledb.BIND_OUT, type: oracledb.CLOB },
        o_surgeries: { dir: oracledb.BIND_OUT, type: oracledb.CLOB },
        o_vaccination: { dir: oracledb.BIND_OUT, type: oracledb.CLOB },
        o_family: { dir: oracledb.BIND_OUT, type: oracledb.CLOB },
        o_medical_checks: { dir: oracledb.BIND_OUT, type: oracledb.CLOB }
      }
    );

    return {
      patient_id,
      blood_group: result.outBinds.o_blood_group,
      allergies: await clobToString(result.outBinds.o_allergies),
      past_surgeries_operations: await clobToString(result.outBinds.o_surgeries),
      vaccination_history: await clobToString(result.outBinds.o_vaccination),
      family_history: await clobToString(result.outBinds.o_family),
      medical_checks: await clobToString(result.outBinds.o_medical_checks)
    };
  } catch (err) {
    throw err;
  } finally {
    await conn.close();
  }
}

async function clobToString(clob) {
  if (!clob) return null;
  return new Promise((resolve, reject) => {
    let data = "";
    clob.setEncoding("utf8");
    clob.on("data", chunk => (data += chunk));
    clob.on("end", () => resolve(data));
    clob.on("error", reject);
  });
}

// UPDATE
async function updateMedicalHistory(data) {
  const conn = await db.getConnection();
  try {
            // console.log('inside update');
    await conn.execute(
      `
      BEGIN 
        update_medical_history(
          :patient_id,
          :blood_group,
          :allergies,
          :past_surgeries_operations,
          :vaccination_history,
          :family_history,
          :medical_checks
        ); 
      END;
      `,
      {
        patient_id: data.patient_id,
        blood_group: data.blood_group,
        allergies: data.allergies,
        past_surgeries_operations: data.past_surgeries_operations,
        vaccination_history: data.vaccination_history,
        family_history: data.family_history,
        medical_checks: data.medical_checks
      }
    );
    return { success: true };
  } catch (err) {
    throw err;
  } finally {
    await conn.close();
  }
}

// DELETE
async function deleteMedicalHistory(patient_id) {
  const conn = await db.getConnection();
  try {
    await conn.execute(
      `
      BEGIN 
        delete_medical_history(:p_patient_id); 
      END;
      `,
      { p_patient_id: patient_id }
    );
    return { success: true };
  } catch (err) {
    throw err;
  } finally {
    await conn.close();
  }
}

module.exports = {
  createMedicalHistory,
  getMedicalHistoryById,
  updateMedicalHistory,
  deleteMedicalHistory
};
