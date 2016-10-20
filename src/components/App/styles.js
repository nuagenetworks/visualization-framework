import { theme } from "../../theme";

const style = {
    navBar: {
        fontSize: "12px",
        fontWeight: 200,
    },
    container: {
        margin: "10px",
        position: "relative",
    },
    menuLogo: {
        textAlign: "center",
        fontSize: "1.2em",
        padding: "10px",
        color: theme.palette.blackColor,
        background: theme.palette.greyLightColor,
    },
    nestedItems: {
        padding: 0,
    },
    nestedItem: {
        fontSize: "1em",
        paddingLeft: "16px",
        color: theme.palette.blackColor,
    },
    listItem: {
        color: theme.palette.blackColor,
        fontSize: "1em",
        fontWeight: 200,
    },
    subHeader: {
        height: "35px",
        lineHeight: "35px",
        color: theme.palette.blueColor,
        fontSize: "1.1em",
        fontWeight: 300,
        background: theme.palette.greyLightColor,
    }
}

export default style;
