// routes/index.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const ejs = require("ejs");
const path = require("path");
const multer = require("multer");
const Product = require("../models/productModel");
const db = require("../config/database");

// Models
const User = require("../models/userModel");
const Customer = require("../models/customerModel");
const Order = require("../models/orderModel");
const Draft = require("../models/draftModel"); // <— pakai draft
const Payment = require("../models/paymentModel");

// Database migration for extend_from column if not exists
db.query("ALTER TABLE d_peminjaman ADD COLUMN extend_from INT DEFAULT NULL", (err) => {
  if (err && err.code !== 'ER_DUP_FIELDNAME') {
    console.error("Error adding extend_from to d_peminjaman:", err);
  }
});
db.query("ALTER TABLE peminjaman ADD COLUMN extend_from INT DEFAULT NULL", (err) => {
  if (err && err.code !== 'ER_DUP_FIELDNAME') {
    console.error("Error adding extend_from to peminjaman:", err);
  }
});

// Controllers
const authController = require("../controllers/authController");
const categoryController = require("../controllers/categoryController");
const customerController = require("../controllers/customerController");
const productController = require("../controllers/productController");

// Middleware
const {
  isLoggedIn,
  isAdmin,
  ensureVerifiedCustomer,
  passLoginStatus,
} = require("../middlewares/authMiddleware");

/* ============================================
    KONFIGURASI MIDDLEWARE UPLOAD (MULTER)
============================================ */

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

/* ============================================
   AUTH PAGE (PUBLIC ACCESS)
============================================ */

// ROUTE LOGIN
router.get("/login", async (req, res) => {
  const message = req.session.message || null;
  req.session.message = null;

  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/auth/login.ejs"),
    { message },
  );

  res.render("layouts/auth", {
    title: "Login | Lably",
    meta: "",
    style: "",
    content,
  });
});
router.post("/login", authController.login);

// ROUTE REGISTER
router.get("/register", async (req, res) => {
  const message = req.session.message || null;
  req.session.message = null;

  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/auth/register.ejs"),
    { message },
  );

  res.render("layouts/auth", {
    title: "Register | Lably",
    meta: "",
    style: "",
    content,
  });
});
router.post("/register", authController.register);

// ROUTE LOGOUT
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

/* ============================================
   USER PAGE (PUBLIC ACCESS)
============================================ */

// ROUTE HOME
router.get("/", passLoginStatus, async (req, res) => {
  const filter = req.query.filter || "default";

  let sql = "";

  if (filter === "best") {
    // Produk dipinjam lebih dari 3x
    sql = `
      SELECT p.id, p.name, p.price, p.image, p.stock
      FROM products p
      JOIN (
        SELECT id_products, COUNT(*) AS total
        FROM peminjaman
        GROUP BY id_products
        HAVING total > 3
      ) AS t
      ON p.id = t.id_products
      LIMIT 6
    `;
  } else if (filter === "available") {
    // Produk stok > 1
    sql = `
      SELECT id, name, price, image, stock
      FROM products
      WHERE stock > 1
      LIMIT 6
    `;
  } else {
    // Default → ambil 6 produk pertama
    sql = `
      SELECT id, name, price, image, stock
      FROM products
      LIMIT 6
    `;
  }

  db.query(sql, async (err, products) => {
    if (err) {
      console.error("Error loading products:", err);
      products = [];
    }

    // mapping data untuk dikirim ke EJS
    const catalogue = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      img: p.image ? `/uploads/${p.image}` : "/Assets/default.png", // fallback
      stock: p.stock,
    }));

    const content = await ejs.renderFile(
      path.join(__dirname, "../views/pages/user/home.ejs"),
      {
        catalogue,
        activeFilter: filter, // 🔥 biar tombol biru sesuai filter
      },
    );

    // fetch user dari DB jika login
    const userId = req.session.user?.id;
    if (userId) {
      User.getById(userId, (userErr, userRows) => {
        const user = !userErr && userRows.length ? userRows[0] : null;

        res.render("layouts/main", {
          title: "Home | Lably Official Web",
          currentPage: "home",
          showFooter: true,
          meta: `<meta name="description" content="LabLy: Solusi alat riset dan laboratorium." />`,
          style: `<link rel="stylesheet" href="/CSS/home.css" />`,
          content,
          user,
        });
      });
    } else {
      res.render("layouts/main", {
        title: "Home | Lably Official Web",
        currentPage: "home",
        showFooter: true,
        meta: `<meta name="description" content="LabLy: Solusi alat riset dan laboratorium." />`,
        style: `<link rel="stylesheet" href="/CSS/home.css" />`,
        content,
        user: null,
      });
    }
  });
});

router.get("/api/best-items", (req, res) => {
  const sql = `
    SELECT 
      pr.id,
      pr.name,
      pr.price,
      pr.image,
      pr.stock,
      SUM(p.qty) AS total_qty
    FROM peminjaman p
    JOIN products pr ON p.id_products = pr.id
    GROUP BY pr.id, pr.name, pr.price, pr.image, pr.stock
    ORDER BY total_qty DESC
    LIMIT 3
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.json([]);
    }

    const items = rows.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      img: p.image ? `/uploads/${p.image}` : "/Assets/default.png",
      stock: p.stock,
    }));
    res.json(items);
  });
});

router.get("/api/availability", (req, res) => {
  const sql = `
    SELECT id, name, price, image, stock
    FROM products
    WHERE stock > 1
    LIMIT 6
  `;

  db.query(sql, (err, rows) => {
    if (err) return res.json([]);

    const items = rows.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      img: p.image ? `/uploads/${p.image}` : "/Assets/default.png",
      stock: p.stock,
    }));

    res.json(items);
  });
});

// ROUTE CATALOGUE
router.get("/catalogue", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 9;
  const offset = (page - 1) * limit;

  const search = req.query.search || "";
  const category = req.query.category || "all";
  const selectedPrice = req.query.price || "all";

  Product.getPaginated(search, limit, offset, category, (err, products) => {
    if (err) return res.status(500).send("Error fetching products");

    Product.count(search, category, (err2, result) => {
      if (err2) return res.status(500).send("Error counting products");

      const totalProducts = result[0].total;
      const totalPages = Math.ceil(totalProducts / limit);

      db.query("SELECT * FROM category", (err3, categories) => {
        if (err3) return res.status(500).send("Error fetching categories");

        ejs.renderFile(
          path.join(__dirname, "../views/pages/user/catalogue.ejs"),
          {
            products,
            categories,
            currentPage: page,
            totalPages,
            selectedCategory: category,
            selectedPrice,
            search,
          },
          (err4, content) => {
            if (err4) {
              console.log("EJS ERROR:", err4);
              return res.status(500).send("EJS render error");
            }

            const userId = req.session.user?.id;
            if (userId) {
              User.getById(userId, (userErr, userRows) => {
                const user = !userErr && userRows.length ? userRows[0] : null;

                res.render("layouts/main", {
                  title: "Catalogue | Lably Official Web",
                  currentPage: "catalogue",
                  showFooter: true,
                  meta: `
          <meta name="description" content="Katalog alat laboratorium LabLy." />
          <meta name="keywords" content="LabLy, alat riset, laboratorium" />
        `,
                  style: `<link rel="stylesheet" href="/CSS/catalogue.css" />`,
                  content,
                  user,
                });
              });
            } else {
              res.render("layouts/main", {
                title: "Catalogue | Lably Official Web",
                currentPage: "catalogue",
                showFooter: true,
                meta: `
        <meta name="description" content="Katalog alat laboratorium LabLy." />
        <meta name="keywords" content="LabLy, alat riset, laboratorium" />
      `,
                style: `<link rel="stylesheet" href="/CSS/catalogue.css" />`,
                content,
                user: null,
              });
            }
          },
        );
      });
    });
  });
});

router.post("/hide-reminder", (req, res) => {
  req.session.hideReminder = true;
  return res.json({ success: true });
});

// ROUTE PRODUCT
router.get("/product/:id", isLoggedIn, passLoginStatus, (req, res) => {
  const productId = req.params.id;

  const sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN category c ON p.id_category = c.id
    WHERE p.id = ?
  `;

  db.query(sql, [productId], async (err, results) => {
    if (err) throw err;
    if (results.length === 0) return res.redirect("/catalogue");

    const product = results[0];

    // Ambil pesan popup (jika ada) dari session, lalu reset
    const popupMessage = req.session.message || null;
    req.session.message = null;

    const content = await ejs.renderFile(
      path.join(__dirname, "../views/pages/user/product.ejs"),
      { product, message: popupMessage, showPopup: !!popupMessage },
    );

    const userId = req.session.user?.id;
    if (userId) {
      User.getById(userId, (userErr, userRows) => {
        const user = !userErr && userRows.length ? userRows[0] : null;

        res.render("layouts/main", {
          title: `${product.name} | Lably Web`,
          currentPage: "product",
          showFooter: true,
          meta: `<meta name="description" content="${product.name}"/>`,
          style: `<link rel="stylesheet" href="/CSS/product.css" />`,
          content,
          user, // dari DB
          message: popupMessage,
          showPopup: !!popupMessage,
        });
      });
    } else {
      res.render("layouts/main", {
        title: `${product.name} | Lably Web`,
        currentPage: "product",
        showFooter: true,
        meta: `<meta name="description" content="${product.name}"/>`,
        style: `<link rel="stylesheet" href="/CSS/product.css" />`,
        content,
        user: null,
        message: popupMessage,
        showPopup: !!popupMessage,
      });
    }
  });
});

