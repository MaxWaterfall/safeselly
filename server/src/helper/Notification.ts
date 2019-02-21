import { IReturnWarning, Priority } from "../../../shared/Warnings";

/**
 * The type of notification it is.
 */
export enum NotificationType {
    USER_SUBMITTED,
    SERVER_GENERATED,
}

export interface INotification {
    priority: Priority;
    type: NotificationType;
    warning?: IReturnWarning;
    title: string;
    body: string;
    dateTimeAdded: Date;
}
