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
	DeviceToken VARCHAR(64) NOT NULL UNIQUE,
    AccessToken VARCHAR(64),
    VerificationToken VARCHAR(64) UNIQUE,
	Verified boolean,

	PRIMARY KEY (DeviceId),
    FOREIGN KEY (UserId) REFERENCES User(UserId)
);

CREATE TABLE Warning (
	WarningId int AUTO_INCREMENT,
	UserId int NOT NULL,
	WarningDateTime DATETIME NOT NULL,
	PeopleDescription TEXT,
	WarningDescription TEXT NOT NULL,
	Latitude DOUBLE NOT NULL,
	Longitude DOUBLE NOT NULL,
	Upvotes int,
	Downvotes int,
	
	PRIMARY KEY(WarningId),
	FOREIGN KEY(UserId) REFERENCES User(UserId)
)