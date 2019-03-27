import {
    Accordion, Button, Container, Content, H3, Item, Text, View,
} from "native-base";
import React, { Component } from "react";
import { WarningType } from "../../../../../shared/Warnings";
import { HeaderBar } from "../../general/HeaderBar";
import Styles from "../../general/Styles";

export default class ChooseWarningType extends Component<any> {
      // @ts-ignore
      public static navigationOptions = ({navigation}) => {
        return {
            header: <HeaderBar backButton onPress={() => navigation.pop()}/>,
        };
    }

    private dataArray = [
        { title: "Mugging", content:
            "Stolen property from you personally. By force " +
            "or with the threat of force (e.g. phone, wallet etc.).",
        },
        { title: "Assault", content:
            "Attacked you violently (e.g. punching, kicking, stabbing etc.).",
        },
        { title: "Threatening Behaviour", content:
            "Threatened to harm you or your property.",
        },
        { title: "Harassment", content:
            "Catcalled, made inappropriate comments, masturbated in public, " +
            "showed their genitals, followed you or asked you to get in their car etc.",
        },
        { title: "Burglary", content:
            "Entered your home and stole or attempted to steal your property.",
        },
        { title: "Theft", content:
            "Stolen your property whilst you were not present (e.g. laptop " +
            "stolen from a cafe, bicycle stolen outside the library etc.).",
        },
        { title: "Suspicious Behaviour", content:
            "Tried to open house/car doors, been in places they should not be, taken photos without good reason etc.",
        },
        { title: "Vandalism", content:
            "Damaged your property (e.g. scratched your car, smashed your house window etc.).",
        },
        { title: "General", content:
            "Done anything else that has not been covered by the above sections.",
        },
    ];

    constructor(props: any) {
        super(props);
    }

    public render() {
        return (
            <Container>
                <Content padder>
                    <H3 style={{...Styles.centreText as any, ...Styles.mbt10}}>
                        What type of incident was it?
                    </H3>
                    <Text style={{...Styles.centreText as any, ...Styles.mb10}}>
                        Select from the list below.
                    </Text>
                    <Item last/>
                    <Accordion
                        dataArray={this.dataArray}
                        renderContent={this.renderContent}
                    />
                </Content>
            </Container>
        );
    }

    private moveToNextScreen = (type: WarningType) => {
        this.props.navigation.push("EnterInformation", {
            WarningLocation: this.props.navigation.getParam("WarningLocation"),
            WarningType: type,
        });
    }

    private renderContent = (item: any) => {
        return (
            <View>
                <Content padder>
                    <Text style={[Styles.centreText as any, Styles.mb10]}>
                        The perpetrator(s) has:
                    </Text>
                    <Text>
                        {item.content}
                    </Text>
                    <Button
                        full
                        onPress={() => this.moveToNextScreen(item.title.toLowerCase())}
                        style={Styles.mt10}
                    >
                        <Text>
                            Select
                        </Text>
                    </Button>
                </Content>
            </View>
        );
    }
}
