CREATE DATABASE SafeSelly;
USE SafeSelly;

CREATE TABLE User (
    username VARCHAR(32) NOT NULL UNIQUE,
	accessToken VARCHAR(64),
	deviceToken VARCHAR(64) NOT NULL,
	verificationToken VARCHAR(64) UNIQUE,
	fcmToken VARCHAR(256),
	verified boolean,
	banned boolean,

    PRIMARY KEY (username)
);

CREATE TABLE Warning (
	rowNumber int NOT NULL AUTO_INCREMENT,
	warningId VARCHAR(16) NOT NULL UNIQUE,
	username VARCHAR(32) NOT NULL,
	warningType VARCHAR(32) NOT NULL,
	warningDateTime DATETIME NOT NULL,
	latitude DOUBLE NOT NULL,
	longitude DOUBLE NOT NULL,
	addedDateTime DATETIME NOT NULL,
	
	PRIMARY KEY(rowNumber, warningId),
	FOREIGN KEY(username) REFERENCES User(username)
);

CREATE Table GeneralWarning (
	warningId VARCHAR(16) NOT NULL UNIQUE,
	peopleDescription TEXT,
	warningDescription TEXT NOT NULL,

	PRIMARY KEY(warningId),
	FOREIGN KEY(warningId) REFERENCES Warning(warningId)
);

CREATE Table Vote (
	warningId VARCHAR(16),
	username VARCHAR(32) NOT NULL,
	upvote boolean,
	downvote boolean,

	PRIMARY KEY(warningId, username),
	FOREIGN KEY(warningId) REFERENCES Warning(warningId),
	FOREIGN KEY(username) REFERENCES User(username)
);

CREATE Table Feedback (
	int feedbackId AUTO_INCREMENT NOT NULL UNIQUE,
	username VARCHAR(32) NOT NULL,
	feedback TEXT NOT NULL,

	PRIMARY KEY(feedbackId),
	FOREIGN KEY(username) REFERENCES User(username)
);