// ROUTE FORM
router.get(
  "/form",
  isLoggedIn,
  passLoginStatus,
  ensureVerifiedCustomer,
  async (req, res) => {
    const formSpecificScript = "/JS/form-user.js";
    const message = req.session.message || null;
    req.session.message = null;

    const productId = req.query.product_id;
    const qty = parseInt(req.query.qty) || 1;
    const action = req.query.action;
    const borrowDate = req.query.borrow_date || "";
    const extendOrderId = req.query.extend_order_id || "";

    if (!productId) {
      req.session.message = "ID Produk tidak ditemukan.";
      return res.redirect("/catalogue");
    }

    if (!action) {
      req.session.message = "Aksi pemesanan tidak valid.";
      return res.redirect("/catalogue");
    }

    Product.getById(productId, (err, productRows) => {
      if (err) {
        console.error("Database Error (Product):", err);
        req.session.message =
          "Terjadi kesalahan server saat mengambil data produk.";
        return res.redirect("/catalogue");
      }

      if (!productRows || productRows.length === 0) {
        req.session.message = "Produk tidak ditemukan.";
        return res.redirect("/catalogue");
      }

      const product = productRows[0];
      const priceTotal = product.price * qty;

      User.getById(req.session.user.id, (err, userRows) => {
        if (err) {
          console.error("Database Error (User):", err);
          req.session.message =
            "Terjadi kesalahan server saat mengambil data pengguna.";
          return res.redirect("/login");
        }

        if (!userRows || userRows.length === 0) {
          req.session.message =
            "Sesi pengguna tidak valid. Silakan login kembali.";
          return res.redirect("/login");
        }

        const user = userRows[0];

        ejs.renderFile(
          path.join(__dirname, "../views/pages/user/form.ejs"),
          {
            message,
            product,
            qty,
            priceTotal,
            user,
            action,
            borrowDate,
            extendOrderId,
          },
          (err, content) => {
            if (err) {
              console.error("EJS Render Error:", err);
              req.session.message =
                "Terjadi kesalahan saat membuat tampilan formulir.";
              return res.redirect("/catalogue");
            }

            res.render("layouts/forms", {
              title: "Form | Lably",
              meta: `
              <meta name="description" content="Form peminjaman alat laboratorium LabLy." />
              <meta name="keywords" content="LabLy, alat riset, laboratorium" />
            `,
              style: "",
              content,
              scriptFile: formSpecificScript,
            });
          },
        );
      });
    });
  },
);
router.post("/submit-data", isLoggedIn, ensureVerifiedCustomer, (req, res) => {
  const {
    action_type,
    quantity,
    product_id,
    borrow_date,
    return_date,
    all_total,
    all_total_raw,
    phone,
    address,
    extend_order_id,
  } = req.body;

  console.log("========== SUBMIT DATA ==========");
console.log(req.body);
console.log("action_type :", action_type);
console.log("extend_order_id :", extend_order_id);
console.log("=================================");

  const userId = req.session.user && req.session.user.id;

  // helper to parse formatted currency like "Rp1.234.000" or "1234000" into number
  function parseCurrency(value) {
    if (value == null) return null;
    if (typeof value === "number") return value;
    if (all_total_raw && !isNaN(all_total_raw)) {
      return Number(all_total_raw);
    }
    const cleaned = String(value).replace(/[^\d]/g, "");
    if (cleaned === "") return null;
    return Number(cleaned);
  }

  const allTotalNumber = parseCurrency(all_total);

  if (!userId) {
    req.session.message = "User tidak valid.";
    return res.redirect("/login");
  }

  if (action_type === "cart") {
    // ⬇⬇ Simpan ke d_peminjaman sebagai draft (keranjang)
    Product.getById(product_id, (err, productRows) => {
      if (err) {
        console.error("Database Error (Product):", err);
        req.session.message = "Gagal menambahkan produk ke keranjang.";
        return res.redirect("/catalogue");
      }

      const product = productRows && productRows[0];
      if (!product) {
        req.session.message = "Produk tidak ditemukan.";
        return res.redirect("/catalogue");
      }

      // Validasi: pastikan quantity tidak melebihi stock
      const qtyNum = Number(quantity) || 1;
      if (qtyNum <= 0 || qtyNum > Number(product.stock)) {
        req.session.message = {
          type: "error",
          text: "Jumlah yang diminta melebihi stok tersedia.",
        };
        return res.redirect(`/product/${product.id}`);
      }

      const draftData = {
        product_id: product.id,
        price: product.price, // simpan harga satuan
        borrow_date: borrow_date || null,
        return_date: return_date || null,
        quantity: qtyNum,
        phone: phone || "",
        address: address || "",
        extend_from: null,
      };

      console.log("Draft Data:");
      console.log(draftData);

      Draft.add(userId, draftData, (err2) => {
        if (err2) {
          console.error("Gagal simpan draft:", err2);
          req.session.message = "Gagal menyimpan ke keranjang.";
          return res.redirect("/catalogue");
        }

        console.log("Draft cart tersimpan untuk user:", userId);
        return res.redirect("/cart");
      });
    });
  } else if (action_type === "loan" || action_type === "extend") {

  Product.getById(product_id, (err, productRows) => {

    if (err) {
      console.error("Database Error (Product):", err);
      req.session.message = "Gagal memproses peminjaman.";
      return res.redirect("/catalogue");
    }

    const product = productRows && productRows[0];

    if (!product) {
      req.session.message = "Produk tidak ditemukan.";
      return res.redirect("/catalogue");
    }

    const qtyNum = Number(quantity) || 1;

    // Validasi stok hanya untuk peminjaman baru
    if (action_type !== "extend") {
      if (qtyNum <= 0 || qtyNum > Number(product.stock)) {
        req.session.message = {
          type: "error",
          text: "Jumlah yang diminta melebihi stok tersedia.",
        };
        return res.redirect(`/product/${product.id}`);
      }
    }

    const draftData = {
      product_id: product.id,
      price: product.price,
      borrow_date: borrow_date || null,
      return_date: return_date || null,
      quantity: qtyNum,
      phone: phone || "",
      address: address || "",
      extend_from: action_type === "extend"
        ? Number(extend_order_id)
        : null,
    };

    const saveDraft = () => {
      Draft.deleteByUser(userId, (errDel) => {

        if (errDel) {
          console.error("Gagal menghapus draft lama:", errDel);
        }

        Draft.add(userId, draftData, (err2) => {

          if (err2) {
            console.error("Gagal simpan draft:", err2);

            req.session.message = {
              type: "error",
              text: "Gagal menyimpan peminjaman.",
            };

            return res.redirect("/catalogue");
          }

          console.log("Draft loan/extend tersimpan untuk user:", userId);
          return res.redirect("/checkout");

        });

      });
    };

    if (action_type === "extend") {

      const checkSql = `
        SELECT id
        FROM peminjaman
        WHERE extend_from = ?
        AND status = 'pending'
        LIMIT 1
      `;

      db.query(checkSql, [extend_order_id], (errCheck, rows) => {

        if (errCheck) {
          console.error(errCheck);

          req.session.message = {
            type: "error",
            text: "Terjadi kesalahan.",
          };

          return res.redirect(`/order-detail/${extend_order_id}`);
        }

        if (rows.length > 0) {

          req.session.message = {
            type: "warning",
            text: "Extension request is still pending.",
          };

          return res.redirect(`/order-detail/${extend_order_id}`);
        }

        saveDraft();

      });

    } else {

      saveDraft();

    }

  });
    } else {
    return res.status(400).send("Aksi tidak valid.");
  }
});



