const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",     // phpMyAdmin host default
    user: "root",          // user default
    password: "",          // default kosong
    database: "lably_website"
});

db.connect(err => {
    if (err) {
        console.log("Database Connection Error: ", err);
        return;
    }
    console.log("Connected to MySQL (phpMyAdmin)");
});

module.exports = db;
