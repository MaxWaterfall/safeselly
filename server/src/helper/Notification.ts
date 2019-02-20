import { IReturnWarning } from "../../../shared/Warnings";

/**
 * How important the notification is.
 */
export enum Priority {
    HIGH = 1,
    NORMAL = 2,
    LOW = 3,
}

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
