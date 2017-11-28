import { theme } from "../../../theme";

export const properties = {
    colors: [
      theme.palette.blueColor,
      theme.palette.orangeColor,
      theme.palette.pinkColor,
      theme.palette.redColor,
      theme.palette.greenColor
    ],
    orientation: "vertical",
    stroke: {
        width: "1px"
    },
    legend: {
        show: false
    },
    yTickGrid: true
}
