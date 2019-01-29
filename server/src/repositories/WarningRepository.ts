import * as log from "../helper/Logger";
import { HttpRequestError } from "./../helper/HttpRequestError";
import { IWarning, WarningType } from "./../helper/WarningTypes";
import { db } from "./../Server";

const submitWarningSql = `
    INSERT INTO Warning
    VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)
`;
const submitGeneralWarningSql = `
    INSERT INTO GeneralWarning
    VALUES (?, ?, ?)
`;
const getAllWarningsSql = `
    SELECT WarningId, WarningType, WarningDateTime, Latitude, Longitude
    FROM Warning
`;
const getAllWarningsAfterIdSql = `
    SELECT WarningId, WarningType, WarningDateTime, Latitude, Longitude
    FROM Warning
    WHERE RowNumber >
        (SELECT RowNumber FROM Warning WHERE WarningId = ?)
`;
const upvoteWarningSql = `
    INSERT INTO Vote
    VALUES (?, ?, true, false)
    ON DUPLICATE KEY UPDATE
        Upvote = true,
        Downvote = false
`;
const downvoteWarningSql = `
    INSERT INTO Vote
    VALUES (?, ?, false, true)
    ON DUPLICATE KEY UPDATE
        Upvote = false,
        Downvote = true
`;
const getWarningTypeSql = `
    SELECT WarningType FROM Warning
    WHERE WarningId = ?
`;
const getGeneralWarningSql = `
    SELECT PeopleDescription, WarningDescription
    FROM GeneralWarning
    WHERE WarningId = ?
`;

export async function submitWarning(username: string, warning: IWarning, dateTime: string, warningId: string) {
    // First add to the Warning table.
    try {
        await db.query(submitWarningSql, [
            warningId,
            username,
            warning.type,
            warning.dateTime,
            warning.location.lat,
            warning.location.long,
            dateTime,
        ]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }

    // Now add to a specific warning table, depending on the warning type.
    try {
        if (warning.type === "general") {
            await db.query(submitGeneralWarningSql, [
                warningId,
                warning.information.peopleDescription,
                warning.information.warningDescription,
            ]);
        }
    } catch (err) {
        // TODO: Revert previous query.
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}

/**
 * Returns a warnings type.
 * @param warningId
 */
export async function getWarningType(warningId: string) {
    try {
        const result = await db.query(getWarningTypeSql, [warningId]) as any[];
        if (result.length > 0) {
            return result;
        }
        return "";
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}

/**
 * Returns specific information about a warning based on it's type.
 * @param warningId
 * @param warningType
 */
export async function getWarningInformation(warningId: string, warningType: WarningType) {
    try {
        if (warningType === "general") {
            return await db.query(getGeneralWarningSql, warningId) as any[];
        }

        // Other warning types here.
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
        await db.query(upvoteWarningSql, [warningId, username]);
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
        await db.query(downvoteWarningSql, [warningId, username]);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}
