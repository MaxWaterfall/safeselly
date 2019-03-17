/**
 * Builds a test database full of fake/testing data.
 */

// @ts-ignore no types.
import randomLocation from "random-location";
import { ISubmissionWarning, Location, WarningType } from "../../shared/Warnings";
import { db } from "../src/Server";
import * as log from "./../src/helper/Logger";
import * as UserRepository from "./../src/repositories/UserRepository";
import * as WarningRepository from "./../src/repositories/WarningRepository";

const NUMBER_OF_USERS = 10000;
const LOCATIONS_PER_USER = 20;
const NUMBER_OF_WARNINGS = 100000;
const NUMBER_OF_USABLE_WARNINGS = 300;

const createTablesSql = `
    CREATE TABLE User (
        username VARCHAR(32) NOT NULL UNIQUE,
        accessToken VARCHAR(64),
        deviceToken VARCHAR(64) NOT NULL,
        verificationToken VARCHAR(64) UNIQUE,
        fcmToken VARCHAR(256),
        verified boolean,
        banned boolean,
        lastRequest DATETIME,

        PRIMARY KEY (username)
    );

    CREATE TABLE UserInformation (
        username VARCHAR(32) NOT NULL,
        gender VARCHAR(10),
        homeLatitude DOUBLE,
        homeLongitude DOUBLE,
        currentLatitude DOUBLE,
        currentLongitude DOUBLE,
        ownsBicycle boolean,
        ownsCar boolean,
        ownsLaptop boolean,

        PRIMARY KEY (username),
        FOREIGN KEY (username) REFERENCES User(username)
    );

    CREATE Table UserLocation (
        locationId int AUTO_INCREMENT NOT NULL UNIQUE,
        username VARCHAR(32) NOT NULL,
        latitude double NOT NULL,
        longitude double NOT NULL,

        PRIMARY KEY (locationId),
        FOREIGN KEY (username) REFERENCES User(username)
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
        peopleDescription TEXT,
        warningDescription TEXT NOT NULL,

        PRIMARY KEY(rowNumber, warningId),
        FOREIGN KEY(username) REFERENCES User(username)
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
        feedbackId int AUTO_INCREMENT NOT NULL UNIQUE,
        username VARCHAR(32) NOT NULL,
        feedback TEXT NOT NULL,

        PRIMARY KEY(feedbackId),
        FOREIGN KEY(username) REFERENCES User(username)
    );
`;
const deleteTablesSql = "SET FOREIGN_KEY_CHECKS = 0;" +
    "DROP TABLE IF EXISTS User;" +
    "DROP TABLE IF EXISTS UserInformation;" +
    "DROP TABLE IF EXISTS UserLocation;" +
    "DROP TABLE IF EXISTS Warning;" +
    "DROP TABLE IF EXISTS Vote;" +
    "DROP TABLE IF EXISTS Feedback;" +
    "SET FOREIGN_KEY_CHECKS = 1;"
;
const addFakeUserInformationSql = `
    INSERT INTO UserInformation
    VALUES (?, 'FEMALE', 1, 1, 1, 1, true, true, true);
`;
const addFakeUserLocationSql = `
    INSERT INTO UserLocation
    VALUES (NULL, ?, 1, 1);
`;
const addFakeWarningSql = `
    INSERT INTO Warning
    VALUES (NULL, ?, '1', 'general', '1000-01-01 00:00:00', 1, 1, '1000-01-01 00:00:00', "", 'This is a test warning.');
`;
const deleteFakeWarningsSql = `
    SET FOREIGN_KEY_CHECKS = 0;
    DELETE FROM Warning WHERE warningId LIKE 'a%';
    SET FOREIGN_KEY_CHECKS = 1;
`;
const addTestUserInformationSql = `
    INSERT INTO UserLocation (locationId, username, latitude, longitude)
    VALUES
        (NULL, 'MXW663', 52.444766, -1.930498),
        (NULL, 'MXW663', 52.44528, -1.930788),
        (NULL, 'MXW663', 52.445757, -1.931034),
        (NULL, 'MXW663', 52.446264, -1.931303),
        (NULL, 'MXW663', 52.44617, -1.931753),
        (NULL, 'MXW663', 52.446065, -1.932253),
        (NULL, 'MXW663', 52.445831, -1.933025),
        (NULL, 'MXW663', 52.446338, -1.933186),
        (NULL, 'MXW663', 52.446868, -1.933487),
        (NULL, 'MXW663', 52.447372, -1.933471);

    INSERT INTO UserInformation (username, gender, homeLatitude,
        homeLongitude, currentLatitude, currentLongitude, ownsBicycle, ownsCar, ownsLaptop)
    VALUES
        ('MXW663', 'MALE', 52.444386, -1.929963, 52.444386, -1.929963, 0, 1, 1);

    INSERT INTO UserLocation (locationId, username, longitude, latitude)
    VALUES
        (NULL, 'TEST', -1.933858, 52.445433),
        (NULL, 'TEST', -1.933444, 52.446737),
        (NULL, 'TEST', -1.935462, 52.444255),
        (NULL, 'TEST', -1.934657, 52.444926),
        (NULL, 'TEST', -1.936159, 52.443654),
        (NULL, 'TEST', -1.93307, 52.445916),
        (NULL, 'TEST', -1.936186, 52.442904),
        (NULL, 'TEST', -1.936658, 52.443255);

    INSERT INTO UserInformation (username, gender, homeLatitude,
        homeLongitude, currentLatitude, currentLongitude, ownsBicycle, ownsCar, ownsLaptop)
    VALUES
        ('TEST', 'FEMALE', 52.442518, -1.935704, 52.442518, -1.935704, 1, 0, 1);
`;

