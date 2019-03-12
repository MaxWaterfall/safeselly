import { IWarning } from "../../../shared/Warnings";

/**
 * The type of notification it is.
 */
export enum NotificationType {
    USER_SUBMITTED,
    SERVER_GENERATED,
}

export interface INotification {
    type: NotificationType;
    warning?: IWarning;
    title: string;
    body: string;
    dateTimeAdded: Date;
}
