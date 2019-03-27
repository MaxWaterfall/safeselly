import { Warning } from "./Warning";

export class HarassmentWarning extends Warning {
    // Override.
    protected genderCheck() {
        if (this.userInfo!.gender === "FEMALE") {
            this.relevance += 1;
        }
    }
}
