// @ts-ignore No type definitions exist for this library.
import datetimeDifference from "datetime-difference";
import FastPriorityQueue from "fastpriorityqueue";
import schedule from "node-schedule";
import { getPriorityForWarningType, Priority } from "../../../shared/Warnings";
import { sendNotificationToAll } from "../services/NotificationService";
import * as log from "./Logger";
import { INotification, NotificationType } from "./Notification";

/**
 * How old a warning can be before it will no longer be pushed as a notification instantly.
 */
const MAX_INSTANT_NOTIFICATION_TIME = 60;
/**
 * The maximum amount of notifications a user can receive per day.
 */
const MAX_NOTIFICATIONS_PER_DAY = 5;
/**
 * The maximum amount of time a notification can be in the queue for (in minutes).
 * Currently set to 1 day.
 */
const MAX_TIME_IN_QUEUE = 24 * 60;
/**
 * The number of notifications that have been sent today.
 */
let notificationsSentToday = 0;

/**
 * Set up the priority queue, giving it the comparison function.
 */
const queue = new FastPriorityQueue((a: INotification, b: INotification) => {
    return a.priority < b.priority;
});
setUpSchedules();

/**
 * Adds a new notification to the queue or sends it immediately.
 * @param notification
 */
export async function addNotification(notification: INotification) {
    if (notification.type === NotificationType.USER_SUBMITTED) {
        if (shouldSendNow(notification)) {
            try {
                await sendNotificationToAll(notification);
                notificationSent();
            } catch (err) {
                // Failed to send notification, add to queue.
                queue.add(notification);
            }
            return;
        }

        if (!shouldAddToQueue(notification)) {
            return;
        }
    }

    queue.add(notification);
}

/**
 * Schedules functions to run jobs later on.
 */
function setUpSchedules() {
    // We want to run the queue jobs every 2 hours between 8AM and 8PM.
    schedule.scheduleJob("queueJob", "0 8-20/2 * * *", queueJobs);
    // We want to reset notifications sent per day at 12pm every day.
    schedule.scheduleJob("resetNotificationsSent", "* 12 * * *", () => {
        notificationsSentToday = 0;
        log.info("Reset notifications sent today.");
    });
}

/**
 * Deletes old notifications then tries to send the top notification in the queue.
 */
function queueJobs() {
    log.info("Running queue jobs.");
    removeOldNotifications();
    sendWaitingNotification();
}

/**
 * Removes old notifications from the queue.
 */
function removeOldNotifications() {
    queue.removeMany((a: INotification) => {
        const minutesFromNow = getMinutesFromNow(a.dateTimeAdded);
        if (minutesFromNow > MAX_TIME_IN_QUEUE) {
            return true;
        }
        return false;
    });
}

/**
 * Sends the top waiting notification to users.
 */
async function sendWaitingNotification() {
    if (queue.isEmpty()) {
        return;
    }

    try {
        const top = queue.poll() as INotification;
        await sendNotificationToAll(top);
        notificationSent();
    } catch (err) {
        log.error(err);
    }
}

/**
 * Updates the number of notifications sent today and removes the notification from the queue.
 * @param notification
 */
function notificationSent() {
    notificationsSentToday += 1;
    log.info("Notifications sent today: " + notificationsSentToday);

    queue.forEach((value) => {
        log.info(value.warning!.type);
    });

    log.info("Next notification: " + JSON.stringify(queue.peek()));
}

/**
 * Checks if a notification that is a user submitted warning should be sent now.
 * @param notification
 */
function shouldSendNow(notification: INotification) {
    const minutesFromNow = getMinutesFromNow(new Date(notification.warning!.dateTime));
    if (minutesFromNow > MAX_INSTANT_NOTIFICATION_TIME || minutesFromNow < 0) {
        return false;
    }

    const priority = getPriorityForWarningType(notification.warning!.type);
    if (priority < Priority.LOW) {
        // Send right now, priority is medium or high.
        return true;
    }

    if (notificationsSentToday < MAX_NOTIFICATIONS_PER_DAY) {
        return true;
    }

    return false;
}

/**
 * Checks if a notification that is a user submitted warning should be added to the queue.
 * @param notification
 */
function shouldAddToQueue(notification: INotification) {
    const minutesFromNow = getMinutesFromNow(new Date(notification.warning!.dateTime));
    if (minutesFromNow < MAX_TIME_IN_QUEUE && minutesFromNow > -1) {
        return true;
    }

    return false;
}

/**
 * Returns the amount of minutes that have passed from the given time.
 * Returns -1 if the date given is more than a month old.
 * @param date
 */
function getMinutesFromNow(date: Date) {
    const MINUTES_IN_HOUR = 60;
    const MINUTES_IN_DAY = MINUTES_IN_HOUR * 24;
    const now = new Date();
    const diff = datetimeDifference(date, now);

    if (diff.years > 0) {
        return -1;
    }

    if (diff.months > 0) {
        return -1;
    }

    let minutesPassed = 0;

    minutesPassed += diff.minutes;
    minutesPassed += diff.hours * MINUTES_IN_HOUR;
    minutesPassed += diff.days * MINUTES_IN_DAY;

    return minutesPassed;
}
