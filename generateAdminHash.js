const bcrypt = require("bcrypt");

bcrypt.hash("123", 10, (err, hash) => {
    if (err) throw err;
    console.log("HASH:", hash);
});
