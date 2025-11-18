// routes/index.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Route GET untuk Home Page (URL: /)
router.get("/", (req, res) => {
  // Controller Logic: Ambil data (jika ada, misal: statistik alat)
  const dataHome = {
    title: "Sistem Peminjaman Alat Lab",
    message: "Selamat datang di sistem peminjaman alat laboratorium.",
  };

  // View: Render template EJS
  res.render("index", dataHome);
});

// LOGIN PAGE (URL: /login)
router.get("/login", (req, res) => {
  res.render("pages/login", { title: "Login" });
});
router.post("/login", authController.login);


// REGISTER PAGE (URL: /register)
router.get("/register", (req, res) => {
  res.render("pages/register", { title: "Register" });
});
router.post("/register", authController.register);

// FORM PAGE (URL: /form)
router.get("/form", (req, res) => {
  res.render("pages/form", { title: "Form" });
});

module.exports = router;
