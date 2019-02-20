import {
    IReturnWarning,
    ISpecificReturnWarning,
    ISubmissionWarning,
    IVote,
    IWarningInformation,
    WarningType,
} from "../../../shared/Warnings";
import * as log from "../helper/Logger";
import { HttpRequestError } from "./../helper/HttpRequestError";
import { db } from "./../Server";

const submitWarningSql = `
    INSERT INTO Warning
    VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;
const getAllWarningsSql = `
    SELECT warningId, warningType, warningDateTime, latitude, longitude
    FROM Warning
`;
const upvoteWarningSql = `
    INSERT INTO Vote
    VALUES (?, ?, true, false)
    ON DUPLICATE KEY UPDATE
        upvote = true,
        downvote = false
`;
const downvoteWarningSql = `
    INSERT INTO Vote
    VALUES (?, ?, false, true)
    ON DUPLICATE KEY UPDATE
        upvote = false,
        downvote = true
`;
const getSpecificWarningInformationSql = `
    SELECT peopleDescription, warningDescription
    FROM Warning
    WHERE warningId = ?
`;
const getAllWarningsFromSql = `
    SELECT warningId, warningType, warningDateTime, latitude, longitude
    FROM Warning
    WHERE warningDateTime > DATE_SUB(NOW(),INTERVAL ? HOUR)
`;
const getVotesForWarningSql = `
    SELECT
        (SELECT COUNT(*) FROM Vote WHERE warningId = ? AND upvote = 1) as upvotes,
        (SELECT COUNT(*) FROM Vote WHERE warningId = ? AND downvote = 1) as downvotes
`;
const hasUserVotedSql = `
    SELECT upvote, downvote
    FROM Vote
    WHERE username = ? AND warningId = ?
`;
const didUserSubmitWarningSql = `
    SELECT username
    FROM Warning
    WHERE username = ? AND warningId = ?
`;

/**
 * Submits a warning into the database.
 * @param username
 * @param warning
 * @param dateTime
 * @param warningId
 */
export async function submitWarning(
    username: string, warning: ISubmissionWarning, dateTime: string, warningId: string) {
    // Add to the Warning table.
    try {
        await db.query(submitWarningSql, [
            warningId,
            username,
            warning.type,
            warning.dateTime,
            warning.location.lat,
            warning.location.long,
            dateTime,
            warning.information.peopleDescription,
            warning.information.warningDescription,
        ]);
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
export async function getWarningInformation(
    warningId: string): Promise<IWarningInformation | string> {
    try {
        // Get warning information.
        const result = await db.query(getSpecificWarningInformationSql, warningId) as any[];
        if (result.length > 0) {
            return result[0] as IWarningInformation;
        }
        return "";
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}

/**
 * Returns generic information for all warnings.
 */
export async function getAllWarnings(): Promise<IReturnWarning[]> {
    try {
        const result = await db.query(getAllWarningsSql, []) as any[];
        return result.map((warning) => {
            const returnWarning: IReturnWarning = {
                warningId: warning.warningId,
                type: warning.warningType,
                location: {
                    lat: warning.latitude,
                    long: warning.longitude,
                },
                dateTime: warning.warningDateTime,
            };
            return returnWarning;
        });
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}

/**
 * Returns all warnings with a WarningDateTime within the past {hours} hours.
 * @param hours
 */
export async function getAllWarningsFrom(hours: number): Promise<IReturnWarning[]> {
    try {
        const result = await db.query(getAllWarningsFromSql, [hours]) as any[];
        return result.map((warning) => {
            const returnWarning: IReturnWarning = {
                warningId: warning.warningId,
                type: warning.warningType,
                location: {
                    lat: warning.latitude,
                    long: warning.longitude,
                },
                dateTime: warning.warningDateTime,
            };
            return returnWarning;
        });
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

/**
 * Returns the number of upvotes and downvotes a warning has received.
 * @param warningId
 */
export async function getVotesForWarning(warningId: string): Promise<IVote> {
    try {
        const result = await db.query(getVotesForWarningSql, [warningId, warningId]) as any[];
        return result[0] as IVote;
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}

/**
 * Returns whether or not a user has voted for a warning.
 * @param username
 * @param warningId
 */
export async function hasUserVoted(username: string, warningId: string): Promise<boolean> {
    try {
        const result = await db.query(hasUserVotedSql, [username, warningId]) as any[];
        if (result[0] === undefined) {
            return false;
        }

        if (result[0].upvote === undefined) {
            return false;
        }

        if (result[0].upvote === 1) {
            return true;
        }

        if (result[0].downvote === undefined) {
            return false;
        }

        if (result[0]. downvote === 1) {
            return true;
        }

        return false;
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}

/**
 * Returns whether or not the user submitted a warning.
 * @param username
 * @param warningId
 */
export async function didUserSubmitWarning(username: string, warningId: string): Promise<boolean> {
    try {
        const result = await db.query(didUserSubmitWarningSql, [username, warningId]) as any[];
        if (result.length > 0) {
            return true;
        }

        return false;
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error");
    }
}
