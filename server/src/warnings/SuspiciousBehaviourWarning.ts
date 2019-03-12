import { TheftWarning } from "./TheftWarning";

/**
 * SuspiciousBehaviourWarning is exactly the same as TheftWarning in terms of functionality.
 * A separate class has been created to make the code more readable and to make it
 * easier to make specific changes in the future.
 */
export class SuspiciousBehaviourWarning extends TheftWarning {}
