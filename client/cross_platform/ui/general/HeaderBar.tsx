import {
    Body,
    Button,
    Header,
    Icon,
    Left,
    Right,
    Title,
} from "native-base";
import React from "react";

interface IProps {
    backButton?: boolean;
    onPress?(): void;
}

export const HeaderBar = (props: IProps) => {
    if (props.backButton) {
        return (
            <Header>
                <Left>
                    <Button onPress={props.onPress} transparent>
                        <Icon name="arrow-round-back"/>
                    </Button>
                </Left>
                <Body>
                    <Title>
                        Safe Selly
                    </Title>
                </Body>
                <Right/>
        </Header>
        );
    }

    return (
        <Header>
            <Body>
                <Title>
                    Safe Selly
                </Title>
            </Body>
            <Right/>
        </Header>
    );
};
