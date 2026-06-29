const database = require("../config/database");

const User = {
  create: (data, callback) => {
    const sql = ` INSERT INTO users (username, email, password, pp_image, status) VALUES (?, ?, ?, ?, 'active')
    `;

    database.query(
      sql,
      [data.username, data.email, data.password, data.pp_image],
      callback,
    );
  },

  findByEmail: (email, callback) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    database.query(sql, [email], callback);
  },

  // Tambahan untuk dashboard
  getAll: (callback) => {
    const sql = "SELECT * FROM users";
    database.query(sql, callback);
  },

  updateLastLogin: (id, callback) => {
    const sql = "UPDATE users SET last_login = NOW() WHERE id = ?";
    database.query(sql, [id], callback);
  },

  reactivate: (id, callback) => {
    const sql = "UPDATE users SET status = 'active' WHERE id = ?";
    database.query(sql, [id], callback);
  },

  deactivateInactive: (callback) => {
    const sql = `
            UPDATE users
            SET status = 'inactive'
            WHERE (status = 'active' OR status IS NULL)
            AND last_login IS NOT NULL
            AND TIMESTAMPDIFF(DAY, last_login, NOW()) > 30
        `;
    database.query(sql, callback);
  },

  getById: (id, callback) => {
    const sql = "SELECT * FROM users WHERE id = ?";
    database.query(sql, [id], callback);
  },

  updateProfile: (id, { username, email, phone, address }, callback) => {
    const sql =
      "UPDATE users SET username = ?, email = ?, phone = ?, address = ? WHERE id = ?";
    database.query(sql, [username, email, phone, address, id], callback);
  },

  uploadKtp: (id, ktpPath, callback) => {
    const sql =
      "UPDATE users SET ktp_image = ?, ktp_status = 'pending' WHERE id = ?";
    database.query(sql, [ktpPath, id], callback);
  },

  updatePhoto: (id, photoPath, callback) => {
    const sql = "UPDATE users SET pp_image = ? WHERE id = ?";

    database.query(sql, [photoPath, id], callback);
  },

  updatePassword: (id, password, callback) => {
    const sql = "UPDATE users SET password = ? WHERE id = ?";

    database.query(sql, [password, id], callback);
  },

  updateEmail: (id, email, callback) => {
    const sql = "UPDATE users SET email = ? WHERE id = ?";

    database.query(sql, [email, id], callback);
  },
};

module.exports = User;
