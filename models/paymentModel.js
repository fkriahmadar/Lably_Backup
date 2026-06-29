const database = require("../config/database");

const Payment = {
  createPayments: (userId, paymentMethod, ewalletProvider, items, callback) => {
    if (!items || items.length === 0) return callback(null, { affectedRows: 0 });

    const values = items.map((item) => [
      item.borrow_date || null,
      item.return_date || null,
      paymentMethod,
      ewalletProvider || null,
      userId,
      item.product_id,
      Number(item.itemTotal) || 0,
      Number(item.quantity) || 1,
    ]);

    const sql = `
      INSERT INTO payment
        (tgl_pinjam, tgl_kembali, metode_payment, ewallet_provider, id_user, id_product, price, qty)
      VALUES ?
    `;

    database.query(sql, [values], callback);
  },
};

module.exports = Payment;
