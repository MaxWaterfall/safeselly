import { View } from "native-base";
import React from "react";

export const Centre = (props: any) => {
    return (
        <View style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        }}>
            {props.children}
        </View>
    );
};
