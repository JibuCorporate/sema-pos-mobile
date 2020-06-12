import { DISCOUNTS_SET } from "../actions/DiscountActions";
import DiscountRealm from '../database/discount/discount.operations';
let initialState = { discounts: DiscountRealm.getDiscounts() };

const discountReducer = (state = initialState, action) => {
    let newState;
    switch (action.type) {
        case DISCOUNTS_SET:
            newState = { ...state };
            newState.discounts = action.data.slice();
            return newState;
        default:
            return state;
    }
};

export default discountReducer;

