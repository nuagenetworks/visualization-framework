
export const gray = 'rgb(217, 217, 217)';
export const darkGray = 'rgb(79, 79, 79)';
export const primary = 'rgb(107, 148, 236)';
export const backgroundColor = 'rgb(255, 255, 255)';
export const fontColor = 'rgb(107, 107, 107)';
export const translucentBackground = 'rgba(217, 217, 217, .85)';
export const accentColor = '#fa5d5c';
export const white = '#fff';
export const border = `1px solid ${gray}`;


const buttonFlat = {
    background: translucentBackground,
    border: 'none',
    display: 'flex',
    justifyContent: 'center',
    fontSize: 12,
    lineHeight: '14px',
    color: 'rgb(119, 125, 125)',
    cursor: 'pointer',
};

const button = {
    borderRadius: 0,
    border: 0,
    backgroundColor: gray,
    padding: '3px 15px',
    color: 'rgb(79, 79, 79)',
    textAlign: 'center',
};

const tabButton = {
    border: 'none',
    background: 'none',
    fontSize: 12,
    lineHeight: '25px',
};

const tooltip = {
    transition: 'opacity .2s',
    position: 'absolute',
    transform: 'translateY(-100%)',
    fontSize: 10,
    background: backgroundColor,
    padding: '2px 5px',
    border: `1px solid ${gray}`,
};

const fieldWrapper = {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    boxSizing: 'border-box',
    border: '1px solid rgb(208, 208, 208)',
    paddingLeft: 5,
};

const checkbox = {
    height: 14,
    width: 10,
    border: '1px solid #ddd',
    display: 'inline-block',
    marginRight: 5,
    cursor: 'pointer',
};

const select = {
    display: 'flex',
    alignItems: 'center',
    background: '#fff',
    width: '100%',
    boxSizing: 'border-box',
    height: 20,
    lineHeight: 30,
    border: 'none',
    outline: 'none',
    fontFamily: 'Roboto',
    fontSize: 12,
};

const dataViewSectionLabel = {
    overflow: 'hidden',
    fontSize: 11,
    textOverflow: 'ellipsis',
    wordWrap: 'normal',
    color: 'rgb(107, 148, 236)',
};

const viewContent = {
    display: 'flex',
    height: '100%',
};

const wrapper = {
    height: '100%',
    width: '100%',
    position: 'relative',
};

