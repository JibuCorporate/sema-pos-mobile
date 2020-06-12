
import { INVENTORY_SET, SET_METER_READING } from "../actions/InventoryActions";
import InventroyRealm from '../database/inventory/inventory.operations';
let initialState = { inventory:  InventroyRealm.getAllInventory(), meterReadings: [] };

const inventoryReducer = (state = initialState, action) => {
	let newState;
	switch (action.type) {
		case INVENTORY_SET:
			newState = { ...state };
			newState.inventory = action.data.slice();
            return newState;
            case SET_METER_READING:
			newState = { ...state };
			newState.meterReadings = action.data.slice();
			return newState;
		default:
			return state;
	}
};

export default inventoryReducer;

