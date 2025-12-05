const oracledb = require('oracledb');

let pool;

async function initialize() {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 2
    });
    console.log('Oracle DB connection pool created successfully');
  } catch (err) {
    console.error('Error creating connection pool:', err);
    throw err;
  }
}

async function getConnection() {
  if (!pool) {
    throw new Error('Pool not initialized. Call initialize() first.');
  }
  return await pool.getConnection();
}

async function close() {
  if (pool) {
    await pool.close();
  }
}

module.exports = {
  initialize,
  getConnection,
  close,
  // Export config for backward compatibility (if needed)
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING
};