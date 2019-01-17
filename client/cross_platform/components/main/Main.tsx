import React, { Component } from "react";
import { createAppContainer, createBottomTabNavigator, createStackNavigator } from "react-navigation";
import SubmitWarning from "./SubmitWarning";
import ViewWarning from "./ViewWarning";

/**
 * This component is the parent component of all the main functionality of
 * the app (everything except registration).
 */
export default class Main extends Component {
    constructor(props: {}) {
        super(props);
    }

    public render() {
        return <AppContainer/>;
    }
}

const ViewWarningStack = createStackNavigator(
    {
        ViewWarning,
    },
    {
        headerMode: "none",
        navigationOptions: {
            header: null,
        },
    },
);
const SubmitWarningStack = createStackNavigator(
    {
        SubmitWarning,
    },
    {
        headerMode: "none",
        navigationOptions: {
            header: null,
        },
    },
);
const AppNavigator = createBottomTabNavigator(
    {
        ViewWarning: ViewWarningStack,
        SubmitWarning: SubmitWarningStack,
    },
    {
        initialRouteName: "ViewWarning",
    },
);
const AppContainer = createAppContainer(AppNavigator);
