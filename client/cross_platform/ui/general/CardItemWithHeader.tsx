import { Body, Card, CardItem, Text} from "native-base";
import React from "react";

interface IProps {
    header: string;
    body: string;
}

export const CardItemWithHeader = (props: IProps) => {
    return (
        <Card>
            <CardItem header>
              <Text>{props.header}</Text>
            </CardItem>
            <CardItem>
              <Body>
                <Text>
                  {props.body}
                </Text>
              </Body>
            </CardItem>
         </Card>
    );
};
