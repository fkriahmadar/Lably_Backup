-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 26, 2026 at 02:53 PM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lably_website`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(50) NOT NULL,
  `username` varchar(250) NOT NULL,
  `email` varchar(250) NOT NULL,
  `password` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `username`, `email`, `password`) VALUES
(1, 'etmin', 'admin@gmail.com', '$2b$10$b9Ly7MLMAD66SG5Wj4my7.BIIwtp9fqbA/cby18aho3BdlDTTi4Du');

-- --------------------------------------------------------

--
-- Table structure for table `category`
--

CREATE TABLE `category` (
  `id` int(50) NOT NULL,
  `name` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `category`
--

INSERT INTO `category` (`id`, `name`) VALUES
(22, 'Biologi dan Ilmu Hayati'),
(23, 'Kimia dan Ilmu Material');

-- --------------------------------------------------------

--
-- Table structure for table `d_peminjaman`
--

CREATE TABLE `d_peminjaman` (
  `id` int(50) NOT NULL,
  `id_user` int(50) NOT NULL,
  `id_products` int(50) NOT NULL,
  `price` varchar(250) NOT NULL,
  `tgl_pinjam` date NOT NULL,
  `tgl_kembali` date NOT NULL,
  `status` enum('draft') NOT NULL DEFAULT 'draft',
  `qty` int(50) NOT NULL,
  `no_telp` varchar(255) NOT NULL,
  `alamat` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `d_peminjaman`
--

INSERT INTO `d_peminjaman` (`id`, `id_user`, `id_products`, `price`, `tgl_pinjam`, `tgl_kembali`, `status`, `qty`, `no_telp`, `alamat`, `created_at`, `updated_at`) VALUES
(84, 10, 6, '1200000', '2026-06-21', '2026-06-22', 'draft', 1, '', 'Bekasi', '2026-06-21 03:19:15', '2026-06-21 03:19:15');

-- --------------------------------------------------------

--
-- Table structure for table `payment`
--

CREATE TABLE `payment` (
  `id_payment` int(50) NOT NULL,
  `tgl_pinjam` date NOT NULL,
  `tgl_kembali` date NOT NULL,
  `metode_payment` enum('Credit Card','Qris','E-Wallet') NOT NULL,
  `ewallet_provider` enum('Dana','ShopeePay','OVO','GoPay') DEFAULT NULL,
  `id_user` int(50) NOT NULL,
  `id_product` int(50) NOT NULL,
  `price` int(50) NOT NULL,
  `qty` int(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `payment`
--

INSERT INTO `payment` (`id_payment`, `tgl_pinjam`, `tgl_kembali`, `metode_payment`, `ewallet_provider`, `id_user`, `id_product`, `price`, `qty`, `created_at`) VALUES
(1, '2026-06-26', '2026-06-27', 'Credit Card', NULL, 9, 23, 650000, 1, '2026-06-26 11:04:50');

-- --------------------------------------------------------

--
-- Table structure for table `peminjaman`
--

CREATE TABLE `peminjaman` (
  `id` int(50) NOT NULL,
  `id_user` int(50) NOT NULL,
  `id_products` int(50) NOT NULL,
  `price` varchar(255) NOT NULL,
  `tgl_pinjam` date NOT NULL,
  `tgl_kembali` date NOT NULL,
  `status` enum('pending','in use','completed','overdue') NOT NULL,
  `qty` int(50) NOT NULL,
  `no_telp` varchar(255) NOT NULL,
  `alamat` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `peminjaman`
--

INSERT INTO `peminjaman` (`id`, `id_user`, `id_products`, `price`, `tgl_pinjam`, `tgl_kembali`, `status`, `qty`, `no_telp`, `alamat`) VALUES
(14, 9, 12, '1050000', '2025-12-24', '2025-12-31', 'completed', 1, '998', 'jhvhj'),
(15, 9, 15, '1500000', '2025-12-12', '2025-12-13', 'completed', 1, '998', 'jhvhj'),
(17, 9, 8, '200000', '2025-12-19', '2025-12-20', 'completed', 1, '998', 'jhvhj'),
(18, 10, 13, '200000', '2025-12-05', '2025-12-06', 'completed', 1, '89892492840', 'Melbourne'),
(19, 10, 11, '100000', '2025-12-05', '2025-12-06', 'pending', 1, '89892492840', 'Melbourne'),
(20, 10, 15, '1500000', '2025-12-05', '2025-12-06', 'overdue', 1, '89892492840', 'Melbourne'),
(21, 10, 12, '300000', '2025-12-05', '2025-12-06', 'completed', 2, '89892492840', 'Melbourne'),
(22, 9, 12, '300000', '2025-12-05', '2025-12-06', 'completed', 2, '89892492840', 'Melbourne'),
(23, 9, 11, '100000', '2025-12-05', '2025-12-06', 'overdue', 1, '89892492840', 'Melbourne'),
(24, 9, 12, '150000', '2025-12-05', '2025-12-06', 'completed', 1, '89892492840', 'Melbourne'),
(25, 9, 15, '1500000', '2025-12-06', '2025-12-07', 'completed', 1, '89892492840', 'Melbourne'),
(26, 10, 21, '600000', '2025-12-16', '2025-12-18', 'pending', 1, '+33 1 23 45 67', 'Paris'),
(27, 10, 23, '2600000', '2025-12-19', '2025-12-23', 'pending', 1, '+33 1 23 45 67', 'Paris'),
(28, 10, 18, '12000000', '2025-12-11', '2025-12-15', 'pending', 1, '+33 1 23 45 67', 'Paris'),
(29, 10, 23, '10400000', '2025-12-10', '2025-12-26', 'pending', 1, '89892492840', 'Melbourne'),
(30, 11, 9, '250000', '2025-12-13', '2025-12-14', 'pending', 1, '+82 10 1234 5678', 'Seoul'),
(31, 11, 21, '300000', '2025-12-12', '2025-12-13', 'pending', 1, '+82 10 1234 5678', 'Seoul'),
(32, 9, 24, '1000000', '2026-05-04', '2026-05-05', 'completed', 1, '89892492840', 'Melbourne'),
(33, 9, 22, '750000', '2026-06-12', '2026-06-13', 'completed', 1, '9999', 'jhug'),
(34, 9, 24, '1000000', '2026-06-13', '2026-06-14', 'overdue', 1, '9999', 'jhug'),
(35, 9, 23, '650000', '2026-06-12', '2026-06-13', 'pending', 1, '9999', 'jhug'),
(36, 13, 11, '100000', '2026-06-20', '2026-06-21', 'pending', 1, '-', 'bekasi'),
(37, 13, 8, '200000', '2026-06-20', '2026-06-21', 'pending', 1, '-', 'bekasi'),
(38, 13, 8, '200000', '2026-06-20', '2026-06-21', 'pending', 1, '-', 'bekasi'),
(39, 13, 8, '200000', '2026-06-20', '2026-06-21', 'pending', 1, '-', 'bekasi'),
(40, 13, 8, '200000', '2026-06-20', '2026-06-21', 'pending', 1, '-', 'bekasi'),
(41, 13, 8, '200000', '2026-06-20', '2026-06-21', 'pending', 1, '-', 'bekasi'),
(42, 13, 7, '600000', '2026-06-20', '2026-06-22', 'pending', 1, '-', 'bekasi'),
(43, 13, 7, '600000', '2026-06-20', '2026-06-22', 'pending', 1, '-', 'bekasi'),
(44, 13, 7, '600000', '2026-06-20', '2026-06-22', 'pending', 1, '-', 'bekasi'),
(45, 13, 10, '50000', '2026-06-21', '2026-06-22', 'pending', 1, '-', 'bekasi'),
(46, 13, 10, '50000', '2026-06-21', '2026-06-22', 'pending', 1, '-', 'bekasi'),
(47, 13, 7, '300000', '2026-06-21', '2026-06-22', 'pending', 1, '-', 'bekasi'),
(48, 13, 9, '250000', '2026-06-21', '2026-06-22', 'pending', 1, '-', 'Bekasi'),
(49, 13, 9, '250000', '2026-06-21', '2026-06-22', 'pending', 1, '-', 'Bekasi'),
(50, 13, 9, '250000', '2026-06-21', '2026-06-22', 'pending', 1, '-', 'Bekasi'),
(51, 13, 6, '1200000', '2026-06-21', '2026-06-22', 'pending', 1, '-', 'Bekasi'),
(52, 13, 6, '1200000', '2026-06-21', '2026-06-22', 'pending', 1, '-', 'Bekasi'),
(53, 10, 6, '1200000', '2026-06-21', '2026-06-22', 'pending', 1, '-', 'Bekasi'),
(54, 13, 8, '200000', '2026-06-21', '2026-06-22', 'pending', 1, '-', 'Bekasi'),
(55, 13, 11, '100000', '2026-06-21', '2026-06-22', 'pending', 1, '-', 'Bekasi'),
(56, 13, 11, '100000', '2026-06-21', '2026-06-22', 'pending', 1, '-', 'Bekasi'),
(57, 13, 9, '250000', '2026-06-21', '2026-06-22', 'pending', 1, '-', 'Bekasi'),
(58, 13, 12, '150000', '2026-06-23', '2026-06-24', 'completed', 1, '-', 'Bekasi'),
(59, 13, 9, '250000', '2026-06-23', '2026-06-24', 'pending', 1, '-', 'Bekasi'),
(60, 9, 23, '650000', '2026-06-26', '2026-06-27', 'in use', 1, '-', '-');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `id_category` int(50) NOT NULL,
  `description` varchar(250) NOT NULL,
  `stock` int(50) NOT NULL,
  `kondisi` varchar(250) NOT NULL,
  `price` int(50) NOT NULL,
  `image` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `id_category`, `description`, `stock`, `kondisi`, `price`, `image`) VALUES
(6, 'NanoDrop Spectrophotometer', 22, 'NanoDrop adalah spektrofotometer mikro volume yang memungkinkan pengukuran konsentrasi dan kemurnian atau protein menggunakan volume sampel yang sangat kecil tanpa memerlukan kuvet. Instrumen ini bekerja dengan menahan tetesan sampel di antara dua se', 7, 'Sangat Baik', 1200000, '1765298983927-Nano.png'),
(7, 'Thermal Cycler', 22, 'Alat yang digunakan untuk melakukan Polymerase Chain Reaction, yaitu serangkaian siklus pemanasan dan pendinginan yang sangat tepat untuk mengamplifikasi (memperbanyak) sekuens spesifik.', 1, 'Sangat Baik', 300000, '1765298976080-Cycler.png'),
(8, 'Centrifuge', 22, 'Mesin yang memutar sampel dengan kecepatan sangat tinggi untuk memisahkan komponen-komponen (seperti sel, pelet, atau organel) berdasarkan perbedaan massa jenis melalui gaya sentrifugal.', 2, 'Sangat Baik', 200000, '1765298967860-Centri.png'),
(9, 'Gel Electrophoresis System', 22, 'Alat yang memisahkan molekul bermuatan berdasarkan ukuran ketika sampel dialirkan listrik melalui media gel, digunakan untuk memeriksa kualitas dan ukuran produk.', 9, 'Sangat Baik', 250000, '1765298959126-Gel.png'),
(10, 'Mikropipet', 22, 'Alat presisi yang digunakan untuk mengambil dan memindahkan volume cairan yang sangat kecil (dalam skala mikroliter), merupakan alat dasar penting dalam menyiapkan semua reaksi biologi molekuler.', 18, 'Sangat Baik', 50000, '1765298950023-Mikropipet.png'),
(11, 'Mikroskop Cahaya', 22, 'Alat fundamental untuk mengamati objek mikroskopis seperti sel, jaringan, bakteri, dan jamur, dengan memperbesar citra melalui sistem lensa dan pencahayaan.', 2, 'Sangat Baik', 100000, '1765298420979-Cahaya.png'),
(12, 'Inkubator', 22, 'Ruangan atau wadah yang menyediakan suhu, kelembaban, dan terkadang kadar CO2 yang terkontrol dan stabil untuk mendukung pertumbuhan optimal mikroorganisme atau kultur sel.', 7, 'Sangat Baik', 150000, '1765298343828-Inkubator.png'),
(13, 'Autoklaf', 22, 'Alat sterilisasi yang menggunakan uap air panas bertekanan tinggi (121 C dan 15 psi) untuk membunuh semua mikroorganisme, termasuk spora, pada alat dan media yang digunakan.', 3, 'Sangat Baik', 200000, '1765297335109-Autoklaf.png'),
(14, 'Qubit Fluorometer', 22, 'Alat kuantifikasi yang lebih spesifik daripada NanoDrop, menggunakan pewarnaan fluoresensi yang hanya berinteraksi dengan molekul target ($\\text{DNA}$ untai ganda atau protein) sehingga menghasilkan pengukuran konsentrasi dengan sensitivitas dan spes', 2, 'Sangat Baik', 300000, '1765297250042-Qubit.png'),
(15, 'HPLC', 23, 'Alat kromatografi canggih yang digunakan untuk memisahkan, mengidentifikasi, dan mengkuantifikasi setiap komponen dalam campuran cair kompleks. Prinsipnya adalah memisahkan analit berdasarkan interaksi yang berbeda dengan fase diam dan fase gerak.', 5, 'Sangat Baik', 1500000, '1765297161546-HPLC.png'),
(17, 'Scanning Electron Microscope', 23, 'Alat mikroskop elektron yang digunakan untuk memeriksa morfologi dan topografi permukaan material dengan resolusi tinggi (nanometer) dan memperlihatkan detail struktur permukaan yang tak bisa dilihat mikroskop biasa.', 5, 'Sangat Baik', 1400000, '1765300485454-Scan.png'),
(18, 'TEM', 23, 'Mikroskop elektron untuk melihat struktur internal (mikro/nanoskalanya) material, termasuk kristal, butiran, atau fase dalam material tipis', 3, 'Sangat Baik', 3000000, '1765300478029-TEM.png'),
(19, 'Gas Chromatograph', 23, 'Alat kromatografi canggih untuk memisahkan, mengidentifikasi, dan mengkuantifikasi komponen volatil atau kimia organik dalam campuran gas atau cair.', 6, 'Sangat Baik', 3500000, '1765300470186-Gas.png'),
(20, 'FTIR', 23, 'Spektrometer infra merah untuk mengidentifikasi struktur molekuler dan gugus fungsi kimia dalam sampel (padat, cair, gas).', 8, 'Sangat Baik', 800000, '1765300462155-FTIR.png'),
(21, 'UV–Vis Spectrophotometer', 23, 'Alat spektroskopi untuk mengukur penyerapan cahaya ultraviolet/visible oleh larutan, yang membantu kuantifikasi konsentrasi senyawa berdasarkan absorbansi.', 9, 'Sangat Baik', 300000, '1765300454605-UVS.png'),
(22, 'Universal Testing Machine', 23, 'Mesin uji material (tarik, tekan, lentur) untuk menguji sifat mekanik suatu bahan (kuat tarik, modul elastisitas, deformasi, kekuatan material).', 8, 'Sangat Baik', 750000, '1765300447539-UTM.png'),
(23, 'Differential Scanning Calorimeter', 23, 'Alat analisis termal untuk menentukan transisi termal material (misalnya titik leleh, glass transition, reaksi endoterm/eksoterm).', 2, 'Sangat Baik', 650000, '1765300438895-DSC.png'),
(24, 'Rheometer', 23, 'Alat untuk mengukur viskositas atau sifat aliran fluida/polimer/larutan (bagaimana material mengalir/berehologi di bawah gaya geser atau tekanan).', 8, 'Sangat Baik', 1000000, '1765300431109-Rheometer.png');

-- --------------------------------------------------------

--
-- Table structure for table `reminder`
--

CREATE TABLE `reminder` (
  `id` int(50) NOT NULL,
  `sent_at` datetime NOT NULL,
  `id_peminjaman` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `reminder`
--

INSERT INTO `reminder` (`id`, `sent_at`, `id_peminjaman`) VALUES
(6, '2026-06-12 18:11:48', 34);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `pp_image` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` datetime DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `ktp_image` varchar(255) DEFAULT NULL,
  `ktp_status` enum('unverified','pending','verified','rejected') DEFAULT 'unverified'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `pp_image`, `status`, `created_at`, `last_login`, `phone`, `address`, `ktp_image`, `ktp_status`) VALUES
