import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import orderItemStyles from './orderItemStyles';
import i18n from '../../app/i18n';
import SettingRealm from '../../database/settings/settings.operations';
import { colors } from '../../styles/sema_colors';

if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	whyDidYouRender(React, {
		trackAllPureComponents: true
	});
}

class OrderSummary extends React.PureComponent {
	getCurrency = () => {
		const settings = SettingRealm.getAllSetting();
		return settings.currency;
	};

	getAmount = () => {
		const { orderItems } = this.props;
		const products = orderItems;
		if (products.length > 0) {
			let totalAmount = 0;

			products.forEach((i) => {
				if (i.product.description === 'discount') {
					totalAmount += i.finalAmount;
				} else if (i.product.description === 'delivery') {
					totalAmount += i.finalAmount;
				} else {
					totalAmount += i.finalAmount;
				}
			});

			// for (const i of products) {
			// 	if (i.product.description === 'discount') {
			// 		totalAmount += i.finalAmount;
			// 	} else if (i.product.description === 'delivery') {
			// 		totalAmount += i.finalAmount;
			// 	} else {
			// 		totalAmount += i.finalAmount;
			// 	}
			// }
			return totalAmount;
		}
		return 0;
	};

	getTotalOrders = () => {
		const { orderItems } = this.props;
		return orderItems.reduce((total, item) => {
			if (
				item.product.description !== 'discount' &&
				item.product.description !== 'delivery'
			) {
				return total + item.quantity;
			}
			return total + 0;
		}, 0);
	};

	render() {
		return (
			<View style={orderItemStyles.ordersumcont}>
				<View style={orderItemStyles.rowDirection}>
					<Text style={styles.summaryText}>{i18n.t('order-summary')}</Text>
					<Text style={styles.cartText}>
						{i18n.t('cart')} ({this.getTotalOrders()})
					</Text>
				</View>
				<View style={styles.containerTotal}>
					<Text style={(orderItemStyles.flexTwo, styles.totalText)}>
						{i18n.t('order-total')}
					</Text>
					<Text style={(orderItemStyles.flexThree, styles.totalText)}>
						{this.getCurrency().toUpperCase()} {this.getAmount()}
					</Text>
				</View>
			</View>
		);
	}
}

function mapStateToProps(state) {
	return {
		orderItems: state.orderReducer.products
	};
}

export default connect(mapStateToProps)(OrderSummary);

const styles = StyleSheet.create({
	orderSummaryViewTextOne: {
		flex: 3,
		marginLeft: 20
	},

	cartText: {
		alignSelf: 'center',
		color: colors.black,
		flex: 1,
		fontSize: 18,
		fontWeight: 'bold'
	},

	iconleftMargin: {
		left: 10,
		textAlign: 'center'
	},
	leftMargin: {
		left: 10
	},
	summaryText: {
		alignSelf: 'center',
		color: colors.black,
		flex: 3,
		fontSize: 18,
		fontWeight: 'bold',
		marginLeft: 20
	},

	totalText: {
		alignSelf: 'center',
		color: colors.black,
		fontSize: 18,
		fontWeight: 'bold',
		marginTop: 10
	}
});

