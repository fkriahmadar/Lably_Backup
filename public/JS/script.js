document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".main-header");
  const footer = document.querySelector(".main-footer");

  // Tentukan ambang batas 75% dari tinggi viewport
  const viewportHeight = window.innerHeight;
  const threshold = viewportHeight * 0.25; // Header hilang saat footer mencapai 25% dari atas (atau 75% terisi)

  function checkFooterVisibility() {
    // Mendapatkan posisi Y dari tepi atas footer relatif terhadap viewport
    const footerTop = footer.getBoundingClientRect().top;

    // Kondisi: Header disembunyikan jika tepi atas footer
    // sudah melewati 75% dari tinggi viewport (yaitu footerTop <= threshold)
    if (footerTop <= threshold) {
      // Footer sudah mengisi 75% layar atau lebih, sembunyikan header
      header.classList.add("header-hidden");
    } else {
      // Footer belum memenuhi ambang batas, tampilkan header
      header.classList.remove("header-hidden");
    }
  }

  // Panggil saat halaman pertama kali dimuat
  checkFooterVisibility();

  // Panggil setiap kali terjadi event scroll
  window.addEventListener("scroll", checkFooterVisibility);

  // Panggil saat ukuran jendela berubah (misalnya rotasi tablet)
  window.addEventListener("resize", checkFooterVisibility);
});
