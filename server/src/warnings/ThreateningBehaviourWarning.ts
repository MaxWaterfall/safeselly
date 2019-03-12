import { Warning } from "./Warning";

export class ThreateningBehaviourWarning extends Warning {
    /**
     * Override.
     * Threatening behaviour warnings have a starting relevance of 1.
     */
    protected readonly initialRelevance = 1;
}
