import { Alert, AppState, AppStateStatus } from "react-native";
import firebase from "react-native-firebase";
import { Notification, NotificationOpen } from "react-native-firebase/notifications";
import { IWarning } from "../../../shared/Warnings";
import { makeAuthenticatedRequest } from "./NetworkService";
import {isRegistered} from "./RegistrationService";

let currentAppState: AppStateStatus = "active";

interface IListenerList {
    name: string;
    callback: (data: IWarning) => void;
}

/**
 * List of functions that are called when a user receives a notification.
 */
let notificationReceivedListeners: IListenerList[] = [];
/**
 * List of functions that are called when the user opens a notification.
 */
let notificationOpenedListeners: IListenerList[] = [];
let registered = false;

/**
 * Sets up the app so that it's ready to receive notifications.
 */
export async function setUp() {

    registered = await isRegistered() as boolean;
    if (!registered) {
        // This should never happen. Method should only be called from ViewAllWarnings.
        return;
    }

    // Check if the user has permission.
    let enabled;
    try {
        enabled = await firebase.messaging().hasPermission();
    } catch (err) {
        // Nothing we can do here.
    }

    if (!enabled) {
        // We don't have permission, request it.
        try {
            await firebase.messaging().requestPermission();
            // User has authorised.
        } catch (err) {
            // User has rejected permissions.
            throw new Error("You must give permission.");
        }
    }

    setUpTopics();
    setUpChannel();
    setUpFCMToken();
    setUpListeners();
}

/**
 * Subscribes this user to the relevant topics.
 * This means it can receive notifications for these topics.
 */
function setUpTopics() {
    firebase.messaging().subscribeToTopic("testing");
}

/**
 * Creates the channel that the device will receive notifications through.
 */
function setUpChannel() {
    // Build the channel.
    const channel = new
        firebase.notifications.Android.Channel(
            "main-channel",
            "Main Channel",
            firebase.notifications.Android.Importance.Max,
        ).setDescription("Apps' main channel.");

    // Create the channel.
    firebase.notifications().android.createChannel(channel);
}

/**
 * Gets the FCM token from firebase and sends it to the server.
 */
async function setUpFCMToken() {
    const fcmToken = await firebase.messaging().getToken();
    if (fcmToken) {
        // Send token to server.
        makeAuthenticatedRequest("POST", "/user/fcm-token", {
            fcm_token: fcmToken,
        })
            .catch((err) => {
                // Do nothing.
            });
    }
}

/**
 * Called when the fcm token changes.
 */
firebase.messaging().onTokenRefresh((fcmToken) => {
    // Send fcm token to server.
    makeAuthenticatedRequest("POST", "/user/fcm-token", {
        fcm_token: fcmToken,
    })
        .catch((err) => {
            // Do nothing.
        });
});

/**
 * Adds a function the the notificationReceivedListener list.
 * @param name
 * @param callback
 */
export function addNotificationReceivedListener(name: string, callback: (warning: IWarning) => void) {
    notificationReceivedListeners.push({name, callback});
}

/**
 * Removes a function the the notificationReceivedListener list.
 * @param name
 */
export function removeNotificationReceivedListener(name: string) {
    notificationReceivedListeners = notificationReceivedListeners.filter((value) => {
        return value.name !== name;
    });
}

/**
 * Adds a function the the notificationOpenedListener list.
 * @param callback
 */
export function addNotificationOpenedListener(name: string, callback: (warning: IWarning) => void) {
    notificationOpenedListeners.push({name, callback});
}

/**
 * Removes a function the the notificationOpenedListener list.
 * @param callback
 */
export function removeNotificationOpenedListener(name: string) {
    notificationOpenedListeners = notificationOpenedListeners.filter((value) => {
        return value.name !== name;
    });
}

function setUpListeners() {
    /**
     * Called when any notification is received on the device.
     */
    firebase.notifications().onNotification((notification: Notification) => {
        if (!registered) {
            return;
        }

        if (currentAppState === "active") {
            // Display the notification (not default behaviour).
            // Create the notification.
            const notif = new firebase.notifications.Notification()
                .setNotificationId(notification.notificationId)
                .setTitle(notification.title)
                .setBody(notification.body)
                .setData(notification.data);

            // Set channel Id.
            notif.android.setChannelId("main-channel");

            // Set icons.
            notif.android.setSmallIcon("@drawable/ic_stat_ss");

            // Set to cancel when user opens it.
            notif.android.setAutoCancel(true);

            // Show notification.
            firebase.notifications().displayNotification(notif);
        }

        const warning: IWarning = JSON.parse(notification.data.warning) as IWarning;

        // Call all listeners.
        for (const listener of notificationReceivedListeners) {
            listener.callback(warning);
        }
    });

    /**
     * Called when any notification is opened by the user (when app is in background/foreground).
     */
    firebase.notifications().onNotificationOpened((notificationOpen: NotificationOpen) => {
        if (!registered) {
            return;
        }

        const warning = JSON.parse(notificationOpen.notification.data.warning) as IWarning;

        // Call all opened listeners.
        for (const listener of notificationOpenedListeners) {
            listener.callback(warning);
        }
    });
}

AppState.addEventListener("change", (nextAppState) => {
    currentAppState = nextAppState;
});
