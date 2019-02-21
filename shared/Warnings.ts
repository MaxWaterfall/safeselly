export const MAX_PEOPLE_DESCRIPTION_LENGTH = 300;
export const MAX_WARNING_DESCRIPTION_LENGTH = 300;
export const MIN_WARNING_DESCRIPTION_LENGTH = 20;
export const SELLY_OAK_LAT = 52.436720;
export const SELLY_OAK_LONG = -1.939000;
export const DISTANCE_FROM_SELLY_OAK = 5000; // 5km.

/**
 * How important the warning is.
 */
export enum Priority {
    HIGH = 1,
    NORMAL = 2,
    LOW = 3,
}

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
    information: IWarningInformation;
}

/**
 * The information that is given when the client requests a set of warnings.
 * This information is also given when the user is notified of a warning.
 */
export interface IReturnWarning {
    warningId: string;
    type: WarningType;
    priority: number;
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
    information: IWarningInformation;
    votes: IVote;
    userVoted: boolean;
    userSubmitted: boolean;
}

/**
 * The specific information about the warning.
 */
export interface IWarningInformation {
    peopleDescription: string;
    warningDescription: string;
}

/**
 * Checks a warning meets all the rules required for it to be valid.
 * Throws an error if the warning is not valid.
 * @param warning the warning to be validated.
 */
export function validateWarning(warning: ISubmissionWarning) {
    // Check ISubmissionWarning members are correct types.
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

    validateWarningInformation(warning.information);
}

/**
 * Checks a warning information is valid.
 * @param warning
 */
function validateWarningInformation(warning: IWarningInformation) {
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
        case "general": return Priority.NORMAL;
        case "vandalism": return Priority.LOW;
        case "threatening behaviour": return Priority.HIGH;
        case "assault": return Priority.HIGH;
        case "burglary": return Priority.NORMAL;
        case "theft": return Priority.LOW;
        case "mugging": return Priority.HIGH;
        case "suspicious behaviour": return Priority.LOW;
        case "harassment": return Priority.NORMAL;
    }
}

/**
 * Throws an error which shows the user what part of the warning is invalid.
 */
function throwIsNotValidError(name: string) {
    throw new Error(`'${name}' is not valid.`); 
}


