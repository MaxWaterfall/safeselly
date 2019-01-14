import React, { Component } from "react";
import { View, Text, StyleSheet } from "react-native"; 
import MapView, {PROVIDER_GOOGLE, Region} from "react-native-maps";

const SELLY_OAK_LAT = 52.436720;
const SELLY_OAK_LONG = -1.939000;

interface IState {
    region: {
        latitude: number,
        longitude: number,
        latitudeDelta: number,
        longitudeDelta: number,
    }
}
export default class ViewWarning extends Component<{}, IState> {
    public constructor(props: {}) {
        super(props);

        this.state = {
            region: {
                latitude: SELLY_OAK_LAT,
                longitude: SELLY_OAK_LONG,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
            }
        }

        this.onRegionChange.bind(this);
    }

    public render() {
        return (
            <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={this.state.region}
                onRegionChange={this.onRegionChange}
            >
            </MapView>
          </View>
        );
    }

    private onRegionChange = (region: Region) => {
        console.log("called");
        console.log(region);
        this.setState({region: region});
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});