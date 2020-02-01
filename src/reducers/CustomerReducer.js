
import { CUSTOMER_SELECTED, CUSTOMERS_SET, CUSTOMERS_SEARCH, CUSTOMER_EDIT, CUSTOMERS_CHANNEL_SEARCH } from "../actions/CustomerActions";
import PosStorage from "../database/PosStorage";

let initialState = { selectedCustomer: {}, customers: [], searchString: "", channelFilterString: "", isEdit: false };

const customerReducer = (state = initialState, action) => {
	let newState;
	switch (action.type) {
		case CUSTOMER_SELECTED:
			newState = { ...state };
			newState.selectedCustomer = action.data;
			return newState;
		case CUSTOMERS_SET:
			newState = { ...state };
			newState.customers = action.data.slice();
			return newState;
		case CUSTOMERS_SEARCH:
			newState = { ...state };
			newState.searchString = action.data;
			return newState;
		case CUSTOMERS_CHANNEL_SEARCH:
			newState = { ...state };
			newState.channelFilterString = action.data;
			return newState;			
		case CUSTOMER_EDIT:
			newState = { ...state };
			newState.isEdit = action.data;
			return newState;
		default:
			return state;
	}
};

export default customerReducer;

