import { StyleSheet } from "react-native";

export default {
    mb10: {
        marginBottom: 10,
    },
    mt10: {
        marginTop: 10,
    },
    mbt10: {
        marginBottom: 10,
        marginTop: 10,
    },
    margin: {
        margin: 10,
    },
    padder: {
        padding: 10,
    },
    centreText: {
        textAlign: "center",
    },
    centreChildren: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    fillObject: {
        ...StyleSheet.absoluteFillObject,
    },
};
