import React from 'react';

class Login extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            username : null, password: null, usrMessage: ''
        };
    }

    handleUsernameChange = (event) => {
        this.setState({username : event.target.value});
    }

    handlePasswordChange = (event) => {
        this.setState({password : event.target.value});
    }

    handleLogin = (event) => {
        event.preventDefault();

        console.log("username: ", this.state.username, " | password: ", this.state.password);

        const credentials = {
            username : this.state.username,
            password : this.state.password
        }

        let fetchURL = process.env.REACT_APP_PORT+'/api/login';
        fetch(fetchURL, {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify(credentials),
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if(response.status == 200){
                this.props.updateAuthentication();
                this.setState({usrMessage : 'Authenticated. Redirecting to home.'});
            } else{
                this.setState({usrMessage : 'Incorrect credentials'});
            }
        }).catch(err => {
            this.setState({usrMessage : 'Server error'});
            console.log(err);
        })
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
        <input type="username" placeholder="Username"
               onChange={props.handleUsernameChange}>
        </input>
    );
}


function PasswordInput(props) {
    return (
        <input type="password" placeholder="Password"
               onChange={props.handlePasswordChange}>
        </input>
    );
}


function LoginButton(props) {
    return (
        <button onClick={props.handleLogin}>
            Log In
        </button>
    );
}

export default Login;