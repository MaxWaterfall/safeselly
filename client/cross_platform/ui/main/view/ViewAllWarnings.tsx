import { ActionSheet, Button, Icon, Text, Toast, View } from "native-base";
import React, { Component } from "react";
import firebase from "react-native-firebase";
import { NotificationOpen } from "react-native-firebase/notifications";
import MapView, {Marker, PROVIDER_GOOGLE, Region} from "react-native-maps";
import {
    getViewedWarnings,
    getWarningsFrom,
    initialRegion,
    loadViewedWarnings,
} from "../../../services/ViewWarningsService";
import { FailedToConnectScreen } from "../../general/FailedToConnectScreen";
import { LoadingScreen } from "../../general/LoadingScreen";
import { IReturnWarning, Priority } from "./../../../../../shared/Warnings";
import * as NotificationService from "./../../../services/NotificationService";
import { HeaderBar } from "./../../general/HeaderBar";
import Styles from "./../../general/Styles";

const FILTER_BUTTONS = ["Past Hour", "Past Day", "Past Week", "Cancel"];
const CANCEL_INDEX = 3;

enum FilterTypes {
    HOUR = 1,
    DAY = 24,
    WEEK = DAY * 7,
}

interface IFilter {
    text: "Past Hour" | "Past Day" | "Past Week";
    hours: FilterTypes;
}

interface IState {
    region?: Region;
    warnings: IReturnWarning[];
    loading: boolean;
    failed: boolean;
    filter: IFilter;
    lastViewedWarningId: string;
}

export default class ViewAllWarnings extends Component<any, IState> {
    public static navigationOptions = () => {
        return {
            header: <HeaderBar/>,
        };
    }

    /**
     * Selects the markers colour based on whether the warning has been viewed or not.
     */
    public static chooseMarkerColour = (warning: IReturnWarning) => {
       if (warning.priority === Priority.HIGH) {
           return "red";
       }

       if (warning.priority === Priority.NORMAL) {
           return "orange";
       }

       if (warning.priority === Priority.LOW) {
           return "yellow";
       }

       return "white";
   }

    public constructor(props: any) {
        super(props);

        this.state = {
            loading: true,
            failed: false,
            filter: {
                text: "Past Day",
                hours: FilterTypes.DAY,
            },
            warnings: [],
            lastViewedWarningId: "",
        };

        this.loadInitialStateFromConstructor();
        NotificationService.addNotificationReceivedListener("ViewAllWarnings", this.receivedNotification);
        NotificationService.addNotificationOpenedListener("ViewAllWarnings", this.openedNotification);
    }

