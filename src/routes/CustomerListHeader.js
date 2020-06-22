import React from 'react';
import { View, Picker, StyleSheet } from 'react-native';
import * as CustomerActions from '../actions/CustomerActions';
import { Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/FontAwesome';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import i18n from '../app/i18n';
import { withNavigation } from 'react-navigation';
import AppContext from '../context/app-context';
class CustomerListHeader extends React.PureComponent {
    static contextType = AppContext;
    render() {
        return (
            <View
                style={styles.headerCont}>
                <View
                    style={styles.iconsContainer}>
                    {this.context.customerProps.isCustomerSelected && (
                        <Icons
                            name='balance-scale'
                            size={25}
                            color="white"
                            style={styles.iconStyle}
                            onPress={this.props.navigation.getParam('clearLoan')}
                        />

                    )}
                    {this.context.customerProps.isCustomerSelected && (
                        <Icon
                            name='md-cart'
                            size={25}
                            color="white"
                            style={styles.iconStyle}
                            onPress={() => {
                                this.props.navigation.navigate('OrderView');
                            }}
                        />

                    )}
                    {this.context.customerProps.isCustomerSelected && (
                        <Icon
                            name='md-more'
                            size={25}
                            color="white"
                            style={styles.iconStyle}
                        />
                    )}
                    {this.context.customerProps.isCustomerSelected && (
                        <Icon
                            name='md-information-circle-outline'
                            size={25}
                            color="white"
                            style={styles.iconStyle}
                            onPress={() => {
                                this.props.navigation.navigate('CustomerDetails');
                            }}

                        />
                    )}
                    {this.context.customerProps.isCustomerSelected && (
                        <Icon
                            name='md-trash'
                            size={25}
                            color="white"
                            style={styles.iconStyle}
                            onPress={this.props.navigation.getParam('onDelete')}
                        />
                    )}
                    {this.context.customerProps.isCustomerSelected && (
                        <Icon
                            name='md-create'
                            size={25}
                            color="white"
                            style={styles.iconStyle}
                            onPress={() => {
                              
                                this.context.setCustomerProps(
                                    {
                                        isCustomerSelected: false,
                                        isDueAmount: 0,
                                        customerName: '',
                                        'title': ''
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
                        inputStyle={styles.inputdpn}
                    />
                </View>

                <View
                    style={styles.pickerCont}>
                    <Picker
                        mode="dropdown"
                        selectedValue={this.context.customerTypeFilter}
                        style={styles.pickerdpn}
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
        this.context.SearchCustomers(searchText);
    };

    checkCustomerTypefilter = (searchText) => {
        this.context.SearchCustomerTypes(searchText);
    };
}

export default withNavigation(CustomerListHeader);

const styles = StyleSheet.create({
	iconStyle: {
		marginRight: 20
	},

	iconsContainer: {
		flex: 1,
		flexDirection: 'row',
		marginTop: 15
	},

	inputdpn: {
		flex: .8, color: 'white'
	},

	pickerdpn: {
		height: 50, width: 200, color: 'white'
	},

	pickerCont: {
		marginTop: 12,
		flex: 1
	},

	headerCont: {
		flexDirection: 'row',
	}

});
