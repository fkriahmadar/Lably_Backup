const User = require("../models/userModel");
const bcrypt = require("bcrypt");

module.exports = {
    register: (req, res) => {
        const { username, email, password } = req.body;

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) throw err;

            const newUser = { username, email, password: hash };

            User.create(newUser, (err) => {
                if (err) {
                    req.session.message = {
                        type: "error",
                        text: "Gagal register! Email mungkin sudah digunakan."
                    };
                    return res.redirect("/register");
                }

                req.session.message = {
                    type: "success",
                    text: "Registrasi berhasil! Silakan login."
                };

                res.redirect("/login");
            });
        });
    },

    login: (req, res) => {
        const { email, password } = req.body;

        User.findByEmail(email, (err, result) => {
            if (err) throw err;

            if (result.length === 0) {
                req.session.message = {
                    type: "error",
                    text: "Email tidak terdaftar."
                };
                return res.redirect("/login");
            }

            const user = result[0];

            bcrypt.compare(password, user.password, (err, match) => {
                if (!match) {
                    req.session.message = {
                        type: "error",
                        text: "Password salah!"
                    };
                    return res.redirect("/login");
                }

                // Login sukses
                req.session.user = {
                    id: user.id,
                    username: user.username,
                    email: user.email
                };

                req.session.message = {
                    type: "success",
                    text: "Berhasil login!"
                };

                res.redirect("/");
            });
        });
    }
};
