import React from 'react';
import Login from './Login.jsx';

import { shallow, mount } from "enzyme";

describe("Testing that Login components are properly mounting", () => {
    let wrapper = shallow(<Login/>);

    test("testing rendering of the three basic login functional components", () => {
        expect(wrapper.find('UsernameInput')).toHaveLength(1);
        expect(wrapper.find('PasswordInput')).toHaveLength(1);
        expect(wrapper.find('LoginButton')).toHaveLength(1);
    });
})

describe("Testing authentication state updates", () => {

    beforeAll(() => {
        global.fetch = jest.fn();
        window.alert = jest.fn(() => {});
    });

    let wrapper;

    beforeEach(() => {
        let mockUpdateAuthentication = () => {console.log("Mocking update authentication")};
        let props = {updateAuthentication : mockUpdateAuthentication};
        wrapper = mount(<Login {...props}/>, { disableLifecycleMethods: true });
    });

    afterEach(() => {
        fetch.mockClear();
        window.alert.mockClear();
        wrapper.unmount();
    });

    test("testing update of states after change to Username text input", () => {
       wrapper.find("#usernameInput").simulate('change', {target: {value:'sampleUsername'}});
       expect(wrapper.state("username")).toEqual('sampleUsername');
    });

    test("testing update of states after change to Password input", () => {
        wrapper.find("#passwordInput").simulate('change', {target: {value:'samplePass'}});
        expect(wrapper.state("password")).toEqual('samplePass');
     });

     test("testing valid authentication update", async () => {
        const spyComponentMount = jest.spyOn(wrapper.instance(), "handleLogin");

        fetch.mockImplementation(() => {
                return Promise.resolve({
                status: 200
            });
        });

        expect(wrapper.state("usrMessage")).toEqual("");

        wrapper.find("#usernameInput").simulate('change', {target: {value:'sampleUsername'}});
        wrapper.find("#passwordInput").simulate('change', {target: {value:'samplePass'}});

        await wrapper.find("#authenticateButton").simulate('click');

        expect(spyComponentMount).toHaveBeenCalled();
        expect(wrapper.state("usrMessage")).toEqual('Authenticated. Redirecting to home.')
     });

     test("testing invalid authentication update", async () => {
        const spyComponentMount = jest.spyOn(wrapper.instance(), "handleLogin");

        fetch.mockImplementation(() => {
            return Promise.resolve({
            status: 401
            });
        });

        await wrapper.find("#authenticateButton").simulate('click');
        expect(spyComponentMount).toHaveBeenCalled();
        expect(wrapper.state("usrMessage")).toEqual('Incorrect credentials');
    });
});

