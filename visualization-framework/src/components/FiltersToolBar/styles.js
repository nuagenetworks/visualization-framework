import { theme } from "../../theme";

const style = {
    label: {
        fontWeight: "normal",
        fontSize: "0.8em",
        display: "block",
        margin: 0,
        padding: "0 0 0 10px",
        textAlign: "left",
        color: theme.palette.blackColor,
    },
    list: {
        margin: 0,
    },
    listItem: {
        padding: "5px",
        textAlign: "left",
    },
    dropdownMenu: {
        fontSize: "12px",
        height: "26px",
        lineHeight: "20px"
    },
    dropdownMenuUnderlay: {
        lineHeight: "20px"
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
    }
}

export default style;
