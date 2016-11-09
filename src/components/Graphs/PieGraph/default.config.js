import { theme } from "../../../theme";

export const properties = {
    pieInnerRadius: 0, // The inner radius of the slices. Make this non-zero for a Donut Chart.
    pieOuterRadius: 0.8, // The outer radius of the slices.
    pieLabelRadius: 0.85, // The radius for positioning labels.
    colors: [
        theme.palette.yellowLightColor,
        theme.palette.orangeLightColor,
        theme.palette.blueLightColor,
        theme.palette.pinkLightColor,
        theme.palette.greenColor,
        theme.palette.yellowDarkColor,
        theme.palette.orangeLighterColor
    ],
    stroke: {
        color: theme.palette.whiteColor,
        width: "3px"
    }
}
