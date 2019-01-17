import React, { Component } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region, LatLng } from "react-native-maps";
import { SELLY_OAK_LAT, SELLY_OAK_LONG } from "../../helper/GlobalConstants";

interface IProps {
    markerLocation?: {
        latitude: number,
        longitude: number,
    };
    markerSpawned: boolean;
    updateLocation(e: any): void;
}
interface IState {
    region: Region;
}

export default class SubmitWarningMap extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            region: {
                latitude: SELLY_OAK_LAT,
                longitude: SELLY_OAK_LONG,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
            },
        };
    }

    public render() {
        return (
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={this.state.region}
                onRegionChangeComplete={this.onRegionChangeComplete}
                onPress={this.props.updateLocation}
            >
                {this.renderMarker()}
            </MapView>
        );
    }

    /**
     * Returns a <Marker> JSX element if the user has spawned one (by tapping the map).
     */
    private renderMarker(): JSX.Element {
        if (this.props.markerSpawned) {
            const markerLocation = this.props.markerLocation;
            return (
                <Marker draggable
                        coordinate={{latitude: markerLocation!.latitude, longitude: markerLocation!.longitude}}
                        onDragEnd={this.props.updateLocation}
                />
            );
        }

        return <View/>;
    }

    /**
     * Changes the region displayed on the map when the user pans/zooms.
     */
    private onRegionChangeComplete = (newRegion: Region) => {
        this.setState({region: newRegion});
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});
