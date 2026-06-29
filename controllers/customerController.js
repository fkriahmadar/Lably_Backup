const Customer = require("../models/customerModel");
const path = require("path");
const ejs = require("ejs");

module.exports = {
  list: (req, res) => {
    const search = req.query.search || "";
    const status = req.query.status || "all";
    const dateStart = req.query.dateStart || "";
    const dateEnd = req.query.dateEnd || "";
    const page = parseInt(req.query.page) || 1;

    const limit = 5; // show 5 customers per page
    const offset = (page - 1) * limit;

    Customer.countFiltered(
      search,
      status,
      dateStart,
      dateEnd,
      (err, countResult) => {
        if (err) throw err;

        const totalCustomers = countResult[0].total;
        const totalPages = Math.ceil(totalCustomers / limit);

        Customer.getFiltered(
          search,
          status,
          dateStart,
          dateEnd,
          limit,
          offset,
          (err, users) => {
            if (err) throw err;

            console.log(
              "LOAD CUSTOMER EJS FROM:",
              path.join(__dirname, "../views/pages/admin/customer.ejs"),
            );

            ejs.renderFile(
              path.join(__dirname, "../views/pages/admin/customer.ejs"),
              {
                users,
                totalCustomers,
                page,
                totalPages,
                limit,
                search,
                status,
                dateStart,
                dateEnd,
              },
              (err, content) => {
                if (err) throw err;

                res.render("layouts/atmin", {
                  title: "Customers | Lably",
                  style: `
                                <link rel="stylesheet" href="/CSS/sidebar.css">
                                <link rel="stylesheet" href="/CSS/customer.css">
                            `,
                  content,
                  currentPage: "/customer",
                });
              },
            );
          },
        );
      },
    );
  },

  detail: (req, res) => {
    const id = req.params.id;

    Customer.getById(id, (err, userRows) => {
      if (err) throw err;

      if (!userRows || userRows.length === 0) {
        return res.redirect("/customer");
      }

      const user = userRows[0];

      ejs.renderFile(
        path.join(__dirname, "../views/pages/admin/customer-detail.ejs"),
        { user },
        (err, content) => {
          if (err) throw err;

          res.render("layouts/atmin", {
            title: `Detail Customer | Lably`,
            style: `
                        <link rel="stylesheet" href="/CSS/sidebar.css">
                        <link rel="stylesheet" href="/CSS/customer-detail.css">
                    `,
            content,
            currentPage: "/customer",
          });
        },
      );
    });
  },

  approveKtp: (req, res) => {
    const id = req.params.id;
    Customer.updateKtpStatus(id, "verified", (err) => {
      if (err) throw err;
      res.redirect(`/customer/${id}`);
    });
  },

  rejectKtp: (req, res) => {
    const id = req.params.id;
    Customer.updateKtpStatus(id, "rejected", (err) => {
      if (err) throw err;
      res.redirect(`/customer/${id}`);
    });
  },
};
