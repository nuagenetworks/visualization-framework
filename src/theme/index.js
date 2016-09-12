import lightMuiTheme from "material-ui/styles/baseThemes/lightBaseTheme";
import getMuiTheme from "material-ui/styles/getMuiTheme";

export const lightTheme = getMuiTheme(lightMuiTheme, {
    palette: {
        // Material-UI
        primary1Color: "#ffffff",
        primary2Color: "#83a8cd",
        primary3Color: "#3b5874",
        // textColor: "#ffffff",
        // alternateTextColor: "#ffffff",
        accent1Color: "#E7808B", //red
        accent2Color: "#D1D1D1", // gray
        accent3Color: "#DEBB4E", // orange

        canvasColor: "#ffffff", // #E7808B red
        borderColor: "#D1D1D1", // gray or #797979
        disabledColor: "#DEBB4E", // orange
        pickerHeaderColor: "#4E95D8", // blue
        clockCircleColor: "#55C6C9", // light blue
        shadowColor: "#56B79B", // Green

        // Custom
        thinBorder: "solid 1px",
        boldBorder: "solid 2px",
        transparentColor: "transparent",
        containerBackgroundColor: "#3F5574",
        lightBlue: "#506B93",
    },
    drawer: {
        color: "#3F5574",
    },
    appBar: {
        color: "#3F5574",
    },
});

export const theme = lightTheme;
