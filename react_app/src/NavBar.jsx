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

    handleLogout = async (event) => {
        /**
         * Handler for logging out user
         * @param {Event} event Target button click triggering function
         */

        event.preventDefault();

        try{
            let response = await fetch('/api/logout', {
                method: 'POST',
                mode: 'cors',
                credentials: 'include'
            });

            if(response.status === 200){
                await this.props.updateAuthentication();
            } else{
                alert("Server error");
            }
        } catch(err){
            alert('Server error');
            console.log(err);
        }
    }

    render(){
        if(this.props.authenticated){
            return(
                <LogoutButton id="logoutButton" handleLogout={(event) => this.handleLogout(event)}/>
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