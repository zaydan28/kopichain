-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 14, 2025 at 05:20 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 7.4.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_kopichain`
--

-- --------------------------------------------------------

--
-- Table structure for table `distribution_records`
--

CREATE TABLE `distribution_records` (
  `id` int(11) NOT NULL,
  `lot_id` varchar(50) NOT NULL,
  `distributor_name` varchar(255) NOT NULL,
  `date_received` date NOT NULL,
  `shipping_destination` varchar(255) NOT NULL,
  `tx_hash_distribution` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `distribution_records`
--

INSERT INTO `distribution_records` (`id`, `lot_id`, `distributor_name`, `date_received`, `shipping_destination`, `tx_hash_distribution`) VALUES
(3, 'GAYO-20250901-401', 'Dist 1', '2025-09-08', 'Puja Coffee', '0xeddbc6dc8ccbc15df92ac4a040293d51080eced5e2f95aefe90b65b254a0eac2'),
(4, 'GAYO-20250904-428', 'Dist 2', '2025-09-09', 'Wadja Coffee', '0x72f61a8bfccab22bcc5a48405ae68d93df56446afded4f9cccce809f348f5c83'),
(5, 'GAYO-20250807-100', 'Dist 3', '2025-09-10', 'Test Coffee', '0xc1d6b119f989d4f950d394dab06d22fde6231ea0c79ee5de77f25167844e1599'),
(6, 'GAYO-20250905-463', 'Juneadi Distributor', '2025-09-17', 'Bogor Coffee', '0x2caf6b375efc0a417bea2ae7ad67536a9d05ec43ec686ebc80e22e78bc57cce7'),
(7, 'GAYO-20251101-279', 'Kopi Kuroko', '2025-11-05', 'Konsumen', '0x1ac976270e251faf2321c1941012a8cfa3c33dca393c3d8261826f1d2fa1d721'),
(8, 'GAYO-20251112-949', 'PT Bahagia Terus', '2025-11-14', 'Wadja Coffee', '0x9c5ccf598ed385f884101500ebac63cca0c5abd41433fe37c2ef0aeed5fd153b'),
(9, 'GAYO-20250627-757', 'PT Indah', '2025-11-13', 'CaffeeKuu', '0x09fd9152b06cf1deca70108708299d22ea44e9597a5f49cb27ab6ec16506144f');

-- --------------------------------------------------------

--
-- Table structure for table `harvest_lots`
--

CREATE TABLE `harvest_lots` (
  `id` int(11) NOT NULL,
  `lot_id` varchar(50) NOT NULL,
  `farmer_name` varchar(255) NOT NULL,
  `harvest_location` varchar(255) NOT NULL,
  `harvest_date` date NOT NULL,
  `process_method` varchar(100) NOT NULL,
  `harvest_weight` int(11) NOT NULL,
  `tx_hash_harvest` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `harvest_lots`
--

INSERT INTO `harvest_lots` (`id`, `lot_id`, `farmer_name`, `harvest_location`, `harvest_date`, `process_method`, `harvest_weight`, `tx_hash_harvest`) VALUES
(5, 'GAYO-20250901-401', 'Petani 1', 'Takengon, Aceh Tengah', '2025-09-01', 'Natural', 68, '0x028b699aace8a8ed0df4ad59e8faa53365c7140c03715e6f9355509543f45ea2'),
(6, 'GAYO-20250904-428', 'Petani 2', 'Takengon, Aceh Tengah', '2025-09-04', 'Honey', 77, '0x07904b4efb562617eee3515bc0bc6e1127c250edf140e0f302f32f37517fdfdf'),
(7, 'GAYO-20250807-100', 'Petani 1', 'Takengon, Aceh Tengah', '2025-08-07', 'Natural', 100, '0x41b944b8ad3972eedacbd2e7ea750a027a408e1c3593c5426750c239f573a09e'),
(8, 'GAYO-20250905-463', 'Petani Junaedi', 'Takengon, Aceh Tengah', '2025-09-05', 'Natural', 500, '0x5d13fca53e8296496dcfefeb48f04f0ef6241d856b629bddb8b817115eef2796'),
(9, 'GAYO-20250912-456', 'Petani 1', 'Takengon, Aceh Tengah', '2025-09-12', 'Full Washed', 70, '0xf0c70bcf9d28ef2d7df4cc7839a73d24a7ab8c83f5c71f56b09a6968b0b78cad'),
(10, 'GAYO-20251101-279', 'Petani Test 1', 'Depok', '2025-11-01', 'Full Washed', 10, '0xe28128e5a4b5a2b207799e5ec32b36480ffb8275ba4545c92346b5d27a0d1589'),
(11, 'GAYO-20251112-949', 'Haekal M Zaydan', 'Depok', '2025-11-12', 'Full Washed', 99, '0x4874d7c035b80274df458347e300ae44149e5697c6989333149cfef2b9f4424c'),
(12, 'GAYO-20251114-445', 'Petani 1', 'Takengon, Aceh Tengah', '2025-11-14', 'Full Washed', 2, '0xd8d09c95191b03abde0bb5453f95ea97b09b904e8f09790a57fda5ea61163454'),
(13, 'GAYO-20251107-317', 'Rana Karatas', 'Pendik', '2025-11-07', 'Natural', 69, '0xfbf9e4ff3dc568dfc8b051a171f634ae2be347114cd1bf53dd2ee6a6eebb85f3'),
(14, 'GAYO-20251026-591', 'Gillang KP', 'Tangerang', '2025-10-26', 'Honey', 66, '0x7333dc727d84c799816f26808cd442b1ad7e3b48aec6e3d7aa6fb04c005addde'),
(15, 'GAYO-20250627-757', 'Sejati Kopi', 'Madura', '2025-06-27', 'Full Washed', 666, '0x117169f910e3e0a774f60cdeec92b0ad08da9589e981ecb3b5448457c02b7f11');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `name` varchar(99) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `name`) VALUES
(1, 'petani_gayo', '$2b$10$7miVb5iYcLGRqIDYB5tc2usAEI1AGXeBgyakHiiUXqbqixPxRy1Hq', 'petani', 'Sangkuriang'),
(2, 'distributor_nusantara', '$2b$10$zK6Je73cxTcDuHBDfFt9xe1bCxV9rk5asoCHXx9mGntxDawmoObiy', 'distributor', 'PT.Haji Makmur');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `distribution_records`
--
ALTER TABLE `distribution_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lot_id` (`lot_id`);

--
-- Indexes for table `harvest_lots`
--
ALTER TABLE `harvest_lots`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lot_id` (`lot_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `distribution_records`
--
ALTER TABLE `distribution_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `harvest_lots`
--
ALTER TABLE `harvest_lots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
