import { Text, View } from "native-base";
import React from "react";
import { IGeneralWarning } from "../../../helper/Warnings";
import Styles from "../../general/Styles";

interface IProps {
    info: IGeneralWarning;
}

export const ViewGeneralWarning = (props: IProps) => {
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
