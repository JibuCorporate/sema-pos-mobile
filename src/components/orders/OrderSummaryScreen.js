import React from "react";
if (process.env.NODE_ENV === 'development') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
        trackAllPureComponents: true,
    });
}
import { View, Text, Button, TouchableOpacity, ScrollView, FlatList, TextInput, TouchableHighlight, StyleSheet, Alert , InteractionManager} from "react-native";
import orderItemStyles from "./orderItemStyles";
import orderCheckOutStyles from "./orderCheckOutStyles";
import { connect } from "react-redux";
import i18n from "../../app/i18n";
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/Ionicons';
import DiscountRealm from '../../database/discount/discount.operations';
import ToggleSwitch from 'toggle-switch-react-native';
import AppContext from '../../context/app-context';
import { bindActionCreators } from "redux";
import * as OrderActions from "../../actions/OrderActions";
import * as DiscountActions from '../../actions/DiscountActions';

import { CheckBox, Card } from 'react-native-elements';
import DateTimePicker from 'react-native-modal-datetime-picker';
import * as CustomerReminderActions from '../../actions/CustomerReminderActions';
import * as CustomerActions from '../../actions/CustomerActions';
import * as PaymentTypesActions from "../../actions/PaymentTypesActions";
import * as receiptActions from '../../actions/ReceiptActions';
import * as TopUpActions from '../../actions/TopUpActions';
import CreditRealm from '../../database/credit/credit.operations';
import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';
import ProductMRPRealm from '../../database/productmrp/productmrp.operations';
import CustomerDebtRealm from '../../database/customer_debt/customer_debt.operations';
import SettingRealm from '../../database/settings/settings.operations';
import PaymentDescription from './order-checkout/payment-description';
import PaymentTypeRealm from '../../database/payment_types/payment_types.operations';
import CustomerRealm from '../../database/customers/customer.operations';
import OrderRealm from '../../database/orders/orders.operations';
import CustomerReminderRealm from '../../database/customer-reminder/customer-reminder.operations';
import ReceiptPaymentTypeRealm from '../../database/reciept_payment_types/reciept_payment_types.operations';
import OrderSummary from './orderSummary';
import OrderItems from './orderItems';
import OrderCheckOut from './orderCheckOut';
const uuidv1 = require('uuid/v1');
import { withNavigation } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
class OrderSummaryScreen extends React.PureComponent {
	static contextType = AppContext;
	constructor(props) {
		super(props);
		this.state = {
			selectedItem: {},
			accumulator: 0,
			selectedDiscounts: {},
			firstKey: true,
			switch1Value: false,
			isOpen: false,
			isDisabled: false,
			swipeToClose: true,
			sliderValue: 0.3,
			isWalkIn: true,
			//isDisabled: false,
			buttonDisabled: false,
			notes: '',
			//swipeToClose: true,
			loanPaid: 0,
			topUpExpected: 0,
			//sliderValue: 0.3,
			selectedPaymentTypes: [],
			selectedType: {},
			checkedType: {},
			textInputs: [],
			isCompleteOrderVisible: false,
			isDateTimePickerVisible: false,
			receiptDate: new Date(),
			selectedPaymentType: "Cash",

			isBottleTrackerModal: false,
			isAdditionalNotesModal: false,
			isPaymentModal: false,
			isorderItemsModal: false,
		};

		// this.selectedCustomer = {JSON.stringify(navigation.getParam('item', {}))};
	//	this.onPay = this.onPay.bind(this);
	//	this.handleCompleteSale = this.handleCompleteSale.bind(this);
	//	this.orderItems = [...this.props.orderItems];
	}
	static whyDidYouRender = true;
	render() {
		return (
			<View style={orderItemStyles.orderSideBar}>
				<OrderSummary/>
				<OrderItems/>
				<OrderCheckOut/>
			</View>
		);
	}



}

function mapStateToProps(state, props) {
	return {
		orderItems: state.orderReducer.products,
		discounts: state.discountReducer.discounts,
		paymentTypes: state.paymentTypesReducer.paymentTypes,
		delivery: state.paymentTypesReducer.delivery,
		selectedPaymentTypes: state.paymentTypesReducer.selectedPaymentTypes,
		selectedDiscounts: state.orderReducer.discounts,
		channel: state.orderReducer.channel,
		receiptsPaymentTypes: state.paymentTypesReducer.receiptsPaymentTypes,
		receipts: state.receiptReducer.receipts,
		payment: state.orderReducer.payment,
		selectedCustomer: state.customerReducer.selectedCustomer,
		topups: state.topupReducer.topups,
		topupTotal: state.topupReducer.total,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		orderActions: bindActionCreators(OrderActions, dispatch),
		discountActions: bindActionCreators(DiscountActions, dispatch),
		receiptActions: bindActionCreators(receiptActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch),
		paymentTypesActions: bindActionCreators(PaymentTypesActions, dispatch),
		topUpActions: bindActionCreators(TopUpActions, dispatch),
		customerReminderActions: bindActionCreators(CustomerReminderActions, dispatch),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(OrderSummaryScreen));

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
		borderColor: '#2858a7',
		borderTopWidth: 5,
		borderRightWidth: 5,

	},
	summaryText: {
		fontWeight: 'bold',
		fontSize: 18,
		color: 'black',
		alignSelf: 'center'
	},

	containerTotal: {
		flex: 2,
		backgroundColor: "#e0e0e0",
		borderColor: '#2858a7',
		borderTopWidth: 5,
		borderRightWidth: 5,

	},
	orderSummaryViewTextOne: { flex: 3, marginLeft: 20 },
	totalText: {
		marginTop: 10,
		fontWeight: 'bold',
		fontSize: 18,
		color: 'black',
		alignSelf: 'center'
	},
	leftMargin: {
		left: 10
	},

	iconleftMargin: {
		textAlign: 'center',
		left: 10
	}

});


