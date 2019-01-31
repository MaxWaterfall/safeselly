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
    padder: {
        margin: 10,
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
