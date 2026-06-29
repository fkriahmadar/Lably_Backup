const database = require("../config/database");

const Order = {
  createOrders: (userId, items, callback) => {
    if (!items || items.length === 0) return callback(null, { affectedRows: 0 });

    const values = items.map((it) => {
      const priceVal =
        it.itemTotal != null ? it.itemTotal : it.all_total || it.price || 0;

      // =============================
      //  FIX: simpan hanya tanggal (YYYY-MM-DD)
      // =============================
      const tgl_pinjam = it.borrow_date
        ? it.borrow_date.slice(0, 10)
        : null;

      const tgl_kembali = it.return_date
        ? it.return_date.slice(0, 10)
        : null;

      const status = it.status || "pending";
      const qty = Number(it.quantity) || 1;

      const telp = String(it.phone || it.no_telp || "").trim() || "-";
      const alamat = String(it.address || it.alamat || "").trim() || "-";

      return [
        userId,
        it.product_id,
        String(priceVal),
        tgl_pinjam,
        tgl_kembali,
        status,
        qty,
        telp,
        alamat,
      ];
    });

    const sql = `
      INSERT INTO peminjaman
      (id_user, id_products, price, tgl_pinjam, tgl_kembali, status, qty, no_telp, alamat)
      VALUES ?
    `;

    database.query(sql, [values], callback);
  },

  getAll: (callback) => {
    database.query("SELECT * FROM peminjaman ORDER BY id DESC", callback);
  },
};

module.exports = Order;
