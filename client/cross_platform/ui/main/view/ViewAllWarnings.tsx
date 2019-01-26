import { Button, Container, Content, Text } from "native-base";
import React, { Component } from "react";
import { View } from "react-native";
import MapView, {Marker, PROVIDER_GOOGLE, Region} from "react-native-maps";
import { initialRegion } from "../../../services/ViewWarningsService";
import { LoadingScreen } from "../../general/LoadingScreen";
import { IWarning } from "./../../../helper/Warnings";
import { getInitialWarnings } from "./../../../services/ViewWarningsService";
import { HeaderBar } from "./../../general/HeaderBar";
import { Centre } from "./../../general/StyleComponents";
import Styles from "./../../general/Styles";
import { FailedToConnectScreen } from "../../general/FailedToConnectScreen";

interface IState {
    region?: Region;
    warnings?: IWarning[];
    loading: boolean;
    failed: boolean;
}

export default class ViewAllWarnings extends Component<any, IState> {
    public static navigationOptions = () => {
        return {
            header: <HeaderBar/>,
        };
    }

    public constructor(props: any) {
        super(props);

        this.state = {
            loading: true,
            failed: false,
        };

        this.loadInitialStateFromConstructor();
    }

    public render() {
        if (this.state.loading) {
            return <LoadingScreen/>;
        }

        if (this.state.failed) {
           return <FailedToConnectScreen onPress={this.loadInitialState}/>;
        }

        return (
            <Container style={{flex: 1}}>
                <MapView
                    style={Styles.fillObject}
                    provider={PROVIDER_GOOGLE}
                    region={this.state.region}
                    onRegionChangeComplete={this.onRegionChangeComplete}
                >
                    {this.state.warnings!.map((warning: IWarning) => {
                    })}
                </MapView>
            </Container>
        );
    }

    /**
     * Gets the initial set of warnings from the warning service.
     */
    private loadInitialStateFromConstructor = () => {
        getInitialWarnings()
            .then((warnings) => {
                this.setState({
                    region: initialRegion,
                    warnings,
                    loading: false,
                });
            })
            .catch((err) => {
                this.setState({
                    loading: false,
                    failed: true,
                });
            });
    }

    /**
     * Gets the initial set of warnings from the warning service.
     * Sets the state so that loading is true.
     */
    private loadInitialState = () => {
        this.setState({loading: true});
        this.loadInitialStateFromConstructor();
    }

    private onRegionChangeComplete = (region: Region) => {
        this.setState({ region });
    }
}
