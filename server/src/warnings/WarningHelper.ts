import { Location } from "../../../shared/Warnings";
import { IWarning } from "../../../shared/Warnings";
import { AssaultWarning } from "./AssaultWarning";
import { BurglaryWarning } from "./BurglaryWarning";
import { GeneralWarning } from "./GeneralWarning";
import { HarassmentWarning } from "./HarassmentWarning";
import { MuggingWarning } from "./MuggingWarning";
import { SuspiciousBehaviourWarning } from "./SuspiciousBehaviourWarning";
import { TheftWarning } from "./TheftWarning";
import { ThreateningBehaviourWarning } from "./ThreateningBehaviourWarning";
import { VandalismWarning } from "./VandalismWarning";
import { Warning } from "./Warning";

/**
 * The information about a user that is used to determine a warnings' relevance.
 */
export interface IUserInformation {
    username: string;
    lastKnownLocation: Location | undefined;
    homeLocation: Location | undefined;
    frequentLocations: Location[];
    gender: "MALE" | "FEMALE" | "UNKNOWN";
    ownsBicycle: boolean;
    ownsCar: boolean;
    ownsLaptop: boolean;
}

/**
 * Creates a new warning based on the type of warning.
 * @param warning
 */
export function createWarning(warning: IWarning): Warning {
   switch (warning.type) {
       case "assault": return new AssaultWarning(warning);
       case "burglary": return new BurglaryWarning(warning);
       case "harassment": return new HarassmentWarning(warning);
       case "mugging": return new MuggingWarning(warning);
       case "threatening behaviour": return new ThreateningBehaviourWarning(warning);
       case "theft": return new TheftWarning(warning);
       case "vandalism": return new VandalismWarning(warning);
       case "suspicious behaviour": return new SuspiciousBehaviourWarning(warning);
       default: return new GeneralWarning(warning);
   }
}
