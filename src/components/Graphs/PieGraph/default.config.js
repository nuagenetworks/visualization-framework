import { theme } from "../../../theme";

export const properties = {
    pieInnerRadius: 0,      // The inner radius of the slices. Make this non-zero for a Donut Chart.
    pieOuterRadius: 0.8,    // The outer radius of the slices.
    pieLabelRadius: 0.85,   // The radius for positioning labels.
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
    legend: {
        show: true,                 // Show or not the legend style
        orientation: 'vertical',    // Orientation between 'vertical' and 'horizontal'
        circleSize: 4,              // Size in pixel of the circle
        labelOffset: 2,             // Space in pixels between the circle and the label,
        charToPixel: 8,             // Default value to convert a char to pixel
        circleToPixel: 3,           // Default value to convert the circle to pixel
    }
}
