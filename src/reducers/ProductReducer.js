import { PRODUCTS_SET } from '../actions/ProductActions';

const initialState = { products: [] };

const productReducer = (state = initialState, action) => {
  let newState;
  switch (action.type) {
    case PRODUCTS_SET:
      newState = { ...state };
      newState.products = action.data.slice();
      return newState;
    default:
      return state;
  }
};

export default productReducer;
