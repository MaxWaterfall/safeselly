import React, { Component } from "react";
import { ActivityIndicator, Button, Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { handleNetworkError, makeRequest } from "../../helper/Network";
import { IWarning } from "../../helper/Warning";
import ViewWarningMap from "./ViewWarningMap";

enum State {
    VIEWING_MAP,
    VIEWING_WARNING,
    LOADING,
}
interface IState {
    myState: State;
    // Array of all warnings we want to display to the user.
    warnings: IWarning[];
    // The index of the warning which is being viewed right now.
    currentWarning: number;
}
export default class ViewWarning extends Component<{}, IState> {

    public constructor(props: {}) {
        super(props);

        this.state = {
            myState: State.LOADING,
            warnings: [],
            currentWarning: -1,
        };

        // Get warnings from the server to populate the map.
        this.getWarnings();
    }

    public render() {
        if (this.state.myState === State.VIEWING_MAP) {
            return (
                <View style={styles.container}>
                    <ViewWarningMap oneWarning={false}
                        style={styles} warnings={this.state.warnings} onMarkerPress={this.onMarkerPress}/>
                </View>
            );
        } else if (this.state.myState === State.VIEWING_WARNING) {
            const currentWarning = this.state.warnings[this.state.currentWarning];
            return (
                <View style={styles.viewWarningContainer}>
                    <View style={styles.titleBarContainer}>

                        <Text style={styles.titleText}>{"Warning: #" + currentWarning.WarningId}</Text>
                    </View>
                    <View style={styles.viewWarningMapContainer}>
                        <ViewWarningMap oneWarning={true}
                            style={styles} warnings={[currentWarning]} onMarkerPress={() => {}}/>
                    </View>
                    <ScrollView style={styles.warningInformationContainer}>
                        <Text style={styles.heading}>Date:</Text>
                        <Text style={styles.text}>{this.extractDate(currentWarning.WarningDateTime)}</Text>
                        <Text style={styles.heading}>Time:</Text>
                        <Text style={styles.text}>{currentWarning.WarningDateTime.substring(11, 16)}</Text>
                        <Text style={styles.heading}>Person(s) Description:</Text>
                        <Text style={styles.text}>{currentWarning.WarningDescription}</Text>
                        <Text style={styles.heading}>Warning Description:</Text>
                        <Text style={styles.text}>{currentWarning.WarningDescription}</Text>
                    </ScrollView>
                    <View style={styles.voteButtonContainer}>
                        <View style={styles.voteButton}>
                            <Button title="I saw this happen" color="green" onPress={() => {}}/>
                        </View>
                        <View style={styles.voteButton}>
                            <Button title="This is spam" color="red" onPress={() => {}}/>
                        </View>
                    </View>
                    <Button title="back to map"
                            onPress={() => this.setState({myState: State.VIEWING_MAP})}
                    />
                </View>
            );
        }

        // myState === State.LOADING
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    /**
     * Retrieves warnings from the server which are used to populate the map.
     */
    private getWarnings() {
        makeRequest("POST", "/warning/all", true, {})
            .then((value) => {
                this.setState({
                    warnings: value,
                    myState: State.VIEWING_MAP,
                });
            })
            .catch((err) => {
                this.setState({myState: State.VIEWING_MAP});
                handleNetworkError(err);
            });
    }

    /**
     * Updates myState so that the information form the warning that the user
     * selected will be displayed on screen.
     */
    private onMarkerPress = (id: number) => {
        this.setState({
            currentWarning: id,
            myState: State.VIEWING_WARNING,
        });
    }

    private extractDate(dateTime: string): string {
        const year = dateTime.substring(0, 4);
        const month = dateTime.substring(5, 7);
        const day = dateTime.substring(8, 10);

        return `${day}/${month}/${year}`;
    }
}

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    viewWarningContainer: {
        flex: 1,
    },
    viewWarningMapContainer: {
        height: height / 3,
    },
    titleBarContainer: {
        flexDirection: "row",
        alignContent: "center",
        justifyContent: "center",
        padding: 5,
    },
    titleText: {
        fontWeight: "bold",
        fontSize: 20,
    },
    warningInformationContainer: {
        margin: 10,
    },
    heading: {
        fontWeight: "bold",
    },
    text: {
        fontSize: 15,
        marginBottom: 5,
    },
    voteButtonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    voteButton: {
        flexGrow: 1,
    },
});
