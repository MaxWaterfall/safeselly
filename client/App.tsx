import { Root } from "native-base";
import React, {Component} from "react";
import {
    createAppContainer,
    createStackNavigator,
    NavigationContainer,
} from "react-navigation";
import { isRegistered } from "./cross_platform/services/RegistrationService";
import { LoadingScreen } from "./cross_platform/ui/general/LoadingScreen";
import Main from "./cross_platform/ui/main/Main";
import Register from "./cross_platform/ui/registration/Register";

let AppNavigator: NavigationContainer;
let AppContainer: NavigationContainer;

interface IState {
    loading: boolean;
}

/**
 * This component is the root component of the entire app.
 */
export default class App extends Component<{}, IState> {
    public constructor(props: {}) {
        super(props);

        this.state = {
            loading: true,
        };

        // Set up the correct route based on whether the user has registered or not.
        isRegistered()
            .then((value) => {
                AppNavigator = createStackNavigator(
                    {
                        Register: {screen: Register},
                        Main: {screen: Main},
                    },
                    {
                        headerMode: "none",
                        initialRouteName: value ? "Main" : "Register",
                    },
                );
                AppContainer = createAppContainer(AppNavigator);
                this.setState({loading: false});
            });
    }

    public render() {
        if (this.state.loading) {
            return <LoadingScreen/>;
        }

        return (
            <Root>
                <AppContainer/>
            </Root>
        );
    }
}
