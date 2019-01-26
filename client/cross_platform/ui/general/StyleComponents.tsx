import { Container } from "native-base";
import React from "react";

export const Centre = (props: any) => {
    return (
        <Container style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        }}>
            {props.children}
        </Container>
    );
};
