import React, {Component} from "react";
import {Platform, StyleSheet, Text, View} from "react-native";
import Register, {State} from "./components/register/RegisterComponent";

interface IState {
    registered: boolean;
    registerComponent: JSX.Element;
}
export default class App extends Component<{}, IState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            registered: false,
            registerComponent: <Register 
                registrationComplete={(username, deviceToken, accessToken) => {
                    this.registrationComplete(username, deviceToken, accessToken)
                }}
            />,
        };
    }

    public registrationComplete(username: string, deviceToken: string, accessToken: string) {
        this.setState({
            registered: true,
        });
        // Store username, deviceId and access token.
    }

    public render() {
        if (!this.state.registered) {
            return (
                this.state.registerComponent
            );
        }
        return (
            <View>
                <Text>Registered!</Text>
            </View>
        );
    }
}