(8, 'Bima', 'bima@gmail.com', '$2b$10$FmCL.PkghfWzndZ5.QUwI.Kvopfbo8V9XEDPvPSiOQWqucrz6KKy6', '/uploads/1781832767953-a7a3c193f8819c212fe2231f13e46732.jpg', 'inactive', '2025-11-20 15:52:39', '2025-11-20 23:02:33', NULL, NULL, NULL, 'unverified'),
(9, 'Fikri Ahmad', 'fikri@gmail.com', '$2b$10$UebE8MYFCGC9QApehlZaCeS2TOq5sLMZO6kdw9eKbj8xMtzS4xw8y', '/uploads/1781833445777-2f49dfa3f97e24eec56d24e9d704c43b.jpg', 'active', '2025-11-20 16:01:38', '2026-06-26 19:45:54', '+6281298765432', 'Bekasi Barat, Jl.Hobi-Hobi 38565', '/uploads/1781789161999-Bukti Solve.jpeg', 'verified'),
(10, 'Hanni Pham', 'hanni@gmail.com', '$2b$10$ISb9CGqUchgBigd50UkngOGzRxVN/B27lfOezVcnGA9GP05csbwfu', '/uploads/1782467017928-download (50).jpeg', 'active', '2025-12-01 12:24:04', '2026-06-26 18:08:38', '+821096743434', '380 Yeouidaebang-ro, Yeongdeungpo-gu, Seoul, 07342, South Korea', '/uploads/1780643635582-Gemini_Generated_Image_jdk60gjdk60gjdk6.png', 'verified'),
(11, 'Jung Ahyeon', 'ahyeon@gmail.com', '$2b$10$ARK4bGdrwKfyrveYqmaiAO0OKBaqTK/Fjk3TBe1t5Jfqui/ddfrOe', '/uploads/1782463694761-download (51).jpeg', 'active', '2025-12-12 00:12:39', '2026-06-26 15:48:04', '+821098765432', NULL, '/uploads/1780641830027-Gemini_Generated_Image_3t0tyg3t0tyg3t0t.png', 'rejected'),
(12, 'Ruru', 'ruru@gmail.com', '$2b$10$ibx4MmUjaPG208hSUDWo2e30RQtwUvGeTI76ZVwSGq/4JgIK0OS8G', '/uploads/1781848470546-2f49dfa3f97e24eec56d24e9d704c43b.jpg', 'active', '2026-06-19 01:13:43', '2026-06-19 13:13:02', '+3585522195', NULL, '/uploads/1781848504241-a7a3c193f8819c212fe2231f13e46732.jpg', 'pending'),
(13, 'Ohim', 'ohim@gmail.com', '$2b$10$dk033.zQ5cF/CPF.WeblLOqrwJCI0Oa270ETCU1pe5YO3Mmpx603i', '/uploads/1781880987287-raja Ohim.png', 'active', '2026-06-19 14:51:42', '2026-06-23 17:03:02', '+6283176549876', NULL, '/uploads/1781880740522-ohim.jpeg', 'verified');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `category`
--
ALTER TABLE `category`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `d_peminjaman`
--
ALTER TABLE `d_peminjaman`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_products` (`id_products`),
  ADD KEY `id_user` (`id_user`);

--
-- Indexes for table `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`id_payment`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `id_product` (`id_product`);

