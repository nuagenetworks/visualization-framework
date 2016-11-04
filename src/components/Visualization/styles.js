import { theme } from "../../theme";

const style = {
    card: {
        border: theme.palette.thinBorder + theme.palette.greyColor,
        height: "100%",
        width: "100%",
        minHeight: "300px",
    },
    cardTitle: {
        background: theme.palette.greyLightColor,
        color: theme.palette.blackColor,
        padding: "10px",
        fontSize: "1.2em",
        fontWeight: "200",
    },
    cardText: {
        padding: "10px",
        fontSize: "0.85em",
        color: theme.palette.blackColor,
    },
    cardContainer: {
        height: "100%",
        width: "100%",
    },
    overlayContainer: {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        display: "inline-block",
        textAlign: "center",
    },
    overlayText: {
        position: "absolute",
        top: "40%",
        width: "100%",
        fontSize: "1.2em",
        fontWeight: 300,
        color: theme.palette.blackColor,
    },
    container: {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        display: "inline-block",
        textAlign: "center",
    },
    text: {
        position: "absolute",
        top: "40%",
        width: "100%",
        fontSize: "1.2em",
        fontWeight: 300,
    },
    descriptionContainer: {
        textAlign: "justify",
        background: theme.palette.greyDarkColor,
        opacity: "0.8",
    },
    descriptionText: {
        padding: "60px 20px 20px 20px",
        fontSize: "1.1em",
        color: theme.palette.whiteColor,
    }

};

export default style;
