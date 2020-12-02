import React from 'react';

class NavBar extends React.Component{
    /**
     * Simple navigational bar across app. When authenticated,
     * provides logout feature
     * @param {*} props 
     */
    constructor(props){
        super(props);
    }

    handleLogout = (event) => {
        /**
         * Handler for logging out user
         * @param {Event} event Target button click triggering function
         */

        event.preventDefault();

        let fetchURL = process.env.REACT_APP_PORT+'/api/logout';
        fetch(fetchURL, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include'
        }).then(response => {
            if(response.status === 200){
                this.props.updateAuthentication();
            } else{
                alert("Server error");
            }
        }).catch(error => {
            alert('Server error');
            console.log(error);
        })
    }

    render(){
        if(this.props.authenticated){
            return(
                <LogoutButton handleLogout={(event) => this.handleLogout(event)}/>
            )
        } else{
            return(
                <div></div>
            )
        }
    }
}

function LogoutButton(props){
    return(
        <button onClick={props.handleLogout}>Logout</button>
    )
}

export default NavBar;