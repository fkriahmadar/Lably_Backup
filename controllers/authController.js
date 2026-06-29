const Product = require("../models/productModel");
const User = require("../models/userModel");
const Order = require("../models/orderModel");
const Admin = require("../models/adminModel");
const bcrypt = require("bcrypt");
const path = require("path");
const ejs = require("ejs");

module.exports = {
  // ========================
  // LOGIN (ADMIN + USER)
  // ========================
  login: (req, res) => {
    const { email, password } = req.body;

    // Cek admin dulu
    Admin.findByEmail(email, (err, adminResult) => {
      if (err) throw err;

      if (adminResult.length > 0) {
        const admin = adminResult[0];

        bcrypt.compare(password, admin.password, (err, match) => {
          if (!match) {
            req.session.message = {
              type: "error",
              text: "Password admin salah!",
            };

            req.session.save(() => {
              return res.redirect("/login");
            });
            return;
          }

          // Login admin sukses
          req.session.admin = {
            id: admin.id,
            username: admin.username,
            email: admin.email,
          };

          req.session.message = {
            type: "success",
            text: "Selamat datang Admin!",
          };

          req.session.save(() => {
            return res.redirect("/dashboard");
          });
        });

        return;
      }

      // Kalau bukan admin, cek user
      User.findByEmail(email, (err, userResult) => {
        if (err) throw err;

        if (userResult.length === 0) {
          req.session.message = {
            type: "error",
            text: "Email tidak terdaftar.",
          };

          req.session.save(() => {
            return res.redirect("/login");
          });
          return;
        }

        const user = userResult[0];

        bcrypt.compare(password, user.password, (err, match) => {
            if (!match) {
                req.session.message = {
                    type: "error",
                    text: "Password salah!"
                };

                req.session.save(() => {
                    return res.redirect("/login");
                });
                return;
            }

            // Jika akun inactive → reaktifasi
            if (user.status === "inactive") {
                User.reactivate(user.id, (err) => {
                    if (err) throw err;
                });
            }

            // Update last login
            User.updateLastLogin(user.id, (err) => {
                if (err) throw err;
            });

            // Login user sukses
            req.session.user = {
                id: user.id,
                username: user.username,
                email: user.email
            };

            req.session.message = {
                type: "success",
                text: "Berhasil login!"
            };

            req.session.save(() => {
                return res.redirect("/");
            });
        });
      });
    });
  },

  // ========================
  // REGISTER USER
  // ========================
  register: (req, res) => {
    const { username, email, password } = req.body;

    bcrypt.hash(password, 10, (err, hash) => {
      if (err) throw err;

      const newUser = { username, email, password: hash, pp_image: "/Assets/profile.jpg" };

      User.create(newUser, (err) => {
        if (err) {
          req.session.message = {
            type: "error",
            text: "Gagal register! Email sudah digunakan.",
          };

          req.session.save(() => {
            return res.redirect("/register");
          });
          return;
        }

        req.session.message = {
          type: "success",
          text: "Registrasi berhasil! Silakan login.",
        };

        req.session.save(() => {
          return res.redirect("/login");
        });
      });
    });
  },

  // ========================
  // DASHBOARD ADMIN
  // ========================
  dashboard: async (req, res) => {
    if (!req.session.admin) {
      return res.redirect("/login");
    }

    const admin = req.session.admin;

    // Ambil message untuk popup
    const message = req.session.message || null;
    req.session.message = null;

    Product.getAll((err, products) => {
      if (err) throw err;

      User.getAll((err, users) => {
        if (err) throw err;

        Order.getAll((err, orders) => {
          if (err) throw err;

          const contentData = {
            admin,
            productsCount: products.length,
            customersCount: users.length,
            ordersCount: orders.length,
            customers: users,
            today: new Date(),
          };

          ejs.renderFile(
            path.join(__dirname, "../views/pages/admin/dashboard.ejs"),
            contentData,
            (err, content) => {
              if (err) throw err;

              res.render("layouts/atmin", {
                title: "Dashboard | Lably",
                meta: "",
                style: `
                                <link rel="stylesheet" href="/CSS/sidebar.css">
                                <link rel="stylesheet" href="/CSS/dashboard.css">
                            `,
                content,
                message, // <––– INI WAJIB BANGET
                showPopup: true,
                currentPage: "/dashboard",
              });
            }
          );
        });
      });
    });
  },
};
