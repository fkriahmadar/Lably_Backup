const database = require("../config/database");

const Draft = {
    // Tambah item draft
    add: (userId, data, callback) => {
        const sql = `
            INSERT INTO d_peminjaman
              (id_user, id_products, price, tgl_pinjam, tgl_kembali, qty, no_telp, alamat, extend_from)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            userId,
            data.product_id,
            data.price,              // harga dari database, bukan input user
            data.borrow_date || null,
            data.return_date || null,
            data.quantity || 1,
            data.phone || "",
            data.address || "",
            data.extend_from || null,
        ];

        database.query(sql, params, callback);
    },

    // Ambil semua draft user
    getByUser: (userId, callback) => {
    const sql = `
        SELECT 
        d.*,
        DATE_FORMAT(d.tgl_pinjam, '%Y-%m-%d') AS tgl_pinjam,
        DATE_FORMAT(d.tgl_kembali, '%Y-%m-%d') AS tgl_kembali,
        p.name AS product_name,
        p.image AS product_image,
        p.price AS product_price
        FROM d_peminjaman d
        LEFT JOIN products p ON d.id_products = p.id
        WHERE d.id_user = ?
        ORDER BY d.id DESC
    `;
    
    database.query(sql, [userId], callback);
    },

    // Hapus semua draft user (setelah checkout)
    deleteByUser: (userId, callback) => {
        const sql = `DELETE FROM d_peminjaman WHERE id_user = ?`;
        database.query(sql, [userId], callback);
    }
};

module.exports = Draft;
