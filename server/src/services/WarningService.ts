import { isPointInCircle } from "geolib";
import { HttpRequestError } from "../helper/HttpRequestError";
import { createWarning, IUserInformation } from "../warnings/WarningHelper";
import {
    DISTANCE_FROM_SELLY_OAK,
    getDangerLevelForWarningType,
    ISpecificReturnWarning,
    ISubmissionWarning,
    IVote,
    IWarning,
    IWarningInformation,
    SELLY_OAK_LAT,
    SELLY_OAK_LONG,
    validateWarning,
} from "./../../../shared/Warnings";
import * as log from "./../helper/Logger";
import * as UserRepository from "./../repositories/UserRepository";
import * as WarningRepository from "./../repositories/WarningRepository";
import * as NotificationService from "./NotificationService";

const NUMBER_OF_IDS = 1000000000000; // 100 billion.
const MAX_HOUR_FILTER = 24 * 7; // 1 week.
const MIN_TOTAL_VOTES_FOR_BAN = 10; // At least 10 votes required before user can be banned.
const BAN_PERCENTAGE = 51; // If 51% of votes are downvotes, the user is banned.
const MINIMUM_RELEVANCE = 3; // The minimum relevance score required for a warning to be considered relevant.

/**
 * Returns all warnings in the database.
 */
export async function getAllWarnings(): Promise<IWarning[]> {
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
export async function getWarningsFrom(hours: string): Promise<IWarning[]> {
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
 * This includes specific warning information that is relevant to the user who made the request.
 */
export async function getWarning(username: string, warningId: string): Promise<ISpecificReturnWarning> {
    if (warningId === undefined) {
        throw new HttpRequestError(400, "No warning_id given.");
    }

    // Get specific warning information.
    let information: IWarningInformation | string;
    try {
        information = await WarningRepository.getWarningInformation(warningId);
        if (information === "") {
            throw new HttpRequestError(400, "Warning does not exist.");
        }
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

    const warning: ISpecificReturnWarning = {
        information: information as IWarningInformation,
        votes,
        userVoted,
        userSubmitted,
    };

    return warning;
}

/**
 * Gets all the relevant warnings (for the user who made the request) that occurred
 * within the last {hours} hours.
 * @param username
 * @param hours
 */
export async function getRelevantWarningsFrom(username: string, hours: string) {
    // Check hours is a number.
    const hoursNumber = Number(hours);
    if (isNaN(hoursNumber)) {
        throw new HttpRequestError(400, "Hours must be a number.");
    }

    // Check hours is not more than the max.
    if (hoursNumber < 0 || hoursNumber > MAX_HOUR_FILTER) {
        throw new HttpRequestError(400, `Hours must be more than 0 and no more than ${MAX_HOUR_FILTER} hour(s).`);
    }

    let warnings: IWarning[];
    let userInfo: IUserInformation;
    try {
        // First retrieve the warnings from the database.
        warnings = await WarningRepository.getAllWarningsFrom(hoursNumber);
        // Now retrieve user information.
        userInfo = await UserRepository.getUserInformation(username);
    } catch (err) {
        throw err;
    }

    // Now work out which warnings are relevant.
    const relevantWarnings: IWarning[] = [];
    for (const warning of warnings) {
        const relevantWarning = createWarning(warning);
        if (relevantWarning.calculateRelevance(userInfo) >= MINIMUM_RELEVANCE) {
            relevantWarnings.push(warning);
        }
    }

    return relevantWarnings;
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
        throw new HttpRequestError(400, err.message);
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

    // Add warning to database then add an upvote to the warning.
    try {
        await WarningRepository.submitWarning(username, warning, getDate(), warningId);
        await WarningRepository.upvoteWarning(warningId, username);
        // TODO: delete warning if second query fails.
    } catch (err) {
        throw (err);
    }

    // Build the IWarning.
    const warningSubmission: IWarning = {
        warningId,
        dateTime: warning.dateTime,
        information: warning.information,
        location: warning.location,
        priority: getDangerLevelForWarningType(warning.type),
        type: warning.type,
    };

    // Pass onto notification service.
    NotificationService.newWarningSubmission(warningId, warningSubmission);
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

    // Check if user needs to be banned.
    try {
        const shouldBan = await shouldBanUser(warningId);
        if (shouldBan) {
            // Ban user.
            await UserRepository.banUser(warningId);
        }
    } catch (err) {
        throw err;
    }
}

/**
 * Checks the ratio of upvotes to downvotes then bans the user if the ratio is too low.
 * @param warningId
 */
async function shouldBanUser(warningId: string): Promise<boolean> {
    // Get the number of upvotes and downvotes from the db.
    try {
        const votes = await WarningRepository.getVotesForWarning(warningId);
        const totalVotes = votes.downvotes + votes.upvotes;

        if (totalVotes < MIN_TOTAL_VOTES_FOR_BAN) {
            return false;
        }

        const downvotePercentage = Math.round((votes.downvotes / totalVotes) * 100);

        if (downvotePercentage >= BAN_PERCENTAGE) {
            return true;
        }

        return false;
    } catch (err) {
        throw err;
    }
}

/**
 *  Returns the current date and time, correctly formatted for the database type DATETIME.
 */
export function getDate(): string {
    // Get current time and date. Need to match format 'YYYY-MM-DD HH:MM:SS' for database.
    const now = new Date();
    let month = (now.getMonth() + 1).toString();
    let date = now.getDate().toString();
    let hours = now.getHours().toString();
    let minutes = now.getMinutes().toString();
    let seconds = now.getSeconds().toString();

    // We don't want our dates to be 0 based.
    if (month === "0") {
        month = "1";
    }
    if (date === "0") {
        date = "1";
    }

    month = format(month);
    date = format(date);
    hours = format(hours);
    minutes = format(minutes);
    seconds = format(seconds);

    const output = `${now.getFullYear()}-${month}-${date} ${hours}:${minutes}:${seconds}`;

    return output;
}

 /**
  * Takes a string an prepends a 0 if needed. Eg. format("5") will return "05".
  * @param value the string to format.
  */
function format(value: string): string {
    if (value.length === 1) {
        value = "0" + value;
    }
    return value;
}