/* ============================================
  PAGES (LOGIN REQUIRED)
============================================ */

// CART PAGE
router.get(
  "/cart",
  isLoggedIn,
  passLoginStatus,
  ensureVerifiedCustomer,
  async (req, res) => {
    const userId = req.session.user && req.session.user.id;

    Draft.getByUser(userId, async (err, rows) => {
      if (err) {
        console.error("Error get draft cart:", err);
        return res.status(500).send("Error loading cart.");
      }

      // mapping ke bentuk yang cocok dengan cart.ejs lama
      const cartItems = (rows || []).map((r) => ({
        product_id: r.id_products,
        name: r.product_name || "Produk",
        price: Number(r.price) || 0,
        image: r.product_image
          ? `/uploads/${r.product_image}`
          : "/Assets/default.png",
        quantity: Number(r.qty) || 1,

        // 🔥 format tanggal (HANYA YYYY-MM-DD)
        borrow_date: r.tgl_pinjam ? String(r.tgl_pinjam).slice(0, 10) : null,
        return_date: r.tgl_kembali ? String(r.tgl_kembali).slice(0, 10) : null,

        all_total: null,
        all_total_raw: null,
      }));

      const content = await ejs.renderFile(
        path.join(__dirname, "../views/pages/user/cart.ejs"),
        { cartItems },
      );

      res.render("layouts/main", {
        title: "Cart | Lably",
        currentPage: "cart",
        showFooter: false,
        meta: `
        <meta name="description" content="Keranjang menyimpan alat laboratorium LabLy." />
        <meta name="keywords" content="LabLy, alat riset, laboratorium" />
      `,
        style: `<link rel="stylesheet" href="/CSS/cart.css" />`,
        content,
      });
    });
  },
);

// Remove a single item from cart (by product_id)
router.post("/cart/remove", isLoggedIn, (req, res) => {
  const { product_id } = req.body;
  const userId = req.session.user && req.session.user.id;

  if (!userId || !product_id) {
    return res.redirect("/cart");
  }

  const sql = `
    DELETE FROM d_peminjaman
    WHERE id_user = ? AND id_products = ?
    LIMIT 1
  `;
  db.query(sql, [userId, product_id], (err) => {
    if (err) {
      console.error("Gagal hapus draft cart:", err);
    }
    return res.redirect("/cart");
  });
});

// Clear entire cart
router.post("/cart/clear", isLoggedIn, (req, res) => {
  const userId = req.session.user && req.session.user.id;

  Draft.deleteByUser(userId, (err) => {
    if (err) {
      console.error("Gagal clear draft cart:", err);
    }
    return res.redirect("/cart");
  });
});

// CHECKOUT PAGE
router.get(
  "/checkout",
  isLoggedIn,
  passLoginStatus,
  ensureVerifiedCustomer,
  async (req, res) => {
    const userId = req.session.user && req.session.user.id;

    Draft.getByUser(userId, async (err, rows) => {
      if (err) {
        console.error("Error get draft for checkout:", err);
        return res.status(500).send("Error loading checkout.");
      }

      function computeDays(borrow, ret) {
        try {
          if (!borrow || !ret) return 1;
          const a = new Date(borrow);
          const b = new Date(ret);
          const diffMs = b - a;
          const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          return days > 0 ? days : 1;
        } catch (e) {
          return 1;
        }
      }

      const items = (rows || []).map((r) => {
        const price = Number(r.price) || 0; // harga satuan
        const qty = Number(r.qty) || 1;
        const days = computeDays(r.tgl_pinjam, r.tgl_kembali);
        const itemTotal = price * qty * days;

        return {
          product_id: r.id_products,
          name: r.product_name || "Produk",
          image: r.product_image
            ? `/uploads/${r.product_image}`
            : "/Assets/default.png",
          price,
          quantity: qty,

          // 🔥 format tanggal
          borrow_date: r.tgl_pinjam ? String(r.tgl_pinjam).slice(0, 10) : null,
          return_date: r.tgl_kembali
            ? String(r.tgl_kembali).slice(0, 10)
            : null,

          days,
          itemTotal,
        };
      });

      const subtotal = items.reduce((s, it) => s + (it.itemTotal || 0), 0);

      const invoiceNumber =
        "INV-LABLY-" +
        Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, "0");

      User.getById(userId, async (userErr, userRows) => {
        const user = !userErr && userRows.length ? userRows[0] : null;
        const content = await ejs.renderFile(
          path.join(__dirname, "../views/pages/user/checkout.ejs"),
          {
            items,
            subtotal,
            invoiceNumber,
            user,
          },
        );

        res.render("layouts/main", {
          title: "Checkout | Lably",
          currentPage: "checkout",
          showFooter: false,
          meta: `
        <meta name="description" content="Bayar untuk peminjaman alat laboratorium LabLy." />
        <meta name="keywords" content="LabLy, alat riset, laboratorium" />
      `,
          style: `
          <link rel="stylesheet" href="/CSS/checkout.css" />
          <link rel="stylesheet" href="/CSS/e-wallet.css" />
          <link rel="stylesheet" href="/CSS/e-wallet_QR.css" />
          <link rel="stylesheet" href="/CSS/QRIS.css" />
          <link rel="stylesheet" href="/CSS/card.css" />
        `,
          content,
          user,
        });
      });
    });
  },
);

// ROUTE: QRIS PAYMENT (standalone view)
router.get("/payment/qris", passLoginStatus, async (req, res) => {
  try {
    const content = await ejs.renderFile(
      path.join(__dirname, "../views/pages/user/payment/qris.ejs"),
      {},
    );

    return res.render("layouts/main", {
      title: "QRIS Payment | Lably",
      currentPage: "payment",
      showFooter: false,
      meta: `
          <meta name="description" content="QRIS payment preview" />
        `,
      style: `<link rel="stylesheet" href="/CSS/QRIS.css" />`,
      content,
    });
  } catch (err) {
    console.error("Error rendering QRIS page:", err);
    return res.status(500).send("Error rendering QRIS page.");
  }
});

// Cancel checkout (tidak hapus draft, cuma balik katalog)
router.post("/checkout/cancel", isLoggedIn, (req, res) => {
  req.session.message = { type: "info", text: "Checkout cancelled." };
  return res.redirect("/catalogue");
});

