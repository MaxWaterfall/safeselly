import React, { Component } from "react";
import {
    createAppContainer,
    createStackNavigator,
    NavigationContainer ,
 } from "react-navigation";
import { loadRegistrationState } from "../../services/RegistrationService";
import { LoadingScreen } from "../general/LoadingScreen";
import EnterUsername from "./EnterUsername";
import VerifyEmail from "./VerifyEmail";

interface IState {
    loading: boolean;
}

/**
 * Parent component for all registration screens.
 */
export default class Register extends Component<any, IState> {
    private RegisterNavigator: any;
    private RegisterNavigatorContainer: any;

    constructor(props: any) {
        super(props);

        this.state = {
            loading: true,
        };

        loadRegistrationState()
            .then((loaded) => {
                let initialRoute = "";
                if (loaded) {
                    initialRoute = "VerifyEmail";
                } else {
                    initialRoute = "EnterUsername";
                }

                this.RegisterNavigator = createStackNavigator(
                    {
                        EnterUsername: {screen: EnterUsername},
                        VerifyEmail: {screen: VerifyEmail},
                    },
                    {
                        initialRouteName: initialRoute,
                    },
                );

                this.RegisterNavigatorContainer = createAppContainer(this.RegisterNavigator as NavigationContainer);
                this.setState({loading: false});
            });
    }

    public render() {
        if (this.state.loading) {
            return <LoadingScreen/>;
        }

        return <this.RegisterNavigatorContainer screenProps={{rootNavigation: this.props.navigation }}/>;
    }
}
