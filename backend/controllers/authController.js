const oracledb = require('oracledb');
const db = require('../config/db'); // your Oracle DB connection

// Login function
async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const connection = await db.getConnection();

    // Check if user exists
    const result = await connection.execute(
      `SELECT user_id, username, role
       FROM UserAuth
       WHERE username = :username AND password = :password`,
      [username, password]
    );

    await connection.close();

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const user = result.rows[0];
    const role = user[2]; // role column ('doctor' or 'admin')

    res.status(200).json({
      message: 'Login successful',
      user_id: user[0],
      username: user[1],
      role: role,
      homepage: role === 'doctor' ? '/doctor/home' : '/admin/home'
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
}

module.exports = { login };
