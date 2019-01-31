import React, { Component } from "react";
import { createAppContainer, createStackNavigator } from "react-navigation";
import ChooseLocation from "./ChooseLocation";
import Introduction from "./Introduction";
import EnterInformation from "./EnterInformation";

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
