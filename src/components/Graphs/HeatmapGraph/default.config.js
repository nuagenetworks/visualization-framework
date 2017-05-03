import { theme } from "../../../theme"

export const properties = {
    stroke: {
        color: "grey",
        width: "0.5px"
    },
    legend: {
        show: false
    },
    mapColors: {
        'InSla': theme.palette.greenColor,
        'OutSla': theme.palette.redColor,
        'UnMonitored': theme.palette.yellowLightColor
    }
}
