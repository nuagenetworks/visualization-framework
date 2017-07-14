import { theme } from "../../theme";

const style = {
    card: {
        border: theme.palette.thinBorder + theme.palette.greyColor,
        height: "100%",
        width: "100%"
    },
    cardTitle: {
        background: theme.palette.greyLightColor,
        color: theme.palette.blackColor,
        padding: "10px",
        fontSize: "1em",
        fontWeight: "200",
        overflow: "hidden",
        whiteSpace: "nowrap"
    },
    copyContainer: {
        marginTop: "1px"
    },
    cardTitleIcon: {
        padding: 0,
        margin: "0 0 0 1px",
        width:16,
        height:16,
        fontSize: "0.75em",
        textAlign: "center",
        cursor: "pointer",
        color: theme.palette.blackColor,
    },
    sharingOptionsContainer: {
        padding: "2px",
        background: theme.palette.greyColor
    },
    menuItem: {
        minHeight: "26px",
        lineHeight: "26px",
        fontSize: "12px",
    },
    cardText: {
        padding: "0px",
        fontSize: "0.85em",
        color: theme.palette.blackColor,
        position: "relative"
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
        position: "relative",
        top: "50%",
        transform: "translateY(-50%)",
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
        top: "35%",
        width: "100%",
        fontSize: "1.2em",
        fontWeight: 300,
    },
    descriptionContainer: {
        textAlign: "justify",
        background: theme.palette.greyLighterColor,
        opacity: "0.8",
        cursor: "pointer",
    },
    descriptionText: {
        position: "relative",
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: "1.1em",
        color: theme.palette.blackColor,
    },
    alignCenter: {
        top: "0",
        bottom: "0",
        display: "flex",
        alignItems: "center",
    }

};

export default style;
