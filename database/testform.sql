-- Create a fresh SQL file to set up the database from scratch

-- Drop existing database if it exists
DROP DATABASE IF EXISTS `testform`;

-- Create the database
CREATE DATABASE `testform`;
USE `testform`;

-- Create the roles table
CREATE TABLE IF NOT EXISTS `roles` (
  `roleID` INT AUTO_INCREMENT PRIMARY KEY,
  `roleName` VARCHAR(50) NOT NULL UNIQUE
);

-- Insert predefined roles into the roles table
INSERT INTO `roles` (`roleName`) VALUES ('admin'), ('supervisor'), ('student');

-- Create the user table
CREATE TABLE IF NOT EXISTS `user` (
  `userID` INT AUTO_INCREMENT PRIMARY KEY,
  `userName` VARCHAR(25) NOT NULL,
  `Password` VARCHAR(255) NOT NULL,
  `PhoneNumber` INT NOT NULL,
  `Email` VARCHAR(100) NOT NULL,
  `roleID` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `userName` (`userName`),
  CONSTRAINT `fk_role` FOREIGN KEY (`roleID`) REFERENCES `roles`(`roleID`)
);

-- Create the team table
CREATE TABLE IF NOT EXISTS `team` (
  `teamID` INT AUTO_INCREMENT PRIMARY KEY,
  `teamName` VARCHAR(100) NOT NULL UNIQUE,
  `member1` INT NOT NULL,
  `member2` INT DEFAULT NULL,
  `supervisorID` INT NOT NULL,
  `projectID` INT DEFAULT NULL,
  CONSTRAINT `fk_member1` FOREIGN KEY (`member1`) REFERENCES `user`(`userID`),
  CONSTRAINT `fk_member2` FOREIGN KEY (`member2`) REFERENCES `user`(`userID`),
  CONSTRAINT `fk_supervisor` FOREIGN KEY (`supervisorID`) REFERENCES `user`(`userID`),
  CONSTRAINT `fk_project` FOREIGN KEY (`projectID`) REFERENCES `project`(`projectID`)
);

-- Insert a default admin user
INSERT INTO `user` (`userName`, `Password`, `PhoneNumber`, `Email`, `roleID`) 
VALUES ('admin', '$2y$10$qg5N0konySSDfrCwS8/ruu38aO3by2hZ.goOerCkBJkwPTogDzWLu', 549709976, 'b6hocine@gmail.com', 1);