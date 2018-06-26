// import * as AuthenticationTypes from '../actions/authentication/AuthenticationTypes';
// import { TYPES, COMMAND, updateReducer } from '../actions/actionHelper';

const initialState = {
    statusMessage: 'INIT',
    error: {},
    isLoggedIn: false,
};

export default function editor(state = initialState, action) {
    switch (action.type) {
        default:
            return state;
    }
}
