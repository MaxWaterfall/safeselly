import { isPointInCircle } from "geolib";
import { HttpRequestError } from "./HttpRequestError";
import * as log from "./Logger";

const MAX_PEOPLE_DESCRIPTION_LENGTH = 300;
const MAX_WARNING_DESCRIPTION_LENGTH = 500;
const SELLY_OAK_LAT = 52.436720;
const SELLY_OAK_LONG = -1.939000;
const DISTANCE_FROM_SELLY_OAK = 5000; // 5km.

export type warningType = "general";

/**
 * The base interface, used for all warnings.
 */
export interface IWarning {
    type: warningType;
    location: {
        lat: number;
        long: number;
    };
    dateTime: string;
    information: IGeneralWarning;
}

/**
 * Checks a warning meets all the rules required for it to be valid.
 * Throws an error if the warning is not valid.
 * @param warning the warning to be validated.
 */
export function validateWarning(warning: IWarning) {
    // Check IWarning members are correct types.
    if (typeof warning.type !== "string") {
        throwError("type");
    }

    if (typeof warning.location === undefined) {
        throwError("location");
    }

    if (typeof warning.location.lat !== "number") {
        throwError("lat");
    }

    if (typeof warning.location.long !== "number") {
        throwError("long");
    }

    if (typeof warning.dateTime !== "string") {
        throwError("warningDateTime");
    }

    // Check location is within bounds.
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

    // Check information member.
    if (warning.type === "general") {
        validateWarningGeneral(warning.information);
    } else {
        throwError("type");
    }
}

// IGeneralWarning -------------------------------------------------------------------------------
export interface IGeneralWarning {
    peopleDescription: string;
    warningDescription: string;
}

function validateWarningGeneral(warning: IGeneralWarning) {
    // Check they are the correct types.
    if (typeof warning.peopleDescription !== "string") {
        throwError("peopleDescription");
    }

    if (typeof warning.warningDescription !== "string") {
        throwError("warningDescription");
    }

    if (warning.peopleDescription.length > MAX_PEOPLE_DESCRIPTION_LENGTH) {
        throw new HttpRequestError(400,
            `People description length is more than ${MAX_PEOPLE_DESCRIPTION_LENGTH} characters.`);
    }

    if (warning.warningDescription.length > MAX_WARNING_DESCRIPTION_LENGTH) {
        throw new HttpRequestError(400,
            `Warning description length is more than ${MAX_WARNING_DESCRIPTION_LENGTH} characters.`);
    }
}
// IGeneralWarning -------------------------------------------------------------------------------

/**
 * Throws an error which shows the user what part of the warning is invalid.
 */
function throwError(name: string) {
    throw new HttpRequestError(400, `'${name}' is not valid.`);
}
