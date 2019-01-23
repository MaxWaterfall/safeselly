import * as log from "../helper/Logger";
import {HttpRequestError} from "./../helper/HttpRequestError";
import {db} from "./../Server";
import {IWarning} from "./../services/WarningService";

const submitWarningSql = `
    INSERT INTO Warning (UserId, WarningDateTime, PeopleDescription, WarningDescription, Latitude, Longitude)
    VALUES (
        (
            SELECT User.UserId FROM User WHERE Username = ?
        ),
        ?, ?, ?, ?, ?
    )
`;
const getAllWarningsSql = `
    SELECT WarningId, WarningDateTime, PeopleDescription, WarningDescription, Latitude, Longitude, Upvotes, Downvotes
    FROM Warning
`;
const getAllWarningsAfterIdSql = `
    SELECT WarningId, WarningDateTime, PeopleDescription, WarningDescription, Latitude, Longitude, Upvotes, Downvotes
    FROM Warning
    WHERE WarningId > ?
`;
const upvoteWarningSql = `
    INSERT INTO Vote
    VALUES (?, (
        SELECT User.UserId FROM User WHERE User.Username = ?
    ), true, false)
    ON DUPLICATE KEY UPDATE
        Upvote = true,
        Downvote = false
`;
const downvoteWarningSql = `
    INSERT INTO Vote
    VALUES (?, (
        SELECT User.UserId FROM User WHERE User.Username = ?
    ), false, true)
    ON DUPLICATE KEY UPDATE
        Upvote = false,
        Downvote = true
`;

export async function submitWarning(username: string, warning: IWarning, dateTime: string) {
    try {
        // People description is not mandatory.
        if (warning.peopleDescription === undefined) {
            warning.peopleDescription = "";
        }
        await db.query(submitWarningSql,
            [
                username,
                dateTime,
                warning.peopleDescription,
                warning.warningDescription,
                warning.location.lat,
                warning.location.long,
            ],
        );
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}

/**
 * Returns all warnings.
 */
export async function getAllWarnings() {
    try {
        return await db.query(getAllWarningsSql, []);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}

/**
 * Returns all warnings submitted after the given warningId.
 * @param warningId
 */
export async function getWarningsAfterId(warningId: string) {
    try {
        return await db.query(getAllWarningsAfterIdSql, [warningId]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}

/**
 * Adds a new upvote to the database.
 * @param warningId
 * @param username
 */
export async function upvoteWarning(warningId: string, username: string) {
    try {
        return await db.query(upvoteWarningSql, [warningId, username]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}

/**
 * Adds a new downvote to the database.
 * @param warningId
 * @param username
 */
export async function downvoteWarning(warningId: string, username: string) {
    try {
        return await db.query(downvoteWarningSql, [warningId, username]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}
