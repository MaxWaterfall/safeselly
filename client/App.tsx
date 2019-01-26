import { Root } from "native-base";
import React, {Component} from "react";
import {
    createAppContainer,
    createStackNavigator,
} from "react-navigation";
import Main from "./cross_platform/ui/main/Main";
import Register from "./cross_platform/ui/registration/Register";

/**
 * This component is the root component of the entire app.
 */
export default class App extends Component {
    // TODO: Load the registration state from disk.
    public render() {
        return (
            <Root>
                <AppContainer/>
            </Root>
        );
    }
}
const AppNavigator = createStackNavigator(
    {
        Register: {screen: Register},
        Main: {screen: Main},
    },
    {
        headerMode: "none",
        initialRouteName: "Main",
    },
);
const AppContainer = createAppContainer(AppNavigator);
