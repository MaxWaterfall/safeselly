import React, {Component} from "react";
import {Text, View, ActivityIndicator, StyleSheet} from "react-native";
import Register  from "./components/register/Register";
import {UserCredentials, setUserCredentials} from "./helper/UserCredentials";

enum State {
    REGISTERING,
    LOADING,
    REGISTERED,
}
interface IState {
    myState: State;
    registerComponent: JSX.Element;
}
export default class App extends Component<{}, IState> {
    constructor(props: {}) {
        super(props);
        this.state = {
            myState: State.REGISTERING,
            registerComponent: <Register 
                registrationComplete={(credentials) => {
                    this.registrationComplete(credentials);
                }}
                styles={styles}
            />,
        };
    }

    private changeState(newState: State) {
        this.setState({
            myState: newState,
        });
    }

    /**
     * Stores the users credentials and changes the state of the application.
     */
    public registrationComplete(credentials: UserCredentials) {
        this.changeState(State.LOADING);
        // Store username, deviceId and access token.
        setUserCredentials(credentials)
            .then(() => {
                this.changeState(State.REGISTERED);
            })
            .catch((err) => {
                this.changeState(State.REGISTERING);
                console.log(err);
            });
    }

    public render() {
        if (this.state.myState === State.REGISTERING) {
            return (
                this.state.registerComponent
            );
        } else if (this.state.myState === State.REGISTERED) {
            return (
                <View>
                    <Text>Registered!</Text>
                </View>
            );
        }
        
        // myState === State.Loading
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
    },
    title: {
        fontSize: 20,
        textAlign: "center",
        margin: 10,
        color: "black",
        marginBottom: 10,
    },
    instructions: {
        textAlign: "center",
        color: "#333333",
        marginBottom: 10,
    },
    textInput: {
        borderColor: "black",
        borderWidth: 1,
        minWidth: 200,
        maxWidth: 200,
        marginBottom: 10,
        height: 40,
        textAlign: "center",
    }
});
