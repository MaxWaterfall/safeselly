import { AsyncStorage } from "react-native";
//@ts-ignore - library does not have any type definitions.
import * as jc from "json-cycle";

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
        let ret = await AsyncStorage.getItem(key);
        if (ret === null) {
            throw new Error(`No value exists for key: ${key}.`);
        }
        return ret;
    } catch (err) {
        throw err;
    }
}

/**
 * Saves the state of a component into local storage.
 */
export async function saveComponentState(key: string, state: {}) {
    try {
        await setItem(key, jc.stringify(state));
     } catch (err) {
         throw err;
     }
}

/**
 * Loads the component state and returns it.
 */
export async function loadComponentState(key: string) {
    try {
        let ret = await (getItem(key));
        return JSON.parse(ret);
     } catch (err) {
         throw err;
     }
}