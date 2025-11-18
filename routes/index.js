// routes/index.js
const express = require("express");
const router = express.Router();
const ejs = require("ejs");
const path = require("path");
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
router.get("/login", async (req, res) => {
  const message = req.session.message || null;
  req.session.message = null;

  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/login.ejs"),
    { message }
  );

  res.render("layouts/auth", {
    title: "Login | Lably",
    meta: "",
    style: "",
    content,
  });
});

router.post("/login", authController.login);


// REGISTER PAGE (URL: /register)
router.get("/register", async (req, res) => {
  const message = req.session.message || null;
  req.session.message = null;

  const content = await ejs.renderFile(
    path.join(__dirname, "../views/pages/register.ejs"),
    { message }
  );

  res.render("layouts/auth", {
    title: "Register | Lably",
    meta: "",
    style: "",
    content,
  });
});

router.post("/register", authController.register);


// FORM PAGE (URL: /form)
router.get("/form", (req, res) => {
  res.render("pages/form", { title: "Form" });
});

module.exports = router;
