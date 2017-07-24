import { theme } from "../../theme";

const style = {
    card: {
        border: theme.palette.thinBorder + theme.palette.greyColor,
        height: "100%",
        width: "100%",
        WebkitBoxShadow: "rgb(31, 28, 31) 6px 6px 16px -11px",
        MozBoxShadow: "rgb(31, 28, 31) 6px 6px 16px -11px",
        boxShadow: "rgb(31, 28, 31) 6px 6px 16px -11px"
    },
    cardTitle: {
        background: theme.palette.greyLightColor,
        color: theme.palette.blackColor,
        padding: "10px",
        fontSize: "0.9em",
        fontWeight: "600",
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
        cursor: "pointer"
    },
    sharingOptionsContainer: {
        padding: "2px",
        background: theme.palette.greyColor,
        position: "absolute",
        zIndex: 999,
        width: "100%"
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
        cursor: "pointer"
    },
    descriptionText: {
        position: "relative",
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: "1.1em",
        color: theme.palette.blackColor,
    },
    fullWidth: {
        width: "100%",
    },

    smallBox: {
        borderRadius: "2px",
        position: "relative",
        display: "block",
        marginBottom: "20px",
        boxShadow: "0 1px 1px rgba(0,0,0,0.1)"
    },

    innerCardTitleIcon: {
        padding: 0,
        margin: "0 0 0 1px",
        width:16,
        height:16,
        fontSize: "0.75em",
        textAlign: "center",
        cursor: "pointer",
        color: "#fff",
    },

};

export default style;
