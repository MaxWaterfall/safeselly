import React, { Component } from "react";
import { View, Text, Button, ActivityIndicator, Alert, ScrollView, TextInput } from "react-native";
import SubmitWarningMap from "./SubmitWarningMap";
import { makeRequest, handleNetworkError } from "./../../helper/Network";

enum State {
    INTRODUCTION,
    CHOOSING_LOCATION,
    FILLING_INFO,
    LOADING,
}

interface IState {
    myState: State;
    warningLocation: {
        latitude: number,
        longitude: number,
    };
    markerSpawned: boolean;
    warningDescription: string;
    peopleDescription: string;
}

const defaultState: IState = {
    myState: State.INTRODUCTION,
    warningLocation: {
        latitude: 0,
        longitude: 0,
    },
    markerSpawned: false,
    warningDescription: "",
    peopleDescription: "",
};

export default class SubmitWarning extends Component<{}, IState> {
    public constructor(props: {}) {
        super(props);
        this.state = defaultState;
    }

    public render() {
        if (this.state.myState === State.INTRODUCTION) {
            return (
                <View>
                    <Text>Submit A Warning</Text>
                    <Text>Follow the instructions to submit a warning.</Text>
                    <Text>Submitting spam will result in an immediate ban.</Text>
                    <Button title="next" onPress={() => this.setState({myState: State.CHOOSING_LOCATION})}/>
                </View>
            );
        }

        if (this.state.myState === State.CHOOSING_LOCATION) {
            return (
                <View style = {{flex: 1}}>
                    <Text>Select A Location</Text>
                    <View style={{flex: 1}}>
                        {this.renderMap()}
                    </View>
                    <Button title="next" onPress={this.moveToFillingInfo}/>
                    <Button title="back" onPress={() => this.setState({myState: State.INTRODUCTION})}/>
                </View>
            );
        }

        if (this.state.myState === State.FILLING_INFO) {
            return (
                <ScrollView>
                    <Text>Person(s) Description:</Text>
                    <TextInput
                        style={{borderWidth: 1, borderColor: "black"}}
                        onChangeText={(text) => this.setState({peopleDescription: text})}
                        multiline
                    />
                    <Text>Warning Description:</Text>
                    <TextInput
                        style={{borderWidth: 1, borderColor: "black"}}
                        onChangeText={(text) => this.setState({warningDescription: text})}
                        multiline
                    />
                    <Button title="back" onPress={() => this.setState({myState: State.CHOOSING_LOCATION})}/>
                    <Button title="submit" onPress={this.submitWarning}/>
                </ScrollView>
            );
        }

        // myState === State.Loading
        return (
            <View style={{flex: 1, justifyContent: "center"}}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    /**
     * Updates the location of the warning being submitted.
     * Based on the location of the marker the on the map.
     */
    public updateLocation = (e: any) => {
        this.setState({
            warningLocation: {
                latitude: e.nativeEvent.coordinate.latitude,
                longitude: e.nativeEvent.coordinate.longitude,
            },
            markerSpawned: true,
        });
    }

    /**
     * Checks whether the user has selected a location then updates myState.
     */
    private moveToFillingInfo = () => {
        if (this.state.markerSpawned) {
            this.setState({myState: State.FILLING_INFO});
        } else {
            Alert.alert("No Location Selected", "Please choose a location on the map.");
        }
    }

    /**
     * Validates the warning information then submits the warning to the server.
     */
    private submitWarning = () => {
        // TODO: Validate warning info.
        this.setState({myState: State.LOADING});
        makeRequest("POST", "/warning/", true, {
            warning: {
                people_description: this.state.peopleDescription,
                warning_description: this.state.warningDescription,
                location: {
                    lat: this.state.warningLocation.latitude,
                    long: this.state.warningLocation.longitude,
                },
            },
        })
            .then(() => {
                Alert.alert("Thank you.", "Your warning has been submitted.");
                this.setState(defaultState);
            })
            .catch((err) => {
                handleNetworkError(err);
                this.setState({myState: State.FILLING_INFO});
            });
    }

    private renderMap = () => {
        if (this.state.markerSpawned) {
            return (
                <SubmitWarningMap
                    updateLocation={this.updateLocation}
                    markerSpawned={this.state.markerSpawned}
                    markerLocation={this.state.warningLocation}
                />
            );
        }

        // Marker has not been spawned.
        return (
            <SubmitWarningMap
                updateLocation={this.updateLocation}
                markerSpawned={this.state.markerSpawned}
            />
        );
    }
}
