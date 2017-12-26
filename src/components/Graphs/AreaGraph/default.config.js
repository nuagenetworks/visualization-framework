import { theme } from "../../../theme"

export const properties = {
    strokeWidth: '2px',
    opacity: '0.4',
    legend: {
        show: false
    },
    colors: [
        theme.palette.yellowLightColor,
        theme.palette.redLightColor,
        theme.palette.orangeLightColor,
        theme.palette.blueLightColor,
        theme.palette.pinkLightColor,
        theme.palette.greenColor,
        theme.palette.mauveColor,
        theme.palette.greenDarkerColor,
        theme.palette.redBlindColor,
        theme.palette.peach,
        theme.palette.darkCyan,
        theme.palette.lightBrown,
        theme.palette.blueviolet,
        theme.palette.aquaLightColor
    ],
    zeroStart: true,
    stacked: true,
    circleRadius: 5,
    transition: 1000
}
