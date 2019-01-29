import { Button, Col, Content, Grid, Row, Text, Toast } from "native-base";
import React, { Component } from "react";
import MapView, {Marker, PROVIDER_GOOGLE, Region} from "react-native-maps";
import { initialRegion, getWarnings } from "../../../services/ViewWarningsService";
import { FailedToConnectScreen } from "../../general/FailedToConnectScreen";
import { LoadingScreen } from "../../general/LoadingScreen";
import { IWarning } from "./../../../helper/Warnings";
import { getInitialWarnings } from "./../../../services/ViewWarningsService";
import { HeaderBar } from "./../../general/HeaderBar";
import Styles from "./../../general/Styles";

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
            <Grid>
                <Row size={9}>
                    <MapView
                        style={Styles.fillObject}
                        provider={PROVIDER_GOOGLE}
                        region={this.state.region}
                        onRegionChangeComplete={this.onRegionChangeComplete}
                    >
                        {this.state.warnings!.map((warning: IWarning) => {
                            return (
                                <Marker
                                    key={warning.WarningId}
                                    coordinate={{latitude: warning.Latitude, longitude: warning.Longitude}}
                                    onPress={() => this.props.navigation.push("ViewSingleWarning", {
                                        warning,
                                    })}
                                />
                            );
                        })}
                    </MapView>
                </Row>
                <Row size={1}>
                    <Col>
                        <Content padder>
                            <Button
                                full
                                onPress={this.refreshWarnings}
                            >
                                <Text>
                                    Refresh
                                </Text>
                            </Button>
                        </Content>
                    </Col>
                </Row>
            </Grid>
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
     * Gets more warnings from the warning service.
     */
    private refreshWarnings = () => {
        getWarnings(this.state.warnings![this.state.warnings!.length - 1].WarningId)
            .then((warnings) => {
                if (warnings.length === 0) {
                    Toast.show({
                        text: "Up to date.",
                        type: "success",
                    });
                    return;
                }

                this.setState({
                    warnings: this.state.warnings!.concat(warnings),
                });
                Toast.show({
                    text: `Retrieved ${warnings.length} warning(s).`,
                    type: "success",
                });
            })
            .catch((err) => {
                Toast.show({
                    text: err.message,
                    type: "danger",
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
