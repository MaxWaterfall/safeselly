import { Permission, PermissionsAndroid, Rationale } from "react-native";

export async function hasPermission(permission: Permission) {
    try {
        return await PermissionsAndroid.check(permission);
    } catch (err) {
        return false;
    }
}

export async function requestLocationPermission() {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: "Location Permission",
                message:
                    "Safe Selly uses your location so you can see where you are on the map." +
                    " Your location data is never sent to the server.",
            },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            return true;
        }

        return false;
    } catch (err) {
        // Nothing we can do here.
    }
}
