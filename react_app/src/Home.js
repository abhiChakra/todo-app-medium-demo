import React from 'react';

class Home extends React.Component{
    constructor(props){
        super(props);
        this.state = {intro : "", tasks : {}};
    }

    componentDidMount(){
        let fetchURL = process.env.REACT_APP_PORT+'/api/home';
        fetch(fetchURL, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept-Type': 'application/json'
            },
            credentials: 'include'
        }).then(response => {
            if(response.status == 200){
                response.json().then(usrMsg => {
                    this.setState({intro : usrMsg});
                })
            }
        }).catch(error => {
            this.setState({intro : 'Error fetching from server.'});
        })

        this.fetchTasks();
    }

    fetchTasks = (empty = true) => {
        let fetchURL = process.env.REACT_APP_PORT+'/api/tasks';

        let existing_tasks = {};

        if(!empty){
            existing_tasks = this.state.tasks;
        }

        fetch(fetchURL, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            body: JSON.stringify({"existing_tasks" : existing_tasks}),
            headers: {
                'Content-Type': 'application/json',
                'Accept-Type': 'application/json'
            }
        }).then(response => {
            if(response.status === 200){
                response.json().then(new_tasks => {
                    let updated_tasks = this.state.tasks;
            
                    Object.entries(new_tasks).map(([task_id, task]) => {updated_tasks[task_id] = task;});

                    this.setState({tasks : updated_tasks});
                })
            } else{
                this.setState({intro : 'Error fetching from server.'});
            }
        }).catch(error => {
            this.setState({intro : 'Error fetching from server.'});
        })
    }

    // handleTaskDelete = (event, task_id) => {
    //     event.preventDefault();

    //     let fetchURL = process.env.REACT_APP_PORT+'/api/remove_task';

    //     fetch(fetchURL, {
    //         method: 'DELETE',
    //         mode: 'cors',
    //         credentials: 'include',
    //         body: JSON.stringify({'task_id':task_id}),
    //         headers: {
    //             'Content-Type': 'application/json',
    //         }
    //     }).then(response => {
    //         if(response.status === 200){

    //         } else{

    //         }
    //     }).catch(error => {

    //     })
    // }

    render(){
        return(
            <div>
                <div>{this.state.intro}</div>
                <hr />
                <TaskListings displayTasks={this.state.tasks}/>
            </div>
        )
    }
}

function TaskListings(props){
    if(props.displayTasks !== {}){
        return Object.entries(props.displayTasks).map(([task_id, task]) => {
            return(
                <div>
                    <hr />
                    <div key={task_id.toString()}>{task}</div><button>Delete</button>
                    <hr />
                </div>
            )
        });
    } else{
        return(
            <div></div>
        )
    }
}

export default Home;