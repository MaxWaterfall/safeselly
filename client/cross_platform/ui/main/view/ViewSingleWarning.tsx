// @ts-ignore No type definitions exist for this library.
import datetimeDifference from "datetime-difference";
import { Button, Container, Content, H3, Icon, Text, Toast, View } from "native-base";
import React, { Component } from "react";
import MapView, { LatLng, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { getWarningInformation, voteWarning } from "../../../services/ViewWarningsService";
import { FailedToConnectScreen } from "../../general/FailedToConnectScreen";
import { LoadingScreen } from "../../general/LoadingScreen";
import { IReturnWarning, ISpecificReturnWarning, IWarningInformation } from "./../../../../../shared/Warnings";
import { HeaderBar } from "./../../general/HeaderBar";
import Styles from "./../../general/Styles";
import ViewAllWarnings from "./ViewAllWarnings";
import { ViewSingleWarningHeader } from "./ViewSingleWarningHeader";
import { ViewWarningDetails } from "./ViewWarningDetails";

interface IState {
    loading: boolean;
    failed: boolean;
    region: Region;
    markerLatLng: LatLng;
    warning: IReturnWarning;
    specific?: ISpecificReturnWarning;
    mapMarginBottom: number;
}

export default class ViewSingleWarning extends Component<any, IState> {

    // @ts-ignore navigation has implicit any type and I cannot change it.
    public static navigationOptions = ({navigation}) => {
        return {
            header: <HeaderBar backButton onPress={() => navigation.pop()}/>,
        };
    }

    public constructor(props: any) {
        super(props);

        const warning: IReturnWarning = this.props.navigation.getParam("warning");

        this.state = {
            loading: true,
            failed: false,
            region: {
                latitude: warning.location.lat,
                longitude: warning.location.long,
                latitudeDelta: 0.007,
                longitudeDelta: 0.003,
            },
            warning,
            markerLatLng: {
                latitude: warning.location.lat,
                longitude: warning.location.long,
            },
            mapMarginBottom: 1,
        };

        this.getWarningInformationInitial();
    }

    public render() {
        if (this.state.loading) {
            return <LoadingScreen/>;
        }

        if (this.state.failed) {
            return <FailedToConnectScreen onPress={this.getWarningInformation}/>;
        }

        return (
            <Container>
                <Container style={{flex: 1}}>
                    <MapView
                        style={[Styles.fillObject, {marginBottom: this.state.mapMarginBottom}]}
                        provider={PROVIDER_GOOGLE}
                        // Workaround for bug where user location button does not show.
                        onMapReady={() => this.setState({mapMarginBottom: 0})}
                        region={this.state.region}
                        showsMyLocationButton={true}
                        showsUserLocation={true}
                        onRegionChangeComplete={this.onRegionChangeComplete}
                    >
                        <Marker
                            coordinate={this.state.markerLatLng as LatLng}
                            pinColor={ViewAllWarnings.chooseMarkerColour(this.state.warning)}
                        />
                    </MapView>
                </Container>
                <Container>
                    <Content padder>
                        <ViewSingleWarningHeader
                            upvotes={this.state.specific!.votes.upvotes}
                            downvotes={this.state.specific!.votes.downvotes}
                            title={this.prettyType() + " Warning"}
                        />
                        <Text style={[Styles.centreText as any, Styles.mb10]}>
                            This incident happened {this.timeFromWarning()} ago on {this.prettyDate()}.
                        </Text>
                        <ViewWarningDetails
                            info={this.state.specific!.information as IWarningInformation}
                        />
                        {this.renderVoteButtons()}
                    </Content>
                </Container>
            </Container>
        );
    }

    private onRegionChangeComplete = (region: Region) => {
        this.setState({ region });
    }

    private renderVoteButtons = () => {
        if (!this.state.specific!.userVoted) {
            return (
                <View>
                    <Button
                        style={Styles.mbt10}
                        block
                        success
                        iconLeft
                        onPress={() => this.voteWarning(true)}
                    >
                        <Icon name="eye"/>
                        <Text>
                            I saw this happen
                        </Text>
                    </Button>
                    <Button
                        block
                        danger
                        iconRight
                        onPress={() => this.voteWarning(false)}
                    >
                        <Text>
                            This warning is spam
                        </Text>
                        <Icon name="alert"/>
                    </Button>
                </View>
            );
        }

        if (this.state.specific!.userSubmitted) {
            return (
                <View>
                    <Text style={Styles.centreText as any}>
                        You submitted this warning.
                    </Text>
                </View>
            );
        }

        return (
            <View>
                <Text style={Styles.centreText as any}>
                    You have already voted for this warning.
                </Text>
            </View>
        );
    }

    /**
     * Gets the information for this specific warning from the server.
     */
    private getWarningInformationInitial = () => {
        getWarningInformation(this.state.warning.warningId)
            .then((value) => {
                this.setState({
                    loading: false,
                    specific: value,
                });
            })
            .catch((err) => {
                // Request failed.
                this.setState({failed: true});
            });
    }

    /**
     * Same as getWarningInformationInitial but also sets the state so that loading = true.
     */
    private getWarningInformation = () => {
        this.setState({loading: true});
        this.getWarningInformationInitial();
    }

    /**
     * Returns the date this warning occurred on in a nice human readable format.
     */
    private prettyDate = () => {
        const date = this.state.warning.dateTime;

        // First, extract date.
        const year = date.substring(0, 4);
        const month = date.substring(5, 7);
        const day = date.substring(8, 10);

        // Now extract time.
        const hours = date.substring(11, 13);
        const minutes = date.substring(14, 16);

        return `${day}/${month}/${year} at ${hours}:${minutes}`;
    }

    /**
     * Returns the amount of time that has passed since this warning happened.
     */
    private timeFromWarning = () => {
        const date = this.state.warning.dateTime;

        const warningDateTime = new Date(date);
        const now = new Date();

        const diff = datetimeDifference(warningDateTime, now);

        if (diff.months > 0) {
            return `${diff.months} month(s)`;
        }

        if (diff.days > 0) {
            return `${diff.days} day(s)`;
        }

        if (diff.hours > 0) {
            return `${diff.hours} hour(s)`;
        }

        if (diff.minutes > 0) {
            return `${diff.minutes} minute(s)`;
        }

        return `${diff.seconds} second(s)`;
    }

    /**
     * Formats the type so that the first letter is upper case.
     */
    private prettyType = () => {
        // Using newType as type is for the old version.
        let type = this.state.warning.newType as string;

        // Uppercase first letter of first word.
        type = type.substr(0, 1).toUpperCase() + type.substr(1);

        const indexOfSecondWord = type.indexOf(" ") + 1;
        if (indexOfSecondWord >= 0) {
            // Uppercase first letter of second word.
            type =
                type.substring(0, indexOfSecondWord) +
                type.substr(indexOfSecondWord, 1).toUpperCase() +
                type.substr(indexOfSecondWord + 1);
        }

        return type;
    }

    /**
     * Sends a request to the server to vote this warning.
     */
    private voteWarning = (upvote: boolean) => {
        voteWarning(this.state.warning.warningId, upvote)
            .then(() => {
                const specific = this.state.specific!;

                // Update the votes (for UI only).
                if (upvote) {
                    specific.votes.upvotes += 1;
                } else {
                    specific.votes.downvotes += 1;
                }

                // Update voted (for UI only).
                specific.userVoted = true;

                this.setState({
                    specific,
                }, () => {
                    Toast.show({
                        text: "Thankyou for your feedback.",
                        type: "success",
                    });
                });
            })
            .catch(() => {
                Toast.show({
                    text: "Network error, try again.",
                    type: "danger",
                });
            });
    }
}
