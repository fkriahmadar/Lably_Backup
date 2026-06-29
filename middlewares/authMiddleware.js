const User = require("../models/userModel");

// 1. Middleware Otentikasi Umum (Admin atau Customer)
const isLoggedIn = (req, res, next) => {
  // Cek apakah sesi user ATAU sesi admin ada
  if (req.session.user || req.session.admin) {
    return next();
  }

  req.session.message = {
    type: "error",
    text: "Anda harus login untuk mengakses halaman ini.",
  };

  req.session.save(() => {
    return res.redirect("/login");
  });
};

// 1b. Middleware Untuk Memastikan Akun Customer Sudah Terverifikasi
const ensureVerifiedCustomer = (req, res, next) => {
  if (!req.session.user || !req.session.user.id) {
    req.session.message = {
      type: "error",
      text: "Anda harus login terlebih dahulu.",
    };
    return req.session.save(() => res.redirect("/login"));
  }

  User.getById(req.session.user.id, (err, userRows) => {
    if (err) {
      console.error("ERROR checking user verification:", err);
      req.session.message = {
        type: "error",
        text: "Terjadi kesalahan pada server. Silakan coba lagi.",
      };
      return req.session.save(() => res.redirect("/catalogue"));
    }

    if (!userRows || userRows.length === 0) {
      req.session.message = {
        type: "error",
        text: "Sesi pengguna tidak valid. Silakan login kembali.",
      };
      return req.session.save(() => res.redirect("/login"));
    }

    const user = userRows[0];
    // If the database doesn't have the `ktp_status` column (undefined),
    // avoid blocking the user — log a warning and allow the request to continue.
    if (typeof user.ktp_status === "undefined") {
      console.warn(
        `Warning: user ${user.id} has no ktp_status column — skipping verification check.`,
      );
      return next();
    }

    if (user.ktp_status !== "verified") {
      req.session.message = {
        type: "error",
        text: "Akun Anda belum terverifikasi. Upload KTP dan tunggu verifikasi admin untuk melakukan peminjaman.",
      };
      return req.session.save(() => res.redirect("/profile-customer"));
    }

    next();
  });
};

// 2. Middleware Otorisasi (Khusus Admin)
const isAdmin = (req, res, next) => {
  // Cek apakah sesi admin ADA
  if (req.session.admin) {
    return next();
  }

  // Jika tidak ada sesi admin, arahkan mereka ke halaman utama user atau login
  req.session.message = {
    type: "error",
    text: "Akses Ditolak: Anda tidak memiliki izin Admin.",
  };

  req.session.save(() => {
    // Redirect ke dashboard user atau login jika tidak ada sesi sama sekali
    return res.redirect(req.session.user ? "/" : "/login");
  });
};

// 3. Middleware untuk Header (tetap sama)
const passLoginStatus = (req, res, next) => {
  // isLoggedIn status menjadi true jika ada sesi user ATAU admin
  res.locals.isLoggedIn = !!req.session.user || !!req.session.admin;
  // Provide `user` for templates (some views expect `user` variable)
  res.locals.user = req.session.user || req.session.admin || null;
  // keep legacy name for compatibility
  res.locals.userSession = res.locals.user;
  res.locals.isAdmin = !!req.session.admin;
  next();
};

module.exports = {
  isLoggedIn, // Dipakai untuk rute Customer
  isAdmin, // Dipakai untuk rute Admin
  ensureVerifiedCustomer,
  passLoginStatus,
};
