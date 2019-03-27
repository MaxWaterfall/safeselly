import { Button, Col, Grid, Row, Text, View} from "native-base";
import React, { Component } from "react";
import { DatePickerAndroid, DatePickerAndroidOpenReturn, TimePickerAndroid } from "react-native";
import { Centre } from "../../general/StyleComponents";
import Styles from "../../general/Styles";

interface IProps {
    dateTime: Date;
    chooseTime(time: any): void;
    chooseDate(date: any): void;
}

export default class DateTime extends Component<IProps> {

    public constructor(props: IProps) {
        super(props);
    }

    public render() {
        return (
            <Grid style={Styles.mbt10}>
                <Row style={Styles.mb10}>
                    <Col size={1}>
                        <Centre>
                            <Text>
                                Date:
                            </Text>
                        </Centre>
                    </Col>
                    <Col size={5}>
                        <Button bordered onPress={this.openDatePicker}>
                            <Text>
                                {this.props.dateTime.toDateString()}
                            </Text>
                        </Button>
                    </Col>
                </Row>
                <Row>
                    <Col size={1}>
                        <Centre>
                            <Text>
                                Time:
                            </Text>
                        </Centre>
                    </Col>
                    <Col size={5}>
                        <Button bordered onPress={this.openTimePicker}>
                            <Text>
                                {this.props.dateTime.toTimeString().substring(0, 5)}
                            </Text>
                        </Button>
                    </Col>
                </Row>
            </Grid>
        );
    }

    private openDatePicker = () => {
        const today = new Date();
        const minDate = new Date(2019, 0, 0);
        DatePickerAndroid.open({
            date: today,
            maxDate: today,
            minDate,
        })
            .then((value: DatePickerAndroidOpenReturn) => {
                if (value.action === "dismissedAction") {
                    return;
                }

                this.props.chooseDate({
                    year: value.year,
                    month: value.month,
                    day: value.day,
                });
            });
    }

    private openTimePicker = () => {
        const now = new Date();
        TimePickerAndroid.open({
            hour: now.getHours(),
            minute: now.getMinutes(),
            is24Hour: true,
            mode: "spinner",
        })
            .then((value) => {
                if (value.action === "dismissedAction") {
                    return;
                }
                // Call props with new date.
                this.props.chooseTime({
                    hours: value.hour,
                    minutes: value.minute,
                });
            });
    }
}
