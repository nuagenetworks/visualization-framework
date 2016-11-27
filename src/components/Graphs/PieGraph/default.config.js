import { theme } from "../../../theme";

export const properties = {
    pieInnerRadius: 0, // The inner radius of the slices. Make this non-zero for a Donut Chart.
    pieOuterRadius: 0.8, // The outer radius of the slices.
    pieLabelRadius: 0.85, // The radius for positioning labels.
    colors: [
        theme.palette.blueColor,
        theme.palette.pinkColor,
        theme.palette.orangeColor,
        theme.palette.greenColor,
        theme.palette.yellowDarkColor,
        theme.palette.mauveColor,
        theme.palette.redColor,
        theme.palette.greyColor
    ],
    stroke: {
        color: theme.palette.whiteColor,
        width: "3px"
    },
    colorLegend: false, // Whether or not to show a color legend.
    colorLegendHeight: 30, // The height of the color legend area, in pixels.
    colorLegendSpacing: 85, // The space between items in the color legend.
    colorLegendCircleSize: 10, // The radius of colored circles in the legend.
    colorLegendLabelOffsetX: 2 // The text X offset in pixels from the circle.
}
