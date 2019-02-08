import { Button, Container, Content, H2, Text, Textarea } from "native-base";
import React, { Component } from "react";
import { LoadingScreen } from "../../general/LoadingScreen";
import { HeaderBar } from "./../../general/HeaderBar";
import Styles from "./../../general/Styles";

interface IState {
    loading: boolean;
    feedback: string;
}

export default class SubmitFeedback extends Component<any, IState> {
    public static navigationOptions = () => {
        return {
            header: <HeaderBar/>,
        };
    }

    public constructor(props: any) {
        super(props);

        this.state = {
            loading: false,
            feedback: "",
        };
    }

    public render() {
        if (this.state.loading) {
            return <LoadingScreen/>;
        }

        return (
            <Container>
                <Content padder>
                    <H2 style={{...Styles.centreText as any, ...Styles.mbt10}}>
                        Submit Feedback
                    </H2>
                    <Text style={{...Styles.centreText as any, ...Styles.mb10}}>
                        This app was created for my dissertation.
                        I would greatly appreciate any feedback
                        whether it be a bug, feature or anything else you can think of.
                    </Text>
                    <Textarea
                        rowSpan={4}
                        bordered
                        onChangeText={(text) => this.setState({feedback: text})}
                        style={Styles.mb10}
                        value={this.state.feedback}
                    >
                        <Text>
                            {this.state.feedback}
                        </Text>
                    </Textarea>
                    <Button
                        full
                        primary
                        onPress={this.submitFeedback}
                    >
                        <Text>
                            Submit feedback
                        </Text>
                    </Button>
                </Content>
            </Container>
        );
    }

    private submitFeedback = () => {
        this.setState({loading: true}, () => {
            // Submit feedback here.
        });
    }
}
