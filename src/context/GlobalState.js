import React, { PureComponent } from 'react';

import AppContext from './app-context';

class GlobalState extends PureComponent {
  constructor() {
    super();
    this.state = {
      isLoggedin: false,
      selectedCustomer: {},
      customerTypeFilter: 'all',
      searchString: '',
      isEdit: false,
      customerProps: {
        isDueAmount: 0,
        isCustomerSelected: false,
        customerName: '',
        customerTypeValue: 'all',
      },
    };
  }

  setSelectedCustomer = (customer) => {
    this.setState({ selectedCustomer: customer });
  };

  SearchCustomers = (searchString) => {
    this.setState({ searchString });
  };

  SearchCustomerTypes = (customerTypeFilter) => {
    this.setState({ customerTypeFilter });
  };

  setCustomerProps = (customerProps) => {
    this.setState({ customerProps });
  };

  setCustomerEditStatus = (isEdit) => {
    this.setState({ isEdit });
  };

  setLoginStatus = (isLoggedin) => {
    this.setState({ isLoggedin });
  };

  render() {
    const {
      isLoggedin, isEdit, searchString, customerTypeFilter, selectedCustomer,
      customerProps,
    } = this.state;
    this.staticConfig = {
      isLoggedin,
      isEdit,
      searchString,
      customerTypeFilter,
      selectedCustomer,
      customerProps,
      addProductToCart: this.addProductToCart,
      removeProductFromCart: this.removeProductFromCart,
      setSelectedCustomer: this.setSelectedCustomer,
      SearchCustomers: this.SearchCustomers,
      SearchCustomerTypes: this.SearchCustomerTypes,
      setCustomerProps: this.setCustomerProps,
      setCustomerEditStatus: this.setCustomerEditStatus,
    };
    const { children } = this.props;
    return (
      <AppContext.Provider
        value={this.staticConfig}
      >
        {children}
      </AppContext.Provider>
    );
  }
}

export default GlobalState;
