import { Component } from "react";
import React from "react";
import {makeRequest, handleNetworkError} from "../../helper/Network";
import { EnterUsername, WaitForConfirmation } from "./StatelessComponents";
import { ActivityIndicator, View, BackHandler } from "react-native";
import {UserCredentials} from "./../../helper/UserCredentials";

export enum State {
    ENTER_USERNAME,
    LOADING,
    WAIT_FOR_CONFIRMATION
}

interface IProps {
    registrationComplete(credentials: UserCredentials): void,
    styles: any,
}
interface IState {
    myState: State;
    username: string;
}
/**
 * Component is used to register a user. 
*/
class Register extends Component<IProps, IState> {
    private deviceToken = "";
    private accessToken = "";

    constructor(props: IProps) {
        super(props);
        this.state = {
            myState: State.ENTER_USERNAME,
            username: "", // Username needs to be in state because a UI component uses it.
        }
        BackHandler.addEventListener("hardwareBackPress", () => this.handleBackPress());
    }

    /**
     * Handles when the user clicks the back button.
     */
    private handleBackPress() {
        if (this.state.myState === State.ENTER_USERNAME) {
            //TODO: Ask user if they wish to quit application.
            return false;
        } else if (this.state.myState === State.WAIT_FOR_CONFIRMATION) {
            this.changeState(State.ENTER_USERNAME);
            return true;
        }

        // myState === LOADING, do nothing.
        return true;
    }

    // Called when this component will be removed from the DOM.
    public componentWillUnmount() {
        BackHandler.removeEventListener("hardwareBackPress", () => this.handleBackPress());
    }

    private updateUsername(username: string): void {
        this.setState({
            username: username
        });
    }

    /**
     * Starts the registration process, requesting a device token and confirmation email.
     */
    private async startRegistration() {
        this.changeState(State.LOADING);
        try {
            await this.getDeviceToken();
            await this.sendConfirmationEmail();

            // Confirmation email has been sent.
            this.changeState(State.WAIT_FOR_CONFIRMATION);
        } catch (err) {
            handleNetworkError(err);
            this.changeState(State.ENTER_USERNAME);
        }
    }

    private async getDeviceToken() {
        try {
            let response = await makeRequest("POST", "/access/device", false, {
                username: this.state.username,
            });
            this.deviceToken = response.device_token;
        } catch (err) {
            throw err;
        }
    }

    private async sendConfirmationEmail() {
        try {
            await makeRequest("POST", "/access/email", false, {
                username: this.state.username,
                device_token: this.deviceToken,
            });
        } catch (err) {
            throw err;
        }
    }

    private async getAccessToken() {
        this.changeState(State.LOADING);
        try {
            let response = await makeRequest("POST", "/access/token", false, {
                username: this.state.username,
                device_token: this.deviceToken,
            });
            console.log("TOKEN: " + response.access_token);
            console.log("RESPONSE: " + JSON.stringify(response));
            this.accessToken = response.access_token;
            this.changeState(State.ENTER_USERNAME); // Reset state incase we need to register again.
            this.props.registrationComplete({
                username: this.state.username,
                deviceToken: this.deviceToken,
                accessToken: this.accessToken,
            });
        } catch (err) {
            handleNetworkError(err);
            this.changeState(State.WAIT_FOR_CONFIRMATION);
        }
    }
    /**
     * Whether a component should be disabled or not.
     */
    private shouldDisable(): boolean {
        return this.state.myState === State.LOADING;        
    }

    /**
     * Changes this components current state.
     * @param newState 
     */
    private changeState(newState: State) {
        this.setState({
            myState: newState,
        })
    }

    public render() {
        if (this.state.myState === State.ENTER_USERNAME) {
            return <EnterUsername 
                username={this.state.username}
                updateUsername={(username) => this.updateUsername(username)}
                startRegistration={() => this.startRegistration()}
                shouldDisable={() => this.shouldDisable()}
                styles={this.props.styles}
            />
        } else if (this.state.myState === State.WAIT_FOR_CONFIRMATION) {
            return <WaitForConfirmation
                username={this.state.username}
                confirmRegistration={() => this.getAccessToken()}
                goBack={() => this.changeState(State.ENTER_USERNAME)}
                shouldDisable={() => this.shouldDisable()}
                styles={this.props.styles}
            />
        }

        // myState === State.LOADING
        return (
            <View style={this.props.styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }
}

export default Register;