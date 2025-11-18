const express = require("express");
const session = require("express-session");
const app = express();
const ejs = require("ejs");
const path = require("path");

// ==========================
// 1. Middleware penting
// ==========================

// Untuk membaca data POST dari form
app.use(express.urlencoded({ extended: true }));

// Session untuk autentikasi
app.use(session({
    secret: "lably-secret-key",
    resave: false,
    saveUninitialized: true
}));

// Public folder untuk CSS & Asset
app.use(express.static(path.join(__dirname, "public")));

// Set view engine EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// ==========================
// 2. ROUTE HALAMAN (GET)
// ==========================

app.get("/", async (req, res) => {
    const content = await ejs.renderFile(
        path.join(__dirname, "views/pages/home.ejs"),
        {}
    );

    res.render("layouts/main", {
        title: "Home | Lably Official Web",
        showFooter: true,
        meta: `
            <meta name="description" content="LabLy: Solusi terdepan untuk pengadaan alat riset dan laboratorium." />
        `,
        style: `
            <link rel="stylesheet" href="/CSS/home.css" />
        `,
        content,
    });
});

// GET Login Page
app.get("/login", async (req, res) => {
    const content = await ejs.renderFile(
        path.join(__dirname, "views/pages/login.ejs"),
        {}
    );

    res.render("layouts/auth", {
        title: "Login | LabLy",
        meta: "",
        style: "",
        content
    });
});

// GET Register Page
app.get("/register", async (req, res) => {
    const content = await ejs.renderFile(
        path.join(__dirname, "views/pages/register.ejs"),
        {}
    );

    res.render("layouts/auth", {
        title: "Register | LabLy",
        meta: "",
        style: "",
        content
    });
});

app.get("/form", async (req, res) => {
    const content = await ejs.renderFile(
        path.join(__dirname, "views/pages/form.ejs"),
        {}
    );

    res.render("layouts/forms", {
        title: "Form | LabLy",
        meta: "",
        style: "",
        content
    });
});


// ==========================
// 3. ROUTE AUTENTIKASI (POST)
// ==========================

// Import routes utama (index.js)
const routes = require("./routes/index");

// Gunakan semua route di index.js
// contoh: POST /register, POST /login
app.use("/", routes);


// ==========================
// 4. Jalankan server
// ==========================

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
