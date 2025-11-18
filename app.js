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

// Session
app.use(session({
    secret: "lably-secret-key",
    resave: false,
    saveUninitialized: true
}));

// Public folder
app.use(express.static(path.join(__dirname, "public")));

// Set EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// ==========================
// 2. PAGE HOME
// ==========================

app.get("/", async (req, res) => {
    const content = await ejs.renderFile(
        path.join(__dirname, "views/pages/home.ejs"),
        {}
    );

    res.render("layouts/main", {
        title: "Home | Lably",
        showFooter: true,
        meta: `
            <meta name="description" content="LabLy: Solusi alat riset & laboratorium." />
        `,
        style: `<link rel="stylesheet" href="/CSS/home.css" />`,
        content,
    });
});


// ==========================
// 3. ROUTES AUTENTIKASI (LOGIN, REGISTER)
// ==========================

const routes = require("./routes/index");
app.use("/", routes);


// ==========================
// 4. Jalankan Server
// ==========================

app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
