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
        // shadowColor: "", // #56B79B Green

        // Custom borders
        thinBorder: "solid 1px",
        boldBorder: "solid 2px",

        // Custom colors
        blackColor: "#6b6b6b",
        blackDarkColor: "#5e5959",
        blackDarkerColor: "#232022",
        blackLightColor: "#777d7d",
        blackLighterColor: "#91aeae",
        blueBlindColor: "#0072b2",
        blueColor: "#6b94ec",
        blueDarkColor: "#5a83de",
        blueDarkerColor: "#333333",
        blueLightColor: "#7da3f7",
        blueLighterColor: "#b3d0ff",
        bluePaleColor: "#c7d9f9",
        greenBlindColor: "#009e73",
        greenColor: "#b3d645",
        greenDarkColor: "#36ab65",
        greenLightColor: "#e0fe83",
        greenLighterColor: "#ffffcb",
        greyColor: "#d9d9d9",
        greyDarkColor: "#ccc2c2",
        greyDarkerColor: "#333333",
        greyLightColor: "#f2f2f2",
        greyLighterColor: "#fcfcfc",
        mauveColor: "#aa97f2",
        orangeBlindColor: "#e69f00",
        orangeColor: "#f9b13d",
        orangeLightColor: "#fec26a",
        orangeLighterColor: "#fed291",
        redBlindColor: "#d55e00",
        redColor: "#f76159",
        transparentColor: "transparent",
        whiteColor: "#ffffff",
        windowBodyColor: "#f5f5f5",
        yellowBlindColor: "#f0e442",
        yellowColor: "#eeda54",
    },
    drawer: {
        color: "#3F5574",
    },
    appBar: {
        color: "#3F5574",
    },
});

export const theme = lightTheme;
