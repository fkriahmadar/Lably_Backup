const database = require("../config/database");

const Category = {

    getAll: (callback) => {
        database.query("SELECT * FROM category ORDER BY id DESC", callback);
    },

    getById: (id, callback) => {
        database.query("SELECT * FROM category WHERE id = ?", [id], callback);
    },

    findByName: (name, callback) => {
        database.query("SELECT * FROM category WHERE name = ?", [name], callback);
    },

    create: (name, callback) => {
        database.query(
            "INSERT INTO category (name) VALUES (?)",
            [name],
            callback
        );
    },

    update: (id, name, callback) => {
        database.query(
            "UPDATE category SET name = ? WHERE id = ?",
            [name, id],
            callback
        );
    },

    delete: (id, callback) => {
        database.query("DELETE FROM category WHERE id = ?", [id], callback);
    }
};

// agar controller bisa query manual cek-relasi
Category.db = database;

module.exports = Category;
