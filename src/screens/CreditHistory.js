import React from 'react';

import { View, Text, FlatList, Alert, TouchableHighlight, StyleSheet } from 'react-native';

import Icon from 'react-native-vector-icons/Ionicons';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { format, parseISO, isBefore } from 'date-fns';
import * as TopUpActions from '../actions/TopUpActions';
import * as CustomerActions from '../actions/CustomerActions';
import CustomerRealm from '../database/customers/customer.operations';
import CreditRealm from '../database/credit/credit.operations';
import SettingRealm from '../database/settings/settings.operations';
import SelectedCustomerDetails from './CustomerDetailSubHeader';

class CreditHistory extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			refresh: false,
			topup: '',
			searchString: '',
			hasScrolled: false
		};
	}

	componentDidMount() {
		this.props.topUpActions.setTopUpTotal(
			this.prepareTopUpData().reduce((total, item) => {
				return total + item.topup;
			}, 0)
		);
	}

	render() {
		return (
			<View style={styles.selecteddetails}>
				<SelectedCustomerDetails
					creditSales={this.customerCreditPaymentTypeReceipts()}
					navigation={this.props.navigation}
					topupTotal={this.totalTopUp()}
					selectedCustomer={this.props.selectedCustomer}
				/>

				<View style={styles.creditcont}>
					<View style={styles.flex1}>
						<FlatList
							ref={(ref) => {
								this.flatListRef = ref;
							}}
							data={this.prepareTopUpData()}
							ListHeaderComponent={this.showHeader}
							extraData={this.state.refresh}
							renderItem={({ item, index, separators }) => (
								<TouchableHighlight
									// onPress={() => this.onPressItem(item)}
									onShowUnderlay={separators.highlight}
									onHideUnderlay={separators.unhighlight}>
									{this.getRow(item, index, separators)}
								</TouchableHighlight>
							)}
							keyExtractor={(item) => item.customerId}
							initialNumToRender={50}
						/>
					</View>
				</View>
			</View>
		);
	}

	onChangeTopup = (topup) => {
		this.setState({ topup });
	};

	getCancelButton() {
		return (
			<TouchableHighlight onPress={() => this.closePaymentModal()}>
				<Icon size={50} name="md-close" color="black" />
			</TouchableHighlight>
		);
	}

	closePaymentModal = () => {
		this.refs.modal6.close();
	};

	getCurrency = () => {
		const settings = SettingRealm.getAllSetting();
		return settings.currency;
	};

	addCredit = () => {
		if (Number(this.state.topup) === 0) {
			Alert.alert(
				'Notice',
				'Top Up should be more than 0',
				[
					{
						text: 'OK',
						onPress: () => {}
					}
				],
				{ cancelable: false }
			);
			return;
		}

		CreditRealm.createCredit(
			this.props.selectedCustomer.customerId,
			Number(this.state.topup),
			Number(this.state.topup)
		);
		this.setState({ topup: '' });
		this.props.topUpActions.setTopups(CreditRealm.getAllCredit());
		this.props.topUpActions.setTopUpTotal(
			this.prepareTopUpData().reduce((total, item) => {
				return total + item.topup;
			}, 0)
		);

		this.props.selectedCustomer.walletBalance =
			Number(this.props.selectedCustomer.walletBalance) + Number(this.state.topup);
		CustomerRealm.updateCustomerWalletBalance(
			this.props.selectedCustomer,
			this.props.selectedCustomer.walletBalance
		);
		this.props.customerActions.CustomerSelected(this.props.selectedCustomer);
		this.props.customerActions.setCustomers(CustomerRealm.getAllCustomer());
	};

	totalTopUp() {
		return this.prepareTopUpData().reduce((total, item) => {
			return total + item.topup;
		}, 0);
	}

	prepareTopUpData() {
		if (this.props.topups.length > 0) {
			const totalCount = this.props.topups.length;
			const topupLogs = [...new Set(this.props.topups)];
			const topups = topupLogs.map((topup, index) => {
				return {
					active: topup.active,
					// id: topup.id,
					createdAt: topup.created_at,
					top_up_id: topup.top_up_id,
					customer_account_id: topup.customer_account_id,
					total: topup.total,
					topup: topup.topup,
					balance: topup.balance,
					totalCount
				};
			});

			topups.sort((a, b) => {
				return isBefore(parseISO(a.createdAt), parseISO(b.createdAt)) ? 1 : -1;
			});
			return topups.filter(
				(r) => r.customer_account_id === this.props.selectedCustomer.customerId
			);
		}
		return [];
	}

	getRow = (item, index, separators) => {
		const isSelected = false;
		return (
			<View style={[this.getRowBackground(index, isSelected), styles.rowstyles]}>
				<View style={styles.flex1}>
					<Text style={styles.baseItem}>
						{format(parseISO(item.createdAt), 'iiii d MMM yyyy')}
					</Text>
				</View>
				<View style={styles.flex1}>
					<Text style={(styles.baseItem, styles.leftMargin)}>
						{this.getCurrency()} {item.topup}
					</Text>
				</View>
			</View>
		);
	};

	showHeader = () => {
		return (
			<View style={styles.headerBackground}>
				<View style={styles.flex1}>
					<Text style={styles.headerItem}>Date</Text>
				</View>

				<View style={styles.flex1}>
					<Text style={styles.headerItem}>Topup Amount</Text>
				</View>
			</View>
		);
	};

	customerCreditPaymentTypeReceipts() {
		const receiptsPaymentTypes = [...this.compareCreditPaymentTypes()];
		const customerReceipt = [...this.getCustomerRecieptData()];
		const finalCustomerReceiptsPaymentTypes = [];

		for (const receiptsPaymentType of receiptsPaymentTypes) {
			const rpIndex = customerReceipt
				.map(function (e) {
					return e.id;
				})
				.indexOf(receiptsPaymentType.receipt_id);
			if (rpIndex >= 0) {
				receiptsPaymentType.receipt = receiptsPaymentTypes[rpIndex];
				finalCustomerReceiptsPaymentTypes.push(receiptsPaymentType);
			}
		}
		return finalCustomerReceiptsPaymentTypes;
	}

	compareCreditPaymentTypes() {
		const receiptsPaymentTypes = [...this.props.receiptsPaymentTypes];
		const paymentTypes = [...this.props.paymentTypes];
		const finalreceiptsPaymentTypes = [];
		for (const receiptsPaymentType of receiptsPaymentTypes) {
			const rpIndex = paymentTypes
				.map(function (e) {
					return e.id;
				})
				.indexOf(receiptsPaymentType.payment_type_id);
			if (rpIndex >= 0) {
				if (paymentTypes[rpIndex].name === 'credit') {
					receiptsPaymentType.name = paymentTypes[rpIndex].name;
					finalreceiptsPaymentTypes.push(receiptsPaymentType);
				}
			}
		}
		return finalreceiptsPaymentTypes;
	}

	compareLoanPaymentTypes() {
		const receiptsPaymentTypes = [...this.props.receiptsPaymentTypes];
		const paymentTypes = [...this.props.paymentTypes];

		const finalreceiptsPaymentTypes = [];

		for (const receiptsPaymentType of receiptsPaymentTypes) {
			const rpIndex = paymentTypes
				.map(function (e) {
					return e.id;
				})
				.indexOf(receiptsPaymentType.payment_type_id);
			if (rpIndex >= 0) {
				if (paymentTypes[rpIndex].name === 'loan') {
					receiptsPaymentType.name = paymentTypes[rpIndex].name;
					finalreceiptsPaymentTypes.push(receiptsPaymentType);
				}
			}
		}
		return finalreceiptsPaymentTypes;
	}

	getCustomerRecieptData() {
		// Used for enumerating receipts

		if (this.props.receipts.length > 0) {
			const totalCount = this.props.receipts.length;

			const salesLogs = [...new Set(this.props.receipts)];
			const remoteReceipts = salesLogs.map((receipt, index) => {
				return {
					active: receipt.active,
					id: receipt.id,
					createdAt: receipt.created_at,
					customerAccount: receipt.customer_account,
					customer_account_id: receipt.customer_account_id,
					receiptLineItems: receipt.receipt_line_items,
					isLocal: receipt.isLocal || false,
					key: receipt.isLocal ? receipt.key : null,
					index,
					updated: receipt.updated,
					amountLoan: receipt.amount_loan,
					totalCount,
					currency: receipt.currency_code,
					totalAmount: receipt.total
				};
			});

			remoteReceipts.sort((a, b) => {
				return isBefore(parseISO(a.createdAt), parseISO(b.createdAt)) ? 1 : -1;
			});

			let siteId = 0;
			if (SettingRealm.getAllSetting()) {
				siteId = SettingRealm.getAllSetting().siteId;
			}
			return remoteReceipts.filter(
				(r) => r.customer_account_id === this.props.selectedCustomer.customerId
			);
		}
		return [];
	}

	getRowBackground = (index, isSelected) => {
		if (isSelected) {
			return styles.selectedBackground;
		}
		return index % 2 === 0 ? styles.lightBackground : styles.darkBackground;
	};
}

