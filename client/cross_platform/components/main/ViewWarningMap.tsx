import React, { Component } from "react";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { IWarning } from "../../helper/Warning";
import { SELLY_OAK_LAT, SELLY_OAK_LONG } from "./../../helper/GlobalConstants";

interface IProps {
    warnings: IWarning[];
    oneWarning: boolean;
    style: any;
    onMarkerPress(index: number): void;
}
interface IState {
    region: Region;
}

export default class ViewWarningMap extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        const region: Region = {
            latitude: SELLY_OAK_LAT,
            longitude: SELLY_OAK_LONG,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
        };

        if (this.props.oneWarning) {
            region.latitude = this.props.warnings[0].Latitude;
            region.longitude = this.props.warnings[0].Longitude;
        }

        this.state = {region};
    }

    public render() {
        return (
            <MapView
                provider={PROVIDER_GOOGLE}
                style={this.props.style.map}
                region={this.state.region}
                onRegionChangeComplete={this.onRegionChangeComplete}
            >
                {/** Render all the markers. */}
                {
                    this.props.warnings.map((warning: Warning, index: number) => {
                        return (
                            <Marker
                                onPress={() => this.props.onMarkerPress(index)}
                                key={index}
                                coordinate={{latitude: warning.Latitude, longitude: warning.Longitude}}
                            />
                        );
                    })
                }

            </MapView>
        );
    }

    private renderMarkers = () => {
        // Centre this warning.
        if (this.props.warnings.length === 1) {

        }
    }

    /**
     * Changes the region displayed on the map when the user pans/zooms.
     */
    private onRegionChangeComplete = (newRegion: Region) => {
        this.setState({region: newRegion});
    }
}
