import React, {Component} from "react";
import {AppState, Text, View, ActivityIndicator, StyleSheet, AppStateStatus, AsyncStorage} from "react-native";
import Register  from "./components/register/Register";
import {UserCredentials, setUserCredentials} from "./helper/UserCredentials";
import { saveComponentState, loadComponentState } from "./helper/Storage";
import { SaveableComponent } from "./helper/SavableComponent";

enum State {
    REGISTERING,
    LOADING,
    REGISTERED,
}
interface IState {
    myState: State;
    appState: AppStateStatus;
}
export default class App extends Component<{}, IState> implements SaveableComponent {
    // Set up reference to components so we can call methods on them.
    private register = React.createRef<Register>();
    private registerComponent: JSX.Element; 

    constructor(props: {}) {
        super(props);
        this.state = {
            myState: State.REGISTERING,
            appState: "active"
        };

        // Load the state that is saved in local storage (if it exists).
        this.initialLoadState();

        this.registerComponent = (<Register 
                registrationComplete={(credentials) => {
                    this.registrationComplete(credentials);
                }}
                styles={styles}
                ref={this.register}
            />
        );

        // Set up listener so we know when the apps' state has changed.
        AppState.addEventListener("change", (nextState) => this.handleAppStateChange(nextState));
    }

    /**
     * Called when this component is about to be removed from the DOM.
     */
    public componentWillUnmount() {
        // Remove appstate listener.
        AppState.removeEventListener("change", (nextState) => this.handleAppStateChange(nextState));
    }

    public initialLoadState() {
        loadComponentState("app")
        .then((state) => {
            this.setState({
                myState: state.myState
            })
        })
        .catch((err) => {
            console.error(err);
        });
    }

    public saveState() {
        // Save our state.
        saveComponentState("app", this.state)
            .catch((err) => {
                console.error(err);
            });

        // Tell all saveable components to save their state.
        this.register.current!.saveState();
    }

    public loadState() {
        // Load our state.
        this.initialLoadState();

        // Tell saveable components to load their state.
        this.register.current!.loadState();
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
            return this.registerComponent;
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

    private handleAppStateChange(nextAppState: AppStateStatus) {
        if (this.state.appState.match(/inactive|background/) && nextAppState === "active") {
            // App has come into foreground, load states from persistent memory.
            this.loadState();
            this.setState({appState: nextAppState});
            return;
        } 

        if (this.state.appState === "active" && nextAppState.match(/inactive|background/)) {
            // App is going into background, save states into persistent memory.
            this.saveState();
            this.setState({appState: nextAppState});
            return;
        }
    }

    private changeState(newState: State) {
        this.setState({
            myState: newState,
        });
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
