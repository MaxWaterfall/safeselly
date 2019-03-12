import { IWarning } from "../../../shared/Warnings";
import { Warning } from "./Warning";

export class TheftWarning extends Warning {
    protected static readonly CAR_KEYWORDS = [
        "car", "vehicle", "van", "jeep",
    ];

    protected static readonly BICYCLE_KEYWORDS = [
        "bicycle", "bike",
    ];

    protected static readonly LAPTOP_KEYWORDS = [
        "laptop", "mac", "book", "computer",
    ];

    protected description: string;
    /**
     * Whether or not a car was stolen in this warning.
     */
    protected containsCar: boolean = false;
    /**
     * Whether or not a bicycle was stolen in this warning.
     */
    protected containsBicycle: boolean = false;
    /**
     * Whether or not a laptop was stolen in this warning.
     */
    protected containsLaptop: boolean = false;

    // Override.
    public constructor(warning: IWarning) {
        // We only accept ISubmissionWarning, as this has the specific warning information required.
        super(warning);
        // Extract the warning and convert it to lower case.
        this.description = warning.information.warningDescription.toLowerCase();
        this.checkForKeywords();
    }

    /**
     * Checks whether the warning contains key words that may indicate what items were stolen.
     */
    protected checkForKeywords() {
        this.containsCar = new RegExp(TheftWarning.CAR_KEYWORDS.join("|")).test(this.description);
        this.containsBicycle = new RegExp(TheftWarning.BICYCLE_KEYWORDS.join("|")).test(this.description);
        this.containsLaptop = new RegExp(TheftWarning.LAPTOP_KEYWORDS.join("|")).test(this.description);
    }

    // Override.
    protected ownsCheck() {
        // Check whether the user owns the item stolen.
        if (this.containsCar && this.userInfo!.ownsCar) {
            this.relevance += 1;
            return;
        }

        if (this.containsBicycle && this.userInfo!.ownsBicycle) {
            this.relevance += 1;
            return;
        }

        if (this.containsLaptop && this.userInfo!.ownsLaptop) {
            this.relevance += 1;
            return;
        }
    }
}
