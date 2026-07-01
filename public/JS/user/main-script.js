document.addEventListener("DOMContentLoaded", function () {
  /* =========================================================
      NAVBAR SCROLL
  ========================================================= */
  const header = document.querySelector(".main-header");
  const footer = document.querySelector(".main-footer");

  if (header && footer) {
    const viewportHeight = window.innerHeight;
    const threshold = viewportHeight * 0.25;

    function checkFooterVisibility() {
      const footerTop = footer.getBoundingClientRect().top;

      if (footerTop <= threshold) {
        header.classList.add("header-hidden");
      } else {
        header.classList.remove("header-hidden");
      }
    }

    checkFooterVisibility();
    window.addEventListener("scroll", checkFooterVisibility);
    window.addEventListener("resize", checkFooterVisibility);
  }

  /* =========================================================
      BURGER MENU
  ========================================================= */
  const toggleButton = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("main-nav");
  const navIcons = document.querySelector(".nav-icons");

  if (toggleButton && navMenu && navIcons) {
    toggleButton.addEventListener("click", function () {
      navMenu.classList.toggle("active");
      navIcons.classList.toggle("active");

      const icon = toggleButton.querySelector("i");

      if (navMenu.classList.contains("active")) {
        icon.classList.remove("bi-list");
        icon.classList.add("bi-x-lg");

        // Perhitungan offset untuk posisi navIcons
        setTimeout(() => {
          const navHeight = navMenu.offsetHeight;
          const navMarginBottom = parseFloat(
            getComputedStyle(navMenu).marginBottom
          );
          const iconsMarginTop = parseFloat(
            getComputedStyle(navIcons).marginTop
          );
          const totalOffset = navHeight + navMarginBottom + iconsMarginTop;

          navIcons.style.top = `calc(100% + ${totalOffset}px)`;
        }, 0);
      } else {
        icon.classList.remove("bi-x-lg");
        icon.classList.add("bi-list");
        navIcons.style.top = "";
      }
    });
  }

  /* =========================================================
      CHECKOUT METHOD
  ========================================================= */
  const methodButtons = document.querySelectorAll(".method-btn");

  methodButtons.forEach((button) => {
    button.addEventListener("click", function () {
      methodButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
      console.log("Metode pembayaran dipilih:", this.textContent.trim());
    });
  });

  /* =========================================================
      PAGINATION ORDER (Satu fungsi)
  ========================================================= */
  const cardListContainer = document.querySelector(".order-card-list");

  if (cardListContainer) {
    const rowsPerPage = 5;
    const maxPageButtons = 3;
    const allCards = Array.from(
      cardListContainer.querySelectorAll(".order-card")
    );
    const totalRows = allCards.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    const paginationContainer = document.querySelector(".pagination");
    let currentPage = 1;

    // Fungsi displayCards
    function displayCards(page) {
      const startIndex = (page - 1) * rowsPerPage;
      const endIndex = startIndex + rowsPerPage;

      allCards.forEach((card, index) => {
        card.style.display =
          index >= startIndex && index < endIndex ? "flex" : "none";
      });
    }

    // Fungsi createButton (Digabungkan)
    function createButton(innerHTML, targetPage) {
      const button = document.createElement("button");
      button.innerHTML = innerHTML;
      button.classList.add("page-item");

      button.addEventListener("click", () => {
        if (targetPage >= 1 && targetPage <= totalPages) {
          currentPage = targetPage;
          displayCards(currentPage);
          renderPaginationButtons();
        }
      });
      return button;
    }

    // Fungsi renderPaginationButtons
    function renderPaginationButtons() {
      paginationContainer.innerHTML = "";
      const startWindow =
        Math.floor((currentPage - 1) / maxPageButtons) * maxPageButtons + 1;
      const endWindow = Math.min(startWindow + maxPageButtons - 1, totalPages);

      if (currentPage > maxPageButtons && startWindow > 1) {
        const prevGroupPage = startWindow - 1;
        const prevButton = createButton("&#x276E; PREV", prevGroupPage);
        prevButton.classList.add("page-arrow");
        paginationContainer.appendChild(prevButton);
      }

      for (let i = startWindow; i <= endWindow; i++) {
        const button = createButton(i, i);
        if (i === currentPage) button.classList.add("active");
        button.classList.add("page-number");
        paginationContainer.appendChild(button);
      }

      if (endWindow < totalPages) {
        const nextGroupPage = endWindow + 1;
        const nextButton = createButton(`NEXT &#x276F;`, nextGroupPage);
        nextButton.classList.add("page-next");
        paginationContainer.appendChild(nextButton);
      }
    }

    // Inisialisasi hanya jika ada halaman
    if (totalPages > 0) {
      displayCards(currentPage);
      renderPaginationButtons();
    }
  } // end if (cardListContainer)

  /* =========================================================
      FILTER ORDER
  ========================================================= */
  const filterButtons = document.querySelectorAll(".filter-btn");
  const orderCards = document.querySelectorAll(".order-card");
  const mainContent = document.getElementById("main-content");

  const filterMap = {
    all: ["paid", "in-use", "overdue", "complete"],
    loaned: ["in-use", "overdue"],
    completed: ["complete"],
  };

  function applyFilter(filterName) {
    const validStatuses = filterMap[filterName];

    if (mainContent) {
      if (filterName === "all") {
        mainContent.classList.remove("view-loaned");
      } else {
        mainContent.classList.add("view-loaned");
      }
    }

    orderCards.forEach((card) => {
      const cardStatus = card.getAttribute("data-status");
      const shouldDisplay =
        filterName === "all" || validStatuses.includes(cardStatus);
      card.style.display = shouldDisplay ? "flex" : "none";
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");

      const filterName = this.id.split("-")[1];
      applyFilter(filterName);
    });
  });

  applyFilter("all");

  /* =========================================================
      PRODUCT PAGE — QTY INPUT (Menangani multiple forms)
  ========================================================= */
  const qtyDisplay = document.querySelector(".qty-display");
  const plus = document.querySelector(".plus-btn");
  const minus = document.querySelector(".minus-btn");

  // ID yang akan di-update (termasuk yang dari perbaikan HTML sebelumnya)
  const formQties = [
    document.getElementById("cart-qty-input"),
    document.getElementById("loan-qty-input"),
    document.querySelector(".qty-hidden"), // untuk form yang lain (misal form lama)
  ].filter((el) => el); // filter elemen yang tidak ditemukan (null)

  // Target semua form yang mungkin mengirim kuantitas
  // ID yang di-merge: productForm, cart-form, loan-form
  const quantityForms = document.querySelectorAll(
    "#productForm, #cart-form, #loan-form"
  );

  if (qtyDisplay && plus && minus && quantityForms.length > 0) {
    const productContainer = document.querySelector('.container.product-detail');
    const maxStock = productContainer ? (parseInt(productContainer.dataset.stock) || Infinity) : Infinity;

    // Fungsi untuk memperbarui semua hidden input QTY
    function updateHiddenQties() {
      const currentQty = qtyDisplay.value;
      formQties.forEach((input) => {
        input.value = currentQty;
      });
    }

    // Utility: tampilkan popup kecil di client
    function showClientPopup(type, text) {
      const existing = document.getElementById('client-popup');
      if (existing) existing.remove();
      const div = document.createElement('div');
      div.id = 'client-popup';
      div.className = `popup ${type}`;
      div.style.position = 'fixed';
      div.style.top = '6rem';
      div.style.right = '1rem';
      div.style.zIndex = 2000;
      div.style.padding = '10px 14px';
      div.style.borderRadius = '6px';
      div.style.boxShadow = '0 6px 18px rgba(0,0,0,0.12)';
      div.innerText = text;
      document.body.appendChild(div);
      setTimeout(() => { const p = document.getElementById('client-popup'); if (p) p.remove(); }, 3500);
    }

    // Listener tombol PLUS
    plus.addEventListener("click", () => {
      const current = parseInt(qtyDisplay.value);
      if (current < maxStock) {
        qtyDisplay.value = current + 1;
        updateHiddenQties();
      } else {
        showClientPopup('error', 'Jumlah yang diminta melebihi stok tersedia.');
      }
    });

    // Listener tombol MINUS
    minus.addEventListener("click", () => {
      if (parseInt(qtyDisplay.value) > 1) {
        qtyDisplay.value = parseInt(qtyDisplay.value) - 1;
        updateHiddenQties();
      }
    });

    // Listener submit pada semua form yang relevan
    quantityForms.forEach((form) => {
      form.addEventListener("submit", (e) => {
        updateHiddenQties(); // pastikan QTY diperbarui saat submit
        if (Number(qtyDisplay.value) > maxStock) {
          e.preventDefault();
          showClientPopup('error', 'Jumlah yang diminta melebihi stok tersedia.');
        }
      });
    });

    // Panggil sekali untuk inisialisasi
    updateHiddenQties();
  }

  /* =========================================================
      FORM PAGE — AUTO TOTAL HARGA (Menggunakan ID yang benar)
  ========================================================= */
  const borrowDate = document.getElementById("borrowDate");
  const returnDate = document.getElementById("returnDate");
  const allTotal = document.getElementById("allTotal");

  if (borrowDate && returnDate && allTotal) {
    const price = Number(document.getElementById("price").dataset.price);
    const qty = Number(document.getElementById("qty").value);

    // Format tanggal ke YYYY-MM-DD
    function formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    // Set tanggal minimal pinjam (Today) jika bukan perpanjangan
    if (!borrowDate.hasAttribute("readonly")) {
      const today = new Date();
      borrowDate.min = formatDate(today);
    }

    // Update minimal tanggal kembali (H+1 dari tanggal pinjam)
    function updateReturnDateMin() {
      if (borrowDate.value) {
        const bDate = new Date(borrowDate.value);
        const nextDay = new Date(bDate);
        nextDay.setDate(bDate.getDate() + 1);
        returnDate.min = formatDate(nextDay);
      }
    }

    function hitungTotal() {
      if (!borrowDate.value || !returnDate.value) return;

      const start = new Date(borrowDate.value);
      const end = new Date(returnDate.value);

      const msPerDay = 1000 * 60 * 60 * 24;
      const selisih = Math.ceil((end - start) / msPerDay);

      if (selisih <= 0) {
        allTotal.value = "Tanggal salah";
        return;
      }

      const total = price * qty * selisih;
      allTotal.value = "Rp" + total.toLocaleString("id-ID");
      document.getElementById("allTotalRaw").value = total;
    }

    borrowDate.addEventListener("change", () => {
      updateReturnDateMin();
      hitungTotal();
    });
    returnDate.addEventListener("change", hitungTotal);

    // Inisialisasi awal
    updateReturnDateMin();
    hitungTotal();
  }
});
