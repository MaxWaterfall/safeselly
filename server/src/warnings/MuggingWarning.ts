import { Warning } from "./Warning";

export class MuggingWarning extends Warning {
    /**
     * Override.
     * Mugging warnings have a starting relevance of 1.
     */
    protected readonly initialRelevance = 1;
}
