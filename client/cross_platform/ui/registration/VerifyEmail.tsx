import {
    Button,
    Container,
    Content,
    Text,
    Toast,
} from "native-base";
import React, { Component } from "react";
import { LoadingScreen } from "../general/LoadingScreen";
import { finishRegistration, getUsername } from "./../../services/RegistrationService";
import { HeaderBar } from "./../general/HeaderBar";
import Styles from "./../general/Styles";

interface IState {
    loading: boolean;
}

export default class VerifyEmail extends Component<any, IState> {
    public static navigationOptions = () => {
        return {
            header: <HeaderBar/>,
        };
    }

    public constructor(props: any) {
        super(props);

        this.state = {
            loading: false,
        };
    }

    public render() {
        if (this.state.loading) {
            return <LoadingScreen/>;
        }

        return (
            <Container>
                <Content padder>
                    <Text style={[Styles.centreText as any, Styles.mb15, Styles.mt15]}>
                        We've sent an email to {getUsername()}@bham.ac.uk.
                    </Text>
                    <Text style={[Styles.centreText as any, Styles.mb15]}>
                        Click the link in the email, then tap the button below.
                    </Text>
                    <Button
                        primary
                        full
                        style={Styles.mb15}
                        onPress={this.pressNext}
                    >
                        <Text>I've clicked the link</Text>
                    </Button>
                    <Button
                        info
                        full
                        style={Styles.mb15}
                        onPress={() => this.props.navigation.pop()}
                    >
                        <Text>I entered the wrong username</Text>
                    </Button>
                </Content>
            </Container>
        );
    }

    private pressNext = () => {
        this.setState({loading: true});

        finishRegistration()
            .then(() => {
                this.setState({loading: false});

                // Navigate to main screen.
                this.props.screenProps.rootNavigation.navigate("Main");
            })
            .catch((err) => {
                this.setState({loading: false});
                Toast.show({
                    text: err.message,
                    type: "warning",
                });
            });
    }
}
