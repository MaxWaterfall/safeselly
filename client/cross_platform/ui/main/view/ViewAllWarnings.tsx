import { Button, Icon, Toast, View, Text, ActionSheet } from "native-base";
import React, { Component } from "react";
import MapView, {Marker, PROVIDER_GOOGLE, Region} from "react-native-maps";
import { getWarnings, initialRegion } from "../../../services/ViewWarningsService";
import { FailedToConnectScreen } from "../../general/FailedToConnectScreen";
import { LoadingScreen } from "../../general/LoadingScreen";
import { IWarning } from "./../../../helper/Warnings";
import { getInitialWarnings } from "./../../../services/ViewWarningsService";
import { HeaderBar } from "./../../general/HeaderBar";
import Styles from "./../../general/Styles";

type FilterType = "Past Hour" | "Past Day" | "Past Week";
const FILTER_BUTTONS = ["Past Hour", "Past Day", "Past Week", "Cancel"];
const CANCEL_INDEX = 3;

interface IState {
    region?: Region;
    warnings?: IWarning[];
    loading: boolean;
    failed: boolean;
    filter: FilterType;
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
            filter: "Past Hour",
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
            <View style={{flex: 1 , flexDirection: "column"}}>
                <MapView
                    style={{flexGrow: 1}}
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
                            >
                            </Marker>
                        );
                    })}
                </MapView>
                <View style={[{flexDirection: "row", justifyContent: "space-between"}, Styles.padder]}>
                    <Button
                        onPress={this.refreshWarnings}
                        info
                    >
                        <Icon name="refresh"/>
                    </Button>
                    <Button
                        style={{flexGrow: 1, marginLeft: 10, flex: 1, justifyContent: "center"}}
                        info
                        onPress={this.filterWarnings}
                    >
                        <Text>
                            Filter: {this.state.filter}
                        </Text>
                    </Button>
                </View>
            </View>
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

    private filterWarnings = () => {
        ActionSheet.show(
            {
                options: FILTER_BUTTONS,
                cancelButtonIndex: CANCEL_INDEX,
                title: "Choose Filter",
            },
            (buttonIndex) => {
                if (buttonIndex !== CANCEL_INDEX) {
                    // Load correct warnings.
                    this.setState({filter: FILTER_BUTTONS[buttonIndex] as FilterType});
                }
            },
        );
    }

    private onRegionChangeComplete = (region: Region) => {
        this.setState({ region });
    }
}
