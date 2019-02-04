import {
    IReturnWarning,
    ISpecificReturnWarning,
    WarningType,
} from "../../../shared/Warnings";
import { makeAuthenticatedRequest } from "./NetworkService";

const SELLY_OAK_LAT = 52.436720;
const SELLY_OAK_LONG = -1.939000;
const LATITUDE_DELTA = 0.026;
const LONGITUDE_DELTA = 0.0159;

const viewedWarnings: Map<string, boolean> = new Map();

export const initialRegion = {
    latitude: SELLY_OAK_LAT,
    longitude: SELLY_OAK_LONG,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
};

/**
 * Retrieves all warnings from the server with a WarningDateTime within the past {hours} hours.
 */
export async function getWarningsFrom(hours: number): Promise<IReturnWarning[]> {
    try {
        return await makeAuthenticatedRequest("GET", `/warning/filter/${hours}`, {});
    } catch (err) {
        throw err;
    }
}

/**
 * Retrieves all warnings from the server after a given warning id.
 */
export async function getWarningsAfterId(warningId: string): Promise<IReturnWarning[]> {
    try {
        return await makeAuthenticatedRequest("GET", `/warning/${warningId}/after`, {});
    } catch (err) {
        throw err;
    }
}

/**
 * Retrieves specific warning information from the server.
 * @param warningId
 */
export async function getWarningInformation(
    warningId: string, warningType: WarningType): Promise<ISpecificReturnWarning> {

    try {
        let result;
        if (warningType === "general") {
            result = await makeAuthenticatedRequest("GET", `/warning/${warningId}`, {});
            viewWarning(warningId);
        }

        return result;
    } catch (err) {
        throw err;
    }
}

/**
 * Adds a vote to the warning with id {warningId}.
 * @param warningId
 */
export async function voteWarning(warningId: string, upvote: boolean) {
    try {
        if (upvote) {
            return await makeAuthenticatedRequest("POST", `/warning/${warningId}/upvote`, {});
        }

        // Downvote.
        return await makeAuthenticatedRequest("POST", `/warning/${warningId}/downvote`, {});
    } catch (err) {
        throw err;
    }
}

/**
 * Adds a warning to the viewedWarnings list.
 * @param warningId
 */
function viewWarning(warningId: string) {
    viewedWarnings.set(warningId, true);
}

/**
 * Gets a list of all the warnings the user has recently viewed.
 */
export function getViewedWarnings() {
    return viewedWarnings;
}
