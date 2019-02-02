// @ts-ignore No type definitions exist for this library.
import datetimeDifference from "datetime-difference";
import { Button, Container, Content, H3, Icon, Text, Toast, View } from "native-base";
import React, { Component } from "react";
import MapView, { LatLng, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { getWarningInformation, voteWarning } from "../../../services/ViewWarningsService";
import { FailedToConnectScreen } from "../../general/FailedToConnectScreen";
import { LoadingScreen } from "../../general/LoadingScreen";
import { IGeneralWarning, IWarning } from "./../../../helper/Warnings";
import { HeaderBar } from "./../../general/HeaderBar";
import Styles from "./../../general/Styles";
import { ViewGeneralWarning } from "./ViewGeneralWarning";
import { ViewSingleWarningHeader } from "./ViewSingleWarningHeader";

interface IState {
    loading: boolean;
    failed: boolean;
    region: Region;
    markerLatLng: LatLng;
    warning: IWarning;
    information?: IGeneralWarning;
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

        const warning: IWarning = this.props.navigation.getParam("warning");

        this.state = {
            loading: true,
            failed: false,
            region: {
                latitude: warning.latitude,
                longitude: warning.longitude,
                latitudeDelta: 0.007,
                longitudeDelta: 0.003,
            },
            warning,
            markerLatLng: {
                latitude: warning.latitude,
                longitude: warning.longitude,
            },
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
                <Container style={{...{flex: 1}}}>
                    <MapView
                        style={Styles.fillObject}
                        provider={PROVIDER_GOOGLE}
                        region={this.state.region}
                        onRegionChangeComplete={this.onRegionChangeComplete}
                    >
                        <Marker coordinate={this.state.markerLatLng as LatLng}/>
                    </MapView>
                </Container>
                <Container>
                    <Content padder>
                        <ViewSingleWarningHeader
                            upvotes={10}
                            downvotes={10}
                            title={this.prettyType() + " Warning"}
                        />
                        <Text style={[Styles.centreText as any, Styles.mb10]}>
                            This incident happened {this.timeFromWarning()} ago on {this.prettyDate()}.
                        </Text>
                        {this.renderWarningInformation()}
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
                    </Content>
                </Container>
            </Container>
        );
    }

    private onRegionChangeComplete = (region: Region) => {
        this.setState({ region });
    }

    /**
     * Gets the information for this specific warning from the server.
     */
    private getWarningInformationInitial = () => {
        getWarningInformation(this.state.warning.warningId, this.state.warning.warningType)
            .then((value: any) => {
                this.setState({
                    loading: false,
                    information: value,
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
     * Renders the specific information of the warning.
     */
    private renderWarningInformation = () => {
        if (this.state.warning.warningType === "general") {
            return <ViewGeneralWarning info={this.state.information as IGeneralWarning}/>;
        }

        return <Text>Error</Text>;
    }

    /**
     * Returns the date this warning occurred on in a nice human readable format.
     */
    private prettyDate = () => {
        const date = this.state.warning.warningDateTime;

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
        const date = this.state.warning.warningDateTime;

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
        const type = this.state.warning.warningType;
        return (type.substr(0, 1).toUpperCase()) + type.substr(1);
    }

    /**
     * Sends a request to the server to vote this warning.
     */
    private voteWarning = (upvote: boolean) => {
        voteWarning(this.state.warning.warningId, upvote)
            .then(() => {
                Toast.show({
                    text: "Thankyou for your feedback.",
                    type: "success",
                });
            })
            .catch(() => {
                Toast.show({
                    text: "Network error, try again.",
                    type: "danger",
                });
            });
        // Downvote
    }
}
