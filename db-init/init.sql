-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Oct 16, 2025 at 01:00 AM
-- Server version: 8.0.42
-- PHP Version: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `testform`
--

-- --------------------------------------------------------

--
-- Table structure for table `binomes`
--

CREATE TABLE `binomes` (
  `binome_id` int NOT NULL,
  `project_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `binomes`
--

INSERT INTO `binomes` (`binome_id`, `project_id`) VALUES
(2, NULL),
(4, NULL),
(5, 105);

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `project_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text,
  `binome_id` int DEFAULT NULL,
  `supervisor_id` int DEFAULT NULL,
  `Etat` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'proposed',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `file_path` varchar(255) DEFAULT NULL,
  `contenu` text,
  `mots_cles` varchar(255) DEFAULT NULL,
  `environnement` varchar(255) DEFAULT NULL,
  `niveau` varchar(10) NOT NULL,
  `type` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `projects`
--

INSERT INTO `projects` (`project_id`, `title`, `description`, `binome_id`, `supervisor_id`, `Etat`, `created_at`, `updated_at`, `file_path`, `contenu`, `mots_cles`, `environnement`, `niveau`, `type`) VALUES
(95, 'theme intern 3', 'gg', NULL, 52, 'approved', '2025-05-25 00:04:05', '2025-05-25 00:04:08', '../Back-end/uploads/subjects/sujet_68325e7500242.pdf', NULL, NULL, NULL, 'licence', 'intern'),
(96, 'theme intern 4', 'gg', NULL, 51, 'approved', '2025-05-25 00:04:36', '2025-05-25 00:04:38', '../Back-end/uploads/subjects/sujet_68325e94d7514.pdf', NULL, NULL, NULL, 'licence', 'intern'),
(97, 'theme intern 5', 'ggg', NULL, 52, 'rejected', '2025-05-25 13:15:59', '2025-05-25 14:45:59', '../Back-end/uploads/subjects/sujet_6833180fd5c62.pdf', NULL, NULL, NULL, 'licence', 'intern'),
(104, 'gestion des pfe', 'ggg', NULL, 50, 'approved', '2025-05-25 14:50:50', '2025-05-25 14:50:53', '../Back-end/uploads/subjects/sujet_68332e4a52170.pdf', NULL, NULL, NULL, 'licence', 'intern'),
(105, 'gg', 'gg', NULL, 51, 'approved', '2025-05-25 14:54:45', '2025-05-25 14:55:33', 'uploads/extern_projects/68332f35a5e71_extern_PFE (1).pdf', 'gg', 'gg', 'gg', 'Débutant', 'extern'),
(106, 'gg', 'gg', NULL, 52, 'assigned', '2025-06-14 15:38:58', '2025-06-14 15:38:58', NULL, NULL, NULL, NULL, 'licence', 'intern');

-- --------------------------------------------------------

--
-- Table structure for table `project_choices`
--

CREATE TABLE `project_choices` (
  `id` int NOT NULL,
  `binome_id` int NOT NULL,
  `project_id` int NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'en attente',
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `confirmed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `project_choices`
--

INSERT INTO `project_choices` (`id`, `binome_id`, `project_id`, `status`, `submitted_at`, `confirmed_at`) VALUES
(70, 5, 105, 'validated', '2025-05-25 14:54:45', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `studentID` int NOT NULL,
  `userID` int DEFAULT NULL,
  `nom` varchar(100) DEFAULT NULL,
  `prenom` varchar(100) DEFAULT NULL,
  `matricule` varchar(50) DEFAULT NULL,
  `binome_id` int DEFAULT NULL,
  `level` enum('licence','master') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`studentID`, `userID`, `nom`, `prenom`, `matricule`, `binome_id`, `level`) VALUES
(174, 425, 'abdallah', 'delhoum', '1111', 5, 'licence'),
(175, 426, 'besis', 'houcine', '2222', 5, 'licence'),
(176, 427, 'anis', 'chbab', '3333', 2, 'licence'),
(177, 428, 'alhaq', 'diaa', '4444', 2, 'licence'),
(178, 430, 'bb', 'bb', '777', NULL, 'licence'),
(179, 431, 'cc', 'cc', '888', NULL, 'licence'),
(180, 432, 'shikor', 'shikor', '8888', NULL, 'licence');

-- --------------------------------------------------------

--
-- Table structure for table `supervisors`
--

CREATE TABLE `supervisors` (
  `supervisor_id` int NOT NULL,
  `userID` int NOT NULL,
  `nom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `prenom` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Grade` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `supervisors`
--

INSERT INTO `supervisors` (`supervisor_id`, `userID`, `nom`, `prenom`, `Grade`) VALUES
(50, 409, 'abdallah', 'delhoum', 'assistant a'),
(51, 410, 'besis', 'houcine', 'asistant b'),
(52, 411, 'anis', 'chbab', 'prof de cour'),
(53, 412, 'alhaq', 'diaa', 'prof de td');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `userID` int NOT NULL,
  `userName` varchar(25) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `PhoneNumber` int DEFAULT NULL,
  `Email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `Role` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`userID`, `userName`, `Password`, `PhoneNumber`, `Email`, `Role`) VALUES
(177, 'admin', '$2y$10$lCPdNKlaXONEDcUqvJj1bezP7GcKDExSGvq1R8QkHgfl/sxfUJLbi', 5, '', 'admin'),
(409, 'abdallah@gmil.com', '$2y$10$G/X6Ynl2BipvH30/jMuSq.OYvv2X3o57LkGYgpmsoUYcWvlL/7Zfa', 0, '', 'supervisor'),
(410, 'abdalla@gmil.com', '$2y$10$mK8RnC2lz1mClLwG.OiIEOnwKTqSpEJgwKodSAqL6Tgy/R0FAK5hm', 0, '', 'supervisor'),
(411, 'abdall@gmil.com', '$2y$10$c/BGSuIYURFIdV0pk1WWm.TAMO/5IXkBmcPuiALk9QYIpjUv2cQnC', 0, '', 'supervisor'),
(412, 'abdal@gmil.com', '$2y$10$XXllC8YNFgjbMLhQ3mh9SetYc8r3OWxAAiTUd1SXxxlRwX13iJPaa', 0, '', 'supervisor'),
(425, '1111', '$2y$10$xG1cNEdvGZ4JjzJLrDS8wuWyV/0XEFPljf799DArKePkvTsFiBZm2', 0, '', 'student'),
(426, '2222', '$2y$10$sNeliTk9ieQB2fIZt6xEeOYL/B1vvEOG9dADtiOvTkE3jdozC0NEa', 0, '', 'student'),
(427, '3333', '$2y$10$sr1vZWl1MVDXccxgkc5ipOsKxGJR5S0WhqRsdYWGWz/jpvI4o8NRa', 0, '', 'student'),
(428, '4444', '$2y$10$j27qcbOCVQZUVWXbihh0/.4dQZw6RtPs0iHjm5/V4cDxaoN1aVJeu', 0, '', 'student'),
(429, 'aa', '$2y$10$HAkhj5fciGQ78xFLHZKLm.Qti6bokU1rxqHVcEEQCfHgVUGUEwkf.', NULL, NULL, 'admin'),
(430, '777', '$2y$10$MvAqRl5lgG8DD8jbJsytBOtM/.KToC4kwDn23qugfoi7ndvUnrBPm', NULL, NULL, 'student'),
(431, '888', '$2y$10$nzcVtA.4YmTtcwbNSWJusOSiqtYJQUcudmSFP4PH7zmCEX9mzJPxu', NULL, NULL, 'student'),
(432, '8888', '$2y$10$ouG.F62yRgIZTevHhpBGOuSlXN5dvK75o7hGs1dFemIaN/5UQgGS.', NULL, NULL, 'student'),
(433, 'test', '$2y$10$G2hODiudm6eaAt1HRwZ6yObtkWsBYT.cdPbSLo2So.c.hTdhu1vza', NULL, NULL, 'admin');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `binomes`
--
ALTER TABLE `binomes`
  ADD PRIMARY KEY (`binome_id`),
  ADD KEY `project_id` (`project_id`) USING BTREE;

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`project_id`),
  ADD KEY `binome_id` (`binome_id`),
  ADD KEY `supervisor_id` (`supervisor_id`);

