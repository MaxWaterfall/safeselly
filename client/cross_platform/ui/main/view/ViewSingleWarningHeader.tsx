import { H3, Icon, Text, View } from "native-base";
import React from "react";
import Styles from "./../../general/Styles";

interface IProps {
    upvotes: number;
    downvotes: number;
    title: string;
}
export const ViewSingleWarningHeader = (props: IProps) => {
    return (
        <View style={[{flexDirection: "row", justifyContent: "space-between"}, Styles.mb10, Styles.mt10]}>
            <View style={[{flexDirection: "row"}, Styles.centreChildren as any]}>
                <Icon name="eye" style={[{marginRight: 5}, Styles.success]}/>
                <Text>{props.upvotes}</Text>
            </View>
            <View style={[Styles.centreChildren as any, {flexGrow: 5, marginLeft: 10, marginRight: 10}]}>
                <H3 style={[Styles.centreText as any]}>
                    {props.title}
                </H3>
            </View>
            <View style={[{flexDirection: "row"}, Styles.centreChildren as any]}>
                <Icon name="alert" style={[{marginRight: 5}, Styles.danger]}/>
                <Text>{props.downvotes}</Text>
            </View>
        </View>
    );
};
