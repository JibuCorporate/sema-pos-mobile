import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppContext from '../context/app-context';
import { colors } from '../styles/sema_colors';

const styles = StyleSheet.create({
	container: {
		color: colors.white,
		flexDirection: 'row',
		fontSize: 18
	},
	tooltitle: {
		color: colors.white,
		fontSize: 18
	}
});

class CustomerTitle extends React.PureComponent {
	static contextType = AppContext;

	render() {
		const { customerProps } = this.context;
		const { title } = this.props;
		return (
			<View style={styles.container}>
				{customerProps.isCustomerSelected && (
					<Text style={styles.tooltitle}>{customerProps.customerName}</Text>
				)}
				{!customerProps.isCustomerSelected && (
					<Text style={styles.tooltitle}>{title || customerProps.title}</Text>
				)}
			</View>
		);
	}
}

export default CustomerTitle;
