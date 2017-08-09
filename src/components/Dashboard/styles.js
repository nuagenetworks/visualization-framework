import { theme } from "../../theme";

const style = {
    navigationContainer: {
        background: theme.palette.greyLightDarkColor,
        textAlign: "center",
        color: theme.palette.blackColor,
        padding: "2px 10px",
        height: "34px",
        borderBottom: theme.palette.thinBorder + theme.palette.greyColor,

    },
    linksList: {
        display: "inline-block",
        margin: "3px",
        fontSize: "0.8em",
    },
    link: {
        padding: "0 10px",
        fontSize: "1.3em",
    },
    gridContainer: {
        margin: "10px",
        position: "relative",
    },
    activeLink: {
        fontWeight : "bold",
        fontSize: "1.5em",
    },
    noneTextDecoration : {
        textDecoration: "none",
    }
}

export default style;
