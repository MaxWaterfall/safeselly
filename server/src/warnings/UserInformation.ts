import { Location } from "../../../shared/Warnings";

/**
 * The information about a user that is used to determine a warnings' relevance.
 */
export default interface IUserInformation {
    lastKnownLocation: Location;
    homeLocation: Location;
    frequentLocations: Location[];
    gender: "MALE" | "FEMALE" | "UNKNOWN";
    ownsBicycle: boolean;
    ownsCar: boolean;
    ownsLaptop: boolean;
}
