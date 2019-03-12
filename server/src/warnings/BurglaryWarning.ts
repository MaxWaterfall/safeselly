import { Location } from "../../../shared/Warnings";
import { Warning } from "./Warning";

export class BurglaryWarning extends Warning {
    /**
     * Override LOWER_DISTANCE to 100m.
     */
    protected readonly LOWER_DISTANCE = 100;
    /**
     * Override UPPER_DISTANCE to 200m.
     */
    protected readonly UPPER_DISTANCE = 200;

    // Override.
    protected locationCheck() {
        // Check if this warning was near the users' home location only.
        if (this.userInfo!.homeLocation !== undefined &&
            this.isLocationWithinLowerDistance(this.userInfo!.homeLocation as Location)) {
            return;
        }

        if (this.userInfo!.homeLocation !== undefined &&
            this.isLocationWithinUpperDistance(this.userInfo!.homeLocation as Location)) {
            return;
        }
    }
}