// Finalize checkout: create peminjaman rows for the logged-in user
router.post(
  "/checkout/complete",
  isLoggedIn,
  ensureVerifiedCustomer,
  (req, res) => {
    const userId = req.session.user && req.session.user.id;
    if (!userId) {
      req.session.message = {
        type: "error",
        text: "User session tidak valid.",
      };
      return res.redirect("/login");
    }

    Draft.getByUser(userId, (err, rows) => {
      console.log("========== DRAFT ==========");
console.log(rows);
console.log("===========================");
      if (err) {
        console.error("ERROR get draft for complete:", err);
        req.session.message = {
          type: "error",
          text: "Gagal memproses checkout.",
        };
        return res.redirect("/checkout");
      }

      if (!rows || rows.length === 0) {
        req.session.message = {
          type: "error",
          text: "Tidak ada item untuk checkout.",
        };
        return res.redirect("/cart");
      }

      function computeDays(borrow, ret) {
        try {
          if (!borrow || !ret) return 1;
          const a = new Date(borrow);
          const b = new Date(ret);
          const diffMs = b - a;
          const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          return days > 0 ? days : 1;
        } catch (e) {
          return 1;
        }
      }

      const itemsToInsert = rows.map((r) => {
        const priceUnit = Number(r.price) || 0;
        const qty = Number(r.qty) || 1;
        const days = computeDays(r.tgl_pinjam, r.tgl_kembali);
        const itemTotal = priceUnit * qty * days;

        return {
          product_id: r.id_products,
          quantity: qty,
          borrow_date: r.tgl_pinjam ? String(r.tgl_pinjam).slice(0, 10) : null,
          return_date: r.tgl_kembali
            ? String(r.tgl_kembali).slice(0, 10)
            : null,
          itemTotal: itemTotal,
          price: priceUnit,
          phone: r.no_telp || "",
          address: r.alamat || "",
          extend_from: r.extend_from || null,
        };
      });
      console.log("========== ITEMS ==========");
console.log(itemsToInsert);
console.log("===========================");

      const paymentMethod = req.body.payment_method || "Unknown";
      const ewalletProvider = req.body.ewallet_provider || null;

      Order.createOrders(userId, itemsToInsert, (err2, result) => {
        if (err2) {
          console.error("ERROR creating orders:", err2);
          req.session.message = {
            type: "error",
            text: "Gagal menyimpan pesanan.",
          };
          return res.redirect("/checkout");
        }

        /* =====================================================
         🔥 UPDATE STOK PRODUK SECARA REAL-TIME
      ===================================================== */
        const updateStockPromises = itemsToInsert
          .filter((item) => !item.extend_from) // Lewati pengurangan stok untuk perpanjangan
          .map((item) => {
            return new Promise((resolve, reject) => {
              const sql = `
              UPDATE products 
              SET stock = stock - ?
              WHERE id = ? AND stock >= ?
            `;
              db.query(
                sql,
                [item.quantity, item.product_id, item.quantity],
                (err, result) => {
                  if (err) return reject(err);

                  if (result.affectedRows === 0) {
                    return reject(
                      new Error(
                        "Stok tidak mencukupi untuk produk ID " + item.product_id,
                      ),
                    );
                  }

                  resolve();
                },
              );
            });
          });

        Promise.all(updateStockPromises)
          .then(() => {
            // simpan detail payment untuk setiap item checkout
            Payment.createPayments(
              userId,
              paymentMethod,
              ewalletProvider,
              itemsToInsert,
              (errPayment) => {
                if (errPayment) {
                  console.error("ERROR saving payment records:", errPayment);
                  req.session.message = {
                    type: "error",
                    text: "Gagal menyimpan data pembayaran.",
                  };
                  return res.redirect("/checkout");
                }

                // kalau stok aman → hapus draft
                Draft.deleteByUser(userId, (errDel) => {
                  if (errDel) {
                    console.error(
                      "Gagal menghapus draft setelah checkout:",
                      errDel,
                    );
                  }

                  req.session.message = {
                    type: "success",
                    text: "Checkout berhasil. Pesanan disimpan.",
                  };
                  return res.redirect("/notif-checkout");
                });
              },
            );
          })
          .catch((errStock) => {
            console.error("STOCK ERROR:", errStock);

            req.session.message = {
              type: "error",
              text: "Checkout gagal: stok salah satu produk sudah habis.",
            };
            return res.redirect("/cart");
          });
      });
    });
  },
);

// NOTIF CHECKOUT PAGE
router.get("/notif-checkout", isLoggedIn, passLoginStatus, async (req, res) => {
  try {
    const content = await ejs.renderFile(
      path.join(__dirname, "../views/pages/user/notif-checkout.ejs"),
      {},
    );

    return res.render("layouts/main", {
      title: "Payment Success | Lably",
      currentPage: "notif-checkout",
      showFooter: false,
      showHeader: false,
      meta: `
        <meta name="description" content="Notifikasi Checkout laboratorium LabLy." />
        <meta name="keywords" content="LabLy, alat riset, laboratorium" />
      `,
      style: `
        <link rel="stylesheet" href="/CSS/notif-checkout.css" />
      `,
      content,
    });
  } catch (err) {
    console.error("Error rendering notif-checkout:", err);
    return res.redirect("/order-user");
  }
});

// PREVIEW PAGES FOR PAYMENT PARTIALS (USEFUL FOR DEV / DIRECT ACCESS)
router.get("/preview/ewallet", passLoginStatus, async (req, res) => {
  try {
    const subtotal = req.query.subtotal ? Number(req.query.subtotal) : 10000;
    const invoiceNumber = req.query.invoiceNumber || "INV-DEV-000001";

    const content = await ejs.renderFile(
      path.join(__dirname, "../views/pages/user/payment/e-wallet.ejs"),
      { subtotal, invoiceNumber },
    );

    return res.render("layouts/main", {
      title: "E-Wallet Preview | Lably",
      currentPage: "preview-ewallet",
      showFooter: false,
      meta: "",
      style: `<link rel=\"stylesheet\" href=\"/CSS/e-wallet.css\" />`,
      content,
    });
  } catch (err) {
    console.error("Error rendering e-wallet preview:", err);
    return res.status(500).send("Error rendering e-wallet preview.");
  }
});

router.get("/preview/ewallet-qr", passLoginStatus, async (req, res) => {
  try {
    const subtotal = req.query.subtotal ? Number(req.query.subtotal) : 10000;
    const invoiceNumber = req.query.invoiceNumber || "INV-DEV-000001";

    const content = await ejs.renderFile(
      path.join(__dirname, "../views/pages/user/payment/e-wallet_QR.ejs"),
      { subtotal, invoiceNumber },
    );

    return res.render("layouts/main", {
      title: "E-Wallet QR Preview | Lably",
      currentPage: "preview-ewallet-qr",
      showFooter: false,
      meta: "",
      style: `<link rel=\"stylesheet\" href=\"/CSS/e-wallet_QR.css\" />`,
      content,
    });
  } catch (err) {
    console.error("Error rendering e-wallet-qr preview:", err);
    return res.status(500).send("Error rendering e-wallet-qr preview.");
  }
});

