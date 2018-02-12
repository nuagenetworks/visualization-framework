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
        'UnMonitored': theme.palette.yellowLightColor,
        '0': theme.palette.greenColor,
        '1': theme.palette.yellowLightColor,
        '2': theme.palette.redColor,
        'Green': theme.palette.greenColor,
        'Red': theme.palette.redColor,
        'Orange': theme.palette.yellowLightColor
    },
    otherColors: [
        theme.palette.bluePaleColor,
        theme.palette.orangeLightColor,
        theme.palette.blueLightColor,
        theme.palette.pinkLightColor,
        theme.palette.orangeLighterColor,
        theme.palette.blackLightColor,
        theme.palette.greenLightColor,
        theme.palette.greyLightDarkColor,
        theme.palette.blueviolet,
        theme.palette.darkCyan,
        theme.palette.peach,
        theme.palette.aquaLightColor,
        theme.palette.windowBodyColor,
        theme.palette.orangeBlindColor,
        theme.palette.mauveColor,
    ],
    emptyBoxColor: theme.palette.greyLightColor
}
