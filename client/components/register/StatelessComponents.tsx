import React from "react";
import { Text, View, TextInput, Button, Keyboard, TouchableWithoutFeedback } from "react-native";

interface EnterUsernameProps {
    username: string;
    updateUsername(username: string): void;
    startRegistration(): void;
    shouldDisable(): boolean;
    styles: any;
}
export const EnterUsername: React.SFC<EnterUsernameProps> = (props) => {
    return (
        <TouchableWithoutFeedback onPress = {() => Keyboard.dismiss()}>   
            <View style = {props.styles.container}>
                <Text style = {props.styles.title}>Safe Selly</Text>
                <Text style = {props.styles.instructions}>Enter your University of Birmingham username below.</Text>
                <TextInput style={props.styles.textInput} value={props.username} onChangeText={(text) => props.updateUsername(text)}/>
                <Button title="Next" onPress={props.startRegistration} disabled={props.shouldDisable()}/>
            </View>
        </TouchableWithoutFeedback>
    );
}

interface WaitForConfirmationProps {
    username: string;
    confirmRegistration(): void;
    goBack(): void;
    shouldDisable(): boolean;
    styles: any;
}
export const WaitForConfirmation: React.SFC<WaitForConfirmationProps> = (props) => {
    return (
        <View style={props.styles.container}>
            <Text style={props.styles.instructions}>We've sent an email to {props.username}@bham.ac.uk.</Text>
            <Text style={props.styles.instructions}>Click the link in the email to confirm registration then tap the button below to continue.</Text>
            <Button title="I've clicked the link" onPress={props.confirmRegistration} disabled={props.shouldDisable()}/>
        </View>
    );
}