// ORDER PAGE
router.get("/order-user", isLoggedIn, passLoginStatus, async (req, res) => {
  const orderSpecificScript = "/JS/user/order-user.js";
  const userId = req.session.user.id;

  const sql = `
    SELECT 
      p.id,
      p.id_products,
      p.qty,
      p.price,
      p.status,
      DATE_FORMAT(p.tgl_pinjam, '%Y-%m-%d') AS tgl_pinjam,
      DATE_FORMAT(p.tgl_kembali, '%Y-%m-%d') AS tgl_kembali,

      pr.name AS product_name,
      pr.image AS product_image,
      pr.price AS product_price,

      r.reminder_id AS reminder_id
    FROM peminjaman p
    LEFT JOIN products pr ON p.id_products = pr.id
    LEFT JOIN (
      SELECT id_peminjaman, MAX(id) AS reminder_id
      FROM reminder
      GROUP BY id_peminjaman
    ) r ON r.id_peminjaman = p.id
    WHERE p.id_user = ?
AND NOT (
    p.extend_from IS NOT NULL
    AND p.status = 'pending'
)
    ORDER BY p.id DESC
  `;

  db.query(sql, [userId], async (err, orders) => {
    if (err) {
      console.error("ORDER LOAD ERROR:", err);
      return res.status(500).send("Error loading orders.");
    }

    User.getById(userId, async (userErr, userRows) => {
      if (userErr || !userRows.length)
        return res.status(500).send("Error loading user.");
      const user = userRows[0];

      const content = await ejs.renderFile(
        path.join(__dirname, "../views/pages/user/profile/order.ejs"),
        { orders, user },
      );

      res.render("layouts/profile", {
        title: "My Orders | Lably",
        style: `
          <link rel="stylesheet" href="/CSS/dashboard-profile.css" />
          <link rel="stylesheet" href="/CSS/order-user.css" />
        `,
        scriptFile: orderSpecificScript,
        content,
        currentPage: req.path,
        user,
      });
    });
  });
});

// ORDER DETAIL PAGE
router.get(
  "/order-detail/:id",
  isLoggedIn,
  passLoginStatus,
  async (req, res) => {
    const orderId = req.params.id;
    const userId = req.session.user.id;

    const sql = `
    SELECT
    p.id,
    p.id_products,
    p.qty,
    p.price,
    p.status,

    DATE_FORMAT(p.tgl_pinjam, '%Y-%m-%d') AS tgl_pinjam,
    DATE_FORMAT(p.tgl_kembali, '%Y-%m-%d') AS tgl_kembali,

    pr.name AS product_name,
    pr.image AS product_image,
    pr.kondisi,
    pr.price AS product_price,

    c.name AS category_name,

    u.username,
    u.email,
    u.phone,
    u.address,

    pmt.metode_payment AS payment_method,
    pmt.ewallet_provider,

    (
        SELECT COUNT(*)
        FROM peminjaman x
        WHERE x.extend_from = p.id
        AND x.status = 'pending'
    ) AS pending_extend

FROM peminjaman p

LEFT JOIN products pr
ON p.id_products = pr.id

LEFT JOIN category c
ON pr.id_category = c.id

LEFT JOIN users u
ON p.id_user = u.id

LEFT JOIN payment pmt
ON p.id_user = pmt.id_user
AND p.id_products = pmt.id_product
AND p.tgl_pinjam = pmt.tgl_pinjam
AND p.tgl_kembali = pmt.tgl_kembali

WHERE p.id = ?
AND p.id_user = ?
  `;

    db.query(sql, [orderId, userId], async (err, results) => {
      if (err) {
        console.error("ORDER DETAIL LOAD ERROR:", err);
        return res.status(500).send("Error loading order detail.");
      }

      if (results.length === 0) return res.status(404).send("Order not found.");

      const order = results[0];

      User.getById(userId, async (userErr, userRows) => {
        if (userErr || !userRows.length)
          return res.status(500).send("Error loading user.");
        const user = userRows[0];

        const content = await ejs.renderFile(
          path.join(__dirname, "../views/pages/user/profile/order-detail.ejs"), // fix
          { order, user }, // fix
        );

        res.render("layouts/profile", {
          title: "Order Detail | Lably",
          style: `<link rel="stylesheet" href="/CSS/order-detail.css" />`, // fix
          content,
          currentPage: "/order-user",
          user,
        });
      });
    });
  },
);

router.get(
  "/receipt/:id",
  isLoggedIn,
  passLoginStatus,
  async (req, res) => {
    const orderId = req.params.id;
    const userId = req.session.user.id;

    const sql = `
      SELECT
        p.id,
        p.id_products,
        p.qty,
        p.price,
        p.status,

        DATE_FORMAT(p.tgl_pinjam, '%Y-%m-%d') AS tgl_pinjam,
        DATE_FORMAT(p.tgl_kembali, '%Y-%m-%d') AS tgl_kembali,

        pr.name AS product_name,
        pr.image AS product_image,
        pr.price AS product_price,

        u.username,
        u.email,
        u.phone,
        u.address,

        pmt.metode_payment AS payment_method,
        pmt.ewallet_provider

      FROM peminjaman p

      LEFT JOIN products pr
      ON p.id_products = pr.id

      LEFT JOIN users u
      ON p.id_user = u.id

      LEFT JOIN payment pmt
      ON p.id_user = pmt.id_user
      AND p.id_products = pmt.id_product
      AND p.tgl_pinjam = pmt.tgl_pinjam
      AND p.tgl_kembali = pmt.tgl_kembali

      WHERE p.id = ?
      AND p.id_user = ?

      LIMIT 1
    `;

    db.query(sql, [orderId, userId], async (err, results) => {

      if (err) {
        console.error("RECEIPT LOAD ERROR:", err);
        return res.status(500).send("Error loading receipt.");
      }

      if (results.length === 0) {
        return res.status(404).send("Receipt not found.");
      }

      const order = results[0];

      User.getById(userId, async (userErr, userRows) => {

        if (userErr || !userRows.length) {
          return res.status(500).send("Error loading user.");
        }

        const user = userRows[0];

        const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/user/profile/receipt.ejs"),
    {
        order,
        user,
    }
);

res.render("layouts/profile", {
    title: "Payment Receipt | LabLy",
    currentPage: "/order-user",
    user,
    style: `
        <link rel="stylesheet" href="/CSS/dashboard-profile.css">
        <link rel="stylesheet" href="/CSS/receipt.css">
    `,
    content,
});

      });

    });

  }
);

// USER DASHBOARD CUSTOMER PAGE
router.get(
  "/dashboard-customer",
  isLoggedIn,
  passLoginStatus,
  async (req, res) => {
    const userId = req.session.user.id;

    User.getById(userId, async (err, userRows) => {
      if (err) {
        console.error("Database Error (User):", err);
        return res.status(500).send("Error loading user dashboard.");
      }

      if (!userRows || userRows.length === 0) {
        return res.status(404).send("User not found.");
      }

      const user = userRows[0];

      const sql = `
                SELECT
                    p.id,
                    p.id_products,
                    p.status,

                    DATE_FORMAT(p.tgl_pinjam,'%Y-%m-%d') AS tgl_pinjam,
                    DATE_FORMAT(p.tgl_kembali,'%Y-%m-%d') AS tgl_kembali,

                    pr.name AS product_name,
                    pr.image AS product_image,

                    c.name AS category_name,

                    r.reminder_id

                FROM peminjaman p

                LEFT JOIN products pr
                ON p.id_products = pr.id

                LEFT JOIN category c
                ON pr.id_category = c.id

                LEFT JOIN (
                    SELECT
                        id_peminjaman,
                        MAX(id) AS reminder_id
                    FROM reminder
                    GROUP BY id_peminjaman
                ) r
                ON r.id_peminjaman = p.id

                WHERE p.id_user = ?

                ORDER BY p.tgl_pinjam DESC, p.id DESC
                `;

      db.query(sql, [userId], async (orderErr, orders) => {
        if (orderErr) {
          console.error("Dashboard Order Load Error:", orderErr);
          return res.status(500).send("Error loading dashboard orders.");
        }

        const activeOrders = orders.filter(
          (o) => o.status === "in use" || o.status === "overdue",
        );
        const completedOrders = orders.filter((o) => o.status === "completed");
        const pendingOrders = orders.filter((o) => o.status === "pending");
        const uniqueProducts = new Set(
          orders
            .filter((o) => o.status !== "pending")
            .map((o) => o.id_products),
        ).size;

        const latestOrders = orders.slice(0, 3);
        const reminders = orders.filter(
          (o) => o.reminder_id && o.status !== "completed",
        );

        const content = await ejs.renderFile(
          path.join(__dirname, "../views/pages/user/profile/dashboard.ejs"),
          {
            user,
            stats: {
              active: activeOrders.length,
              completed: completedOrders.length,
              pending: pendingOrders.length,
              uniqueProducts,
            },
            latestOrders,
            reminders,
          },
        );

        res.render("layouts/profile", {
          title: "Customer Dashboard | Lably",
          style: `<link rel="stylesheet" href="/CSS/dashboard-profile.css" />`,
          content,
          currentPage: req.path,
          user,
        });
      });
    });
  },
);

