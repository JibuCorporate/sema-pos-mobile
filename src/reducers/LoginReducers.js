import {SET_LOGIN_PENDING, SET_LOGIN_SUCCESS, SET_LOGIN_ERROR} from "../actions/LoginActions";

let initialState = {
	isLoginSuccess: false,
	isLoginPending: false,
	loginError: null
}
const loginReducer = (state = initialState, action) => {
	console.log("loginReducer: " + action.type);
	let newState;
	switch (action.type) {
		case SET_LOGIN_PENDING:
			newState = {...state};
			newState.isLoginPending = action.data;
			return newState;
		case SET_LOGIN_SUCCESS:
			newState = {...state};
			newState.isLoginSuccess = action.data;
			return newState;
		case SET_LOGIN_ERROR:
			newState = {...state};
			newState.loginError = action.data;
			return newState;
		default:
			return state;
	}
};

export default loginReducer;
