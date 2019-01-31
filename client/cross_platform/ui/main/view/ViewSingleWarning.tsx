// @ts-ignore No type definitions exist for this library.
import datetimeDifference from "datetime-difference";
import { Button, Container, Content, H1, H2, H3, Text } from "native-base";
import React, { Component } from "react";
import MapView, { LatLng, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { getInitialWarnings, getWarningInformation, initialRegion } from "../../../services/ViewWarningsService";
import { CardItemWithHeader } from "../../general/CardItemWithHeader";
import { FailedToConnectScreen } from "../../general/FailedToConnectScreen";
import { LoadingScreen } from "../../general/LoadingScreen";
import { IGeneralWarning, IWarning } from "./../../../helper/Warnings";
import { HeaderBar } from "./../../general/HeaderBar";
import Styles from "./../../general/Styles";

interface IState {
    loading: boolean;
    failed: boolean;
    region: Region;
    markerLatLng: LatLng;
    warning: IWarning;
    information?: any;
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
                latitude: warning.Latitude,
                longitude: warning.Longitude,
                latitudeDelta: 0.007,
                longitudeDelta: 0.003,
            },
            warning,
            markerLatLng: {
                latitude: warning.Latitude,
                longitude: warning.Longitude,
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
                        <H3 style={{...Styles.centreText as any, ...Styles.mb10, ...Styles.mt10}}>
                            {this.prettyType()} Warning
                        </H3>
                        <Text style={{...Styles.centreText as any, ...Styles.mb10}}>
                            This incident happened {this.timeFromWarning()} ago on {this.prettyDate()}.
                        </Text>
                        {this.renderWarningInformation()}
                        <Button
                            style={Styles.mbt10}
                            full
                            success
                        >
                            <Text>
                                I saw this happen
                            </Text>
                        </Button>
                        <Button
                            full
                            danger
                        >
                            <Text>
                                This warning is spam
                            </Text>
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
        getWarningInformation(this.state.warning.WarningId, this.state.warning.WarningType)
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
        const render: JSX.Element[] = [];
        let index = 0;
        for (const property in this.state!.information) {
            if (this.state.information!.hasOwnProperty(property)) {
                // Find index of second capital letter. We can start at 1 as we know 0
                // will be the first capital letter.
                index = -1;
                for (let i = 1; i < property.length; i++) {
                    if (property.charAt(i) === property.charAt(i).toUpperCase()) {
                        index = i;
                        break;
                    }
                }

                let formattedProperty = property;
                if (index !== -1) {
                    // Format property by inserting a space.
                    formattedProperty = property.substring(0, index) + " " + property.substring(index, property.length);
                }

                // Add this item to the array.
                render.push((
                    <CardItemWithHeader
                        key={index++}
                        header={formattedProperty}
                        body={this.state.information[property]}
                    />
                ));
            }
        }

        return render;
    }

    /**
     * Returns the date this warning occurred on in a nice human readable format.
     */
    private prettyDate = () => {
        const date = this.state.warning.WarningDateTime;

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
        const date = this.state.warning.WarningDateTime;

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
        const type = this.state.warning.WarningType;
        return (type.substr(0, 1).toUpperCase()) + type.substr(1);
    }
}
