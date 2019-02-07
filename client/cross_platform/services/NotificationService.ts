import { Alert, AppState, AppStateStatus } from "react-native";
import firebase from "react-native-firebase";
import { Notification, NotificationOpen } from "react-native-firebase/notifications";
import { IReturnWarning } from "../../../shared/Warnings";
import { makeAuthenticatedRequest } from "./NetworkService";

let currentAppState: AppStateStatus = "active";
let viewAllWarningsListener: (data: IReturnWarning) => void;

/**
 * Sets up the app so that it's ready to receive notifications.
 */
export async function setUp() {
    // Check if the user has permission.
    let enabled;
    try {
        enabled = await firebase.messaging().hasPermission();
    } catch (err) {
        // Handle error.
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
    createNotificationListeners();
}

function setUpTopics() {
    firebase.messaging().subscribeToTopic("all");
}

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

async function setUpFCMToken() {
    const fcmToken = await firebase.messaging().getToken();
    if (fcmToken) {
        // Send token to server.
        makeAuthenticatedRequest("POST", "/user/fcm-token", {
            fcm_token: fcmToken,
        })
            .catch((err) => {
                // Do nothing for now.
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
            // Do nothing for now.
        });
});

/**
 * Allows components to listen for notifications.
 * @param name The name of component listening for the notification.
 * @param callback
 */
export function addNotificationListener(name: string, callback: (warning: IReturnWarning) => void) {
    if (name === "ViewAllWarnings") {
        viewAllWarningsListener = callback;
    }
}

function createNotificationListeners() {
    // Called when any notification is received on the device.
    firebase.notifications().onNotification((notification: Notification) => {
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

            // Show notification.
            firebase.notifications().displayNotification(notif);
        }
    });

    // Called when any notification is opened.
    firebase.notifications().onNotificationOpened((notificationOpen: NotificationOpen) => {
        const warning = JSON.parse(notificationOpen.notification.data.warning) as IReturnWarning;
        viewAllWarningsListener(warning);
    });
}

AppState.addEventListener("change", (nextAppState) => {
    currentAppState = nextAppState;
});
