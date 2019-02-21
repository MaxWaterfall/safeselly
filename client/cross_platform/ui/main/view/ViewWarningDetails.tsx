import { Text, View } from "native-base";
import React from "react";
import { IWarningInformation } from "../../../../../shared/Warnings";
import Styles from "../../general/Styles";

interface IProps {
    info: IWarningInformation;
}

export const ViewWarningDetails = (props: IProps) => {
    const renderPeopleDescription = () => {
        if (props.info.peopleDescription !== "") {
            return (
                <View>
                    <Text style={[{fontWeight: "bold"}]}>
                        Description of person(s) involved:
                    </Text>
                    <Text style={Styles.mb10}>
                        {props.info.peopleDescription}
                    </Text>
                </View>
            );
        }
    };

    return (
        <View>
            {renderPeopleDescription()}
            <Text style={[{fontWeight: "bold"}]}>
                Description of incident:
            </Text>
            <Text style={Styles.mb10}>
                {props.info.warningDescription}
            </Text>
        </View>
    );
};