/**
 * Deletes then creates the tables in the database.
 * Fills the database with 100000 warnings and 10000 users, each with 20 frequently visited locations.
 */
export async function buildDatabase(generateFakeWarnings: boolean) {
    // Delete then create tables.
    try {
        log.info("Deleting tables.");
        await db.query(deleteTablesSql, []);
        log.info("Creating tables.");
        await db.query(createTablesSql, []);
    } catch (err) {
        throw err;
    }

    // Create fake users.
    log.info("Creating users.");
    for (let i = 0; i < NUMBER_OF_USERS; i++) {
        // Add to user table.
        const istr = i.toString();
        try {
            // Create row in User.
            await UserRepository.addUser(istr, istr, istr);
            // Create row in UserInformation.
            db.query(addFakeUserInformationSql, [istr]);
            // Create rows in UserLocation.
            for (let j = 0; j < LOCATIONS_PER_USER; j++) {
                db.query(addFakeUserLocationSql, [i]);
            }
        } catch (err) {
            throw err;
        }
    }

    log.info("Creating MXW663 and TEST users.");
    try {
        await UserRepository.addUser("MXW663", "1", "1");
        await UserRepository.addUser("TEST", "2", "2");
        db.query(addTestUserInformationSql, []);
    } catch (err) {
        log.error(err);
    }

    log.info("Creating warnings.");
    // Create fake warnings.
    for (let i = 0; i < NUMBER_OF_WARNINGS; i++) {
        const istr = i.toString();
        try {
            db.query(addFakeWarningSql, [istr]);
        } catch (err) {
            throw err;
        }
    }

    log.info("Done building database.");

    if (generateFakeWarnings) {
        createFakeWarnings();
    }
}

/**
 * Creates 300 random fake warnings.
 * Each warning is within 750m of selly oak and within the last week.
 */
export async function createFakeWarnings() {
    // Delete all current fake warnings.
    log.info("Deleting fake warnings.");
    await db.query(deleteFakeWarningsSql, []);
    log.info("Creating fake warnings.");
    for (let i = 0; i < NUMBER_OF_USABLE_WARNINGS; i++) {
        const type = getRandomType();
        let warningDescription = "This is a test warning.";
        if (type === "theft" || type === "vandalism") {
            warningDescription = getRandomMessage();
        }
        try {
            const randomDate = getRandomDate();
            const warningToSubmit: ISubmissionWarning = {
                dateTime: randomDate,
                information: {
                    peopleDescription: "This is a test warning.",
                    warningDescription,
                },
                location: getRandomLocation(),
                type,
            };
            WarningRepository.submitWarning("1", warningToSubmit, randomDate, "a" + i.toString());
        } catch (err) {
            throw err;
        }
    }

    log.info("Done creating fake warnings.");
}

/**
 * Generates a random warning message, used to test theft/vandalism OWNS modifier.
 */
function getRandomMessage() {
    const random = getRandomNumber(3);
    if (random === 0) {
        return "They jumped in my car and drove away.";
    }

    if (random === 1) {
        return "They broke my lock and stole my bike.";
    }

    return "I left my laptop on the table and it was stolen.";
}

/**
 * Returns a random location within 750m of Selly Oak.
 */
function getRandomLocation(): Location {
    const P = {
        latitude: 52.443944,
        longitude: -1.931672,
    };

    const randomPoint = randomLocation.randomCirclePoint(P, 750);
    return {
        lat: randomPoint.latitude,
        long: randomPoint.longitude,
    };
}

/**
 * Returns a random date within the last week.
 */
function getRandomDate(): string {
    // ms in s * s in min * min in hour * hours in week.
    const weekInMilliseconds = 1000 * 60 * 60 * 168;
    const randomMilliseconds = getRandomNumber(weekInMilliseconds);
    let date = new Date(new Date().getTime() - randomMilliseconds).toJSON();
    date = date.substr(0, 10) + " " + date.substr(11, 8);
    return date;
}

/**
 * Returns a random type of warning.
 */
function getRandomType(): WarningType {
    const random = getRandomNumber(8);

    switch (random) {
        case 0: return "assault";
        case 1: return "burglary";
        case 2: return "harassment";
        case 3: return "mugging";
        case 4: return "suspicious behaviour";
        case 5: return "theft";
        case 6: return "threatening behaviour";
        case 7: return "vandalism";
    }

    return "general";
}

/**
 * Returns a random integer from 0 to max (exclusive).
 * @param max
 */
function getRandomNumber(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
}
