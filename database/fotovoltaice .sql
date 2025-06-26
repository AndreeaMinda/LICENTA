-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gazdă: 127.0.0.1:3306
-- Timp de generare: iun. 26, 2025 la 04:18 PM
-- Versiune server: 9.1.0
-- Versiune PHP: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Bază de date: `fotovoltaice`
--

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `clients`
--

DROP TABLE IF EXISTS `clients`;
CREATE TABLE IF NOT EXISTS `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `type` enum('fizica','juridica') COLLATE utf8mb4_unicode_ci DEFAULT 'fizica',
  `judet` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `localitate` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Eliminarea datelor din tabel `clients`
--

INSERT INTO `clients` (`id`, `name`, `email`, `phone`, `type`, `judet`, `localitate`) VALUES
(1, 'Popescu Ion', 'ion@example.com', '0712345678', 'fizica', 'Timis', 'Timisoara'),
(2, 'Minda ANdreea', 'andrea_minda@yahoo.com', '0767323274', 'fizica', 'Timis', 'Timisoara'),
(13, 'Ferenczi Cristi', 'c.ferenczi@solanum.ro', '0766474844', 'fizica', 'Timis', 'Timisoara'),
(4, 'SC EcoSun SRL', 'contact@ecosun.ro', '0356456789', 'juridica', 'Arad', 'Arad'),
(5, 'Ionescu Maria', 'maria.ionescu@yahoo.com', '0744556677', 'fizica', 'Cluj', 'Cluj-Napoca'),
(6, 'GreenVolt Solutions SRL', 'office@greenvolt.ro', '0213456789', 'juridica', 'Ilfov', 'Buftea'),
(7, 'Andrei Vlad', 'vlad.andrei@gmail.com', '0755112233', 'fizica', 'Brasov', 'Brasov'),
(8, 'SolarExpert SRL', 'info@solarexpert.ro', '0314455667', 'juridica', 'Bucuresti', 'Bucuresti'),
(9, 'Georgescu Elena', 'elena.g@gmail.com', '0766123123', 'fizica', 'Iasi', 'Iasi'),
(10, 'SC LumiSolar SRL', 'admin@lumisolar.ro', '0374123123', 'juridica', 'Constanta', 'Constanta'),
(11, 'Dumitrescu Radu', 'radu.dumitrescu@gmail.com', '0733445566', 'fizica', 'Dolj', 'Craiova'),
(12, 'ElectroSun SRL', 'contact@electrosun.ro', '0344112233', 'juridica', 'Sibiu', 'Sibiu');

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `devize`
--

DROP TABLE IF EXISTS `devize`;
CREATE TABLE IF NOT EXISTS `devize` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Eliminarea datelor din tabel `devize`
--

INSERT INTO `devize` (`id`, `project_id`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9);

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `deviz_items`
--

DROP TABLE IF EXISTS `deviz_items`;
CREATE TABLE IF NOT EXISTS `deviz_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `material_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `material_id` (`material_id`)
) ENGINE=MyISAM AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Eliminarea datelor din tabel `deviz_items`
--

INSERT INTO `deviz_items` (`id`, `project_id`, `material_id`, `quantity`, `unit_price`) VALUES
(35, 1, 69, 2, 3450.00),
(34, 1, 48, 16, 1175.00),
(33, 1, 49, 3, 6100.00),
(32, 1, 81, 1, 775.45),
(5, 2, 70, 1, 4600.00),
(6, 2, 67, 1, 4300.00),
(7, 2, 48, 40, 1175.00),
(8, 2, 75, 2, 7800.00),
(9, 2, 82, 1, 904.40),
(10, 3, 63, 3, 4850.00),
(11, 3, 86, 100, 790.89),
(12, 3, 71, 2, 3100.00),
(13, 4, 70, 5, 4600.00),
(14, 4, 91, 87, 578.33),
(15, 4, 75, 24, 7800.00),
(16, 4, 83, 3, 1069.00),
(17, 5, 70, 1, 4600.00),
(18, 5, 67, 1, 4300.00),
(19, 5, 95, 66, 422.22),
(20, 5, 75, 4, 7800.00),
(21, 6, 63, 10, 4850.00),
(22, 6, 90, 250, 512.56),
(23, 6, 77, 5, 4900.00),
(24, 7, 62, 1, 3950.00),
(25, 7, 87, 50, 907.07),
(26, 7, 74, 1, 9800.00),
(27, 7, 56, 300, 7.90),
(36, 8, 62, 1, 3950.00),
(37, 8, 85, 1, 639.49),
(38, 8, 71, 1, 3100.00),
(48, 9, 55, 150, 7.90),
(47, 9, 84, 2, 1202.95),
(46, 9, 77, 5, 4900.00),
(45, 9, 48, 250, 1175.00),
(44, 9, 63, 100, 4850.00);

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `materials`
--

DROP TABLE IF EXISTS `materials`;
CREATE TABLE IF NOT EXISTS `materials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `type` varchar(50) DEFAULT NULL,
  `unit` varchar(20) DEFAULT NULL,
  `supplier` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Eliminarea datelor din tabel `materials`
