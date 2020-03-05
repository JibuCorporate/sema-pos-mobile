
import React from 'react';
import { View, Picker } from 'react-native';
import * as CustomerActions from '../actions/CustomerActions';
import { Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import i18n from '../app/i18n';
class CustomerListHeader extends React.PureComponent {

    render() {
        // console.log('header props', this.props.customerProps);
        return (
            <View
                style={{
                    flexDirection: 'row',
                }}>
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'row',
                        marginTop: 15
                    }}>
                    {this.props.customerProps.isCustomerSelected && (
                        <Icons
                            name='balance-scale'
                            size={25}
                            color="white"
                            style={{
                                marginRight: 20,
                            }}
                            onPress={this.props.navigation.getParam('clearLoan')}
                        />

                    )}
                    {this.props.customerProps.isCustomerSelected && (
                        <Icon
                            name='md-cart'
                            size={25}
                            color="white"
                            style={{
                                marginRight: 20,
                            }}
                            onPress={() => {
                                this.props.customerActions.SetCustomerProp(
                                    {
                                        isCustomerSelected: true,
                                        isDueAmount: 0,
                                        customerName: '',
                                        'title': '',
                                    }
                                );


                                this.props.navigation.navigate('OrderView');
                            }}
                        />

                    )}
                    {this.props.customerProps.isCustomerSelected && (
                        <Icon
                            name='md-more'
                            size={25}
                            color="white"
                            style={{
                                marginRight: 20,
                            }}
                        />
                    )}
                    {this.props.customerProps.isCustomerSelected && (
                        <Icon
                            name='md-information-circle-outline'
                            size={25}
                            color="white"
                            style={{
                                marginRight: 20,
                            }}
                            onPress={() => {
                                this.props.customerActions.SetCustomerProp(
                                    {
                                        isCustomerSelected: false,
                                        isDueAmount: 0,
                                        customerName: '',
                                        'title': '',
                                    }
                                );
                                this.props.navigation.navigate('CustomerDetails');
                            }}

                        />
                    )}
                    {this.props.customerProps.isCustomerSelected && (
                        <Icon
                            name='md-trash'
                            size={25}
                            color="white"
                            style={{
                                marginRight: 20,
                            }}
                            onPress={this.props.navigation.getParam('onDelete')}
                        />
                    )}
                    {this.props.customerProps.isCustomerSelected && (
                        <Icon
                            name='md-create'
                            size={25}
                            color="white"
                            style={{
                                marginRight: 20,
                            }}
                            onPress={() => {
                                this.props.customerActions.SetCustomerProp(
                                    {
                                        isCustomerSelected: false,
                                        isDueAmount: 0,
                                        customerName: '',
                                        'title': '',
                                    }
                                );
                                this.props.navigation.navigate('EditCustomer');
                            }}
                        />
                    )}
                </View>

                <View>
                    <Input
                        onChangeText={(searchText) => {
                            this.searchCustomer(searchText)
                        }}
                        placeholder={i18n.t('search-placeholder')}
                        placeholderTextColor='white'
                        inputStyle={{ flex: .8, color: 'white' }}
                    />
                </View>

                <View
                    style={{
                        marginTop: 12,
                        flex: 1
                    }}>
                    <Picker
                        mode="dropdown"
                        selectedValue={this.props.customerTypeFilter}
                        style={{ height: 50, width: 200, color: 'white' }}
                        onValueChange={(searchText) => {
                            this.checkCustomerTypefilter(searchText)
                        }}>

                        <Picker.Item label="All Customer Types" value="all" />
                        <Picker.Item label="Business" value="Business" />
                        <Picker.Item label="Household" value="Household" />
                        <Picker.Item label="Retailer" value="Retailer" />
                        <Picker.Item label="Outlet Franchise" value="Outlet Franchise" />
                        <Picker.Item label="Anonymous" value="Anonymous" />
                    </Picker>

                </View>

            </View>

        );
    }

    searchCustomer = (searchText) => {
        this.props.customerActions.SearchCustomers(searchText);
    };

    checkCustomerTypefilter = (searchText) => {
        this.props.customerActions.SearchCustomerTypes(searchText);
    };
}

function mapStateToProps(state, props) {
    return {
        selectedCustomer: state.customerReducer.selectedCustomer,
        customers: state.customerReducer.customers,
        searchString: state.customerReducer.searchString,
        customerProps: state.customerReducer.customerProps,
        customerTypeFilter: state.customerReducer.customerTypeFilter,
        paymentTypes: state.paymentTypesReducer.paymentTypes,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        customerActions: bindActionCreators(CustomerActions, dispatch),
    };
}

export default connect(
    mapStateToProps, mapDispatchToProps
)(CustomerListHeader);
