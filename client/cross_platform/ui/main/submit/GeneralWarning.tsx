import { Container, Form, Text, Textarea} from "native-base";
import React, { Component } from "react";
import { IGeneralWarning, WarningInformationType } from "../../../helper/Warnings";
import { HeaderBar } from "./../../general/HeaderBar";
import Styles from "./../../general/Styles";

interface IProps {
    info: IGeneralWarning;
    updateWarningInformation(info: WarningInformationType): void;
}

export default class GeneralWarning extends Component<IProps> {
    // @ts-ignore
    public static navigationOptions = ({navigation}) => {
        return {
            header: <HeaderBar backButton onPress={() => navigation.pop()}/>,
        };
    }

    public render() {
        return (
            <Form style={Styles.mbt10}>
                <Text>
                    Describe the person(s) involved (not required):
                </Text>
                <Textarea
                    rowSpan={4}
                    bordered
                    onChangeText={this.updatePeopleDescription}
                    style={Styles.mb10}
                >
                    {this.props.info.peopleDescription}
                </Textarea>
                <Text>
                    Describe the incident:
                </Text>
                <Textarea
                    rowSpan={4}
                    bordered
                    onChangeText={this.updateWarningDescription}
                    style={Styles.mb10}
                >
                    {this.props.info.warningDescription}
                </Textarea>
            </Form>

        );
    }

    private updatePeopleDescription = (text: string) => {
        this.props.updateWarningInformation({
            peopleDescription: text,
            warningDescription: this.props.info.warningDescription,
        });
    }

    private updateWarningDescription = (text: string) => {
        this.props.updateWarningInformation({
            peopleDescription: this.props.info.peopleDescription,
            warningDescription: text,
        });
    }
}
