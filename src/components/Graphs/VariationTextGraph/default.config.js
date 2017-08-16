import { theme } from "../../../theme";

export const properties = {
    titleHeader: {
        fontColor: theme.palette.whiteColor,
        padding: "5px"
    },
    textAlign: "center",
    padding: {
        top: "15px",
        bottom: "5px",
        left: "15px",
        right: "15px"
    },
    fontSize: "1.4em",
    fontColor: theme.palette.whiteColor,
    drawColors: {
        content: theme.palette.yellowDarkColor,
        header: {
            backgroundColor: theme.palette.yellowDarkerColor,
            color: theme.palette.whiteColor,
            padding: "5px"
        },
        iconBox: theme.palette.yellowDarkColor
    },
    negativeColors: {
        content: theme.palette.redLightColor,
        header: {
            backgroundColor: theme.palette.redDarkColor,
            color: theme.palette.whiteColor,
            padding: "5px"
        },
        iconBox: theme.palette.redColor
    },
    positiveColors: {
        content: theme.palette.greenColor,
        header: {
            backgroundColor: theme.palette.greenDarkerColor,
            color: theme.palette.whiteColor,
            padding: "5px"
        },
        iconBox: theme.palette.greenDarkColor
    },
}
