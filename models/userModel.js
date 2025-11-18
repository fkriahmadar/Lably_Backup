const database = require("../config/database");

const User = {
    create: (data, callback) => {
        const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        database.query(sql, [data.username, data.email, data.password], callback);
    },

    findByEmail: (email, callback) => {
        const sql = "SELECT * FROM users WHERE email = ?";
        database.query(sql, [email], callback);
    }
};

module.exports = User;
