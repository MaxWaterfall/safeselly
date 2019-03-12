import { Warning } from "./Warning";

export class AssaultWarning extends Warning {
    /**
     * Override.
     * Assault warnings have a starting relevance of 1.
     */
    protected readonly initialRelevance = 1;
}
