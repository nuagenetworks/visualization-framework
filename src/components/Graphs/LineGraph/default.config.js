import { theme } from "../../../theme"

export const properties = {
    stroke: {
        color: "red",
        width: "4px"
    },
    legend: {
        show: false
    },
    colors: [
        theme.palette.orangeLightColor,
        theme.palette.blueLightColor,
        theme.palette.pinkLightColor,
        theme.palette.orangeLighterColor,
        theme.palette.greenColor,
        theme.palette.yellowLightColor,
        theme.palette.yellowDarkColor,
    ],
    zeroStart: false,
}
