import { isPointInCircle } from "geolib";
import { HttpRequestError } from "../helper/HttpRequestError";
import * as WarningRepository from "./../repositories/WarningRepository";

const MAX_PEOPLE_DESCRIPTION_LENGTH = 300;
const MAX_WARNING_DESCRIPTION_LENGTH = 500;
const SELLY_OAK_LAT = 52.436720;
const SELLY_OAK_LONG = -1.939000;
const DISTANCE_FROM_SELLY_OAK = 5000; // 5km.

export interface IWarning {
    peopleDescription: string;
    warningDescription: string;
    location: {
        lat: number;
        long: number;
    };
}

export async function getAllWarnings() {
    try {
        return await WarningRepository.getAllWarnings();
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

    // Check if the id given is actually a number.
    if (isNaN(Number(warningId))) {
        throw new HttpRequestError(400, "warning_id is not a number.");
    }

    try {
        return await WarningRepository.getWarningsAfterId(warningId);
    } catch (err) {
        throw err;
    }
}

/**
 * Validates then submits a warning.
 */
export async function submitWarning(username: string, warning: IWarning) {
    // Validate the warning.
    try {
        validateWarning(warning);
    } catch (err) {
        throw err;
    }

    // Add warning to database.
    try {
        await WarningRepository.submitWarning(username, warning, getDate());
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

// Takes a string an appends a 0 if needed. Eg. format("5") will retun "05".
function format(value: string): string {
    if (value.length === 1) {
        value = "0" + value;
    }
    return value;
}

function validateWarning(warning: IWarning) {
    if (warning.peopleDescription !== undefined) {
        // People descriptions are allowed to be undefined.
        if (warning.peopleDescription.length > MAX_PEOPLE_DESCRIPTION_LENGTH) {
            throw new HttpRequestError(400,
                `People description length is more than ${MAX_PEOPLE_DESCRIPTION_LENGTH} characters.`);
        }
    }

    if (warning.warningDescription === undefined) {
        // Warning descriptions cannot be undefined.
        throw new HttpRequestError(400, "No warning description provided.");
    }

    if (warning.warningDescription.length > MAX_WARNING_DESCRIPTION_LENGTH) {
        throw new HttpRequestError(400,
            `Warning description length is more than ${MAX_WARNING_DESCRIPTION_LENGTH} characters.`);
    }

    // Location must be within 5km of Selly Oak.
    if (!isPointInCircle(
        {latitude: warning.location.lat, longitude: warning.location.long},
        {latitude: SELLY_OAK_LAT, longitude: SELLY_OAK_LONG},
        DISTANCE_FROM_SELLY_OAK,
    )) {
        throw new HttpRequestError(400, `
            Location [lat:${warning.location.lat}, long:${warning.location.long}]
            is not within ${DISTANCE_FROM_SELLY_OAK}km of Selly Oak`,
        );
    }
}
