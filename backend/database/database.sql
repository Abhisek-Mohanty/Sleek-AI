 CREATE TABLE `enquiries` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Enquiry',
  `enquiryNumber` varchar(20) DEFAULT NULL,
  `firstName` varchar(25) DEFAULT NULL,
  `lastName` varchar(25) DEFAULT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `email` varchar(50) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `ActionLogs` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `enquiryId` INT DEFAULT NULL,
    `agentName` VARCHAR(255) DEFAULT NULL,
    `comment` LONGTEXT DEFAULT NULL,
    `actionType` INT DEFAULT NULL,
    `createdAt` DATETIME DEFAULT NULL,
    `updatedAt` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `CommunicationLogs` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `enquiryId` INT DEFAULT NULL,
    `communicationType` INT DEFAULT NULL,
    `message` LONGTEXT DEFAULT NULL,
    `status` INT DEFAULT NULL,
    `createdAt` DATETIME DEFAULT NULL,
    `updatedAt` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `Pans` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `enquiryId` INT DEFAULT NULL,
    `panNumber` VARCHAR(255) DEFAULT NULL,
    `fullName` VARCHAR(255) DEFAULT NULL,
    `firstName` VARCHAR(255) DEFAULT NULL,
    `lastName` VARCHAR(255) DEFAULT NULL,
    `middleName` VARCHAR(255) DEFAULT NULL,
    `status` BOOLEAN DEFAULT FALSE,
    `category` INT DEFAULT NULL,
    `fatherName` VARCHAR(255) DEFAULT NULL,
    `crifLastChecked` DATETIME DEFAULT NULL,
    `crifScore` INT DEFAULT NULL,
    `creditBureauPath` LONGTEXT DEFAULT NULL,
    `analyiseReportPath` LONGTEXT DEFAULT NULL,
    `createdAt` DATETIME DEFAULT NULL,
    `updatedAt` DATETIME DEFAULT NULL, 
    PRIMARY KEY (`id`),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE `Followups` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `enquiryId` INT DEFAULT NULL,
    `dateOfAction` DATETIME DEFAULT NULL,
    `comment` LONGTEXT DEFAULT NULL,
    `actionType` INT DEFAULT NULL,
    `createdAt` DATETIME DEFAULT NULL,
    `updatedAt` DATETIME DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

