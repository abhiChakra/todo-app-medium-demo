import React from 'react';
import App from './App.jsx';
import Login from './Login.jsx';
import Home from './Home.jsx';
import NavBar from './NavBar.jsx';

import { mount } from "enzyme";

describe("testing rendering/redirecting of App components when NOT authenticated", () => {

    // to apply before all tests
    beforeAll(() => {
        // mocking global fetch method
        global.fetch = jest.fn();

        // mocking window.alert method as it is not implemented
        window.alert = jest.fn(() => {});
    });

    let wrapper;
    beforeEach(async () => {
        wrapper = mount(<App />);

        // spying on verifyAuthentication function of current wrapper's node's class instance
        const spyComponentMount = jest.spyOn(wrapper.instance(), "verifyAuthentication");

        // returning a false resolve, ie user is NOT authenticated
        fetch.mockImplementation(() => {
            return Promise.resolve({
                json: () => {
                    return Promise.resolve(false);
                }
            });
        });

        // calling componentDidMount function, leading to verifyAuthentication call
        await wrapper.instance().componentDidMount();
        wrapper.update();

        // test for checking whether verifyAuthentication called within componentDidMount.
        expect(spyComponentMount).toHaveBeenCalled();

        // state isAuthenticated should set to false
        expect(wrapper.state("isAuthenticated")).toEqual(false);
    });

    afterEach(() => {
        // clears mock statuses of fetch and alert at end of each test
        fetch.mockClear();
        window.alert.mockClear();

        // unmounts test Component to mimic mount unmount cycle
        wrapper.unmount();
    });

    test("renders login page upon unsuccessful authentication", async () => {
        // should display only Login 
        expect(wrapper.find(Login)).toHaveLength(1);

        // should NOT display Home as not authenticated
        expect(wrapper.find(Home)).toHaveLength(0);

        // should always display NavBar
        expect(wrapper.find(NavBar)).toHaveLength(1);

        // As not logged in, should not display any logout button
        expect(wrapper.find("#logoutButton")).toHaveLength(0);

        // below checking existence for elements from Login component
        expect(wrapper.find("#usernameInput")).toHaveLength(1);
        expect(wrapper.find("#passwordInput")).toHaveLength(1);
        expect(wrapper.find("#authenticateButton")).toHaveLength(1);
    });

    test("Correctly updating HTML based on login authentication", async () => {

        //const loginSpyComponentMount = jest.spyOn(wrapper.instance(), "handleLogin");

        // mocking a valid login fetch call to /api/login
        fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                status: 200
            });
        });

        // entering user credentials in relevant textBoxes
        wrapper.find("#usernameInput").simulate('change', {target: {value:'sampleUsername'}});
        wrapper.find("#passwordInput").simulate('change', {target: {value:'samplePass'}});

        // clicking Log in button
        await wrapper.find("#authenticateButton").simulate('click');

        wrapper.update();

        // ensuring correct HTML change based on correct login, i.e. we expect a re-direct message
        let authenticatedDiv = (<div>
                                    Authenticated. Redirecting to home.
                                </div>)

        expect(wrapper.contains(authenticatedDiv)).toBe(true);

        let incorrectDiv = (<div>
                                Incorrect credentials
                            </div>)

        expect(wrapper.contains(incorrectDiv)).toBe(false);
    });

    test("Correctly updating HTML based on login authentication", async () => {

        //const loginSpyComponentMount = jest.spyOn(wrapper.instance(), "handleLogin");

        // mocking an incorrect login fetch call to /api/login
        fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                status: 401
            });
        });

        // entering user credentials in relevant textBoxes
        wrapper.find("#usernameInput").simulate('change', {target: {value:'sampleUsername'}});
        wrapper.find("#passwordInput").simulate('change', {target: {value:'samplePass'}});

        // clicking Log in button
        await wrapper.find("#authenticateButton").simulate('click');

        wrapper.update();

        // ensuring correct HTML change based on correct login, i.e. we expect an incorrect credentials message
        let authenticatedDiv = (<div>
                                    Authenticated. Redirecting to home.
                                </div>)

        expect(wrapper.contains(authenticatedDiv)).toBe(false);

        let incorrectDiv = (<div>
                                Incorrect credentials
                            </div>)

        expect(wrapper.contains(incorrectDiv)).toBe(true);
    });
});

describe("testing rendering/redirecting of App components when authenticated", () => {

    // to apply before all tests
    beforeAll(() => {
        // mocking global fetch method
        global.fetch = jest.fn();

        // mocking window.alert method as it is not implemented
        window.alert = jest.fn(() => {});
    });

    let wrapper;
    beforeEach(() => {
        wrapper = mount(<App />);
    });

    afterEach(() => {
        // clears mock statuses of fetch and alert at end of each test
        fetch.mockClear();
        window.alert.mockClear();

        // unmounts test Component to mimic mount unmount cycle
        wrapper.unmount();
    });

    test("renders Home page upon successfull authentication", async () => {
        const spyComponentMount = jest.spyOn(wrapper.instance(), "verifyAuthentication");

        // returning a true resolve, ie user IS authenticated
        fetch.mockImplementation(() => {
            return Promise.resolve({
                json: () => {
                    return Promise.resolve(true);
                }
            });
        });

        // calling componentDidMount function, leading to verifyAuthentication call
        await wrapper.instance().componentDidMount();

        wrapper.update();

        // test for checking whether verifyAuthentication called within componentDidMount.
        expect(spyComponentMount).toHaveBeenCalled();

        // ensuring isAuthenticated state set to true as expected
        expect(wrapper.state("isAuthenticated")).toEqual(true);

        // ensuring navigation away from Login pag instead to Home as expected with authentication
        expect(wrapper.find(Login)).toHaveLength(0);
        expect(wrapper.find(Home)).toHaveLength(1);

        // expecting a NavBar along with logout button as expected with authentication
        expect(wrapper.find(NavBar)).toHaveLength(1);
        expect(wrapper.find("#logoutButton")).toHaveLength(1);

        // just verifying elements within Home Component
        expect(wrapper.find("#addTaskButton")).toHaveLength(1);
        expect(wrapper.find("taskListing")).toHaveLength(0);
        expect(wrapper.find("#emptyTaskListing")).toHaveLength(1);
    });
});