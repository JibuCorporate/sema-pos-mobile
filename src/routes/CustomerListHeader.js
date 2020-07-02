import React from 'react';
import { View, Picker, StyleSheet } from 'react-native';
import { Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/FontAwesome';
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
                        onChangeText={this.props.navigation.getParam('searchCustomer')}
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
                        onValueChange={this.props.navigation.getParam('checkCustomerTypefilter')}>

                        <Picker.Item label="All Customer Types" value="all" />
                        <Picker.Item label="Business" value="business" />
                        <Picker.Item label="Household" value="household" />
                        <Picker.Item label="Retailer" value="retailer" />
                        <Picker.Item label="Outlet Franchise" value="outlet franchise" />
                        <Picker.Item label="Anonymous" value="anonymous" />
                    </Picker>

                </View>

            </View>

        );
    }

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
