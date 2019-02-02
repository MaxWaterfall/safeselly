import { Button, Footer, FooterTab, Text, Icon } from "native-base";
import React, { Component } from "react";
import {createAppContainer, createBottomTabNavigator} from "react-navigation";
import Submit from "./submit/Submit";
import View from "./view/View";

/**
 * Parent component for all main screens.
 */
export default class Main extends Component {
    constructor(props: any) {
        super(props);
    }

    public render() {
        return <MainNavigatorContainer/>;
    }
}

const MainNavigator = createBottomTabNavigator(
    {
        View: {screen: View},
        Submit: {screen: Submit},
    },
    {
        tabBarComponent: (props) => {
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
