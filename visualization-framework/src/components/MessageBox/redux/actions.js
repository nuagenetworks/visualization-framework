export const ActionTypes = {
    ACTION_MESSAGE_BOX_TOGGLE: "ACTION_MESSAGE_BOX_TOGGLE",
};

export const ActionKeyStore = {
    MESSAGE_BOX_OPENED: "opened",
    MESSAGE_BOX_TITLE: "title",
    MESSAGE_BOX_BODY: "body",
    MESSAGE_BOX_BUTTONS: "buttons",
};


export const Actions = {
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
