import React, { Component } from "react";
import { createAppContainer, createStackNavigator } from "react-navigation";
import ViewAllWarnings from "./ViewAllWarnings";
import ViewSingleWarning from "./ViewSingleWarning";

export default class View extends Component {
    public render() {
        return <ViewContainer/>;
    }
}

const ViewNavigator = createStackNavigator(
    {
        ViewAllWarnings: {screen: ViewAllWarnings},
        ViewSingleWarning: {screen: ViewSingleWarning},
    },
    {
        initialRouteName: "ViewAllWarnings",
    },
);
const ViewContainer = createAppContainer(ViewNavigator);
