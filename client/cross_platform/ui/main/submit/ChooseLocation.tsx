import { Button, H3, Text, Toast, View} from "native-base";
import React, { Component } from "react";
import MapView, { LatLng, MapEvent, Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { initialRegion } from "../../../services/ViewWarningsService";
import { HeaderBar } from "./../../general/HeaderBar";
import Styles from "./../../general/Styles";

interface IState {
    region: Region;
    warningLocation?: LatLng;
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
        };
    }

    public render() {
        return (
            <View style={[{flex: 1, flexDirection: "column"}, Styles.mt10]}>
                <H3 style={{...Styles.centreText as any, ...Styles.mbt10}}>
                    Where is the warning located?
                </H3>
                <Text style={{...Styles.centreText as any, ...Styles.mb10}}>
                    Choose a location by tapping the map.
                    You can adjust the marker once it's been placed by long pressing it.
                </Text>
                <MapView
                    onPress={this.onMapPress}
                    style={{flexGrow: 1}}
                    provider={PROVIDER_GOOGLE}
                    region={this.state.region}
                    onRegionChangeComplete={this.onRegionChangeComplete}
                >
                    {this.renderMarker()}
                </MapView>
                <Button
                    style={Styles.padder}
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

        this.props.navigation.push("EnterInformation", {
            WarningLocation: this.state.warningLocation,
            WarningType: "general", // Will be changed to be a specific type when more come out.
        });
    }

    private renderMarker = () => {
        if (this.state.warningLocation !== undefined) {
            return (
                <Marker
                    draggable
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
