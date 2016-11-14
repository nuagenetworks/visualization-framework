import { theme } from "../../theme";

const style = {
    navBar: {
        fontSize: "12px",
        fontWeight: 200,
    },
    container: {
    },
    menuLogo: {
        textAlign: "center",
        fontSize: "1.2em",
        fontWeight: 300,
        padding: "10px",
        color: theme.palette.blackColor,
        background: theme.palette.greyLightColor,
    },
    nestedItems: {
        padding: 0
    },
    nestedItem: {
        fontSize: "1em",
        color: theme.palette.blackColor,
    },
    innerNestedItem: {
        paddingLeft: "32px",
        color: theme.palette.blackColor,
    },
    iconMenu: {
        width: "16px",
        height: "16px",
        margin: "16px 8px 8px 8px"
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
