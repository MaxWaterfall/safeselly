import { Root } from "native-base";
import React, {Component} from "react";
import {
    createAppContainer,
    createStackNavigator,
} from "react-navigation";
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
    },
    {
        headerMode: "none",
        initialRouteName: "Register",
    },
);
const AppContainer = createAppContainer(AppNavigator);
