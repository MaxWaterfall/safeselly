import { Warning } from "../../helper/Warning";
import React, { Component } from "react";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";

interface IProps {
    warnings: Warning[];
    style: any;
    onMarkerPress(index: number): void;
}
interface IState {
    region: Region,
}

const SELLY_OAK_LAT = 52.436720;
const SELLY_OAK_LONG = -1.939000;

export default class Map extends Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.state = {
            region: {
                latitude: SELLY_OAK_LAT,
                longitude: SELLY_OAK_LONG,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
            },
        }
    }

    /**
     * Changes the region displayed on the map when the user pans/zooms.
     */
    private onRegionChangeComplete = (newRegion: Region) => {
        this.setState({region: newRegion});
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
                        return <Marker onPress={() => this.props.onMarkerPress(index)} key={index} coordinate={{latitude: warning.Latitude, longitude: warning.Longitude}}/>
                    })
                }

            </MapView>
        );
    }
}