    public componentWillUnmount() {
        NotificationService.removeNotificationReceivedListener("ViewAllWarnings");
        NotificationService.removeNotificationOpenedListener("ViewAllWarnings");
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
                    {this.renderMarkers()}
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
                            Filter: {this.state.filter.text}
                        </Text>
                    </Button>
                </View>
            </View>
        );
    }

    /**
     * Renders all the markers.
     */
    private renderMarkers = () => {
        return (
            this.state.warnings!.map((warning: IReturnWarning) => {
                let key = warning.warningId;
                if (warning.warningId === this.state.lastViewedWarningId) {
                    // Update the key so the opacity updates.
                    key += "-viewed";
                }

                return (
                    <Marker
                        key={key}
                        coordinate={{latitude: warning.location.lat, longitude: warning.location.long}}
                        onPress={() => this.pressMarker(warning)}
                        pinColor={ViewAllWarnings.chooseMarkerColour(warning)}
                        opacity={this.chooseMarkerOpacity(warning)}
                    />
                );
            })
        );
    }

    private chooseMarkerOpacity = (warning: IReturnWarning) => {
        if (getViewedWarnings().has(warning.warningId) || this.state.lastViewedWarningId === warning.warningId) {
            // Warning has been viewed.
            return 0.5;
        }

        return 1;
    }

    /**
     * Checks whether we were opened from a notification when the app was closed.
     */
    private async openedFromClose() {
        const notificationOpen: NotificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            // App was opened by notification.
            const warning = JSON.parse(notificationOpen.notification.data.warning) as IReturnWarning;
            // Already received notification from the refresh. Now just need to open it.
            this.openedNotification(warning);
        }
    }

    /**
     * Checks if we can add a warning to the state.
     */
    private canAddWarning = (warning: IReturnWarning) => {
        for (const stateWarning of this.state.warnings) {
            if (stateWarning.warningId === warning.warningId) {
                return false;
            }
        }
        return true;
    }

    /**
     * Adds the newly received warning to our list of warnings.
     */
    private receivedNotification = (warning: IReturnWarning) => {
        if (this.canAddWarning(warning)) {
            this.setState({
                warnings: this.state.warnings.concat(warning),
            }, () => {
                Toast.show({
                    text: "Updated warnings.",
                    type: "success",
                });
            });
        }
    }

    /**
     * Same as received notification but opens the warning instead of showing a Toast.
     */
    private openedNotification = (warning: IReturnWarning) => {
         // Add this warning to our list then open it.
         if (this.canAddWarning(warning)) {
            this.setState({
                warnings: this.state.warnings.concat(warning),
            }, () => {
                this.pressMarker(warning);
            });
        } else {
            this.pressMarker(warning);
        }
    }

    /**
     * Moves to the ViewSingleWarning screen.
     */
    private pressMarker = (warning: IReturnWarning) => {
        this.setState({lastViewedWarningId: warning.warningId}, () => {
            this.props.navigation.push("ViewSingleWarning", {
                warning,
            });
        });
    }

    /**
     * Gets the initial set of warnings from the warning service.
     * Also tells ViewWarningsService to load viewed warnings.
     */
    private loadInitialStateFromConstructor = () => {
        Promise.all([getWarningsFrom(this.state.filter.hours), loadViewedWarnings()])
            .then(([warnings]) => {
                this.setState({
                    region: initialRegion,
                    warnings,
                    loading: false,
                    failed: false,
                }, () => {
                    // Check if we were opened by the notification (from closed).
                    this.openedFromClose();
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
     * Sets loading to true before calling loadInitialStateFromConstructor
     */
    private loadInitialState = () => {
        this.setState({loading: true}, this.loadInitialStateFromConstructor);
    }

    /**
     * Gets more warnings from the warning service.
     */
    private refreshWarnings = () => {
        getWarningsFrom(this.state.filter.hours)
            .then((warnings) => {
                if (JSON.stringify(warnings) === JSON.stringify(this.state.warnings)) {
                    // No update has occurred.
                    Toast.show({
                        text: "Up to date.",
                        type: "success",
                    });
                    return;
                }

                // Update has occurred.
                this.setState({warnings}, () => {
                    Toast.show({
                        text: "Updated warnings.",
                        type: "success",
                    });
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
     * Changes the state based on the chosen filter.
     * Then reloads the initial state to get the new warnings.
     */
    private filterWarnings = () => {
        ActionSheet.show(
            {
                options: FILTER_BUTTONS,
                cancelButtonIndex: CANCEL_INDEX,
                title: "Choose Filter",
            },
            (buttonIndex) => {
                if (buttonIndex !== CANCEL_INDEX) {
                    if (FILTER_BUTTONS[buttonIndex] === "Past Hour") {
                        this.setState({
                            filter: {
                                text: "Past Hour",
                                hours: FilterTypes.HOUR,
                            },
                        }, this.refreshWarnings);
                    }

                    if (FILTER_BUTTONS[buttonIndex] === "Past Day") {
                        this.setState({
                            filter: {
                                text: "Past Day",
                                hours: FilterTypes.DAY,
                            },
                        }, this.refreshWarnings);
                    }

                    if (FILTER_BUTTONS[buttonIndex] === "Past Week") {
                        this.setState({
                            filter: {
                                text: "Past Week",
                                hours: FilterTypes.WEEK,
                            },
                        }, this.refreshWarnings);
                    }
                }
            },
        );
    }

    /**
     * Updates the region displayed on the map when the user moves it.
     */
    private onRegionChangeComplete = (region: Region) => {
        this.setState({ region });
    }
}
