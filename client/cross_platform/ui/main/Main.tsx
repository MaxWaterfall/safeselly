import { Button, Footer, FooterTab, Icon } from "native-base";
import React, { Component } from "react";
import {createAppContainer, createBottomTabNavigator} from "react-navigation";
import * as NotificationService from "../../services/NotificationService";
import { LoadingScreen } from "../general/LoadingScreen";
import { IReturnWarning } from "./../../../../shared/Warnings";
import Submit from "./submit/Submit";
import View from "./view/View";

interface IState {
    loading: boolean;
}

/**
 * Parent component for all main screens.
 */
export default class Main extends Component<any, IState> {
    constructor(props: any) {
        super(props);

        this.state = {
            loading: true,
        };

        // Set up the notification service.
        NotificationService.setUp()
            .finally(() => {
                this.setState({loading: false});
            });
    }

    public render() {
        if (this.state.loading) {
            return <LoadingScreen/>;
        }

        return <MainNavigatorContainer/>;
    }

    /**
     * Called just before the component is about to removed from the DOM.
     */
    public componentWillUnmount() {
        NotificationService.removeNotificationOpenedListener("Main");
    }
}

const MainNavigator = createBottomTabNavigator(
    {
        View: {screen: View},
        Submit: {screen: Submit},
    },
    {
        tabBarComponent: (props) => {
            NotificationService.addNotificationOpenedListener("Main", (warning) => {
                // Move to view, the user has opened a notification.
                props.navigation.navigate("View");
            });

            return (
                <Footer>
                    <FooterTab>
                        <Button
                            vertical
                            active={props.navigation.state.index === 0}
                            onPress={() => props.navigation.navigate("View")}
                        >
                            <Icon name="map"/>
                        </Button>
                    </FooterTab>
                    <FooterTab>
                        <Button
                            vertical
                            active={props.navigation.state.index === 1}
                            onPress={() => props.navigation.navigate("Submit")}
                        >
                            <Icon name="add"/>
                        </Button>
                    </FooterTab>
                </Footer>
            );
        },
    },
);
const MainNavigatorContainer = createAppContainer(MainNavigator);
