export const ActionTypes = {
    ACTION_MESSAGE_BOX_TOGGLE: "ACTION_MESSAGE_BOX_TOGGLE",
};

export const ActionKeyStore = {
    KEY_STORE_MESSAGE_BOX_OPENED: "opened",
    KEY_STORE_MESSAGE_BOX_TITLE: "title",
    KEY_STORE_MESSAGE_BOX_BODY: "body",
    KEY_STORE_MESSAGE_BOX_BUTTONS: "buttons",
};


export const MessageBoxActions = {
    toggleMessageBox: function(opened, title, body, buttons) {
        return {
            type: ActionTypes.ACTION_MESSAGE_BOX_TOGGLE,
            opened: opened,
            title: title,
            body: body,
            buttons: buttons
        };
    },
};
