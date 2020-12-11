import React from 'react';

class Login extends React.Component{
    /**
     * Login page, where user is redirected if not authenticated.
     * Includes basic login functionality.
     * @param {*} props 
     */
    constructor(props){
        super(props);
        this.state = {
            username : null, password: null, usrMessage: ''
        };
    }

    handleUsernameChange = (event) => {
        /**
         * Handler for change in username input box
         * @param {Event} event Text change in textbox triggering this function
         */
        this.setState({username : event.target.value});
    }

    handlePasswordChange = (event) => {
        /**
         * Handler for change in password input box
         * @param {Event} event Text change in textbox triggering this function
         */
        this.setState({password : event.target.value});
    }

    handleLogin = async (event) => {
        /**
         * Handler for authenticating user credentials
         * @param {Event} event Target button click triggering function
         */

        // preventing default page reload
        event.preventDefault();

        const credentials = {
            username : this.state.username,
            password : this.state.password
        }

        let fetchURL = process.env.REACT_APP_PORT+'/api/login';

        try{
            let response = await fetch(fetchURL, {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify(credentials),
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if(response.status === 200){
                this.setState({usrMessage : 'Authenticated. Redirecting to home.'});
                await this.props.updateAuthentication();
            } else{
                this.setState({usrMessage : 'Incorrect credentials'});
            }
        } catch(err){
            this.setState({usrMessage : 'Server error'});
            console.log(err);
        }
    }

    render() {
        return(
            <div>
                <UsernameInput handleUsernameChange={(event) => this.handleUsernameChange(event)}/>
                <br/>
                <PasswordInput handlePasswordChange={(event) => this.handlePasswordChange(event)}/>
                <br/>
                <LoginButton handleLogin={(event) => this.handleLogin(event)}/>
                <br/>
                <div>{this.state.usrMessage}</div>
            </div>
        )
    }
}

function UsernameInput(props) {
    return (
        <input id="usernameInput" type="username" placeholder="Username"
               onChange={props.handleUsernameChange}>
        </input>
    );
}


function PasswordInput(props) {
    return (
        <input id="passwordInput" type="password" placeholder="Password"
               onChange={props.handlePasswordChange}>
        </input>
    );
}


function LoginButton(props) {
    return (
        <button id="authenticateButton" onClick={props.handleLogin}>
            Log In
        </button>
    );
}

export default Login;