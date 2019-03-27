import { Form, Text, Textarea} from "native-base";
import React, { Component } from "react";
import { IWarningInformation } from "../../../../../shared/Warnings";
import { HeaderBar } from "../../general/HeaderBar";
import Styles from "../../general/Styles";

interface IProps {
    info: IWarningInformation;
    updateWarningInformation(info: IWarningInformation): void;
}

export default class WarningDetails extends Component<IProps> {
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
                    value={this.props.info.peopleDescription}
                >
                    <Text>
                        {this.props.info.peopleDescription}
                    </Text>
                </Textarea>
                <Text>
                    Describe the incident:
                </Text>
                <Textarea
                    rowSpan={4}
                    bordered
                    onChangeText={this.updateWarningDescription}
                    style={Styles.mb10}
                    value={this.props.info.warningDescription}
                >
                    <Text>
                        {this.props.info.warningDescription}
                    </Text>
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
