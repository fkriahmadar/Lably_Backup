const express = require("express");
const session = require("express-session");
const app = express();
const path = require("path");
const routes = require("./routes/index");
const User = require("./models/userModel");
const Customer = require("./models/customerModel");
const { passLoginStatus } = require("./middlewares/authMiddleware");

// ==========================
// 1. Middleware
// ==========================

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: "lably-secret-key",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(passLoginStatus);

// ==========================
// 2. ROUTER
// ==========================

app.use("/", routes);

// ==========================
// 3. CRON / CEK USER INACTIVE
// ==========================

setInterval(() => {
  console.log("=== CEK USER INACTIVE ===");
  User.deactivateInactive((err, result) => {
    if (err) return console.log("ERROR:", err);
    console.log("HASIL UPDATE:", result);
  });
}, 60 * 1000);

// ==========================
// 4. Server
// ==========================

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
