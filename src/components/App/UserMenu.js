import React from 'react'
import FontAwesome from "react-fontawesome";

class UserMenuView extends React.Component {
    render() {
        const {
            context
        } = this.props;

        let user = context && context.hasOwnProperty("user")
           ? (<span><FontAwesome name='user'/> Signed in as <b>{context['user']}</b> </span>) : '';

        return (
            <div>
                {user}
            </div>
        );
    }
}

export default UserMenuView;
