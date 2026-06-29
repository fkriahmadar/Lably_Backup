const buttons = document.querySelectorAll('.menu-options button');

    buttons.forEach(btn => {
        btn.addEventListener('click', function() {

            // hilangkan active dari semua tombol
            buttons.forEach(b => b.classList.remove('active'));

            // tambahkan active ke tombol yang diklik
            this.classList.add('active');
        });
    });