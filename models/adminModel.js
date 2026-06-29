const database = require("../config/database");

const Admin = {
    create: (data, callback) => {
        const sql = "INSERT INTO admin (username, email, password) VALUES (?, ?, ?)";
        database.query(sql, [data.username, data.email, data.password], callback);
    },

    findByEmail: (email, callback) => {
        const sql = "SELECT * FROM admin WHERE email = ?";
        database.query(sql, [email], callback);
    },

    findById: (id, callback) => {
        const sql = "SELECT * FROM admin WHERE id = ?";
        database.query(sql, [id], callback);
    }
};

module.exports = Admin;