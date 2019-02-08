import React, { Component } from "react";
import {
    createAppContainer,
    createStackNavigator,
} from "react-navigation";
import SubmitFeedback from "./SubmitFeedback";

export default class Feedback extends Component {
    public render() {
        return <FeedbackContainer/>;
    }
}

const FeedbackNavigator = createStackNavigator(
    {
        SubmitFeedback: {screen: SubmitFeedback},
    },
    {
        initialRouteName: "SubmitFeedback",
    },
);
const FeedbackContainer = createAppContainer(FeedbackNavigator);
