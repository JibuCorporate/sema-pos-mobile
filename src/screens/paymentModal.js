import React, { Component } from "react"
import { View, Alert, Text, TextInput, Button, FlatList, ScrollView, TouchableHighlight, StyleSheet, Dimensions, Image, TouchableNativeFeedback } from "react-native";
import { CheckBox } from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from 'react-native-modal-datetime-picker';
import * as OrderActions from "../actions/OrderActions";
import Modal from 'react-native-modalbox';
import * as CustomerBarActions from '../actions/CustomerBarActions';
import * as CustomerActions from '../actions/CustomerActions';
import * as PaymentTypesActions from "../actions/PaymentTypesActions";
import * as receiptActions from '../actions/ReceiptActions';
import * as TopUpActions from '../actions/TopUpActions';

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import i18n from "../app/i18n";
import Icon from 'react-native-vector-icons/Ionicons';
import PosStorage from "../database/PosStorage";
import CustomerTypeRealm from '../database/customer-types/customer-types.operations';
import SalesChannelRealm from '../database/sales-channels/sales-channels.operations';
import ProductMRPRealm from '../database/productmrp/productmrp.operations';
import CustomerDebtRealm from '../database/customer_debt/customer_debt.operations';

import PaymentMethod from '../components/orders/order-checkout/payment-method';
import PaymentDescription from '../components/orders/order-checkout/payment-description';

import PaymentTypeRealm from '../database/payment_types/payment_types.operations';
import SettingRealm from '../database/settings/settings.operations';
import CustomerRealm from '../database/customers/customer.operations';
import OrderRealm from '../database/orders/orders.operations';

import ReceiptPaymentTypeRealm from '../database/reciept_payment_types/reciept_payment_types.operations';
import * as Utilities from "../services/Utilities";
import ToggleSwitch from 'toggle-switch-react-native';

const uuidv1 = require('uuid/v1');
import Events from "react-native-simple-events";
const { height, width } = Dimensions.get('window');
const widthQuanityModal = '90%';
const heightQuanityModal = 500;
const inputTextWidth = 400;
const marginInputItems = width / 2 - inputTextWidth / 2;

const inputFontHeight = Math.round((24 * height) / 752);
const marginTextInput = Math.round((5 * height) / 752);
const marginSpacing = Math.round((20 * height) / 752);

