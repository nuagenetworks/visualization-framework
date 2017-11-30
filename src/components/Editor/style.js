import { primary, gray } from '../../ui-components/style';

const modalTitleHeight = 43;

const wrapper = {
    height: '100%',
};

export default {
    modal: {
        padding: 0,
    },
    modalActions: {
        padding: 0,
    },
    modalTitle: {
        color: primary,
        fontSize: 19,
        fontWeight: 'normal',
        padding: '10px 20px',
        margin: 0,
        borderBottom: `1px solid ${gray}`,
    },

    modalEditorContainer: {
        height: `calc(100% - ${modalTitleHeight}px)`,
    },
    editorField: {
        marginBottom: 10,
    },

    bottomBar: {
        padding: 10,
        borderTop: `1px solid ${gray}`,
        display: 'flex',
        flexDirection: 'row-reverse',
    },

    wrapper,
    editor: {
        height: 'calc(100% - 40px)',
        overflow: 'scroll',
        fontSize: 12,
        padding: 20,
        boxSizing: 'border-box',
    },
    tabsContainer: {
        marginTop: 20,
    },
    readOnlyField: {
        color: 'rgb(0, 0, 0)',
    },
};
