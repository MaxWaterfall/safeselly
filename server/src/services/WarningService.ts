import { isPointInCircle } from "geolib";
import { HttpRequestError } from "../helper/HttpRequestError";
import {
    DISTANCE_FROM_SELLY_OAK,
    IGeneralWarning,
    IReturnWarning,
    ISpecificReturnWarning,
    ISubmissionWarning,
    IVote,
    SELLY_OAK_LAT,
    SELLY_OAK_LONG,
    validateWarning,
    WarningInformationType,
    WarningType,
} from "./../../../shared/Warnings";
import * as log from "./../helper/Logger";
import * as WarningRepository from "./../repositories/WarningRepository";

const NUMBER_OF_IDS = 1000000000000; // 100 billion.
const MAX_HOUR_FILTER = 24 * 7; // 1 week.

/**
 * Returns all warnings in the database.
 */
export async function getAllWarnings(): Promise<IReturnWarning[]> {
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
export async function getAllWarningsFrom(hours: string): Promise<IReturnWarning[]> {
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
 * Returns information for warning with {id}.
 * This includes specific warning information based on it's type.
 */
export async function getWarning(username: string, warningId: string): Promise<ISpecificReturnWarning> {
    if (warningId === undefined) {
        throw new HttpRequestError(400, "No warning_id given.");
    }

    // First get the type of the warning.
    let warningType: WarningType;
    try {
        const result = await WarningRepository.getWarningType(warningId);
        if (result === "") {
            throw new HttpRequestError(400, "warning_id does not exist.");
        }

        warningType = result;
    } catch (err) {
        throw err;
    }

    // Get specific warning information based on type.
    let information: WarningInformationType;
    try {
        information = await WarningRepository.getWarningInformation(warningId, warningType);
    } catch (err) {
        throw err;
    }

    // Get number of votes.
    let votes: IVote;
    try {
        votes = await WarningRepository.getVotesForWarning(warningId);
    } catch (err) {
        throw err;
    }

    // Get if the user has voted or not.
    let userVoted: boolean;
    try {
        userVoted = await WarningRepository.hasUserVoted(username, warningId);
    } catch (err) {
        throw err;
    }

    // Get if the user submitted this warning.
    let userSubmitted: boolean;
    try {
        userSubmitted = await WarningRepository.didUserSubmitWarning(username, warningId);
    } catch (err) {
        throw err;
    }

    const returnWarning: ISpecificReturnWarning = {
        information,
        votes,
        userVoted,
        userSubmitted,
    };

    return returnWarning;
}

/**
 * Validates then submits a warning.
 * @param username
 * @param warning
 */
export async function submitWarning(username: string, warning: ISubmissionWarning) {
    // Validate the warning.
    try {
        validateWarning(warning);
    } catch (err) {
        throw new HttpRequestError(400, err);
    }

    // Check location is within bounds.
    if (!isPointInCircle(
        {latitude: warning.location.lat, longitude: warning.location.long},
        {latitude: SELLY_OAK_LAT, longitude: SELLY_OAK_LONG},
        DISTANCE_FROM_SELLY_OAK,
    )) {
        throw new HttpRequestError(400, `
            Location [lat:${warning.location.lat}, long:${warning.location.long}]
            is not within ${DISTANCE_FROM_SELLY_OAK}m of Selly Oak`,
        );
    }

    // Generate warning id. Gets the hex value.
    const randomNumber = Math.random();
    const warningId = (Math.ceil(randomNumber * NUMBER_OF_IDS)).toString(16);

    // Add warning to database then add a vote to the warning.
    try {
        await WarningRepository.submitWarning(username, warning, getDate(), warningId);
        await WarningRepository.upvoteWarning(warningId, username);
        // TODO: delete warning if second query fails.
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

/**
 *  Returns the current date and time, correctly formatted for the database type DATETIME.
 */
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