--
-- Indexes for table `project_choices`
--
ALTER TABLE `project_choices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_binome` (`binome_id`),
  ADD KEY `fk_project` (`project_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`studentID`),
  ADD UNIQUE KEY `matricule` (`matricule`),
  ADD KEY `binome_id` (`binome_id`),
  ADD KEY `userID` (`userID`);

--
-- Indexes for table `supervisors`
--
ALTER TABLE `supervisors`
  ADD PRIMARY KEY (`supervisor_id`),
  ADD UNIQUE KEY `userID` (`userID`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`userID`),
  ADD UNIQUE KEY `userName` (`userName`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `binomes`
--
ALTER TABLE `binomes`
  MODIFY `binome_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `projects`
--
ALTER TABLE `projects`
  MODIFY `project_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `project_choices`
--
ALTER TABLE `project_choices`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=71;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `studentID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=181;

--
-- AUTO_INCREMENT for table `supervisors`
--
ALTER TABLE `supervisors`
  MODIFY `supervisor_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `userID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=434;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `binomes`
--
ALTER TABLE `binomes`
  ADD CONSTRAINT `fk_binome_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`binome_id`) REFERENCES `binomes` (`binome_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `projects_ibfk_2` FOREIGN KEY (`supervisor_id`) REFERENCES `supervisors` (`supervisor_id`) ON DELETE SET NULL;

--
-- Constraints for table `project_choices`
--
ALTER TABLE `project_choices`
  ADD CONSTRAINT `fk_binome` FOREIGN KEY (`binome_id`) REFERENCES `binomes` (`binome_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`binome_id`) REFERENCES `binomes` (`binome_id`),
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`);

--
-- Constraints for table `supervisors`
--
ALTER TABLE `supervisors`
  ADD CONSTRAINT `supervisors_ibfk_1` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
