import { HttpRequestError } from "../helper/HttpRequestError";
import * as log from "./../helper/Logger";
import { IWarning, validateWarning } from "./../helper/WarningTypes";
import * as WarningRepository from "./../repositories/WarningRepository";

const NUMBER_OF_IDS = 1000000000000; // 100 billion.
const MAX_HOUR_FILTER = 24 * 7; // 1 week.

/**
 * Returns all warnings in the database.
 */
export async function getAllWarnings() {
    try {
        return await WarningRepository.getAllWarnings();
    } catch (err) {
        throw err;
    }
}
/**
 * Returns all warnings with a WarningDateTime less than {hours} hours ago.
 * Throws error if validation fails.
 * @param hours
 */
export async function getAllWarningsFrom(hours: string) {
    // Check it's a number.
    const hoursNumber = Number(hours);
    if (isNaN(hoursNumber)) {
        throw new HttpRequestError(400, "Hours must be a number.");
    }

    // Check it's not more than the max.
    if (hoursNumber < 0 || hoursNumber > MAX_HOUR_FILTER) {
        throw new HttpRequestError(400, "Hours must be more than 0 and no more than 1 week.");
    }

    try {
        return await WarningRepository.getAllWarningsFrom(hoursNumber);
    } catch (err) {
        throw err;
    }
}

/**
 * Returns all information for warning with {id}.
 * This includes specific warning information based on it's type.
 */
export async function getWarning(warningId: string) {
    if (warningId === undefined) {
        throw new HttpRequestError(400, "No warning_id given.");
    }

    // First get the type of the warning.
    let warningType;
    try {
        const result = await WarningRepository.getWarningType(warningId);
        if (result === "") {
            throw new HttpRequestError(400, "warning_id does not exist.");
        }

        warningType = result[0].WarningType;
    } catch (err) {
        throw err;
    }

    // Now retrieve the information.
    try {
        const result = await WarningRepository.getWarningInformation(warningId, warningType) as any[];
        if (result.length > 0) {
            return result[0];
        }

        log.error("The result returned from getWarningInformation had a length that was less than 0.");
        throw new HttpRequestError(500, "Internal Server Error.");
    } catch (err) {
        throw err;
    }
}

/**
 * Returns all warnings submitted after {id}.
 */
export async function getWarningAfterId(warningId: string) {
    if (warningId === undefined) {
        throw new HttpRequestError(400, "No warning_id given.");
    }

    try {
        return await WarningRepository.getWarningsAfterId(warningId);
    } catch (err) {
        throw err;
    }
}

/**
 * Validates then submits a warning.
 * @param username
 * @param warning
 */
export async function submitWarning(username: string, warning: IWarning) {
    // Validate the warning.
    try {
        validateWarning(warning);
    } catch (err) {
        throw err;
    }

    // Generate warning id. Gets the hex value.
    const randomNumber = Math.random();
    const warningId = (Math.ceil(randomNumber * NUMBER_OF_IDS)).toString(16);

    // Add warning to database.
    try {
        await WarningRepository.submitWarning(username, warning, getDate(), warningId);
    } catch (err) {
        throw (err);
    }
}

/**
 * Adds a upvote to a warning.
 * @param warningId the id of the warning to upvote.
 * @param username the user who is upvoting the warning.
 */
export async function upvoteWarning(warningId: string, username: string) {
    try {
        await WarningRepository.upvoteWarning(warningId, username);
    } catch (err) {
        throw (err);
    }
}

/**
 * Adds a downvote to a warning.
 * @param warningId the id of the warning to downvote.
 * @param username the user who is downvoting the warning.
 */
export async function downvoteWarning(warningId: string, username: string) {
    try {
        await WarningRepository.downvoteWarning(warningId, username);
    } catch (err) {
        throw (err);
    }
}

// Returns the current date and time, correctly formatted for the database type DATETIME.
function getDate(): string {
    // Get current time and date. Need to match format 'YYYY-MM-DD HH:MM:SS' for database.
    const date = new Date();
    let month = date.getMonth().toString();
    let day = date.getDay().toString();
    let hours = date.getHours().toString();
    let minutes = date.getMinutes().toString();
    let seconds = date.getSeconds().toString();

    // We don't want our dates to be 0 based.
    if (month === "0") {
        month = "1";
    }
    if (day === "0") {
        day = "1";
    }

    month = format(month);
    day = format(day);
    hours = format(hours);
    minutes = format(minutes);
    seconds = format(seconds);

    return `${date.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

 /**
  * Takes a string an appends a 0 if needed. Eg. format("5") will return "05".
  * @param value the string to format.
  */
function format(value: string): string {
    if (value.length === 1) {
        value = "0" + value;
    }
    return value;
}