// USER PROFILE CUSTOMER PAGE
router.get(
  "/profile-customer",
  isLoggedIn,
  passLoginStatus,
  async (req, res) => {
    User.getById(req.session.user.id, async (err, userRows) => {
      if (err) {
        console.error("Database Error (User):", err);
        req.session.message =
          "Terjadi kesalahan server saat mengambil data pengguna.";
        return res.redirect("/login");
      }

      if (!userRows || userRows.length === 0) {
        req.session.message =
          "Sesi pengguna tidak valid. Silakan login kembali.";
        return res.redirect("/login");
      }

      const user = userRows[0];
      const message = req.session.message || null;
      req.session.message = null;

      const content = await ejs.renderFile(
        path.join(__dirname, "../views/pages/user/profile/profile-page.ejs"),
        { user },
      );

      res.render("layouts/profile", {
        title: "Customer Profile | Lably",
        style: `<link rel="stylesheet" href="/CSS/profile-page.css" />`,
        content,
        message,
        showPopup: !!message,
        currentPage: req.path,
        user,
      });
    });
  },
);

// USER PROFILE UPDATE
router.post("/profile-customer/update", isLoggedIn, async (req, res) => {
  const { username, email, fullPhone, address } = req.body;

  User.updateProfile(
    req.session.user.id,
    { username, email, phone: fullPhone, address },
    (err) => {
      if (err) {
        console.error("Database Error:", err);
        req.session.message = "Gagal memperbarui profil.";
        return res.redirect("/profile-customer");
      }

      req.session.user.username = username;
      req.session.user.email = email;
      req.session.message = "Profil berhasil diperbarui.";
      res.redirect("/profile-customer");
    },
  );
});

// Upload KTP User
router.post(
  "/profile-customer/upload-ktp",
  isLoggedIn,
  upload.single("ktp_image"),
  (req, res) => {
    User.getById(req.session.user.id, (err, userRows) => {
      if (err || !userRows.length) return res.redirect("/profile-customer");

      const user = userRows[0];

      // cek kelengkapan profil
      if (!user.phone || user.phone.trim() === "") {
        req.session.message = {
          type: "error",
          text: "Harap lengkapi nomor telepon terlebih dahulu sebelum verifikasi KTP.",
        };
        return req.session.save(() => res.redirect("/profile-customer"));
      }

      if (!req.file) {
        req.session.message = "File tidak ditemukan.";
        return res.redirect("/profile-customer");
      }

      const ktpPath = `/uploads/${req.file.filename}`;
      User.uploadKtp(req.session.user.id, ktpPath, (err) => {
        if (err) {
          console.error("Database Error:", err);
          req.session.message = "Gagal mengirim KTP.";
          return res.redirect("/profile-customer");
        }
        req.session.message =
          "KTP berhasil dikirim, menunggu verifikasi admin.";
        res.redirect("/profile-customer");
      });
    });
  },
);

router.post(
  "/profile-customer/change-photo",
  isLoggedIn,
  upload.single("profile_image"),
  (req, res) => {
    if (!req.file) {
      return res.redirect("/profile-customer");
    }

    const photoPath = `/uploads/${req.file.filename}`;

    User.updatePhoto(req.session.user.id, photoPath, (err) => {
      if (err) {
        console.error(err);
      }

      req.session.message = "Profile picture updated.";

      res.redirect("/profile-customer");
    });
  },
);

router.post(
  "/profile-customer/change-password",
  isLoggedIn,
  async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      req.session.message = {
        type: "error",
        text: "New passwords do not match.",
      };

      return res.redirect("/profile-customer");
    }

    User.getById(req.session.user.id, async (err, rows) => {
      if (err || !rows.length) {
        return res.redirect("/profile-customer");
      }

      const user = rows[0];

      const match = await bcrypt.compare(oldPassword, user.password);

      if (!match) {
        req.session.message = {
          type: "error",
          text: "Current password is incorrect.",
        };

        return res.redirect("/profile-customer");
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      User.updatePassword(user.id, hashedPassword, (err) => {
        if (err) {
          req.session.message = {
            type: "error",
            text: "Failed to update password.",
          };

          return res.redirect("/profile-customer");
        }

        req.session.message = {
          type: "success",
          text: "Password updated successfully.",
        };

        res.redirect("/profile-customer");
      });
    });
  },
);

router.post(
  "/profile-customer/change-email",
  isLoggedIn,
  async (req, res) => {
    const { currentEmail, newEmail, confirmEmail } = req.body;

    if (newEmail !== confirmEmail) {
      req.session.message = {
        type: "error",
        text: "New email addresses do not match.",
      };
      return res.redirect("/profile-customer");
    }

    User.getById(req.session.user.id, async (err, rows) => {
      if (err || !rows.length) {
        return res.redirect("/profile-customer");
      }

      const user = rows[0];

      // Verifikasi currentEmail cocok dengan email di DB
      if (!currentEmail || currentEmail.toLowerCase() !== user.email.toLowerCase()) {
        req.session.message = {
          type: "error",
          text: "Current email is incorrect.",
        };
        return res.redirect("/profile-customer");
      }

      // Cek apakah email baru sudah dipakai user lain
      User.findByEmail(newEmail, (err, existing) => {
        if (err) {
          req.session.message = { type: "error", text: "Database error." };
          return res.redirect("/profile-customer");
        }

        if (existing.length > 0 && existing[0].id !== user.id) {
          req.session.message = {
            type: "error",
            text: "Email is already in use by another account.",
          };
          return res.redirect("/profile-customer");
        }

        User.updateEmail(user.id, newEmail, (err) => {
          if (err) {
            req.session.message = {
              type: "error",
              text: "Failed to update email.",
            };
            return res.redirect("/profile-customer");
          }

          req.session.user.email = newEmail;
          req.session.message = {
            type: "success",
            text: "Email updated successfully.",
          };
          res.redirect("/profile-customer");
        });
      });
    });
  },
);

/* ============================================
   ADMIN PAGE
============================================ */

router.get("/dashboard", isAdmin, authController.dashboard);

// CUSTOMERS PAGE
router.get("/customer", isAdmin, (req, res) => {
  // if (!req.session.admin) return res.redirect("/login");
  return customerController.list(req, res);
});

// CUSTOMER DETAIL
router.get("/customer/:id", isAdmin, (req, res) => {
  return customerController.detail(req, res);
});

// APPROVE KTP
router.post("/customer/:id/approve-ktp", isAdmin, (req, res) => {
  return customerController.approveKtp(req, res);
});

// REJECT KTP
router.post("/customer/:id/reject-ktp", isAdmin, (req, res) => {
  return customerController.rejectKtp(req, res);
});

