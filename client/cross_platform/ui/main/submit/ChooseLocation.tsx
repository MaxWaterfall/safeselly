import { isPointInCircle } from "geolib";
import { Button, H3, Text, Toast, View} from "native-base";
import React, { Component } from "react";
import MapView, { LatLng, MapEvent, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { initialRegion } from "../../../services/ViewWarningsService";
import {
    DISTANCE_FROM_SELLY_OAK,
    SELLY_OAK_LAT,
    SELLY_OAK_LONG,
} from "./../../../../../shared/Warnings";
import { HeaderBar } from "./../../general/HeaderBar";
import Styles from "./../../general/Styles";

interface IState {
    region: Region;
    warningLocation?: LatLng;
    mapMarginBottom: number;
}

export default class ChooseLocation extends Component<any, IState> {
    // @ts-ignore
    public static navigationOptions = ({navigation}) => {
        return {
            header: <HeaderBar backButton onPress={() => navigation.pop()}/>,
        };
    }

    public constructor(props: any) {
        super (props);

        this.state = {
            region: initialRegion,
            mapMarginBottom: 1,
        };
    }

    public render() {
        return (
            <View style={[{flex: 1, flexDirection: "column"}, Styles.mt10]}>
                <H3 style={{...Styles.centreText as any, ...Styles.mbt10}}>
                    Where did the incident happen?
                </H3>
                <Text style={{...Styles.centreText as any, ...Styles.mb10}}>
                    Choose a location by tapping the map.
                    You can adjust the marker once it's been placed by long pressing it.
                </Text>
                <MapView
                    onPress={this.onMapPress}
                    style={{flexGrow: 1, marginBottom: this.state.mapMarginBottom}}
                    onMapReady={() => this.setState({mapMarginBottom: 0})}
                    provider={PROVIDER_GOOGLE}
                    region={this.state.region}
                    onRegionChangeComplete={this.onRegionChangeComplete}
                    showsMyLocationButton={true}
                    showsUserLocation={true}
                >
                    {this.renderMarker()}
                </MapView>
                <Button
                    style={Styles.margin}
                    full
                    primary
                    onPress={this.moveToNextScreen}
                >
                    <Text>
                        Next
                    </Text>
                </Button>
            </View>
        );
    }

    private moveToNextScreen = () => {
        if (this.state.warningLocation === undefined) {
            Toast.show({
                text: "You must choose a location.",
                type: "warning",
            });
            return;
        }

        // Check the warning is close to Selly Oak.
        if (!isPointInCircle(
            {latitude: this.state.warningLocation!.latitude, longitude: this.state.warningLocation!.longitude},
            {latitude: SELLY_OAK_LAT, longitude: SELLY_OAK_LONG},
            DISTANCE_FROM_SELLY_OAK,
        )) {
            Toast.show({
                text: "Location must be near Selly Oak.",
                type: "warning",
            });
            return;
        }

        // Move to next page.
        this.props.navigation.push("ChooseWarningType", {
            WarningLocation: this.state.warningLocation,
        });
    }

    private renderMarker = () => {
        if (this.state.warningLocation !== undefined) {
            return (
                <Marker
                    draggable
                    onDragEnd={this.onMapPress}
                    coordinate={this.state.warningLocation as LatLng}
                />
            );
        }
    }

    private onMapPress = (event: MapEvent) => {
        // We want to spawn a marker where the user clicked.
        this.setState({
            warningLocation: {
                latitude: event.nativeEvent.coordinate.latitude,
                longitude: event.nativeEvent.coordinate.longitude,
            },
        });
    }

    private onRegionChangeComplete = (region: Region) => {
        this.setState({region});
    }
}
