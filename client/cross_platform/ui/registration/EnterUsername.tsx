import {
    Button,
    Container,
    Content,
    Input,
    Item,
    Text,
    Toast,
} from "native-base";
import React, { Component } from "react";
import { HeaderBar } from "../general/HeaderBar";
import { LoadingScreen } from "../general/LoadingScreen";
import { startRegistration } from "./../../services/RegistrationService";
import Styles from "./../general/Styles";

interface IState {
    username: string;
    loading: boolean;
}
export default class EnterUsername extends Component<any, IState> {
    public static navigationOptions = () => {
        return {
            header: <HeaderBar/>,
        };
    }

    public constructor(props: any) {
        super(props);

        this.state = {
            username: "",
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
                        Enter your University of Birmingham username below.
                    </Text>
                    <Item regular style={Styles.mb15}>
                        <Input
                            placeholder="UoB Username"
                            onChangeText={(text) => this.setState({username: text})}
                        >
                            {this.state.username}
                        </Input>
                    </Item>
                    <Button
                        primary
                        full
                        style={Styles.mb15}
                        onPress={this.pressNext}
                    >
                        <Text>Next</Text>
                    </Button>
                </Content>
            </Container>
        );
    }

    private pressNext = () => {
        this.setState({loading: true});

        // Start the registration process.
        startRegistration(this.state.username)
            .then(() => {
                this.setState({loading: false});
                this.props.navigation.navigate("VerifyEmail");
            })
            .catch((err: any) => {
                this.setState({loading: false});
                Toast.show({
                    text: err.message,
                    type: "warning",
                });
            });
    }
}
