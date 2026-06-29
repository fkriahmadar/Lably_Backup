const database = require("../config/database");

const Customer = {
  // COUNT ALL USERS (Dashboard)
  countAll: (callback) => {
    const sql = "SELECT COUNT(*) AS total FROM users";
    database.query(sql, callback);
  },

  // FILTERED USER LIST (Customer Page)
  getFiltered: (
    search,
    status,
    dateStart,
    dateEnd,
    limit,
    offset,
    callback,
  ) => {
    let sql = `
            SELECT * FROM users
            WHERE 1 = 1
        `;
    let params = [];

    // search (username, email, status)
    if (search) {
      sql += ` AND (username LIKE ? OR email LIKE ? OR status LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // status filter
    if (status && status !== "all") {
      sql += ` AND status = ?`;
      params.push(status);
    }

    // date start filter
    if (dateStart) {
      sql += ` AND DATE(created_at) >= ?`;
      params.push(dateStart);
    }

    // date end filter
    if (dateEnd) {
      sql += ` AND DATE(created_at) <= ?`;
      params.push(dateEnd);
    }

    // pagination
    sql += ` ORDER BY id ASC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    database.query(sql, params, callback);
  },

  // COUNT FILTERED USERS
  countFiltered: (search, status, dateStart, dateEnd, callback) => {
    let sql = `
            SELECT COUNT(*) AS total FROM users
            WHERE 1 = 1
        `;
    let params = [];

    // search
    if (search) {
      sql += ` AND (username LIKE ? OR email LIKE ? OR status LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // status filter
    if (status && status !== "all") {
      sql += ` AND status = ?`;
      params.push(status);
    }

    // date start
    if (dateStart) {
      sql += ` AND DATE(created_at) >= ?`;
      params.push(dateStart);
    }

    // date end
    if (dateEnd) {
      sql += ` AND DATE(created_at) <= ?`;
      params.push(dateEnd);
    }

    database.query(sql, params, callback);
  },

  getById: (id, callback) => {
    const sql = "SELECT * FROM users WHERE id = ?";
    database.query(sql, [id], callback);
  },

  updateKtpStatus: (id, status, callback) => {
    const sql = "UPDATE users SET ktp_status = ? WHERE id = ?";
    database.query(sql, [status, id], callback);
  },
};

module.exports = Customer;