class OrderCheckout extends Component {

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
			isCash: true,
			isLoan: false,
			isMobile: false,
			isCredit: false,
			isJibuCredit: false,
			isCheque: false,
			isBank: false,
			selectedPaymentType: "Cash",
		};
	}

	showDateTimePicker = () => {
		this.setState({ isDateTimePickerVisible: true });
	};

	hideDateTimePicker = () => {
		this.setState({ isDateTimePickerVisible: false });
	};

	handleDatePicked = date => {
		var randomNumber = Math.floor(Math.random() * 59) + 1;
		var randomnumstr;
		if (Number(randomNumber) <= 9) {
			randomnumstr = "0" + randomNumber;
		} else {
			randomnumstr = randomNumber;
		}
		var datestr = date.toString();
		var aftergmt = datestr.slice(-14);
		var datestring = datestr.substring(0, 22) + randomnumstr + " " + aftergmt;

		this.setState({ receiptDate: new Date(datestring) });
		this.hideDateTimePicker();
	};

	getLimitDate = () => {
		let date = new Date();
		let days = date.getDay() === 1 ? 2 : 1;
		date.setDate(date.getDate() - days);
		return date;
	};

	render() {
		const state = this.state;

		console.log('PaymentTypes', this.props.paymentTypes);
		console.log('SelectedPaymentTypes', this.props.selectedPaymentTypes);
		console.log('this.state.checkedType', this.state.checkedType);
		console.log('this.props.delivery', this.props.delivery);
		return (
			<View style={styles.container}>

				<ScrollView>
					<View
						style={{
							flex: 1,
							marginTop: 0,
							marginBottom: 50,
							marginLeft: 100,
							marginRight: 100
						}}>
						<View style={{ flex: 1, flexDirection: 'row' }}>
							<View style={{ flex: 1, height: 50 }}>
								<Text style={[{ textAlign: 'left' }, styles.baseItem]}>Payment Method</Text>
							</View>
							<View
								style={{
									justifyContent: 'flex-end',
									flexDirection: 'row',
									right: 10,
									top: 10
								}}>
								{this.getCancelButton()}
							</View>
						</View>
						<FlatList
							data={this.props.paymentTypes}
							renderItem={({ item, index, separators }) => (
								this.paymentTypesRow(item, index, separators)
							)}
							extraData={this.props.selectedPaymentTypes}
							numColumns={2}
							contentContainerStyle={styles.container}
						/>

						<PaymentDescription
							title={`${i18n.t('previous-amount-due')}:`}
							total={Utilities.formatCurrency(
								this.calculateAmountDue()
							)}
						/>
						{/* {this.getBackDateComponent()} */}
						<View style={styles.completeOrder}>
							<View style={{ justifyContent: 'center', height: 50 }}>
								<TouchableHighlight
									underlayColor="#c0c0c0"
									onPress={() => this.clearLoan()}>
									<Text
										style={[
											{ paddingTop: 20, paddingBottom: 20 },
											styles.buttonText
										]}>
										{i18n.t('clear-loan')}
									</Text>
								</TouchableHighlight>
							</View>
						</View>
					</View>
				</ScrollView>

			</View>

		);
	}

	paymentTypesRow = (item, index, separators) => {

		let isSelectedAvailable = false;
		if (this.props.selectedPaymentTypes.length > 0) {
			const itemIndex = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(item.id);
			if (itemIndex >= 0) {
				isSelectedAvailable = true;
			}
		}

		if (this.props.selectedPaymentTypes.length === 0) {
			console.log('--item--', item);
			if (item.name === 'cash') {
				PaymentTypeRealm.isSelected(item, item.isSelected === true ? false : true);
				this.props.paymentTypesActions.setSelectedPaymentTypes({ ...item, created_at: new Date(), isSelected: item.isSelected === true ? false : true, amount: this.calculateOrderDue() });
				isSelectedAvailable = true;
			}
		}

		if(item.name != "loan"){
			return (
				<View style={{ flex: 1, flexDirection: 'row', backgroundColor: 'white' }}>
					{/* <View style={{ flex: .2, height: 50 }}>
						<Text style={[{ marginLeft: 12 }, styles.baseItem]}>{item.applies_to}-{item.amount}</Text>
					</View> */}
					<View style={{ flex: 1, height: 50 }}>
						<View style={styles.checkBoxRow}>
							<View style={[{ flex: 1 }]}>
								<CheckBox
									title={item.description}
									checkedIcon={<Icon
										name="md-checkbox"
										size={20}
										color="black"
									/>}
									uncheckedIcon={<Icon
										name="md-square-outline"
										size={20}
										color="black"
									/>}
									checked={item.isSelected || isSelectedAvailable}
									onPress={() => {
										console.log('press');
										this.checkBoxType(item);
									}}
								/>
							</View>
							<View style={[{ flex: 1 }]}>{this.showTextInput(item)}</View>
						</View>
					</View>
				</View>
			);
		}

	};

	showTextInput(item) {
		if (this.props.selectedPaymentTypes.length >= 0) {
			const itemIndex = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(item.id);
			if (itemIndex >= 0) {
				if (this.props.selectedPaymentTypes[itemIndex].isSelected) {
					return (
						<TextInput
							underlineColorAndroid="transparent"
							onChangeText={(textValue) => {
								console.log('textValue', textValue);
								console.log('selectedType', this.state.selectedType);
								if (Number(textValue) > Number(this.calculateOrderDue())) {
									Alert.alert(
										'Notice. ',
										`Amount can not be greater that ${this.calculateOrderDue()}`,
										[{ text: 'OK', onPress: () => console.log('OK Pressed') }],
										{ cancelable: false }
									);
									return;
								}

								if (this.props.selectedPaymentTypes.length >= 0) {
									const itemIndex2 = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(this.state.selectedType.id);
									let secondItemObj = this.props.selectedPaymentTypes.filter(obj => obj.id != this.state.selectedType.id).map(function (e) { return e.id });
									console.log('secondItemObj', secondItemObj);


									if (itemIndex2 >= 0) {
										this.props.selectedPaymentTypes[itemIndex].amount = Number(textValue);
										this.props.paymentTypesActions.updateSelectedPaymentType({ ...this.props.selectedPaymentTypes[itemIndex2], amount: Number(textValue) }, itemIndex2);
										this.setState({
											selectedType: { ...this.props.selectedPaymentTypes[itemIndex2], amount: Number(textValue) }
										});
									}

									if (secondItemObj.length > 0) {
										const seconditemIndex2 = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(secondItemObj[0]);
										console.log('seconditemIndex2', seconditemIndex2);
										this.props.selectedPaymentTypes[seconditemIndex2].amount = Number(this.calculateOrderDue()) - Number(textValue);
										this.props.paymentTypesActions.updateSelectedPaymentType({ ...this.props.selectedPaymentTypes[seconditemIndex2], amount: Number(this.calculateOrderDue()) - Number(textValue) }, seconditemIndex2);
									}
								}
								console.log('selectedPaymentTypes', this.props.selectedPaymentTypes);

								this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());

							}
							}
							onFocus={(text) => {
								console.log(item)
								this.setState({
									selectedType: item
								});
							}
							}
							keyboardType="numeric"
							value={(this.props.selectedPaymentTypes[itemIndex].amount).toString()}
							style={[styles.cashInput]}
						/>
					);
				}
			}
		}
	}

	checkBoxType = (item) => {
		console.log('selectedPaymentTypes', this.props.selectedPaymentTypes);

		const itemIndex = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(item.id);
		console.log(itemIndex);
		if (itemIndex >= 0) {

			let secondItemObj = this.props.selectedPaymentTypes.filter(obj => obj.id != item.id).map(function (e) { return e.id });
			console.log('secondItemObj', secondItemObj);

			if (secondItemObj.length > 0) {
				const seconditemIndex2 = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(secondItemObj[0]);
				console.log('seconditemIndex2', seconditemIndex2);
				this.props.paymentTypesActions.updateSelectedPaymentType({ ...this.props.selectedPaymentTypes[seconditemIndex2], amount: Number(this.calculateOrderDue()) }, seconditemIndex2);

				PaymentTypeRealm.isSelected(item, false);
				this.props.paymentTypesActions.removeSelectedPaymentType(item, itemIndex);
				this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
				console.log(this.props.selectedPaymentTypes);
			}

			if (secondItemObj.length === 0) {
				this.props.paymentTypesActions.removeSelectedPaymentType(item, itemIndex);
				this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
			}
			return;
		}

		if (this.props.selectedPaymentTypes.length === 2) {
			Alert.alert(
				'Notice ',
				`You cannot select more than two payment methods.`,
				[{
					text: 'OK', onPress: () => {
						console.log('OK Pressed');
						this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
					}
				}],
				{ cancelable: false }
			);
			return;
		}


		this.setState({
			checkedType: { ...item, isSelected: item.isSelected === true ? false : true }
		});


		if (this.props.selectedPaymentTypes.length === 0) {
			PaymentTypeRealm.isSelected(item, item.isSelected === true ? false : true);
			this.props.paymentTypesActions.setSelectedPaymentTypes({ ...item, created_at: new Date(), isSelected: item.isSelected === true ? false : true, amount: this.calculateOrderDue() });
		} else {
			PaymentTypeRealm.isSelected(item, item.isSelected === true ? false : true);
			this.props.paymentTypesActions.setSelectedPaymentTypes({ ...item, created_at: new Date(), isSelected: item.isSelected === true ? false : true, amount: 0 });
		}


		this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
		console.log(this.props.selectedPaymentTypes);
		console.log('getPaymentTypes', PaymentTypeRealm.getPaymentTypes());
		//this.showTextInput(item);
	};

	valuePaymentChange = textValue => {
		console.log('textValue', textValue);
		console.log('selectedType', this.state.selectedType);

		if (this.props.selectedPaymentTypes.length >= 0) {

			if (this.props.selectedPaymentTypes.length === 0) {
				const itemIndex = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(this.state.selectedType.id);
				if (itemIndex >= 0) {
					this.props.paymentTypesActions.updateSelectedPaymentType({ ...this.props.selectedPaymentTypes[itemIndex], amount: Number(textValue) }, itemIndex);
				}
			}

			if (this.props.selectedPaymentTypes.length > 0) {
				const itemIndex = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(this.state.selectedType.id);
				if (itemIndex >= 0) {
					this.props.paymentTypesActions.updateSelectedPaymentType({ ...this.props.selectedPaymentTypes[itemIndex], amount: Number(textValue) }, itemIndex);
				}
			}

		}
		console.log('selectedPaymentTypes', this.props.selectedPaymentTypes);
	};


	modalOnClose() {
		PaymentTypeRealm.resetSelected();
		this.props.paymentTypesActions.setPaymentTypes(
			PaymentTypeRealm.getPaymentTypes());
	}

	getCancelButton() {
		return (
			<TouchableHighlight onPress={() => this.closePaymentModal()}>
				<Icon
					size={50}
					name="md-close"
					color="black"
				/>
			</TouchableHighlight>
		);
	}

	getBackDateComponent() {
		if (!this.isPayoffOnly()) {
			return (
				<View
					style={{
						marginTop: 10,
						marginBottom: 10,
						marginLeft: 100,
						marginRight: 100
					}}>
					<Button
						title="Change Receipt Date"
						onPress={this.showDateTimePicker}
					/>
					<DateTimePicker
						maximumDate={new Date()}
						isVisible={this.state.isDateTimePickerVisible}
						onConfirm={this.handleDatePicked}
						onCancel={this.hideDateTimePicker}
					/>
				</View>
			);
		} else {
			return null;
		}
	}

	_roundToDecimal(value) {
		return parseFloat(value.toFixed(2));
	}

	_isAnonymousCustomer(customer) {
		return CustomerTypeRealm.getCustomerTypeByName('anonymous').id ==
			customer.customerTypeId
			? true
			: false;
	}

	getItemPrice = item => {
		let productMrp = this._getItemMrp(item);
		if (productMrp) {
			return productMrp.priceAmount;
		}
		return item.priceAmount; // Just use product price
	};

	getItemCogs = item => {
		let productMrp = this._getItemMrp(item);
		if (productMrp) {
			return productMrp.cogsAmount;
		}
		return item.cogsAmount; // Just use product price
	};

	_getItemMrp = item => {
		let salesChannel = SalesChannelRealm.getSalesChannelFromName(
			this.props.channel.salesChannel
		);
		if (salesChannel) {
			let productMrp = ProductMRPRealm.getFilteredProductMRP()[
				ProductMRPRealm.getProductMrpKeyFromIds(
					item.productId,
					salesChannel.id
				)
			];
			if (productMrp) {
				return productMrp;
			}
		}
		return null;
	};


	closeHandler = () => {
		this.setState({ isCompleteOrderVisible: false });
		if (this.saleSuccess) {
			this.props.customerBarActions.ShowHideCustomers(1);
			this.props.customerActions.CustomerSelected({});
		} else {
			Alert.alert(
				'Invalid payment amount. ',
				'The amount paid cannot exceed to cost of goods and customer amount due',
				[{ text: 'OK', onPress: () => console.log('OK Pressed') }],
				{ cancelable: false }
			);
		}
	};

	getTotalOrders = () => {
		console.log("getTotalOrders");
		return this.props.products.reduce((total, item) => { return (total + item.quantity) }, 0);
	};

	getAmount = () => {
		return this.props.products.reduce((total, item) => { return (total + item.quantity * this.getItemPrice(item.product)) }, 0);
	};

	getItemPrice = (product) => {
		let salesChannel = SalesChannelRealm.getSalesChannelFromName(this.props.channel.salesChannel);
		if (salesChannel) {
			let productMrp = ProductMRPRealm.getFilteredProductMRP()[ProductMRPRealm.getProductMrpKeyFromIds(product.productId, salesChannel.id)];
			if (productMrp) {
				return productMrp.priceAmount;
			}
		}
		return product.priceAmount;	// Just use product price
	};

	calculateOrderDue() {
		if (this.isPayoffOnly()) {
			// If this is a loan payoff then the loan payment is negative the loan amount due
			return this.calculateAmountDue();
		} else {
			return this.props.products.reduce((total, item) => {
				return total + item.finalAmount;
			}, 0);
		}
	}

	calculateAmountDue() {
		return this.props.selectedCustomer.dueAmount;
	}

	calculateTotalDue() {
		return this._roundToDecimal(
			this.calculateOrderDue() + this.calculateAmountDue()
		);
	}

	isPayoffOnly() {
		return this.props.products.length === 0;
	}

	clearLoan = () => {
		console.log(this.isPayoffOnly());
		console.log('SelectedPaymentTypes', this.props.selectedPaymentTypes);
		console.log('this.props.selectedDiscounts', this.props.selectedDiscounts);
		console.log('this.props.delivery', this.props.delivery);
		this.formatAndSaveSale();

		// TO DO .... Go to the main page.
		Alert.alert(
			'Notice',
			'Payment Made',
			[{
				text: 'OK',
				onPress: () => {
					this.closePaymentModal();
					this.props.orderActions.ClearOrder();
				}
			}],
			{ cancelable: false }
		);
	};

	formatAndSaveSale = async () => {
		let receipt = null;
		let price_total = 0;
		let totalAmount = 0;
		console.log('payment', this.props.payment);

		if (!this.isPayoffOnly()) {
			// Assumes that there is at least one product
			let receiptDate = this.state.receiptDate
				? this.state.receiptDate
				: new Date(Date.now());

			console.log(receiptDate + " ---- " + uuidv1());

			receipt = {
				id: uuidv1(),
				createdDate: receiptDate,
				currency_code: this.props.products[0].product.priceCurrency,
				customer_account_id: this.props.selectedCustomer.customerId,
				isWalkIn: this.props.payment.isWalkIn,
				amount_cash: this.props.payment.cash,
				delivery: this.props.delivery,
				amount_loan: this.props.payment.credit,
				amountMobile: this.props.payment.mobile,
				amount_bank: this.props.payment.bank,
				amount_cheque: this.props.payment.cheque,
				amountjibuCredit: this.props.payment.jibuCredit,
				siteId: this.props.selectedCustomer.siteId
					? this.props.selectedCustomer.siteId
					: SettingRealm.getAllSetting().siteId,
				payment_type: '', // NOT sure what this is
				sales_channel_id: this.props.selectedCustomer.salesChannelId,
				customer_type_id: this.props.selectedCustomer.customerTypeId,
				products: [],
				active: 1
			};

			if (!receipt.siteId) {
				// This fixes issues with the pseudo direct customer
				if (SettingRealm.getAllSetting())
					receipt.siteId = SettingRealm.getAllSetting().siteId;
			}
			console.log(SettingRealm.getAllSetting());
			let cogs_total = 0;

			receipt.products = await this.props.products.map(product => {
				let receiptLineItem = {};
				let tempValue = this.getItemCogs(product.product) * product.quantity;
				receiptLineItem.price_total = this.getItemPrice(product.product) * product.quantity;
				receiptLineItem.totalAmount = product.finalAmount;
				receiptLineItem.quantity = product.quantity;
				receiptLineItem.notes = product.notes;
				receiptLineItem.product_id = product.product.productId;
				receiptLineItem.product = product.product;
				receiptLineItem.cogs_total = tempValue == 0 ? product.quantity : tempValue;
				// The items below are used for reporting...
				receiptLineItem.sku = product.product.sku;
				receiptLineItem.description = product.product.description;
				if (product.product.unitMeasure == 'liters') {
					receiptLineItem.litersPerSku =
						product.product.unitPerProduct;
				} else {
					receiptLineItem.litersPerSku = 'N/A';
				}
				totalAmount += receiptLineItem.totalAmount;
				price_total += receiptLineItem.price_total;
				cogs_total += receiptLineItem.cogs_total;
				receiptLineItem.active = 1;
				return receiptLineItem;
			});
			receipt.total = price_total;
			receipt.totalAmount = totalAmount;
			receipt.cogs = cogs_total;
			console.log(receipt);
			console.log('receipt.receiptreceiptreceipt()');
		}
		// Check loan payoff
		let payoff = 0;
		try {
			if (this.props.payment.hasOwnProperty('cashToDisplay')) {
				payoff = parseFloat(this.props.payment.cashToDisplay);
			} else if (this.props.payment.hasOwnProperty('mobileToDisplay')) {
				payoff = parseFloat(this.props.payment.mobileToDisplay);
			}
			if (payoff > price_total) {
				// User is paying of loan amount
				payoff -= price_total;
				if (payoff > this.props.selectedCustomer.dueAmount) {
					// Overpayment... this is an error
					Alert.alert(
						i18n.t('over-due-amount-title'),
						i18n.t('over-due-amount-text') +
						this.props.selectedCustomer.dueAmount,
						[
							{
								text: 'OK',
								onPress: () => console.log('OK Pressed')
							}
						],
						{ cancelable: false }
					);

					//return false;
					payoff = 0;
				}
			} else {
				payoff = 0;
			}
		} catch (err) {
			console.log('formatAndSaveSale ' + err.message);
		}
		if (receipt != null) {
			const creditIndex = this.props.selectedPaymentTypes.map(function (e) { return e.name }).indexOf("credit");
			console.log('creditIndex', creditIndex);
			if (creditIndex >= 0) {
				if (Number(this.props.selectedPaymentTypes[creditIndex].amount) > Number(this.props.selectedCustomer.dueAmount)) {
					Alert.alert(
						i18n.t('credit-due-amount-title'),
						i18n.t('credit-due-amount-text') +
						this.props.selectedCustomer.dueAmount,
						[
							{
								text: 'OK',
								onPress: () => console.log('OK Pressed')
							}
						],
						{ cancelable: false }
					);
					return;
				}
			}

			receipt.customer_account = this.props.selectedCustomer;
			console.log(this.props.selectedPaymentTypes.length);
			if (this.props.selectedPaymentTypes.length > 0) {
				CustomerDebtRealm.createManyCustomerDebt(this.props.selectedPaymentTypes, this.props.selectedCustomer.customerId);
				this.props.paymentTypesActions.setRecieptPaymentTypes(
					ReceiptPaymentTypeRealm.getReceiptPaymentTypes()
				);
			}
			// OrderRealm.createOrder(receipt);
			// this.props.receiptActions.setReceipts(
			// 	OrderRealm.getAllOrder()
			// );

			const rpIndex = this.props.selectedPaymentTypes.map(function (e) { return e.name }).indexOf("loan");
			console.log('rpIndex', rpIndex);

			if (rpIndex >= 0) {
				this.props.selectedCustomer.dueAmount = Number(this.props.selectedCustomer.dueAmount) + Number(this.props.selectedPaymentTypes[rpIndex].amount);
				CustomerRealm.updateCustomerDueAmount(
					this.props.selectedCustomer,
					this.props.selectedCustomer.dueAmount
				);
				this.props.customerActions.CustomerSelected(this.props.selectedCustomer);
			}

		} else {

		}
		return true;
	};

	closePaymentModal = () => {
		this.refs.modal6.close();
	};

	getOpacity = () => {
		if (this.props.products.length == 0 || this.props.flow.page != 'products') {
			return { opacity: .3 };
		} else {
			return { opacity: 1 };
		}
	}
}

