export const MAX_PEOPLE_DESCRIPTION_LENGTH = 300;
export const MAX_WARNING_DESCRIPTION_LENGTH = 300;
export const MIN_WARNING_DESCRIPTION_LENGTH = 20;
export const SELLY_OAK_LAT = 52.436720;
export const SELLY_OAK_LONG = -1.939000;
export const DISTANCE_FROM_SELLY_OAK = 5000; // 5km.

export interface IVote {
    upvotes: number,
    downvotes: number,
}

export type WarningType = 
    "general" | 
    "vandalism" | 
    "threatening behaviour" | 
    "assault" | 
    "burglary" | 
    "theft" | 
    "mugging" | 
    "suspicious behaviour" | 
    "harassment";

export type WarningInformationType = IGeneralWarning;

/**
 * The information required to submit a warning.
 */
export interface ISubmissionWarning {
    type: WarningType;
    location: {
        lat: number;
        long: number;
    };
    dateTime: string;
    information: WarningInformationType;
}

/**
 * The information that is given when the client requests a set of warnings.
 * This information is also given when the user is notified of a warning.
 */
export interface IReturnWarning {
    warningId: string;
    type: WarningType;
    location: {
        lat: number;
        long: number;
    }
    dateTime: string;
}

/**
 * The information that is given when the client requests information for a specific warning.
 */
export interface ISpecificReturnWarning {
    information: WarningInformationType;
    votes: IVote;
    userVoted: boolean;
    userSubmitted: boolean;
}

/**
 * The information required for a general warning.
 */
export interface IGeneralWarning {
    peopleDescription: string;
    warningDescription: string;
}

/**
 * Checks a warning meets all the rules required for it to be valid.
 * Throws an error if the warning is not valid.
 * @param warning the warning to be validated.
 */
export function validateWarning(warning: ISubmissionWarning) {
    // Check IWarning members are correct types.
    if (typeof warning.type !== "string") {
        throwIsNotValidError("type");
    }

    if (typeof warning.location === undefined) {
        throwIsNotValidError("location");
    }

    if (typeof warning.location.lat !== "number") {
        throwIsNotValidError("lat");
    }

    if (typeof warning.location.long !== "number") {
        throwIsNotValidError("long");
    }

    if (typeof warning.dateTime !== "string") {
        throwIsNotValidError("warningDateTime");
    }

    if (getPriorityForWarningType(warning.type) === -1) {
        throwIsNotValidError("type");
    }

    validateGeneralWarning(warning.information);
}

/**
 * Checks a general warning is valid.
 * @param warning
 */
function validateGeneralWarning(warning: IGeneralWarning) {
    // Check they are the correct types.
    if (typeof warning.peopleDescription !== "string") {
        throwIsNotValidError("peopleDescription");
    }

    if (typeof warning.warningDescription !== "string") {
        throwIsNotValidError("warningDescription");
    }

    if (warning.peopleDescription.length > MAX_PEOPLE_DESCRIPTION_LENGTH) {
        throw new Error(
            `Description of persons must be less than ${MAX_PEOPLE_DESCRIPTION_LENGTH} characters.`);
    }

    if (warning.warningDescription.length > MAX_WARNING_DESCRIPTION_LENGTH) {
        throw new Error(
            `Description of incident must be less than ${MAX_WARNING_DESCRIPTION_LENGTH} characters.`);
    }

    if (warning.warningDescription.length < MIN_WARNING_DESCRIPTION_LENGTH) {
        throw new Error(
            `Description of incident must be more than ${MIN_WARNING_DESCRIPTION_LENGTH} characters.`);
    }
}

/**
 * Returns the priority of the given warning type.
 * 1 = High, 2 = Normal, 3 = Low
 * @param type
 */
export function getPriorityForWarningType(type: WarningType) {
    switch (type) {
        case "general": return 2;
        case "vandalism": return 3;
        case "threatening behaviour": return 1;
        case "assault": return 1;
        case "burglary": return 2;
        case "theft": return 3;
        case "mugging": return 1;
        case "suspicious behaviour": return 3;
        case "harassment": return 2;
        default: return -1;
    }
}

/**
 * Throws an error which shows the user what part of the warning is invalid.
 */
function throwIsNotValidError(name: string) {
    throw new Error(`'${name}' is not valid.`); 
}


