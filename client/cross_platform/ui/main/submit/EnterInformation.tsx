import { Button, Container, Content, H3, Item, Text, Toast } from "native-base";
import React, { Component } from "react";
import { LatLng } from "react-native-maps";
import { IGeneralWarning, WarningInformationType, WarningType } from "../../../helper/Warnings";
import { LoadingScreen } from "../../general/LoadingScreen";
import { formatDate, sendWarning } from "./../../../services/SubmitWarningService";
import { HeaderBar } from "./../../general/HeaderBar";
import Styles from "./../../general/Styles";
import DateTime from "./DateTime";
import GeneralWarning from "./GeneralWarning";

interface IState {
    warningLocation: LatLng;
    warningDate: Date;
    warningInformation: WarningInformationType;
    warningType: WarningType;
    loading: boolean;
}

export default class EnterInformation extends Component<any, IState> {
    // @ts-ignore
    public static navigationOptions = ({navigation}) => {
        return {
            header: <HeaderBar backButton onPress={() => navigation.pop()}/>,
        };
    }

    public constructor(props: any) {
        super(props);

        this.state = {
            warningLocation: this.props.navigation.getParam("WarningLocation") as LatLng,
            warningDate: new Date(),
            warningInformation: this.getInitialWarningInformation(),
            warningType: this.props.navigation.getParam("WarningType") as WarningType,
            loading: false,
        };
    }

    public render() {
        if (this.state.loading) {
            return <LoadingScreen/>;
        }

        return (
            <Container>
                <Content padder>
                    <H3 style={{...Styles.centreText as any, ...Styles.mbt10}}>
                        What happened?
                    </H3>
                    <Text style={{...Styles.centreText as any, ...Styles.mb10}}>
                        Fill out the fields below.
                    </Text>
                    <Item last/>
                    <Text style={Styles.mt10}>
                        When did the incident occur?
                    </Text>
                    <DateTime
                        chooseTime={this.updateTime}
                        chooseDate={this.updateDate}
                        dateTime={this.state.warningDate as Date}
                    />
                    <Item last/>
                    {this.renderTypeFields()}
                    <Item last/>
                    <Button
                        full
                        primary
                        onPress={this.submitWarning}
                    >
                        <Text>
                            Submit Warning
                        </Text>
                    </Button>
                </Content>
            </Container>
        );
    }

    /**
     * Callback function used by the components that render specific fields based on warning type.
     */
    public updateWarningInformation = (info: WarningInformationType) => {
        this.setState({warningInformation: info});
    }

    /**
     * Submits the warning to the server.
     */
    public submitWarning = () => {
        this.setState({loading: true});
        sendWarning({
            type: this.state.warningType,
            location: {
                lat: this.state.warningLocation.latitude,
                long: this.state.warningLocation.longitude,
            },
            dateTime: formatDate(this.state.warningDate),
            information: this.state.warningInformation,
        })
            .then(() => {
                this.props.navigation.popToTop();
                Toast.show({
                    text: "Thankyou for your submission.",
                    type: "success",
                });
            })
            .catch((err) => {
                this.setState({loading: false});
                Toast.show({
                    text: err.message,
                    type: "danger",
                });
            });
    }

    /**
     * Initialises the warning information object depending on the WarningType.
     */
    private getInitialWarningInformation = (): WarningInformationType => {
        const type = this.props.navigation.getParam("WarningType") as WarningType;

        if (type === "general") {
            return {
                peopleDescription: "",
                warningDescription: "",
            };
        }

        // Default for now.
        return {
            peopleDescription: "",
            warningDescription: "",
        };
    }

    /**
     * Renders a specific set of fields depending on the warning type.
     */
    private renderTypeFields = () => {
        const type = this.state.warningType;

        if (type === "general") {
            return (
                <GeneralWarning
                    info={this.state.warningInformation as IGeneralWarning}
                    updateWarningInformation={this.updateWarningInformation}
                />
            );
        }
    }

    private updateTime = (time: any) => {
        const currentDate = this.state.warningDate as Date;
        this.setState({
            warningDate: new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDay(),
                time.hours,
                time.minutes,
            ),
        });
    }

    private updateDate = (date: any) => {
        const currentDate = this.state.warningDate as Date;
        this.setState({
            warningDate: new Date(
                date.year,
                date.month,
                date.day,
                currentDate.getHours(),
                currentDate.getMinutes(),
            ),
        });
    }
}
