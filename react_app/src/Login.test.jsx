import React from 'react';
import Login from './Login.jsx';

import { shallow, mount } from "enzyme";

describe("Testing that Login components are properly mounting", () => {
    // single component shallow rendering
    let wrapper = shallow(<Login/>);

    test("testing rendering of the three basic login functional components", () => {
        expect(wrapper.find('UsernameInput')).toHaveLength(1);
        expect(wrapper.find('PasswordInput')).toHaveLength(1);
        expect(wrapper.find('LoginButton')).toHaveLength(1);
    });
});

describe("Testing authentication state updates", () => {

    // to apply before all tests
    beforeAll(() => {
        // mocking global fetch method
        global.fetch = jest.fn();

        // mocking window.alert method as it is not implemented
        window.alert = jest.fn(() => {});
    });

    let wrapper;

    beforeEach(() => {
        // setting void mock function to pass as props into Login component
        let mockUpdateAuthentication = () => {console.log("Mocking update authentication")};
        let props = {updateAuthentication : mockUpdateAuthentication};
        wrapper = mount(<Login {...props}/>);
    });

    afterEach(() => {
        // clears mock statuses of fetch and alert at end of each test
        fetch.mockClear();
        window.alert.mockClear();

        // unmounts test Component to mimic mount unmount cycle
        wrapper.unmount();
    });

    test("testing update of states after change to Username text input", () => {
       wrapper.find("#usernameInput").simulate('change', {target: {value:'sampleUsername'}});

       // ensuring state updates as expected
       expect(wrapper.state("username")).toEqual('sampleUsername');
    });

    test("testing update of states after change to Password input", () => {
        wrapper.find("#passwordInput").simulate('change', {target: {value:'samplePass'}});

        // ensuring state updates as expected
        expect(wrapper.state("password")).toEqual('samplePass');
     });

     test("testing valid authentication update", async () => {
        const spyComponentMount = jest.spyOn(wrapper.instance(), "handleLogin");

        // mocking an correct login fetch call to /api/login
        fetch.mockImplementation(() => {
                return Promise.resolve({
                status: 200
            });
        });

        // ensuring usrMessage prior to login
        expect(wrapper.state("usrMessage")).toEqual("");

        wrapper.find("#usernameInput").simulate('change', {target: {value:'sampleUsername'}});
        wrapper.find("#passwordInput").simulate('change', {target: {value:'samplePass'}});

        // clicking Log in button
        await wrapper.find("#authenticateButton").simulate('click');

        expect(spyComponentMount).toHaveBeenCalled();

        // ensuring usrMessage state updates as expected
        expect(wrapper.state("usrMessage")).toEqual('Authenticated. Redirecting to home.')
     });

     test("testing invalid authentication update", async () => {
        const spyComponentMount = jest.spyOn(wrapper.instance(), "handleLogin");

        // mocking an INcorrect login fetch call to /api/login
        fetch.mockImplementation(() => {
            return Promise.resolve({
            status: 401
            });
        });

        await wrapper.find("#authenticateButton").simulate('click');
        expect(spyComponentMount).toHaveBeenCalled();

        // ensuring usrMessage state updates as expected
        expect(wrapper.state("usrMessage")).toEqual('Incorrect credentials');
    });
});

