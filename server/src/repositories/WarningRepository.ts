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

export async function getAllWarnings() {
    try {
        return await db.query(getAllWarningsSql, []);
    } catch (err) {
        log.databaseError(err);
        throw new HttpRequestError(500, "Internal Server Error.");
    }
}
