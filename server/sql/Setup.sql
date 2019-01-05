CREATE DATABASE SafeSelly;
USE SafeSelly;

CREATE TABLE User (
    UserId int AUTO_INCREMENT,
    Username VARCHAR(64),
    
    PRIMARY KEY (UserId)
);

CREATE TABLE Device (
	DeviceId int AUTO_INCREMENT,
    UserId int NOT NULL,
	DeviceToken VARCHAR(32) NOT NULL UNIQUE,
    AccessToken VARCHAR(32),
    VerificationToken VARCHAR(32) UNIQUE,
	Verified boolean,

	PRIMARY KEY (DeviceId),
    FOREIGN KEY (UserId) REFERENCES User(UserId)
);