import React from "react";
import { View, Text, StyleSheet } from "react-native";
import SettingRealm from '../../../database/settings/settings.operations';

class PaymentDescription extends React.PureComponent {
	render() {
		return (
			<View style={styles.paydectitle}>
				<View style={styles.flex3}>
					<Text style={styles.totalTitle}>{this.props.title}</Text>
				</View>
				<View style={styles.flex2}>
					<Text style={styles.totalValue}>{this.getCurrency().toUpperCase()}
					{this.props.total}</Text>
				</View>
			</View>
		);
	}

	getCurrency = () => {
		let settings = SettingRealm.getAllSetting();
		return settings.currency;
	};
}

export default PaymentDescription;

const styles = StyleSheet.create({

	paydectitle: { flex: 1, flexDirection: 'row', marginTop: '1%' },

	flex2: {
		flex: 2
	},

	flex3: {
		flex: 3
	},

	container: {
		flex: 1,
		backgroundColor: "#2858a7",

	},
	totalText: {
		marginTop: 10,
		fontWeight: 'bold',
		fontSize: 16,
		color: 'black',
		alignSelf: 'center'
	},

	totalTitle: {
		textTransform: 'uppercase',
		fontWeight: 'bold'
	},

	totalValue: {
		fontSize: 16,
		fontWeight: 'bold',
	},

});