export default {
    button,
    primaryButton: {
        ...button,
        backgroundColor: primary,
        color: '#fff',
    },
    disabledButton: {
        ...button,
        backgroundColor,
        color: 'rgba(79, 79, 79, 0.6)',
    },
    buttonFlatIcon: {
        ...buttonFlat,
        padding: 3,
    },
    buttonFlat: {
        ...buttonFlat,
        padding: '5px 20px',
    },
    buttonActive: {
        color: primary,
    },
    buttonIcon: {
        ...buttonFlat,
        boxShadow: 'rgb(255, 255, 255) 0px 0px 0px 1px',
        padding: 0,
    },
    tipText: {
        marginTop: 0,
        color: 'rgb(88, 88, 88)',
    },
    subheader: {
        marginTop: 10,
        marginBottom: 10,
    },
    header: {
        marginTop: 10,
        marginBottom: 10,
        color: 'rgb(88, 162, 255)',
        fontSize: 15,
        fontWeight: 'normal',
    },
    label: {
        color: 'rgb(84, 84, 84)',
    },

    modal: {
        padding: 0,
    },

    tabs: {
        width: '100%',
        border: `1px solid ${gray}`,
    },
    tabsTop: {
        width: '100%',
        display: 'flex',
        background: 'rgb(242, 242, 242)',
        justifyContent: 'space-around',
    },
    tabButton,
    tabButtonActive: {
        ...tabButton,
        color: primary,
    },
    tabsContent: {
        padding: '10px 20px',
    },

    modalActions: {
        padding: 0,
    },

    tooltipOpen: {
        ...tooltip,
        opacity: 1,
    },
    tooltipClosed: {
        ...tooltip,
        opacity: 0,
    },

    snackbarBackground: {
        backgroundColor: translucentBackground,
    },
    snackbarContent: {
        color: fontColor,
    },
    networkField: {
        display: 'flex',
        alignItems: 'center',
    },
    ipField: {
        width: '80%',
    },
    field: {
        width: '100%',
        boxSizing: 'border-box',
        height: 20,
        border: 'none',
        outline: 'none',
    },
    fieldWrapper,
    errorField: {
        ...fieldWrapper,
        border: `1px solid ${accentColor}`,
    },
    errorSpan: {
        color: 'rgb(255, 0, 0)',
        fontSize: 10,
    },
    popup: {
        fontSize: 10,
        background: 'rgb(242, 242, 242)',
        padding: '2px 5px',
        border: '1px solid rgb(208, 208, 208)',
        height: 20,
    },
    realCheckbox: {
        display: 'none',
    },
    checkboxChecked: {
        ...checkbox,
        backgroundColor: 'rgb(107, 148, 236)',
    },
    checkboxUnchecked: {
        ...checkbox,
        backgroundColor: '#fff',
    },
    checkboxContainer: {
        margin: '0px 0',
    },
    blob: {
        width: '100%',
        overflowY: 'scroll',
    },
    durationInput: {
        width: '100%',
        boxSizing: 'border-box',
        height: 20,
        border: 'none',
        outline: 'none',
    },
    durationWrapper: {
        width: 40,
        display: 'inline-flex',
        alignItems: 'center',
        background: '#fff',
        boxSizing: 'border-box',
        border: '1px solid rgb(208, 208, 208)',
        paddingLeft: 5,
    },
    select,
    selectMenu: {
        ...select,
        height: 20,
        boxSizing: 'border-box',
        border: '1px solid rgb(208, 208, 208)',
        paddingLeft: 5,
    },
    selectHint: {
        fontFamily: 'Roboto',
        fontSize: 12,
        height: 20,
        lineHeight: '30px',
        bottom: 10,
        zIndex: 1,
        padding: 5,
    },
    selectMenuItem: {
        fontFamily: 'Roboto',
        fontSize: 12,
        height: 20,
    },
    selectedMenuItem: {
        color: 'rgb(107, 148, 236)',
        height: 20,
    },
    selectIcon: {
        height: 20,
        width: 20,
        padding: '0',
        top: -4,
        right: 10,
        maxHeight: 30
    },
    selectLabel: {
        height: 20,
        lineHeight: '30px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: 90,
        boxSizing: 'border-box',
        border: '1px solid rgb(208, 208, 208)',
        overflow: 'scroll',
    },
    singleInput: {
        display: 'flex',
        width: '100%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginBottom: '3px',
    },
    dataView: {
        display: 'flex',
        height: 42,
        transition: 'filter .2s',
        justifyContent: 'space-between',
        paddingLeft: 9,
        cursor: 'pointer',
        paddingTop: 5,
    },
    dataViewPrimaryText: {
        marginLeft: 10,
        flexGrow: 2,
        fontSize: 11,
    },
    dataViewSecondaryText: {
        display: 'block',
        fontSize: 9,
        paddingTop: 4,
    },
    dataViewLabel: {
        color: '#6a6a6a',
        display: 'inline-block',
        opacity: 0.9,
        width: 91,
    },
    dataViewRowFullWidth: {
        paddingTop: 5,
        whiteSpace: 'nowrap',
    },
    dataViewSection: {
        display: 'inline-block',
        width: 190,
        padding: '3px 3px 3px 0',
        verticalAlign: 'top',
    },
    dataViewSectionLabel,
    dataViewSectionLabelSelected: {
        ...dataViewSectionLabel,
        color: 'rgb(255, 255, 255)',
    },
    loadingDataView: {
        filter: 'blur(5px)',
    },
    row: {
        display: 'flex',
        marginTop: 4,
    },
    rowKey: {
        width: 50,
    },
    viewContent,
    viewContentWrapper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    viewWrapper: {
        ...wrapper,
        overflow: 'hidden',
    },
};
