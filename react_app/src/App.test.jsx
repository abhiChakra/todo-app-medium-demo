import React from 'react';
import App from './App.jsx';
import Login from './Login.jsx';
import Home from './Home.jsx';
import NavBar from './NavBar.jsx';

import { mount } from "enzyme";

describe("testing rendering of App components under different authentication circumstances", () => {

    beforeAll(() => {
        global.fetch = jest.fn();
        window.alert = jest.fn(() => {});
    });

    let wrapper;
    beforeEach(() => {
        wrapper = mount(<App />, { disableLifecycleMethods: true });
    });

    afterEach(() => {
        fetch.mockClear();
        window.alert.mockClear();
        wrapper.unmount();
    });

    test("renders login page upon unsuccessful authentication", async () => {
        const spyComponentMount = jest.spyOn(wrapper.instance(), "verifyAuthentication");

        fetch.mockImplementation(() => {
            return Promise.resolve({
                json: () => {
                    return Promise.resolve(false);
                }
            });
        });

        // calling componentDidMount function
        await wrapper.instance().componentDidMount();
        wrapper.update();

        // test for checking whether verifyAuthentication called within componentDidMount.
        expect(spyComponentMount).toHaveBeenCalled();
        expect(wrapper.state("isAuthenticated")).toEqual(false);

        expect(wrapper.find(Login)).toHaveLength(1);
        expect(wrapper.find(Home)).toHaveLength(0);
        expect(wrapper.find(NavBar)).toHaveLength(1);
        expect(wrapper.find("#logoutButton")).toHaveLength(0);

        expect(wrapper.find("#usernameInput")).toHaveLength(1);
        expect(wrapper.find("#passwordInput")).toHaveLength(1);
        expect(wrapper.find("#authenticateButton")).toHaveLength(1);
    });

    test("renders Home page upon successfull authentication", async () => {
        const spyComponentMount = jest.spyOn(wrapper.instance(), "verifyAuthentication");

        fetch.mockImplementation(() => {
            return Promise.resolve({
                json: () => {
                    return Promise.resolve(true);
                }
            });
        });

        // calling componentDidMount function
        await wrapper.instance().componentDidMount();

        wrapper.update();

        // test for checking whether verifyAuthentication called within componentDidMount.
        expect(spyComponentMount).toHaveBeenCalled();
        expect(wrapper.state("isAuthenticated")).toEqual(true);

        expect(wrapper.find(Login)).toHaveLength(0);
        expect(wrapper.find(Home)).toHaveLength(1);
        expect(wrapper.find(NavBar)).toHaveLength(1);
        expect(wrapper.find("#logoutButton")).toHaveLength(1);

        expect(wrapper.find("#addTaskButton")).toHaveLength(1);
        expect(wrapper.find("taskListing")).toHaveLength(0);
        expect(wrapper.find("#emptyTaskListing")).toHaveLength(1);
    });

    test("Correctly updating HTML based on login authentication", async () => {
        const spyComponentMount = jest.spyOn(wrapper.instance(), "verifyAuthentication");

        fetch.mockImplementationOnce(() => {
            return Promise.resolve({
                json: () => {
                    return Promise.resolve(false);
                }
            });
        });

        // calling componentDidMount function
        await wrapper.instance().componentDidMount();

        wrapper.update();

        // test for checking whether verifyAuthentication called within componentDidMount.
        expect(spyComponentMount).toHaveBeenCalled();
        expect(wrapper.state("isAuthenticated")).toEqual(false);

        //const loginSpyComponentMount = jest.spyOn(wrapper.instance(), "handleLogin");

        fetch.mockImplementationOnce(() => {
                return Promise.resolve({
                status: 200
            });
        });

        wrapper.find("#usernameInput").simulate('change', {target: {value:'sampleUsername'}});
        wrapper.find("#passwordInput").simulate('change', {target: {value:'samplePass'}});

        await wrapper.find("#authenticateButton").simulate('click');

        wrapper.update();

        let authenticatedDiv = (<div>
                                    Authenticated. Redirecting to home.
                                </div>)

        expect(wrapper.contains(authenticatedDiv)).toBe(true);

        let incorrectDiv = (<div>
                                Incorrect credentials
                            </div>)

        expect(wrapper.contains(incorrectDiv)).toBe(false);
    });
})