/* ORDER PAGES (tidak diubah) */
router.get("/order", isAdmin, (req, res) => {
  const { search, filter, start, end } = req.query;

  // Pastikan status 'overdue' di-update untuk peminjaman yang lewat tanggal kembali
  const updateOverdueSql = `
    UPDATE peminjaman
    SET status = 'overdue'
    WHERE status = 'in use' AND DATE(tgl_kembali) < CURDATE()
  `;

  db.query(updateOverdueSql, (uErr) => {
    if (uErr) console.error("ERROR updating overdue statuses:", uErr);

    // ============================
    // QUERY 1 → FILTERED ORDERS (untuk tabel)
    // ============================

    let sql = `
      SELECT 
        p.id,
        u.username AS username,
        pr.name AS product_name,
        DATE_FORMAT(p.tgl_pinjam, '%Y-%m-%d') AS tgl_pinjam,
        DATE_FORMAT(p.tgl_kembali, '%Y-%m-%d') AS tgl_kembali,
        p.status
      FROM peminjaman p
      LEFT JOIN users u ON p.id_user = u.id
      LEFT JOIN products pr ON p.id_products = pr.id
      WHERE p.status IN ('pending', 'in use', 'overdue')  -- 🔥 Tampilkan 3 status saja
    `;

    const params = [];

    // 🔎 SEARCH (nama user / nama barang / status)
    if (search) {
      sql += ` AND (u.username LIKE ? OR pr.name LIKE ? OR p.status LIKE ?) `;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // 🔥 FILTER (pending / in use / overdue)
    if (filter && filter !== "all") {
      sql += ` AND p.status = ? `;
      params.push(filter);
    }

    // 📅 DATE FILTER
    if (start) {
      sql += ` AND DATE(p.tgl_pinjam) >= ? `;
      params.push(start);
    }

    if (end) {
      sql += ` AND DATE(p.tgl_kembali) <= ? `;
      params.push(end);
    }

    sql += ` ORDER BY p.id DESC `;

    db.query(sql, params, (err, filteredOrders) => {
      if (err) {
        console.error("ORDER QUERY ERROR:", err);
        return res.status(500).send("Error loading orders.");
      }

      // ============================
      // QUERY 2 → TOTAL BOX ATAS (TIDAK terpengaruh search/filter)
      // ============================

      db.query(`SELECT status FROM peminjaman`, (err2, allOrders) => {
        if (err2) {
          console.error("COUNT QUERY ERROR:", err2);
          return res.status(500).send("Error loading totals.");
        }

        const totalPending = allOrders.filter(
          (o) => o.status === "pending",
        ).length;
        const totalLoaned = allOrders.filter(
          (o) => o.status === "in use",
        ).length;
        const totalOverdue = allOrders.filter(
          (o) => o.status === "overdue",
        ).length;

        User.getAll((errUsers, users) => {
          const totalCustomers = users.length;

          ejs.renderFile(
            path.join(__dirname, "../views/pages/admin/order/order.ejs"),
            {
              users,
              totalCustomers,
              orders: filteredOrders, // tampilkan di tabel
              totalPending,
              totalLoaned,
              totalOverdue,
              search,
              filter,
              start,
              end,
            },
            (err, content) => {
              res.render("layouts/atmin", {
                title: "Orders | Lably",
                style: `<link rel="stylesheet" href="/css/order.css">`,
                content,
                message: null,
                showPopup: false,
                currentPage: req.path,
              });
            },
          );
        });
      });
    });
  });
});

// APPROVE → ubah pending → in use
router.post("/order/approve/:id", isAdmin, (req, res) => {
  db.query(
    "UPDATE peminjaman SET status = 'in use' WHERE id = ?",
    [req.params.id],
    () => res.redirect("/order"),
  );
});

// REJECT → kembalikan stok lalu hapus data
router.post("/order/reject/:id", isAdmin, (req, res) => {
  const id = req.params.id;

  // Ambil data peminjaman dulu untuk mengetahui product & qty
  db.query(
    "SELECT id_products, qty, extend_from FROM peminjaman WHERE id = ?",
    [id],
    (err, results) => {
      if (err || !results || results.length === 0) {
        console.error("ERROR fetching peminjaman for reject:", err);
        return res.redirect("/order");
      }

      const row = results[0];
      const productId = row.id_products;
      const qty = Number(row.qty) || 0;
      const isExtension = !!row.extend_from;

      function deleteOrder() {
        // Hapus reminder terkait (jika ada), lalu hapus peminjaman
        db.query("DELETE FROM reminder WHERE id_peminjaman = ?", [id], () => {
          db.query("DELETE FROM peminjaman WHERE id = ?", [id], () => {
            res.redirect("/order");
          });
        });
      }

      // Kembalikan stok hanya jika bukan perpanjangan (extend)
      if (!isExtension && qty > 0) {
        db.query(
          "UPDATE products SET stock = stock + ? WHERE id = ?",
          [qty, productId],
          (err2) => {
            if (err2) {
              console.error("ERROR restoring stock on reject:", err2);
            }
            deleteOrder();
          },
        );
      } else {
        deleteOrder();
      }
    },
  );
});

// COMPLETE → ubah status jadi completed
router.post("/order/complete/:id", isAdmin, (req, res) => {
  const id = req.params.id;

  // Ambil data peminjaman dulu (product id, qty, status)
  db.query(
    "SELECT id_products, qty, status FROM peminjaman WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("ERROR fetching peminjaman:", err);
        return res.redirect("/order");
      }

      if (!results || results.length === 0) {
        req.session.message = {
          type: "error",
          text: "Peminjaman tidak ditemukan.",
        };
        return res.redirect("/order");
      }

      const row = results[0];
      const productId = row.id_products;
      const qty = Number(row.qty) || 0;

      if (row.status === "completed") {
        db.query("DELETE FROM reminder WHERE id_peminjaman = ?", [id], () => {
          return res.redirect("/order");
        });
        return;
      }
      db.query(
        "UPDATE products SET stock = stock + ? WHERE id = ?",
        [qty, productId],
        (err2) => {
          if (err2) {
            console.error("ERROR restoring stock:", err2);
          }
          db.query(
            "UPDATE peminjaman SET status = 'completed' WHERE id = ?",
            [id],
            () => {
              // hapus reminder agar tidak muncul lagi
              db.query(
                "DELETE FROM reminder WHERE id_peminjaman = ?",
                [id],
                () => {
                  return res.redirect("/order");
                },
              );
            },
          );
        },
      );
    },
  );
});

// KIRIM REMINDER
router.post("/order/reminder/:id", isAdmin, (req, res) => {
  const peminjamanId = req.params.id;

  const sql = `
    INSERT INTO reminder (id_peminjaman, sent_at)
    VALUES (?, NOW())
  `;

  db.query(sql, [peminjamanId], (err) => {
    if (err) {
      console.error("REMINDER ERROR:", err);
      return res.redirect("/order");
    }
    res.redirect("/order");
  });
});

