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
        it.extend_from || null,
      ];
    });

    const sql = `
      INSERT INTO peminjaman
      (id_user, id_products, price, tgl_pinjam, tgl_kembali, status, qty, no_telp, alamat, extend_from)
      VALUES ?
    `;

    database.query(sql, [values], callback);
  },

  updateExtension: (orderId, data, callback) => {
  const sql = `
    UPDATE peminjaman
    SET
      tgl_kembali = ?,
      price = ?,
      status = 'pending'
    WHERE id = ?
  `;

  database.query(
    sql,
    [
      data.return_date,
      String(data.itemTotal),
      orderId,
    ],
    callback
  );
},

  getAll: (callback) => {
    database.query("SELECT * FROM peminjaman ORDER BY id DESC", callback);
  },
};

module.exports = Order;
