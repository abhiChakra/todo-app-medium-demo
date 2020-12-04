import React from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import Login from './Login';
import Home from './Home';
import NavBar from './NavBar';

class App extends React.Component {
  /**
   * Central App Component. Used to return Components 
   * based on user authenication, in our simple app, just
   * between Login and Home pages
   * @param {*} props 
   */
  constructor(props){
    super(props);
    this.state = {
      isAuthenticated: null,
      // used to prevent jump between login and bulletin-analysis while authenticating
      authenticating: true
    };
  }

  componentDidMount(){
    this.verifyAuthentication();
  }

  verifyAuthentication = () => {
    /**
     * Used to verify user authentication status from flask endpoint
     */
    let fetchURL = process.env.REACT_APP_PORT+'/api/is_logged_in';
    
    fetch(fetchURL, {
      method: 'GET',
      timeout: 8000,
      credentials: 'include',
      mode: 'cors'
    }).then(response => {
      response.json().then(authenticated => {
        if(authenticated){
          this.setState({
            isAuthenticated: true,
            authenticating: false
        });
        } else{
          this.setState({
            isAuthenticated: false,
            authenticating: false
        });  
        }
      })
    }).catch(err => {
      alert("Error connecting to flask server: ", err);
    })
  }

  render(){
    if(this.state.authenticating){
      return(
        <div>Authenticating...</div>
      )
    }

    return(
      <div id="Nginx-App">
        <NavBar authenticated={this.state.isAuthenticated} updateAuthentication={() => this.verifyAuthentication()}/>
        <BrowserRouter>
          {
            (this.state.isAuthenticated) ? (
              [<Switch>,
                <Redirect exact from='/login' to='home'/>,
                <Redirect exact from='/' to='home'/>,
                <Route exact path='/home' component={Home}/>
              </Switch>
              ]) : ([
                <Redirect to='login'/>,
                <Route path='/login' render={(props) => <Login {...props}
                        updateAuthentication={() => this.verifyAuthentication()}/>}/>]
            )
          }
        </BrowserRouter>
      </div>
    )
  }



}

export default App;
