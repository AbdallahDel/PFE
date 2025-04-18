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

-- Create the category table
CREATE TABLE IF NOT EXISTS `category` (
  `categoryID` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL UNIQUE
);

-- Insert predefined categories into the category table
INSERT INTO `category` (`name`) VALUES
('Génie Logiciel'),
('Système d’Information et Base de Données'),
('Réseaux, Sécurité Réseaux, Réseaux Mobiles'),
('Système d’Exploitation'),
('Développement Web et Mobile'),
('Architecture des Systèmes'),
('Vision et Imagerie'),
('Intelligence Artificielle'),
('Informatique Théorique');

-- Create the host organization table
CREATE TABLE IF NOT EXISTS `host_organization` (
  `hostOrganizationID` INT AUTO_INCREMENT PRIMARY KEY,
  `legal_name` VARCHAR(255) NOT NULL,
  `address` TEXT NOT NULL,
  `department` VARCHAR(255) NOT NULL
);

-- Create the external supervisors table
CREATE TABLE IF NOT EXISTS `external_supervisors` (
  `supervisorID` INT AUTO_INCREMENT PRIMARY KEY,
  `last_name` VARCHAR(255) NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `occupation` VARCHAR(255) NOT NULL,
  `rank` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL
);

-- Create the project table
CREATE TABLE IF NOT EXISTS `project` (
  `projectID` INT AUTO_INCREMENT PRIMARY KEY,
  `type` ENUM('internal', 'external') NOT NULL,
  `categoryID` INT NOT NULL,
  `speciality` ENUM('SI', 'ISIL') NOT NULL,
  `hostOrganizationID` INT DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `goals` TEXT,
  `challenges` TEXT,
  `keywords` TEXT,
  `teamID` INT DEFAULT NULL,
  `state` TINYINT NOT NULL DEFAULT 0 COMMENT '0: initialized, 1: submitted, 2: approved by admin, -1: rejected',
  `rejection_reason` TEXT DEFAULT NULL COMMENT 'Reason for rejection, if state is -1',
  `education_level` ENUM('licence', 'master') NOT NULL COMMENT 'Education level of the project',
  `internship_period` INT NOT NULL COMMENT 'Internship period in days',
  `start_date` DATE NOT NULL COMMENT 'Start date of the project',
  CONSTRAINT `fk_category` FOREIGN KEY (`categoryID`) REFERENCES `category`(`categoryID`),
  CONSTRAINT `fk_hostOrganization` FOREIGN KEY (`hostOrganizationID`) REFERENCES `host_organization`(`hostOrganizationID`),
  CONSTRAINT `fk_team` FOREIGN KEY (`teamID`) REFERENCES `team`(`teamID`)
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
  CONSTRAINT `fk_project` FOREIGN KEY (`projectID`) REFERENCES `project`(`projectID`),
  CONSTRAINT `unique_project` UNIQUE (`projectID`)
);

-- Create the Q/A table
CREATE TABLE IF NOT EXISTS `qa` (
  `qaID` INT AUTO_INCREMENT PRIMARY KEY,
  `question` TEXT NOT NULL,
  `answer` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the conversations table
CREATE TABLE IF NOT EXISTS `conversations` (
  `conversationID` INT AUTO_INCREMENT PRIMARY KEY,
  `participant1ID` INT NOT NULL,
  `participant2ID` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_participant1` FOREIGN KEY (`participant1ID`) REFERENCES `user`(`userID`),
  CONSTRAINT `fk_participant2` FOREIGN KEY (`participant2ID`) REFERENCES `user`(`userID`)
);

-- Create the messages table
CREATE TABLE IF NOT EXISTS `messages` (
  `messageID` INT AUTO_INCREMENT PRIMARY KEY,
  `conversationID` INT NOT NULL,
  `senderID` INT NOT NULL,
  `content` TEXT NOT NULL,
  `sent_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_conversation` FOREIGN KEY (`conversationID`) REFERENCES `conversations`(`conversationID`),
  CONSTRAINT `fk_sender` FOREIGN KEY (`senderID`) REFERENCES `user`(`userID`)
);

-- Create the supervisor applications table
CREATE TABLE IF NOT EXISTS `supervisor_applications` (
  `applicationID` INT AUTO_INCREMENT PRIMARY KEY,
  `teamID` INT NOT NULL,
  `supervisorID` INT NOT NULL,
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_application_team` FOREIGN KEY (`teamID`) REFERENCES `team`(`teamID`),
  CONSTRAINT `fk_application_supervisor` FOREIGN KEY (`supervisorID`) REFERENCES `user`(`userID`)
);

-- Add a trigger to enforce project assignment rules
DELIMITER //
CREATE TRIGGER `before_project_assignment`
BEFORE UPDATE ON `team`
FOR EACH ROW
BEGIN
  IF NEW.projectID IS NOT NULL THEN
    -- Use a local variable to store the project type
    SET @projectType = (SELECT `type` FROM `project` WHERE `projectID` = NEW.projectID);
    IF @projectType = 'external' THEN
      -- Use a local variable to check if the project is already assigned
      SET @assignedTeam = (SELECT `teamID` FROM `project` WHERE `projectID` = NEW.projectID);
      IF @assignedTeam IS NOT NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'External projects can only be linked to one team.';
      END IF;
    END IF;
  END IF;
END //
DELIMITER ;

-- Insert a default admin user
INSERT INTO `user` (`userName`, `Password`, `PhoneNumber`, `Email`, `roleID`) 
VALUES ('admin', '$2y$10$qg5N0konySSDfrCwS8/ruu38aO3by2hZ.goOerCkBJkwPTogDzWLu', 549709976, 'b6hocine@gmail.com', 1);