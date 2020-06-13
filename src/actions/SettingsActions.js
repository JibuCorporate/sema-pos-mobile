export const SET_SETTINGS = 'SET_SETTINGS';
export const SET_CONFIGURATION = 'SET_CONFIGURATION';

export function setSettings(settings) {
	console.log('settings', settings);
	return (dispatch) => { dispatch({ type: SET_SETTINGS, data: settings }); };
}
