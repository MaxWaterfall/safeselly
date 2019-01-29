import { IGeneralWarning, IWarning, WarningType } from "../helper/Warnings";
import { makeAuthenticatedRequest } from "./NetworkService";

const SELLY_OAK_LAT = 52.436720;
const SELLY_OAK_LONG = -1.939000;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = 0.0421;

export const initialRegion = {
    latitude: SELLY_OAK_LAT,
    longitude: SELLY_OAK_LONG,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
};

/**
 * Retrieves warnings from the server.
 */
export async function getInitialWarnings(): Promise<IWarning[]> {
    let warnings;
    try {
        warnings = await makeAuthenticatedRequest("GET", "/warning/", {});
    } catch (err) {
        throw err;
    }

    return warnings;
}

/**
 * Retrieves all warnings from the server after a given warning id.
 */
export async function getWarnings(warningId: string): Promise<IWarning[]> {
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
export async function getWarningInformation(warningId: string, warningType: WarningType) {
    try {
        if (warningType === "general") {
            return await makeAuthenticatedRequest("GET", `/warning/${warningId}`, {}) as IGeneralWarning;
        }
    } catch (err) {
        throw err;
    }
}
