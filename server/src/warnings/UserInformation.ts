import { Location } from "../../../shared/Warnings";

/**
 * The information about a user that is used to determine a warnings' relevance.
 */
export default interface IUserInformation {
    username: string;
    lastKnownLocation: Location | undefined;
    homeLocation: Location | undefined;
    frequentLocations: Location[];
    gender: "MALE" | "FEMALE" | "UNKNOWN";
    ownsBicycle: boolean;
    ownsCar: boolean;
    ownsLaptop: boolean;
}
