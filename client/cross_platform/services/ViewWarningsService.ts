// @ts-ignore
import datetimeDifference from "datetime-difference";
import { AppState } from "react-native";
import {
    IReturnWarning,
    ISpecificReturnWarning,
    WarningType,
} from "../../../shared/Warnings";
import { getItem, setItem } from "./../data/DataStorage";
import { makeAuthenticatedRequest } from "./NetworkService";

const SELLY_OAK_LAT = 52.44190975688334;
const SELLY_OAK_LONG = -1.9310344196856024;
const LATITUDE_DELTA = 0.012998311140464125;
const LONGITUDE_DELTA = 0.020888708531856537;

let viewedWarnings: Map<string, Date>;

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
        const warnings = await makeAuthenticatedRequest("GET", `/warning/filter/${hours}`, {});
        console.log(JSON.stringify(warnings));
        return warnings;
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
    warningId: string): Promise<ISpecificReturnWarning> {

    try {
        const result = await makeAuthenticatedRequest("GET", `/warning/${warningId}`, {});
        viewWarning(warningId);
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
    viewedWarnings.set(warningId, new Date());
}

/**
 * Gets a list of all the warnings the user has recently viewed.
 */
export function getViewedWarnings() {
    return viewedWarnings;
}

/**
 * Saves the contents of viewedWarnings to local storage.
 */
async function saveViewedWarnings() {
    try {
        // We have to convert the Map into an array of tuples so it can be stored as an object.
        const arrayFrom: Array<{key: string, value: string}> = [];
        viewedWarnings.forEach((value, key) => {
            arrayFrom.push({key, value: value.toJSON()});
        });

        // Convert our array to a string and then store it.
        await setItem("viewedWarnings", JSON.stringify(arrayFrom));
    } catch (err) {
        // Nothing we can do from this error.
    }
}

/**
 * Loads contents from local storage into viewedWarnings.
 */
export async function loadViewedWarnings() {
    try {
        // Get our viewed warnings in string form from storage.
        const viewedWarningsString = await getItem("viewedWarnings");
        const now = new Date();

        // If this is null, we have never stored any viewed warnings.
        if (viewedWarningsString !== null) {
            viewedWarnings = new Map();

            // Convert our string back into an array of tuples.
            const viewedWarningsObject = JSON.parse(viewedWarningsString) as Array<{key: string, value: string}>;

            // Loop through the array, only adding elements to the map if their date < 8 days old.
            viewedWarningsObject.forEach((element) => {
                const date = new Date(element.value);
                if (datetimeDifference(now, date).days < 8) {
                    viewedWarnings.set(element.key, date);
                }
            });
        } else {
            viewedWarnings = new Map();
        }
    } catch (err) {
        // Nothing we can do, just create a new Map.
        viewedWarnings = new Map();
    }

}

/**
 * This listener will be called when the apps state changes.
 */
AppState.addEventListener("change", (nextAppState) => {
    if (nextAppState === "background" || nextAppState === "inactive") {
        saveViewedWarnings();
        return;
    }
});
