import React, { Component } from "react";
import { createAppContainer, createStackNavigator, NavigationContainer } from "react-navigation";
import EnterUsername from "./EnterUsername";
import VerifyEmail from "./VerifyEmail";

/**
 * Parent component for all registration screens.
 */
export default class Register extends Component {
    private RegisterNavigator: NavigationContainer;
    private RegisterNavigatorContainer: NavigationContainer;

    constructor(props: any) {
        super(props);

        // Set up the navigator for the register screens.
        // We do this in the constructor so we can use props.
        this.RegisterNavigator = createStackNavigator(
            {
                EnterUsername: {screen: EnterUsername},
                VerifyEmail: {screen: VerifyEmail},
            },
            {
                initialRouteName: "EnterUsername",
            },
        );
        this.RegisterNavigatorContainer = createAppContainer(this.RegisterNavigator);
    }

    public render() {
        return <this.RegisterNavigatorContainer/>;
    }
}