--

INSERT INTO `materials` (`id`, `name`, `type`, `unit`, `supplier`, `price`) VALUES
(45, 'Invertor Huawei SUN2000-6KTL-L1', 'invertor', 'buc', 'Huawei', 3200.00),
(46, 'Invertor Growatt MOD 6000TL3-X', 'invertor', 'buc', 'Growatt', 2950.00),
(47, 'Panou Trina Solar 450W', 'panou', 'buc', 'Trina Solar', 1150.00),
(48, 'Panou Canadian Solar 455W', 'panou', 'buc', 'Canadian Solar', 1175.00),
(49, 'Baterie Huawei Luna2000 5kWh', 'baterie', 'buc', 'Huawei', 6100.00),
(50, 'Baterie LG Chem RESU10H', 'baterie', 'buc', 'LG Chem', 9800.00),
(51, 'Smart Meter trifazat Huawei DTSU666-H', 'smart_meter', 'buc', 'Huawei', 450.00),
(52, 'Tablou AC/DC complet echipat', 'tablou', 'buc', 'Schneider', 720.00),
(53, 'Structura aluminiu acoperis tigla10 panouri', 'structura', 'set', 'K2 Systems', 850.00),
(54, 'Structura trapezoidala panouri', 'structura', 'set', 'K2 Systems', 780.00),
(55, 'Cablu solar 6mm rosu', 'cablu', 'm', 'Lapp Kabel', 7.90),
(56, 'Cablu solar 6mm negru', 'cablu', 'm', 'Lapp Kabel', 7.90),
(57, 'Conductor cupru 16mm pentru G/V', 'impamantare', 'm', 'ELBA', 14.50),
(58, 'Cablu 3x6mm pentru AC', 'cablu', 'm', 'Prysmian', 10.80),
(59, 'Conectori MC4 set', 'accesoriu', 'set', 'Stäubli', 18.00),
(60, 'Sina aluminiu 40x40 4m', 'accesoriu', 'buc', 'K2 Systems', 68.00),
(61, 'Invertor Deye SUN-6K-SG03LP1-EU', 'invertor', 'buc', 'Deye', 3550.00),
(62, 'Invertor Deye SUN-8K-SG03LP1-EU', 'invertor', 'buc', 'Deye', 3950.00),
(63, 'Invertor Deye SUN-10K-SG04LP3-EU', 'invertor', 'buc', 'Deye', 4850.00),
(79, 'Tablou 18 module 1 string', 'tablou', 'buc', 'Generat', 489.10),
(65, 'Invertor Growatt MOD 8000TL3-X', 'invertor', 'buc', 'Growatt', 3650.00),
(66, 'Invertor Growatt MID 10KTL3-X', 'invertor', 'buc', 'Growatt', 4050.00),
(67, 'Invertor Huawei SUN2000-5KTL-L1', 'invertor', 'buc', 'Huawei', 4300.00),
(68, 'Invertor Huawei SUN2000-10KTL-M1', 'invertor', 'buc', 'Huawei', 5200.00),
(69, 'Invertor Sungrow SG5.0RS', 'invertor', 'buc', 'Sungrow', 3450.00),
(70, 'Invertor Sungrow SG10RT', 'invertor', 'buc', 'Sungrow', 4600.00),
(71, 'Baterie Growatt ARK 2.5H-A1', 'baterie', 'buc', 'Growatt', 3100.00),
(72, 'Baterie Growatt ARK 10.2H-A1', 'baterie', 'buc', 'Growatt', 11600.00),
(73, 'Baterie Huawei Luna2000-5-S0', 'baterie', 'buc', 'Luna', 4950.00),
(74, 'Baterie Huawei Luna2000-10-S0', 'baterie', 'buc', 'Luna', 9800.00),
(75, 'Baterie Sungrow SBR096', 'baterie', 'buc', 'Sungrow', 7800.00),
(76, 'Baterie Sungrow SBR128', 'baterie', 'buc', 'Sungrow', 10200.00),
(77, 'Baterie Felicity 48V 100Ah LiFePO4', 'baterie', 'buc', 'Felicity', 4900.00),
(78, 'Baterie Felicity 48V 200Ah LiFePO4', 'baterie', 'buc', 'Felicity', 8400.00),
(80, 'Tablou 18 module 2 string', 'tablou', 'buc', 'Generat', 603.05),
(81, 'Tablou 24 module 3 string', 'tablou', 'buc', 'Generat', 775.45),
(82, 'Tablou 24 module 4 string', 'tablou', 'buc', 'Generat', 904.40),
(83, 'Tablou 36 module 5 string', 'tablou', 'buc', 'Generat', 1069.00),
(84, 'Tablou 36 module 6 string', 'tablou', 'buc', 'Generat', 1202.95),
(85, 'Panouri fotovoltaice Canadian solar 405W', 'panou', 'buc', 'Canadian Solar', 639.49),
(86, 'Panouri fotovoltaice Canadian solar 410W', 'panou', 'buc', 'Canadian Solar', 790.89),
(87, 'Panouri fotovoltaice JA Solar 550W', 'panou', 'buc', 'JA Solar', 907.07),
(88, 'PANOURI FOTOVOLTAICE LONGI 410W-HIMO 6 EXPLORER', 'panou', 'buc', 'LONGI', 460.00),
(89, 'Panouri fotovoltaice LONGI 410W-ALL BLACK', 'panou', 'buc', 'LONGI', 653.71),
(90, 'Panouri fotovoltaice TRINA VERTEX 425W BLACK FRAM', 'panou', 'buc', 'Trina', 512.56),
(91, 'Panouri fotovoltaice JINKO 565W-TIGER NEO N-TYPE', 'panou', 'buc', 'Jinko', 578.33),
(92, 'Panouri LONGI LRS-72HTH -575W', 'panou', 'buc', 'LONGI', 520.00),
(93, 'Panouri fotovoltaice Longi 435w LRS-54-HTH', 'panou', 'buc', 'LONGI', 460.00),
(94, 'Panouri fotovoltaice Longi 430w LRS-54-HTH', 'panou', 'buc', 'LONGI', 460.00),
(95, 'Panouri fotovoltaice Jinko NEO N-TYPE 425w', 'panou', 'buc', 'Jinko', 422.22),
(96, 'Panouri fotovoltaice Longi 420w', 'panou', 'buc', 'LONGI', 460.00);

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `offers`
--

