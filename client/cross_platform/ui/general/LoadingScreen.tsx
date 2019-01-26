import { Container } from "native-base";
import React from "react";
import {ActivityIndicator} from "react-native";
import { Centre } from "./StyleComponents";

export const LoadingScreen = () => {
    return (
        <Centre>
            <ActivityIndicator size="large" color="#0000ff" />
        </Centre>
    );
};
