export const SET_LOGIN_PENDING = 'SET_LOGIN_PENDING';
export const SET_LOGIN_SUCCESS = 'SET_LOGIN_SUCCESS';
export const SET_LOGIN_ERROR = 'SET_LOGIN_ERROR';



export function setLoginPending(isLoginPending) {
	const data = isLoginPending;
	return (dispatch) => { dispatch({
		type: SET_LOGIN_PENDING,
		data: isLoginPending
	});
};

export function setLoginSuccess(isLoginSuccess) {
	const data = isLoginSuccess;
	return (dispatch) => { dispatch({
		type: SET_LOGIN_SUCCESS,
		data: isLoginSuccess
	});
}

export function setLoginError(loginError) {
	const data = loginError;
	return (dispatch) => { dispatch({
		type: SET_LOGIN_ERROR,
		data: loginError
	});
}
