import React from 'react';
import { View, Picker } from 'react-native';
import { Input } from 'react-native-elements';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/FontAwesome';
import { withNavigation } from 'react-navigation';
import i18n from '../app/i18n';
import AppContext from '../context/app-context';

import styles from './customerListHeader.styles';

import EditButton from './editButton';

class CustomerListHeader extends React.PureComponent {
	static contextType = AppContext;

	render() {
		const { navigation } = this.props;
		const { customerProps, customerTypeFilter } = this.context;
		return (
			<View style={styles.headerCont}>
				<View style={styles.iconsContainer}>
					{customerProps.isCustomerSelected && (
						<Icons
							name="balance-scale"
							size={25}
							color="white"
							style={styles.iconStyle}
							onPress={navigation.getParam('clearLoan')}
						/>
					)}
					{customerProps.isCustomerSelected && (
						<Icon
							name="md-cart"
							size={25}
							color="white"
							style={styles.iconStyle}
							onPress={navigation.navigate('OrderView')}
						/>
					)}
					{customerProps.isCustomerSelected && (
						<Icon
							name="ellipsis-vertical-outline"
							size={25}
							color="white"
							style={styles.iconStyle}
						/>
					)}
					{customerProps.isCustomerSelected && (
						<Icon
							name="md-information-circle-outline"
							size={25}
							color="white"
							style={styles.iconStyle}
							onPress={navigation.navigate('CustomerDetails')}
						/>
					)}
					{customerProps.isCustomerSelected && (
						<Icon
							name="md-trash"
							size={25}
							color="white"
							style={styles.iconStyle}
							onPress={navigation.getParam('onDelete')}
						/>
					)}
					{customerProps.isCustomerSelected && <EditButton navigation={navigation} />}
				</View>

				<View>
					<Input
						onChangeText={navigation.getParam('searchCustomer')}
						placeholder={i18n.t('search-placeholder')}
						placeholderTextColor="white"
						inputStyle={styles.inputdpn}
					/>
				</View>

				<View style={styles.pickerCont}>
					<Picker
						mode="dropdown"
						selectedValue={customerTypeFilter}
						style={styles.pickerdpn}
						onValueChange={navigation.getParam('checkCustomerTypefilter')}>
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
