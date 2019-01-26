import {
    Body,
    Header,
    Left,
    Right,
    Title,
} from "native-base";
import React from "react";

export const HeaderBar = (props: any) => {
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
