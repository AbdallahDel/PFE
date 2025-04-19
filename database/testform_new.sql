-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 19, 2025 at 07:14 PM
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
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

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
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`studentID`, `userID`, `last_name`, `first_name`, `email`, `speciality`, `education_level`, `matricule`, `phone_number`, `teamID`) VALUES
(1, 6, 'idk', 'hocine', 'hocine@gmail.com', 'SI', 'master', '111111', '0657713233', NULL);

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
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `supervisor`
--

INSERT INTO `supervisor` (`supervisorID`, `first_name`, `last_name`, `email`, `phone_number`, `userID`) VALUES
(1, 'barr', 'mohammed', 'barr_mohammed@gmail.com', '222222222', 5);

-- --------------------------------------------------------

--
-- Table structure for table `team`
--

DROP TABLE IF EXISTS `team`;
CREATE TABLE IF NOT EXISTS `team` (
  `teamID` int(11) NOT NULL AUTO_INCREMENT,
  `teamName` varchar(100) NOT NULL,
  `supervisorID` int(11) NOT NULL,
  `projectID` int(11) DEFAULT NULL,
  PRIMARY KEY (`teamID`),
  UNIQUE KEY `teamName` (`teamName`),
  KEY `fk_supervisor` (`supervisorID`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

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
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`userID`, `userName`, `Password`, `Role`) VALUES
(1, 'admin', '$2y$10$qg5N0konySSDfrCwS8/ruu38aO3by2hZ.goOerCkBJkwPTogDzWLu', 'admin'),
(2, 'superadmin', '$2y$10$AYbZfkixGkkMX.5t5Vl/3uQSRGR/paSEnnkHJ9Cj6QQWl09E883Ci', 'admin'),
(3, 'hocine', '$2y$10$YFzm50.hJ1hr.E09zy4Ef.clC8cMCf0MCfyfOKUULOk2B42TFm5sK', 'user'),
(4, 'supervisor', '$2y$10$bBDAMfpZkT85AQM8thmbOuRmZAtxA21iWXjgV/1JSFp/9kj3OZx4i', 'supervisor'),
(5, 'barr.mohammed', '$2y$10$oKPNBIABz46LAL62M7TIx.Z1PcCtIAXfAHIbKt0btlYk7YGte7W66', 'supervisor'),
(6, '111111', '$2y$10$i2NbeURJRr4egugXnnkN6uYL4xqgau4ea3WvZK34.DKdRh05odtXC', 'user');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
