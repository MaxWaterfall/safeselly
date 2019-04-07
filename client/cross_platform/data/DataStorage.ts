import { AsyncStorage } from "react-native";

/**
 * Adds an item into persistent local storage.
 * @param key
 * @param value
 */
export async function setItem(key: string, value: string) {
    try {
       await AsyncStorage.setItem(key, value);
    } catch (err) {
        throw err;
    }
}

/**
 * Gets an item from persistent local storage.
 * @param key
 */
export async function getItem(key: string) {
    try {
        const ret = await AsyncStorage.getItem(key);
        if (ret === null) {
            throw new Error(`No value exists for key: ${key}.`);
        }
        return ret;
    } catch (err) {
        throw err;
    }
}
