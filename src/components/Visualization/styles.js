import { theme } from "../../theme";

const style = {
    card: {
        border: theme.palette.thinBorder + theme.palette.borderColor,
        height: "100%",
        width: "100%",
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
        background: theme.palette.greyDarkerColor,
        opacity: "0.5",
    },
    overlayText: {
        position: "absolute",
        top: "40%",
        width: "100%",
        fontSize: "150%",
        color: theme.palette.whiteColor,
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
        fontSize: "150%",
    },

};

export default style;