function mapStateToProps(state, props) {
	return {
		products: state.orderReducer.products,
		paymentTypes: state.paymentTypesReducer.paymentTypes,
		delivery: state.paymentTypesReducer.delivery,
		selectedPaymentTypes: state.paymentTypesReducer.selectedPaymentTypes,
		selectedDiscounts: state.orderReducer.discounts,
		flow: state.orderReducer.flow,
		channel: state.orderReducer.channel,
		payment: state.orderReducer.payment,
		selectedCustomer: state.customerReducer.selectedCustomer,
		topups: state.topupReducer.topups,
		topupTotal: state.topupReducer.total,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		orderActions: bindActionCreators(OrderActions, dispatch),
		customerBarActions: bindActionCreators(CustomerBarActions, dispatch),
		receiptActions: bindActionCreators(receiptActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch),
		paymentTypesActions: bindActionCreators(PaymentTypesActions, dispatch),
		topUpActions: bindActionCreators(TopUpActions, dispatch),
	};
}
export default connect(mapStateToProps, mapDispatchToProps)(OrderCheckout);


const styles = StyleSheet.create({

	container: {
		flex: 1,
		backgroundColor: "#fcfcfc",

	},
	checkBoxRow: {
		flex: 1,
		flexDirection: 'row',
		marginTop: '1%',
		alignItems: 'center'
	},
	checkBox: {},
	checkLabel: {
		left: 20,
		fontSize: 20
	},
	totalText: {
		marginTop: 10,
		fontWeight: 'bold',
		fontSize: 18,
		color: 'black',
		alignSelf: 'center'
	},
	buttonText: {
		fontWeight: 'bold',
		fontSize: 30,
		alignSelf: 'center',
		color: 'white'
	},
	summaryText: {
		fontWeight: 'bold',
		fontSize: 18,
		color: 'black',
		alignSelf: 'center'
	},
	baseItem: {
		fontWeight: 'bold',
		fontSize: 16,
		color: 'black',
		paddingTop: 4,
		paddingBottom: 4,

	},
	modal: {
		justifyContent: 'center',
		// alignItems: 'center'
	},

	modal2: {
		height: 230,
		backgroundColor: "#3B5998"
	},
	completeOrder: {
		backgroundColor: '#2858a7',
		borderRadius: 30,
		marginTop: '1%'
	},

	modal3: {
		// height: 300,
		// width: 500
		width: widthQuanityModal,
		height: heightQuanityModal,
	},

});