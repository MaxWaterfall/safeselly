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
	RowNumber int NOT NULL AUTO_INCREMENT,
	WarningId VARCHAR(16) NOT NULL UNIQUE,
	Username VARCHAR(32) NOT NULL,
	WarningType VARCHAR(32) NOT NULL,
	WarningDateTime DATETIME NOT NULL,
	Latitude DOUBLE NOT NULL,
	Longitude DOUBLE NOT NULL,
	AddedDateTime DATETIME NOT NULL,
	
	PRIMARY KEY(RowNumber, WarningId),
	FOREIGN KEY(Username) REFERENCES User(Username)
);

CREATE Table GeneralWarning (
	WarningId VARCHAR(16) NOT NULL UNIQUE,
	PeopleDescription TEXT,
	WarningDescription TEXT NOT NULL,

	PRIMARY KEY(WarningId),
	FOREIGN KEY(WarningId) REFERENCES Warning(WarningId)
);

CREATE Table Vote (
	WarningId VARCHAR(16),
	Username VARCHAR(32) NOT NULL,
	Upvote boolean,
	Downvote boolean,

	PRIMARY KEY(WarningId, Username),
	FOREIGN KEY(WarningId) REFERENCES Warning(WarningId),
	FOREIGN KEY(Username) REFERENCES User(Username)
);