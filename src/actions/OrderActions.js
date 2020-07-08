export const ADD_PRODUCT_TO_ORDER = 'ADD_PRODUCT';
export const CLEAR_ORDER = 'CLEAR_ORDER';
export const LOAD_SELECTED_DISCOUNTS = 'LOAD_SELECTED_DISCOUNTS';
export const REMOVE_PRODUCT = 'REMOVE_PRODUCT';
export const SET_PRODUCT_QUANTITY = 'SET_PRODUCT_QUANTITY';
export const SET_ORDER_CHANNEL = 'SET_CHANNEL';
export const SET_ORDER_FLOW = 'SET_ORDER_FLOW';
export const SET_PAYMENT = 'SET_PAYMENT';
export const SET_DISCOUNTS = 'SET_DISCOUNTS';
export const REMOVE_PRODUCT_DISCOUNT = 'REMOVE_PRODUCT_DISCOUNT';
export const ADD_PRODUCT_DISCOUNT = 'ADD_PRODUCT_DISCOUNT';
export const SET_PRODUCT_NOTES = 'SET_PRODUCT_NOTES';

export function AddProductToOrder(product, quantity, price) {
  return (dispatch) => {
    dispatch({
      type: ADD_PRODUCT_TO_ORDER,
      data: {
        product, quantity, unitPrice: price, finalAmount: Number(price) * Number(quantity), notes: '', emptiesReturned: '', emptiesDamaged: '', refillPending: '',
      },
    });
  };
}

export function AddNotesToProduct(product, notes, emptiesReturned, refillPending, emptiesDamaged) {
  return (dispatch) => {
    dispatch({
      type: SET_PRODUCT_NOTES,
      data: {
        product, notes, emptiesReturned, refillPending, emptiesDamaged,
      },
    });
  };
}

export function RemoveProductFromOrder(product, price) {
  return (dispatch) => {
    dispatch({ type: REMOVE_PRODUCT, data: { product, unitPrice: price } });
  };
}

export function SetProductQuantity(product, quantity, price) {
  return (dispatch) => {
    dispatch({
      type: SET_PRODUCT_QUANTITY,
      data: { product, quantity, unitPrice: price },
    });
  };
}

export function SetOrderChannel(channel) {
  return (dispatch) => {
    dispatch({
      type: SET_ORDER_CHANNEL,
      data: { channel: { salesChannel: channel } },
    });
  };
}

export function SetOrderDiscounts(isCustom, customDiscount, product, discount, totalPrice) {
  this.AddProductDiscounts(isCustom, customDiscount, product, discount, totalPrice);
  return (dispatch) => {
    dispatch({
      type: SET_DISCOUNTS,
      data: {
        isCustom, product, discount, totalPrice, customDiscount,
      },
    });
  };
}

export function AddProductDiscounts(isCustom, customDiscount, product, discount, totalPrice) {
  return (dispatch) => {
    dispatch({
      type: ADD_PRODUCT_DISCOUNT,
      data: {
        isCustom, product, discount, totalPrice, customDiscount,
      },
    });
  };
}

export function RemoveProductDiscountsFromOrder(product) {
  return (dispatch) => {
    dispatch({ type: REMOVE_PRODUCT_DISCOUNT, data: { product } });
  };
}

export function SetOrderFlow(page) {
  return (dispatch) => {
    dispatch({ type: SET_ORDER_FLOW, data: { flow: { page } } });
  };
}

export function SetPayment(payment) {
  return (dispatch) => {
    dispatch({ type: SET_PAYMENT, data: { payment } });
  };
}

export function ClearOrder() {
  return (dispatch) => {
    dispatch({ type: CLEAR_ORDER, data: {} });
  };
}