router.get("/order-completed", isAdmin, (req, res) => {
  const { search, filter, start, end } = req.query;

  // ============================
  // QUERY TAMBAH COLUMN overdue_flag
  // ============================
  let sql = `
    SELECT 
      p.id,
      u.username AS username,
      pr.name AS product_name,
      DATE_FORMAT(p.tgl_pinjam, '%Y-%m-%d') AS tgl_pinjam,
      DATE_FORMAT(p.tgl_kembali, '%Y-%m-%d') AS tgl_kembali,
      p.status,
      (p.tgl_kembali < CURDATE()) AS overdue_flag
    FROM peminjaman p
    LEFT JOIN users u ON p.id_user = u.id
    LEFT JOIN products pr ON p.id_products = pr.id
    WHERE p.status = 'completed'
  `;

  const params = [];

  // ============================
  // SEARCH
  // ============================
  if (search) {
    sql += ` AND (u.username LIKE ? OR pr.name LIKE ?) `;
    params.push(`%${search}%`, `%${search}%`);
  }

  // ============================
  // FILTER BUTTONS
  // ============================
  if (filter === "completed") {
    sql += ` AND (p.tgl_kembali >= CURDATE()) `;
  }

  if (filter === "overdue") {
    sql += ` AND (p.tgl_kembali < CURDATE()) `;
  }

  // ============================
  // DATE FILTER
  // ============================
  if (start) {
    sql += ` AND DATE(p.tgl_pinjam) >= ? `;
    params.push(start);
  }
  if (end) {
    sql += ` AND DATE(p.tgl_kembali) <= ? `;
    params.push(end);
  }

  sql += ` ORDER BY p.id DESC `;

  db.query(sql, params, (err, orders) => {
    if (err) {
      console.error("COMPLETED QUERY ERROR:", err);
      return res.status(500).send("Error loading completed orders.");
    }

    // Hitung total completed (TIDAK terpengaruh search/filter)
    db.query(
      `SELECT COUNT(*) AS totalCompleted FROM peminjaman WHERE status='completed'`,
      (err2, totalData) => {
        const totalCompleted = totalData[0].totalCompleted;

        User.getAll((errUsers, users) => {
          const totalCustomers = users.length;

          ejs.renderFile(
            path.join(
              __dirname,
              "../views/pages/admin/order/order_completed.ejs",
            ),
            {
              users,
              totalCustomers,
              orders,
              totalCompleted,

              // agar tombol/filter tetap highlight
              search,
              filter,
              start,
              end,
            },
            (err, content) => {
              res.render("layouts/atmin", {
                title: "Orders Completed",
                style: `<link rel="stylesheet" href="/css/order_completed.css">`,
                content,
                message: null,
                showPopup: false,
                currentPage: req.path,
              });
            },
          );
        });
      },
    );
  });
});

/* ============================================
   PRODUCT ADMIN — CLEAN & FIXED
============================================ */

// LIST
router.get("/product-list", isAdmin, productController.list);

// CREATE PAGE
router.get("/product-create", isAdmin, productController.createPage);

// CREATE ACTION
router.post(
  "/product/create",
  isAdmin,
  upload.single("image"),
  productController.create,
);

// DETAIL PAGE
router.get("/product-detail/:id", isAdmin, productController.detailPage);

// UPDATE ACTION
router.post(
  "/product/update/:id",
  isAdmin,
  upload.single("image"),
  productController.update,
);

// DELETE
router.get("/product/delete/:id", isAdmin, productController.delete);

/* ============================================
   ANALYTICS / INVOICE (tidak diubah)
============================================ */

router.get("/analytics", isAdmin, (req, res) => {
  // if (!req.session.admin) return res.redirect("/login");

  User.getAll((err, users) => {
    const totalCustomers = users.length;

    // Total products
    db.query(`SELECT COUNT(*) AS total FROM products`, (err1, result1) => {
      if (err1) {
        console.error("Error count products:", err1);
        return res.status(500).send("Error loading analytics");
      }

      const totalItems = result1[0]?.total || 0;

      // Total transactions (orders)
      db.query(`SELECT COUNT(*) AS total FROM peminjaman`, (err2, result2) => {
        if (err2) {
          console.error("Error count orders:", err2);
          return res.status(500).send("Error loading analytics");
        }

        const totalTransactions = result2[0]?.total || 0;

        // Total income (sum of price from peminjaman)
        db.query(
          `SELECT COALESCE(SUM(CAST(price AS DECIMAL(15, 2))), 0) AS total FROM peminjaman`,
          (err3, result3) => {
            if (err3) {
              console.error("Error sum income:", err3);
              return res.status(500).send("Error loading analytics");
            }

            const totalIncome = result3[0]?.total || 0;

            // Top loan items (aggregate qty by product)
            const topItemsSql = `
              SELECT 
                pr.id,
                pr.name AS product_name,
                SUM(p.qty) AS total_qty
              FROM peminjaman p
              LEFT JOIN products pr ON p.id_products = pr.id
              WHERE pr.id IS NOT NULL
              GROUP BY pr.id, pr.name
              ORDER BY total_qty DESC
              LIMIT 5
            `;

            db.query(topItemsSql, (err4, topItems) => {
              if (err4) {
                console.error("Error top items:", err4);
                return res.status(500).send("Error loading analytics");
              }

              // Top customers (aggregate transactions by user)
              const topCustomersSql = `
                SELECT 
                  u.id,
                  u.username AS customer_name,
                  COUNT(p.id) AS transaction_count
                FROM peminjaman p
                LEFT JOIN users u ON p.id_user = u.id
                WHERE u.id IS NOT NULL
                GROUP BY u.id, u.username
                ORDER BY transaction_count DESC
                LIMIT 5
              `;

              db.query(topCustomersSql, (err5, topCustomers) => {
                if (err5) {
                  console.error("Error top customers:", err5);
                  return res.status(500).send("Error loading analytics");
                }
                // monthly transactions for current year (months 1..12)
                const monthlySql = `
                  SELECT MONTH(tgl_pinjam) AS mon, COUNT(*) AS cnt
                  FROM peminjaman
                  WHERE tgl_pinjam IS NOT NULL AND YEAR(tgl_pinjam) = YEAR(CURDATE())
                  GROUP BY MONTH(tgl_pinjam)
                `;

                db.query(monthlySql, (err6, monthlyRows) => {
                  if (err6) {
                    console.error("Error monthly stats:", err6);
                    return res.status(500).send("Error loading analytics");
                  }

                  // build array of 12 months (index 0 => Jan)
                  const monthlyData = new Array(12).fill(0);
                  (monthlyRows || []).forEach((r) => {
                    const m = Number(r.mon);
                    if (!isNaN(m) && m >= 1 && m <= 12)
                      monthlyData[m - 1] = r.cnt;
                  });

                  ejs.renderFile(
                    path.join(__dirname, "../views/pages/admin/analytics.ejs"),
                    {
                      users,
                      totalCustomers,
                      totalItems,
                      totalTransactions,
                      totalIncome,
                      topItems: topItems || [],
                      topCustomers: topCustomers || [],
                      monthlyData,
                    },
                    (err, content) => {
                      res.render("layouts/atmin", {
                        title: "Analytics",
                        style: `<link rel="stylesheet" href="/css/analytics.css">`,
                        content,
                        showPopup: false,
                        message: null,
                        currentPage: req.path,
                      });
                    },
                  );
                });
              });
            });
          },
        );
      });
    });
  });
});

router.get("/invoice", isAdmin, (req, res) => {
  const sql = `
    SELECT 
      p.id,
      u.username AS customer_name,
      pr.name AS product_name,
      DATE_FORMAT(p.tgl_pinjam, '%Y-%m-%d') AS tgl_pinjam,
      DATE_FORMAT(p.tgl_kembali, '%Y-%m-%d') AS tgl_kembali,
      p.status,
      p.price
    FROM peminjaman p
    LEFT JOIN users u ON p.id_user = u.id
    LEFT JOIN products pr ON p.id_products = pr.id
    WHERE p.status = 'completed'
    ORDER BY p.id DESC
  `;

  db.query(sql, (err, orders) => {
    if (err) {
      console.error("INVOICE ERROR:", err);
      return res.status(500).send("Error loading invoice.");
    }

    ejs.renderFile(
      path.join(__dirname, "../views/pages/admin/invoice.ejs"),
      { orders },
      (err, content) => {
        res.render("layouts/atmin", {
          title: "Invoice",
          style: `<link rel="stylesheet" href="/css/invoice.css">`,
          content,
          showPopup: false,
          message: null,
          currentPage: req.path,
        });
      },
    );
  });
});

/* ============================================
   CATEGORY
============================================ */

router.get("/category", isAdmin, categoryController.index);
router.get("/category/create", isAdmin, categoryController.createPage);
router.post("/category/create", isAdmin, categoryController.create);
router.get("/category/edit/:id", isAdmin, categoryController.editPage);
router.post("/category/update/:id", isAdmin, categoryController.update);
router.get("/category/delete/:id", isAdmin, categoryController.delete);

module.exports = router;
