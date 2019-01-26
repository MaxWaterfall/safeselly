import { Button, Container, Content, Text } from "native-base";
import React from "react";
import Styles from "./Styles";

export const FailedToConnectScreen = (props: {onPress(): void}) => {
    return (
        <Container>
            <Content padder>
                <Text
                    style={{...Styles.centreText as any, ...Styles.mt15}}
                >
                    Cannot connect to the server, try again.
                </Text>
                <Button
                    full
                    style={Styles.mt15}
                    onPress={props.onPress}
                >
                    <Text>
                        Try again
                    </Text>
                </Button>
            </Content>
        </Container>
    );
};
