import React from 'react';
import Home from './Home.jsx';

import fetchMock from 'fetch-mock';

import { mount } from "enzyme";

describe("Testing adding/deleting task functionalities", () => {

    // to apply before all tests
    beforeAll(() => {
        // mocking global fetch method
        global.fetch = jest.fn();

        // mocking window.alert method as it is not implemented
        window.alert = jest.fn(() => {});
    });

    let wrapper;
    let spyFetchTasks;

    beforeEach(async () => {
        // initializing each test with an initial two tasks 
        wrapper = mount(<Home />);

        // spying on fetchTasks function of wrapper's node's class instance
        spyFetchTasks = jest.spyOn(wrapper.instance(), "fetchTasks");

        // mocking current fetch call to return sample of two tasks
        fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                status: 200, 
                json: () => {
                    return Promise.resolve({1 : "Do Laundry", 2 : "Mow lawn"});
                }
            });
        });

        // calling fetchTasks function.
        await wrapper.instance().fetchTasks(true, "sampleUsername");


        expect(spyFetchTasks).toHaveBeenCalled();

        // updating wrapper to gather potential state updates. 
        // wrapper update "Syncs the enzyme component tree snapshot with the react component tree" (enzyme docs)
        wrapper.update();  

        // check tasks state to be as expected, our two sample tasks
        expect(wrapper.state('tasks')).toEqual({1 : "Do Laundry", 2 : "Mow lawn"});

        // checking that our two tasks are displayed on UI
        expect(wrapper.find("#taskListing")).toHaveLength(2);
    });

    afterEach(() => {
        // clears mock statuses of fetch and alert at end of each test
        fetch.mockClear();
        window.alert.mockClear();

        // unmounts test Component to mimic mount unmount cycle
        wrapper.unmount();
    });

    test("testing functionality for adding a valid new task", async () => {

        // spying on handleAddTask function of wrapper's node's class instance
        const spyAddTaskHandler = jest.spyOn(wrapper.instance(), "handleAddTask");
        spyFetchTasks = jest.spyOn(wrapper.instance(), "fetchTasks");

        // filling textbox for adding new task
        await wrapper.find("#taskInfo").simulate('change', {target : {value : "Clean fishbowl"}});

        wrapper.update();

        // ensuring state update, ie taskInfo textbox handling change properly
        expect(wrapper.state('newTask')).toEqual("Clean fishbowl");

        // establishing two fetchMock calls below to address nested fetch calls in handleAddTask function code
        fetchMock.mock("http://127.0.0.1:8080/api/add_task", true);
        fetchMock.mock("http://127.0.0.1:8080/api/tasks", {3 : "Clean fishbowl"});

        /**
         * Ideally would be able to simulate addTask action, however kept running into 
         * inexplicable issue where wrapper states not updating (despite wrapper.update()). 
         * TODO: further explore cause of failer on simulate click
         */

        // await wrapper.find("#addTaskButton").simulate('click');

        // instead directly calling handleAddTask function
        // mock passing 'event' via empty preventDefault()
        await wrapper.instance().handleAddTask({preventDefault(){}});

        wrapper.update();

        // expecting both handleAddTask and fetchTasks functions to have been called
        expect(spyAddTaskHandler).toHaveBeenCalled();
        expect(spyFetchTasks).toHaveBeenCalled();

        // testing proper update of state upon new task addition
        expect(wrapper.state('tasks')).toEqual({1 : "Do Laundry", 2 : "Mow lawn", 3 : "Clean fishbowl"});
        
        expect(wrapper.find("#taskListing")).toHaveLength(3);

        /**
         * Finding that fetchMock MUST be restored here. 
         * Restoring in afterEach does not work. Must investigate further.
         * TODO: further investigate fetchMock.restore();
         */
        fetchMock.restore();
    });

    test("testing task deletion functionality", async () => {
        const spyDeleteTaskHandler = jest.spyOn(wrapper.instance(), "handleTaskDelete");
        spyFetchTasks = jest.spyOn(wrapper.instance(), "fetchTasks");

        let deleteTaskText;
        let deleteTaskID;

        // establishing two fetchMock calls below to address nested fetch calls in handleAddTask function code
        fetchMock.mock("http://127.0.0.1:8080/api/remove_task", 200);
        fetchMock.mock("http://127.0.0.1:8080/api/tasks", {2 : "Mow lawn"});

        // finding all taskListings and intending to delete first one
        let taskListingToDelete = wrapper.find("#taskListing").at(0);

        // recording task to be deleted task_id and task info
        deleteTaskID = parseInt(taskListingToDelete.props().task_id);
        deleteTaskText = taskListingToDelete.find("#taskListingDiv").text();

        /**
         * Once again as before, ideally would be able to simulate deleteTask action, 
         * however kept running into issue where wrapper states not updating.
         * 
         * Probably further complicted by .bind structure on simulate. 
         * TODO: further explore cause of failer on simulate
         */

        // await taskListingToDelete.find("#taskListingDelete").simulate('click');

        await wrapper.instance().handleTaskDelete(deleteTaskID);

        expect(spyDeleteTaskHandler).toHaveBeenCalled();

        wrapper.update();

        expect(wrapper.find("#taskListing")).toHaveLength(1);

        expect(wrapper.find("#taskListing").at(0).props().task_id).not.toEqual(deleteTaskID);
        expect(wrapper.find("#taskListing").at(0).find("#taskListingDiv").text()).not.toEqual(deleteTaskText);

        fetchMock.restore();
    });
});