function mapStateToProps(state, props) {
	return {
		selectedCustomer: state.customerReducer.selectedCustomer,
		customers: state.customerReducer.customers,
		receiptsPaymentTypes: state.paymentTypesReducer.receiptsPaymentTypes,
		paymentTypes: state.paymentTypesReducer.paymentTypes,
		searchString: state.customerReducer.searchString,
		receipts: state.receiptReducer.receipts,
		topups: state.topupReducer.topups,
		topupTotal: state.topupReducer.total
	};
}

function mapDispatchToProps(dispatch) {
	return {
		customerActions: bindActionCreators(CustomerActions, dispatch),
		topUpActions: bindActionCreators(TopUpActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(CreditHistory);

const styles = StyleSheet.create({
	baseItem: {
		alignContent: 'flex-end',
		fontSize: 18
	},
	creditCont: {
		flexDirection: 'row',
		flex: 0.75,
		width: '85%',
		alignSelf: 'center',
		backgroundColor: '#FFF'
	},
	darkBackground: {
		backgroundColor: '#F0F8FF'
	},
	flex1: { flex: 1 },
	headerBackground: {
		backgroundColor: '#ABC1DE',
		flex: 1,
		flexDirection: 'row',
		height: 50,
		padding: 10,
		alignItems: 'center'
	},
	headerItem: {
		fontSize: 18,
		fontWeight: 'bold'
	},
	leftMargin: {
		left: 10
	},
	lightBackground: {
		backgroundColor: 'white'
	},
	rowstyles: {
		alignItems: 'center',
		flex: 1,
		flexDirection: 'row',
		height: 50,
		padding: 5
	},
	selectedBackground: {
		backgroundColor: '#9AADC8'
	},

	selectedCustomerText: {
		alignSelf: 'center',
		color: 'black',
		flex: 0.5,
		marginLeft: 10
	},

	selecteddetails: { backgroundColor: '#fff', flex: 1 }
});
