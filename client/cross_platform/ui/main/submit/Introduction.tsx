import { Button, Container, Content, H2, Text } from "native-base";
import React, { Component } from "react";
import { HeaderBar } from "./../../general/HeaderBar";
import Styles from "./../../general/Styles";

export default class Introduction extends Component<any> {
    public static navigationOptions = () => {
        return {
            header: <HeaderBar/>,
        };
    }

    public render() {
        return (
            <Container>
                <Content padder>
                    <H2 style={{...Styles.centreText as any, ...Styles.mbt10}}>
                        Submit a Warning
                    </H2>
                    <Text style={{...Styles.centreText as any, ...Styles.mb10}}>
                        Follow the instructions to submit a warning.
                        Any spam submissions will result in an immediate ban, please do not abuse the system.
                    </Text>
                    <Button
                        full
                        primary
                        onPress={() => this.props.navigation.navigate("ChooseLocation")}
                    >
                        <Text>
                            Next
                        </Text>
                    </Button>
                </Content>
            </Container>
        );
    }
}
