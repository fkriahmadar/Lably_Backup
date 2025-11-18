const User = require("../models/userModel");
const bcrypt = require("bcrypt");

module.exports = {
    register: (req, res) => {
        const { username, email, password } = req.body;

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) throw err;

            const newUser = {
                username: username,
                email: email,
                password: hash
            };

            User.create(newUser, (err) => {
                if (err) {
                    console.log(err);
                    return res.send("Gagal register, email kemungkinan sudah digunakan.");
                }

                res.redirect("/login");
            });
        });
    },

    login: (req, res) => {
        const { email, password } = req.body;

        User.findByEmail(email, (err, result) => {
            if (err) throw err;

            if (result.length === 0) {
                return res.send("Email tidak terdaftar.");
            }

            const user = result[0];

            bcrypt.compare(password, user.password, (err, match) => {
                if (!match) {
                    return res.send("Password salah!");
                }

                req.session.user = {
                    id: user.id,
                    username: user.username,
                    email: user.email
                };

                res.redirect("/");
            });
        });
    }
};
