import React, { Component } from "react";
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import ViewWarning from "./ViewWarning";
import SubmitWarning from "./SubmitWarning";

/**
 * This component is the parent component of all the main functionality of 
 * the app (everything except registration).
 */
export default class Main extends Component {
    constructor(props: {}) {
        super(props);
    }

    public render() {
        return <AppContainer/>
    }
}

const ViewWarningStack = createStackNavigator(
    {
        ViewWarning: ViewWarning,
    },
    {   
        headerMode: "none",
        navigationOptions: {
            header: null,
        }
    },
);
const SubmitWarningStack = createStackNavigator(
    {
        SubmitWarning: SubmitWarning,
    },
    {
        headerMode: "none",
        navigationOptions: {
            header: null,
        }
    },
);
const AppNavigator = createBottomTabNavigator(
    {
        ViewWarning: ViewWarningStack,
        SubmitWarning: SubmitWarningStack,
    },
    {
        initialRouteName: "ViewWarning",
    }
);
const AppContainer = createAppContainer(AppNavigator);
