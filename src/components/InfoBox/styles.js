import { theme } from "../../lib/vis-graphs/theme";

const style = {
    modal: {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            minWidth: "400px",
            minHeight: "250px",
            transform: 'translate(-50%, -50%)',
            color: '#000',
            border: '1px solid rgb(167, 162, 162)',
            padding: '0px 0px 50px',
        },
    },
    container: {
        padding: '10px'
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        height: '40px',
        textAlign: 'center',
        width: '100%',
    },
    button: {
        background: theme.palette.greyDarkColor,
        label: theme.palette.greyLightColor
    }
}

export default style;
