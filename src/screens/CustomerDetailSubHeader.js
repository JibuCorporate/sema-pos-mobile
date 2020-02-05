import React, { Component } from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableHighlight,
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as ToolbarActions from '../actions/ToolBarActions';


import PaymentTypeRealm from '../database/payment_types/payment_types.operations';
import * as PaymentTypesActions from "../actions/PaymentTypesActions";

import * as CustomerActions from '../actions/CustomerActions';
import * as TopUpActions from '../actions/TopUpActions';
import * as reportActions from '../actions/ReportActions';
import * as receiptActions from '../actions/ReceiptActions';


import PaymentModal from './paymentModal';

import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modalbox';

class SelectedCustomerDetails extends React.Component {
	constructor(props) {
		super(props);
		this.saleSuccess = false;
		this.state = {
			isQuantityVisible: false,
			firstKey: true,
			isOpen: false,
			isWalkIn: true,
			isDisabled: false,
			swipeToClose: true,
			sliderValue: 0.3,
			paymentOptions: "",
			selectedPaymentTypes: [],
			selectedType: {},
			checkedType: {},
			textInputs: [],
			isCompleteOrderVisible: false,
			isDateTimePickerVisible: false,
			receiptDate: new Date(),
			canProceed: true,
			selectedPaymentType: "Cash",
		};
	}

	render() {
		return (
			<>
			<View style={styles.commandBarContainer}>
				<View style={{ flexDirection: 'column', flex: 1, height: 100 }}>
					<Text style={styles.selectedCustomerText}>
						{this.getName()}
					</Text>

					<Text style={styles.selectedCustomerText}>
						{this.getPhone()}
					</Text>
					{/* <Text style={styles.selectedCustomerText}>
						{this.getCustomerType()}
					</Text> */}
				</View>
				<View style={{ flexDirection: 'column', flex: 1, height: 100 }}>
					{/* <Text style={styles.selectedCustomerText}>
					{this.getCreditPurchases()} Credit Purchases
					</Text> */}
					<Text style={styles.selectedCustomerText}>
						Credit Balance: {this.props.topupTotal - this.getCreditPurchases()}
					</Text>
					<View style={styles.completeOrder}>
						<TouchableHighlight
							onPress={() => this.props.navigation.navigate('OrderView')}>
							<Text style={styles.buttonText}>Make Sale</Text>
						</TouchableHighlight>
						</View>
					</View>
			    	<View style={{ flexDirection: 'column', flex: 1, height: 100 }}>
					<Text style={styles.selectedCustomerText}>
						Loan:  {this.props.selectedCustomer.dueAmount}
					</Text>
						<View style={styles.completeOrder}>
							<TouchableHighlight
								onPress={() => {
									this.refs.modal6.open();
								}}>
								<Text style={styles.buttonText}>Loan Payment</Text>
							</TouchableHighlight>
							</View>

					</View>
			</View>

			<View  style={styles.modalPayment}>
			<Modal
				style={[styles.modal, styles.modal3]}
				coverScreen={true}
				position={"center"} ref={"modal6"}
				onClosed={() => this.modalOnClose()}
				isDisabled={this.state.isDisabled}>
				<PaymentModal
				modalOnClose={this.modalOnClose}
				closePaymentModal={this.closePaymentModal}
				 />
			</Modal>
			</View>
			</>
		);
	}

	modalOnClose() {
		console.log('Modal closed here')
		PaymentTypeRealm.resetSelected();
		this.props.paymentTypesActions.resetSelectedDebt();
		this.props.paymentTypesActions.setPaymentTypes(
			PaymentTypeRealm.getPaymentTypes());
	}

	closePaymentModal = () => {
		this.refs.modal6.close();
	};

	getCreditPurchases() {
		console.log(this.props.creditSales);
		return this.props.creditSales.reduce((total, item) => { return (total + item.amount) }, 0)
	}

	getName() {
		console.log('balanceCredit', this.props.balanceCredit);
		if (this.props.selectedCustomer.hasOwnProperty('name')) {
			return this.props.selectedCustomer.name;
		} else {
			return '';
		}

	}

	getPhone() {
		if (this.props.selectedCustomer.hasOwnProperty('phoneNumber')) {
			return this.props.selectedCustomer.phoneNumber;
		} else {
			return '';
		}
	}

	getCustomerType() {
		if (this.props.selectedCustomer.hasOwnProperty('customertype')) {
			return this.props.selectedCustomer.customerType;
		} else {
			return '';
		}
	}
}

function mapStateToProps(state, props) {
	return {
		selectedCustomer: state.customerReducer.selectedCustomer,
		settings: state.settingsReducer.settings,
		receipts: state.receiptReducer.receipts,
		remoteReceipts: state.receiptReducer.remoteReceipts,
		customers: state.customerReducer.customers,
		receiptsPaymentTypes: state.paymentTypesReducer.receiptsPaymentTypes,
		paymentTypes: state.paymentTypesReducer.paymentTypes,
		products: state.productReducer.products,
		topups: state.topupReducer.topups,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		toolbarActions: bindActionCreators(ToolbarActions, dispatch),
		topUpActions: bindActionCreators(TopUpActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch),
		reportActions: bindActionCreators(reportActions, dispatch),
		paymentTypesActions: bindActionCreators(PaymentTypesActions, dispatch),
		receiptActions: bindActionCreators(receiptActions, dispatch)
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SelectedCustomerDetails);

const styles = StyleSheet.create({

	buttonText: {
		backgroundColor: '#2858a7',
		fontWeight: 'bold',
		fontSize: 18,
		color: 'white',

	},

	commandBarContainer: {
		flex: .25,
		flexDirection: 'row',
		backgroundColor: '#f1f1f1',
		top: 10,
		height: 70,
		elevation: 10,
		alignSelf: 'center',
		width: '80%',
		justifyContent: 'center',
		color: 'white',
		paddingBottom: 20
	},
	modalPayment: {
		backgroundColor: 'white',
	},
	modal3: {
		width: '70%',
		height: 400,
	},
	modal: {
		justifyContent: 'center',
	},
	selectedCustomerText: {
		marginLeft: 10,
		alignSelf: 'flex-start',
		flex: 0.5,
		fontSize: 18,
		color: 'black'
	},
	completeOrder: {
		backgroundColor: '#2858a7',
		borderRadius: 5,
		flex: .4,
		margin: '1%',
		padding: 10,
		width: 200
	}

});