DROP TABLE IF EXISTS `offers`;
CREATE TABLE IF NOT EXISTS `offers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `deviz_id` int DEFAULT NULL,
  `status` enum('in_asteptare','acceptata','in_curs','finalizata','respinsa') DEFAULT 'in_asteptare',
  `nr_oferta` varchar(10) DEFAULT NULL,
  `data` date DEFAULT NULL,
  `obiectiv` text,
  `structura` text,
  `ofertant` varchar(100) DEFAULT NULL,
  `email_sent` tinyint(1) DEFAULT '0',
  `total` decimal(10,2) DEFAULT NULL,
  `project_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `deviz_id` (`deviz_id`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Eliminarea datelor din tabel `offers`
--

INSERT INTO `offers` (`id`, `deviz_id`, `status`, `nr_oferta`, `data`, `obiectiv`, `structura`, `ofertant`, `email_sent`, `total`, `project_id`) VALUES
(1, 1, 'in_asteptare', 'OF-1', '2025-06-22', 'Sistem fotovoltaic complet', '', '', 0, NULL, 1),
(2, 2, 'in_asteptare', 'OF-2', '2025-06-22', 'Sistem fotovoltaic complet', '', '', 0, NULL, 2),
(3, 3, 'in_asteptare', 'OF-3', '2025-06-22', 'Sistem fotovoltaic complet', '', '', 0, NULL, 3),
(4, 4, 'acceptata', 'OF-4', '2025-06-22', 'Sistem fotovoltaic complet', 'Structura la sol _ SUD', 'Minda Andreea', 0, NULL, 4),
(5, 5, 'acceptata', 'OF-5', '2025-06-22', 'Sistem fotovoltaic complet', 'Structura pe acoperis tip terasa', 'Minda Andreea', 0, NULL, 5),
(6, 6, 'in_curs', 'OF-6', '2025-06-22', 'Sistem fotovoltaic complet', 'Structura la sol - SUD', 'Minda Andreea', 0, NULL, 6),
(7, 7, 'finalizata', 'OF-7', '2025-06-22', 'Sistem fotovoltaic complet', 'Structura pe acoperis de tabla', 'Mindsa Andreea', 0, NULL, 7),
(8, 8, 'acceptata', 'OF-9', '2025-06-24', 'Sistem fotovoltaic complet', '', 'Minda ANdreea', 0, 8691.54, 8),
(9, 9, 'finalizata', 'OF-11', '2025-06-26', 'Sistem fotovoltaic complet 100 kw ', 'Structura la sol - sud', 'Minda Andreea', 0, 411571.58, 9);

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `programari`
--

DROP TABLE IF EXISTS `programari`;
CREATE TABLE IF NOT EXISTS `programari` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `data_programare` date NOT NULL,
  `status` enum('programata','in curs','finalizata') DEFAULT 'programata',
  `observatii` text,
  `durata_zile` int DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`)
) ENGINE=MyISAM AUTO_INCREMENT=117 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Eliminarea datelor din tabel `programari`
--

INSERT INTO `programari` (`id`, `project_id`, `data_programare`, `status`, `observatii`, `durata_zile`) VALUES
(116, 9, '2025-07-11', 'finalizata', NULL, 4),
(115, 9, '2025-07-10', 'finalizata', NULL, 4),
(114, 9, '2025-07-08', 'finalizata', NULL, 4),
(113, 9, '2025-07-07', 'finalizata', NULL, 4),
(112, 8, '2025-07-03', 'programata', NULL, 2),
(111, 8, '2025-07-02', 'programata', NULL, 2),
(110, 4, '2025-07-01', 'programata', NULL, 1),
(108, 5, '2025-06-27', 'programata', NULL, 2),
(109, 5, '2025-06-30', 'programata', NULL, 2),
(107, 6, '2025-06-26', '', NULL, 1),
(105, 7, '2025-06-24', 'finalizata', NULL, 2),
(106, 7, '2025-06-25', 'finalizata', NULL, 2);

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `projects`
--

DROP TABLE IF EXISTS `projects`;
CREATE TABLE IF NOT EXISTS `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `status` enum('nou','in_derulare','finalizat') DEFAULT 'nou',
  `total` decimal(10,2) DEFAULT NULL,
  `tva` decimal(10,2) DEFAULT NULL,
  `total_cu_tva` decimal(10,2) DEFAULT NULL,
  `tva_rate` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Eliminarea datelor din tabel `projects`
--

INSERT INTO `projects` (`id`, `client_id`, `name`, `start_date`, `status`, `total`, `tva`, `total_cu_tva`, `tva_rate`) VALUES
(1, 2, 'Instalare 10 kw Sungrow', '2025-06-24', 'nou', 44775.45, 5859.79, 50635.24, '9%'),
(2, 1, 'Instalare sitem Sungrow 15 kw', '2025-06-22', 'nou', 75804.40, 8382.40, 84186.80, '9%'),
(3, 7, 'Instalare sistem 30 kw', '2025-06-22', 'nou', 105839.00, 10145.51, 115984.51, '9%'),
(4, 6, 'Instalare 50 kw sol', '2025-06-22', 'nou', 275721.71, 52387.12, 328108.83, '9%'),
(5, 11, 'Instalare 15 kw Sungrow', '2025-06-22', 'nou', 68366.52, 9272.99, 77639.51, '9%'),
(6, 8, 'Instalare 100 kw Deye', '2025-06-22', 'nou', 216140.00, 41066.60, 257206.60, '9%'),
(7, 10, 'Instalare 25 kw Growatt', '2025-06-22', 'nou', 67973.50, 12914.97, 80888.47, '9%'),
(8, 7, 'Isyds', '2025-06-24', 'nou', 7689.49, 1002.05, 8691.54, '9%'),
(9, 13, 'Instalare 100 kw Deye cu baterii', '2025-06-26', 'nou', 806840.90, 75065.68, 881906.58, '9%');

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','utilizator','ofertant') DEFAULT 'utilizator',
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Eliminarea datelor din tabel `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `role`, `reset_token`, `reset_expires`) VALUES
(1, 'voltplan.adm@gmail.com', '$2b$10$3d3x7RiTKSeOhLH3UJaQiuyWWvFj5OWCnbRImP.jTnlwESEBe3Veq', 'admin', '4ea35ae39929b5f3a0dd611a7c25ba270a342d0dfdae4e8e46141da3e6cd0854', '2025-06-26 02:22:23'),
(2, 'ofertant@example.com', '$2b$10$4j5yjyyQmvzCrFzoS6i16uBbPrGuh7E0F4QILQFIm3vAEGgR.sl3O', 'ofertant', NULL, NULL),
(3, 'user@example.com', '$2b$10$gY7BLvuFYjSQgyjrXdmNnuGxJ1ed3rWjXI1d.nfudKwKSUUJf3Sga', 'utilizator', NULL, NULL),
(4, 'test@voltplan.ro', '$2b$10$YB60RALzv5z7j4.01FtT2O9UHTMOFy7JZp..WDMPRJdlRhAWP9EN2', 'admin', NULL, NULL);

-- --------------------------------------------------------

--
-- Structură tabel pentru tabel `zile_blocate`
--

DROP TABLE IF EXISTS `zile_blocate`;
CREATE TABLE IF NOT EXISTS `zile_blocate` (
  `id` int NOT NULL AUTO_INCREMENT,
  `data` date NOT NULL,
  `motiv` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Eliminarea datelor din tabel `zile_blocate`
--

INSERT INTO `zile_blocate` (`id`, `data`, `motiv`) VALUES
(4, '2025-07-09', NULL),
(5, '2025-06-28', NULL);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
