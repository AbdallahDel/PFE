-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 20, 2025 at 01:22 PM
-- Server version: 11.5.2-MariaDB
-- PHP Version: 8.3.14

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
-- Table structure for table `project`
--

DROP TABLE IF EXISTS `project`;
CREATE TABLE IF NOT EXISTS `project` (
  `projectID` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `type` enum('internal','external') NOT NULL,
  `supervisorID` int(11) NOT NULL,
  PRIMARY KEY (`projectID`),
  KEY `fk_project_supervisor` (`supervisorID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

DROP TABLE IF EXISTS `student`;
CREATE TABLE IF NOT EXISTS `student` (
  `studentID` int(11) NOT NULL AUTO_INCREMENT,
  `userID` int(11) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `speciality` varchar(255) NOT NULL,
  `education_level` enum('licence','master') NOT NULL,
  `matricule` varchar(50) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `teamID` int(11) DEFAULT NULL,
  PRIMARY KEY (`studentID`),
  UNIQUE KEY `matricule` (`matricule`),
  KEY `fk_student_user` (`userID`),
  KEY `fk_student_team` (`teamID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`studentID`, `userID`, `last_name`, `first_name`, `email`, `speciality`, `education_level`, `matricule`, `phone_number`, `teamID`) VALUES
(2, 7, 'becis', 'hocine', 'b6hocine@gmail.com', 'ISIL', 'licence', '212131050574', '0657713233', 1),
(3, 8, 'delhoum', 'abdallah', 'b6hocine@gmail.com', 'ISIL', 'licence', '212131050575', '0657713233', 2);

-- --------------------------------------------------------

--
-- Table structure for table `supervisor`
--

DROP TABLE IF EXISTS `supervisor`;
CREATE TABLE IF NOT EXISTS `supervisor` (
  `supervisorID` int(11) NOT NULL AUTO_INCREMENT,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone_number` varchar(15) NOT NULL,
  `userID` int(11) NOT NULL,
  PRIMARY KEY (`supervisorID`),
  KEY `fk_supervisor_user` (`userID`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `team`
--

DROP TABLE IF EXISTS `team`;
CREATE TABLE IF NOT EXISTS `team` (
  `teamID` int(11) NOT NULL AUTO_INCREMENT,
  `teamName` varchar(100) NOT NULL,
  `supervisorID` int(11) DEFAULT NULL,
  `projectID` int(11) DEFAULT NULL,
  PRIMARY KEY (`teamID`),
  KEY `fk_team_supervisor` (`supervisorID`),
  KEY `fk_team_project` (`projectID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `team`
--

INSERT INTO `team` (`teamID`, `teamName`, `supervisorID`, `projectID`) VALUES
(1, 'hocine_team', NULL, NULL),
(2, 'abdallah_team', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `team_invites`
--

DROP TABLE IF EXISTS `team_invites`;
CREATE TABLE IF NOT EXISTS `team_invites` (
  `inviteID` int(11) NOT NULL AUTO_INCREMENT,
  `from_studentID` int(11) NOT NULL,
  `to_studentID` int(11) NOT NULL,
  `teamID` int(11) NOT NULL,
  `status` enum('pending','accepted','declined') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`inviteID`),
  KEY `fk_invite_from_student` (`from_studentID`),
  KEY `fk_invite_to_student` (`to_studentID`),
  KEY `fk_invite_team` (`teamID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `userID` int(11) NOT NULL AUTO_INCREMENT,
  `userName` varchar(25) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Role` enum('admin','user','supervisor') NOT NULL,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `userName` (`userName`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`userID`, `userName`, `Password`, `Role`) VALUES
(1, 'admin', '$2y$10$qg5N0konySSDfrCwS8/ruu38aO3by2hZ.goOerCkBJkwPTogDzWLu', 'admin'),
(7, '212131050574', '$2y$10$XNoGGkJaKBkVx1pagTEyY.VvJ6fo2wzgC/9y7DNf6Pcnfep4yS2A2', 'user'),
(8, '212131050575', '$2y$10$3meQBNdONhsmSYOdS8bqNeljBB9xYHUw51IGW03EeECtol7WCkcBy', 'user');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `project`
--
ALTER TABLE `project`
  ADD CONSTRAINT `fk_project_supervisor` FOREIGN KEY (`supervisorID`) REFERENCES `supervisor` (`supervisorID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `student`
--
ALTER TABLE `student`
  ADD CONSTRAINT `fk_student_team` FOREIGN KEY (`teamID`) REFERENCES `team` (`teamID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_student_user` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `supervisor`
--
ALTER TABLE `supervisor`
  ADD CONSTRAINT `fk_supervisor_user` FOREIGN KEY (`userID`) REFERENCES `user` (`userID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `team`
--
ALTER TABLE `team`
  ADD CONSTRAINT `fk_team_project` FOREIGN KEY (`projectID`) REFERENCES `project` (`projectID`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_team_supervisor` FOREIGN KEY (`supervisorID`) REFERENCES `supervisor` (`supervisorID`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `team_invites`
--
ALTER TABLE `team_invites`
  ADD CONSTRAINT `fk_invite_from_student` FOREIGN KEY (`from_studentID`) REFERENCES `student` (`studentID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_invite_team` FOREIGN KEY (`teamID`) REFERENCES `team` (`teamID`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_invite_to_student` FOREIGN KEY (`to_studentID`) REFERENCES `student` (`studentID`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
