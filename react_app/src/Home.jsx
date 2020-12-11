import React from 'react';

class Home extends React.Component{
    /**
     * User home, where user is redirected to upon login. 
     * Includes functionality for viewing, adding and deleting user tasks. 
     * @param {*} props 
     */
    constructor(props){
        super(props);
        this.state = {info : "", tasks : {}, newTask: ""};
    }

    async componentDidMount(){
        /** Fetching basic user info and then proceeding to
        *   fetch user's tasks. 
        */

        let fetchURL = process.env.REACT_APP_PORT+'/api/home';

        try{
            let response = await fetch(fetchURL, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept-Type': 'application/json'
                },
                credentials: 'include'
            });

            if(response.status === 200){
                let usrMsg = await response.json();
                this.setState({info : "Updating tasks..."}, () => {
                    return this.fetchTasks(true, usrMsg)
                });
            } else{
                this.setState({info : 'Error fetching from server.'});
            }
        } catch(err){
            this.setState({info : 'Error fetching from server.'});
        }
    }

    fetchTasks = async (empty = true, message = "") => {
        /**
        * Standard function used to fetch a user's tasks.
        * 
        * @param {boolean} empty Useful for fetching only newly added task items
        * @param {string} message Info to be displayed upon fetch completion
        */
        let fetchURL = process.env.REACT_APP_PORT+'/api/tasks';

        let existing_tasks = {};

        if(!empty){
            // when false, only fetch tasks not already present in state
            existing_tasks = this.state.tasks;
        }

        try{
            const tasks_response = await fetch(fetchURL, {
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify({"existing_tasks" : existing_tasks}),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Type': 'application/json'
                }
            });
            
            if(tasks_response){
                if(tasks_response.status === 200){
                    // received new_tasks object in the form {task_id : task_info}
                    let new_tasks = await tasks_response.json();
    
                    let updated_tasks = null;
    
                    if(empty){
                        // if true, must fetch all tasks
                        updated_tasks = {};
                    } else {
                        // if false, must only add on newer fetched tasks to existing state
                        updated_tasks = this.state.tasks;
                    }
                    
                    Object.entries(new_tasks).map(([task_id, task]) => {updated_tasks[task_id] = task});
    
                    this.setState({tasks : updated_tasks, info: message});
                } else{
                    this.setState({info : 'Error fetching tasks from server.'});
                }
            }
        } catch(err){
            this.setState({info : 'Error fetching from server.'});
            // kept for development only
            console.log(err);
        }
    }

    handleAddTask = async (event) => {
        /**
         * Handler for adding new user task into DB
         * @param {Event} event Target button click triggering function
         */

        // preventing default page reload
        event.preventDefault();

        // may not submit a null Task into DB
        if(this.state.newTask === ""){
            this.setState({info : "Must enter valid task"});
        } else{
            this.setState({info : "Adding task..."});
            let fetchURL = process.env.REACT_APP_PORT+"/api/add_task";

            try{
                let add_response = await fetch(fetchURL, {
                    method: 'POST',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept-Type': 'application/json'
                    },
                    body: JSON.stringify({'task' : this.state.newTask}),
                    credentials: 'include'
                });

                if(add_response.status === 200){
                    let succesStatus = await add_response.json();

                    if(succesStatus){
                        // successful DB insertion of task
                        // re-fetching only newly added task for display
                        return await this.fetchTasks(false, "Added task successfully");
                    } else{
                        this.setState({info : "Server error in adding new task"});
                    }
                } else{
                    this.setState({info : "Server error in adding new task"});
                }
            } catch(err){
                this.setState({info : "Server error in adding new task"});
                console.log(err);
            }
        }
    }

    handleNewTaskInput = (event) => {
        /**
         * Handler for text change in Input box for adding task
         * @param {Event} event Text change in textbox triggering this function
         */

        if(this.state.newTask === "" && event.target.value === " "){
        } else{
            this.setState({newTask : event.target.value});
        }
    }

    handleTaskDelete = async (task_id) => {
        /**
         * Handler for deleting existing user task from DB
         * @param {int} task_id ID of task to be deleted required for endpoint
         */
        this.setState({info : "Deleting task..."});

        let fetchURL = process.env.REACT_APP_PORT+'/api/remove_task';

        try{
            let response = await fetch(fetchURL, {
                method: 'DELETE',
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify({'task_id':task_id}),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Type': 'application/json'
                }
            });
    
            if(response.status === 200){
                // must fetch all remaining tasks to update display
                await this.fetchTasks(true, "Task deleted successfully");
            } else{
                this.setState({info : "Error deleting task"});
            }
        } catch(err){
            this.setState({info : err});
        }
    }

    render(){
        return(
            <div>
                <br />
                <div id="usrInfo">{this.state.info}</div>
                <hr/>
                <AddTask handleNewTaskInput={(event) => {this.handleNewTaskInput(event)}} handleAddTask={(event) => {this.handleAddTask(event)}}/>
                <hr />
                <TaskListings handleTaskDelete={(task_id) => this.handleTaskDelete.bind(this, task_id)} displayTasks={Object.entries(this.state.tasks)}/>
            </div>
        )
    }
}

function AddTask(props){
    /**
     * Functional component for purpose of handling add task.
     */
    return(
        <div>
            <input type='text' id='taskInfo' placeholder='Get groceries...' onChange={props.handleNewTaskInput}></input>
            <button id="addTaskButton" onClick={props.handleAddTask}>Add Task</button>
        </div>
    )
}

function TaskListings(props){
    /**
     * Functional component for purpose of listing user's tasks
     */
    if(props.displayTasks.length > 0){
        return props.displayTasks.map(([task_id, task]) => {
            return(
                <div id="taskListing" task_id={task_id} key={task_id.toString()}>
                    <hr />
                    <div id="taskListingDiv">{task}</div><button id="taskListingDelete" onClick={props.handleTaskDelete(task_id)}>Delete</button>                
                    <hr />
                </div>
            )   
        });
    } else{
        return(
            <div id="emptyTaskListing"></div>
        )
    }
        
}

export default Home;