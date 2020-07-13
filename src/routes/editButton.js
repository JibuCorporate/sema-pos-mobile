import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import AppContext from '../context/app-context';

import styles from './customerListHeader.styles';

export default class EditButton extends React.PureComponent {
	static contextType = AppContext;

	editCustomer = () => {
		const { navigation } = this.props;
		const { setCustomerProps } = this.context;
		setCustomerProps({
			isCustomerSelected: false,
			isDueAmount: 0,
			customerName: '',
			title: ''
		});
		navigation.navigate('EditCustomer');
	};

	render() {
		return (
			<Icon
				name="md-create"
				size={25}
				color="white"
				style={styles.iconStyle}
				onPress={this.editCustomer}
			/>
		);
	}
}
