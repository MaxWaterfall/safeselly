CREATE DATABASE SafeSelly;
USE SafeSelly;

CREATE TABLE User (
    Username VARCHAR(32) NOT NULL UNIQUE,
	AccessToken VARCHAR(64),

    PRIMARY KEY (Username)
);

CREATE TABLE Device (
	DeviceToken VARCHAR(64) NOT NULL UNIQUE,
    Username VARCHAR(32) NOT NULL,
    VerificationToken VARCHAR(64) UNIQUE,
	Verified boolean,

	PRIMARY KEY (DeviceToken),
    FOREIGN KEY (Username) REFERENCES User(Username)
);

CREATE TABLE Warning (
	WarningId int AUTO_INCREMENT,
	Username VARCHAR(32) NOT NULL,
	WarningDateTime DATETIME NOT NULL,
	PeopleDescription TEXT,
	WarningDescription TEXT NOT NULL,
	Latitude DOUBLE NOT NULL,
	Longitude DOUBLE NOT NULL,
	Upvotes int,
	Downvotes int,
	DateAdded DATETIME NOT NULL,
	
	PRIMARY KEY(WarningId),
	FOREIGN KEY(Username) REFERENCES User(Username)
);

CREATE Table Vote (
	WarningId int,
	Username VARCHAR(32) NOT NULL,
	Upvote boolean,
	Downvote boolean,

	PRIMARY KEY(WarningId, Username),
	FOREIGN KEY(WarningId) REFERENCES Warning(WarningId),
	FOREIGN KEY(Username) REFERENCES User(Username)
);