--
-- Indexes for table `peminjaman`
--
ALTER TABLE `peminjaman`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_products` (`id_products`),
  ADD KEY `id_user` (`id_user`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_category` (`id_category`);

--
-- Indexes for table `reminder`
--
ALTER TABLE `reminder`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_peminjaman` (`id_peminjaman`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `category`
--
ALTER TABLE `category`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `d_peminjaman`
--
ALTER TABLE `d_peminjaman`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=96;

--
-- AUTO_INCREMENT for table `payment`
--
ALTER TABLE `payment`
  MODIFY `id_payment` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `peminjaman`
--
ALTER TABLE `peminjaman`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `reminder`
--
ALTER TABLE `reminder`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `d_peminjaman`
--
ALTER TABLE `d_peminjaman`
  ADD CONSTRAINT `d_peminjaman_ibfk_1` FOREIGN KEY (`id_products`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `d_peminjaman_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);

--
-- Constraints for table `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `payment_ibfk_2` FOREIGN KEY (`id_product`) REFERENCES `products` (`id`);

--
-- Constraints for table `peminjaman`
--
ALTER TABLE `peminjaman`
  ADD CONSTRAINT `peminjaman_ibfk_2` FOREIGN KEY (`id_products`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `peminjaman_ibfk_3` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`id_category`) REFERENCES `category` (`id`);

--
-- Constraints for table `reminder`
--
ALTER TABLE `reminder`
  ADD CONSTRAINT `reminder_ibfk_1` FOREIGN KEY (`id_peminjaman`) REFERENCES `peminjaman` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
