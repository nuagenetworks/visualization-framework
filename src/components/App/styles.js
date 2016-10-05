import { theme } from "../../theme";

const style = {
    container: {
        margin: "20px",
    },
    header: {
        textAlign: "center",
        color: theme.palette.whiteColor,
        fontSize: "120%",
        padding: "10px",
    },
    nestedItems: {
        background: theme.palette.blueLightColor,
        padding: 0,
    },
    nestedItem: {
        fontSize: "14px",
        paddingLeft: "16px",
        color: theme.palette.whiteColor,
    },
    listItem: {
        color: theme.palette.whiteColor,
    },
    subHeader: {
        color: theme.palette.whiteColor,
        fontSize: "120%",
        textDecoration: "underline",
        fontStyle: "normal",
    }
}

export default style;
