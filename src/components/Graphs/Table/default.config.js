import { theme } from "../../../theme";

export const properties = {
    width: "100%",
    padding: 8,
    colors: [theme.palette.whiteColor, theme.palette.greyLightColor],
    fontColor: theme.palette.blackLightColor,
    border: {
        top: "solid 1px " + theme.palette.greyLightColor,
        left: "0",
        right: "0",
        bottom: "0",
    },
    header: {
        fontColor: theme.palette.blackColor,
        border: {
            top: "0",
            left: "0",
            right: "0",
            bottom: "solid 2px " + theme.palette.greyLightColor,
        }
    }
}
