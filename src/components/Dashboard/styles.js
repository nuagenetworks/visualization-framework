import { theme } from "../../theme";

const style = {
    navigationContainer: {
        background: theme.palette.greyColor,
        textAlign: "center",
        color: theme.palette.blackColor,
        padding: "2px 10px",
        height: "24px",
    },
    linksList: {
        display: "inline-block",
        margin: 0,
        fontSize: "0.8em"
    },
    link: {
        padding: "0 10px",
    },
    iconMenu: {
        padding: 0,
        width:16,
        height:16,
        textAlign: "center",
        cursor: "pointer"
    },
    menuItem: {
        minHeight: "26px",
        lineHeight: "26px",
        fontSize: "12px",
    },
    gridContainer: {
        margin: "10px",
        position: "relative",
    }
}

export default style;
