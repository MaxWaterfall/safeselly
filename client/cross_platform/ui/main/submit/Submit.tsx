import React, { Component } from "react";
import { createAppContainer, createStackNavigator } from "react-navigation";
import ChooseLocation from "./ChooseLocation";
import EnterInformation from "./EnterInformation";
import Introduction from "./Introduction";

export default class Submit extends Component {
    public render() {
        return <SubmitContainer/>;
    }
}

const SubmitNavigator = createStackNavigator(
    {
        Introduction: {screen: Introduction},
        ChooseLocation: {screen: ChooseLocation},
        EnterInformation: {screen: EnterInformation},
    },
    {
        initialRouteName: "Introduction",
    },
);
const SubmitContainer = createAppContainer(SubmitNavigator);
