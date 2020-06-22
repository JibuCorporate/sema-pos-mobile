import React, { Component } from 'react';

import AppContext from './app-context';

class GlobalState extends Component {
  state = {
    selectedCustomer: {},
    customerTypeFilter: "all",
    searchString: "",
    isEdit: false,
    paymentTypeFilter: "",
    customerProps: {
      isDueAmount: 0,
      isCustomerSelected: false,
      customerName: '',
      customerTypeValue: 'all',
    },
  };


  setSelectedCustomer = customer => {
    console.log('Adding customer', customer);
    const updatedSelectedCustomer = { ...this.state.selectedCustomer };
    this.setState({ selectedCustomer: customer });
  };

  SearchCustomers = searchString => {
    console.log('Adding searchString', searchString);
    const updatedSelectedCustomer = { ...this.state.searchString };
    this.setState({ searchString });
  };


  SearchCustomerTypes = customerTypeFilter => {
    console.log('Adding customerTypeFilter', customerTypeFilter);
    const updatedSelectedCustomer = { ...this.state.customerTypeFilter };
    this.setState({ customerTypeFilter });
  };


  setCustomerProps = customerProps => {
    console.log('Adding setCustomerProps', customerProps);
    const updatedSelectedCustomer = { ...this.state.customerProps };
    this.setState({ customerProps });
  };

  setCustomerEditStatus = isEdit => {
    console.log('Adding isEdit', isEdit);
    const updatedSelectedCustomer = { ...this.state.isEdit };
    this.setState({ isEdit });
  };

  render() {
    return (
      <AppContext.Provider
        value={{
          isEdit: this.state.isEdit,
          searchString: this.state.searchString,
          customerTypeFilter: this.state.customerTypeFilter,
          selectedCustomer: this.state.selectedCustomer,
          customerProps: this.state.customerProps,
          addProductToCart: this.addProductToCart,
          removeProductFromCart: this.removeProductFromCart,
          setSelectedCustomer: this.setSelectedCustomer,
          SearchCustomers: this.SearchCustomers,
          SearchCustomerTypes: this.SearchCustomerTypes,
          setCustomerProps: this.setCustomerProps,
          setCustomerEditStatus: this.setCustomerEditStatus
        }}
      >
        {this.props.children}
      </AppContext.Provider>
    );
  }
}

export default GlobalState;
