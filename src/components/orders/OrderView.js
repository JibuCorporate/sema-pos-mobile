import React from "react";
if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	const ReactRedux = require('react-redux');
	whyDidYouRender(React, {
		trackAllPureComponents: true,
	});
}


import { View, Text, Button, TouchableOpacity,
	Dimensions,
	Image,
	InteractionManager, ScrollView, FlatList, TextInput, TouchableHighlight, StyleSheet, Alert } from "react-native";
import orderItemStyles from "./orderItemStyles";
import orderCheckOutStyles from "./orderCheckOutStyles";
import { connect } from "react-redux";
import SettingRealm from '../../database/settings/settings.operations';
import i18n from "../../app/i18n";
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/Ionicons';
import DiscountRealm from '../../database/discount/discount.operations';
import ToggleSwitch from 'toggle-switch-react-native';
import slowlog from 'react-native-slowlog';

import { bindActionCreators } from "redux";
import * as OrderActions from "../../actions/OrderActions";
import * as DiscountActions from '../../actions/DiscountActions';
import * as ProductActions from '../../actions/ProductActions';

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
import PaymentDescription from './order-checkout/payment-description';
import PaymentTypeRealm from '../../database/payment_types/payment_types.operations';
import CustomerRealm from '../../database/customers/customer.operations';
import OrderRealm from '../../database/orders/orders.operations';
import CustomerReminderRealm from '../../database/customer-reminder/customer-reminder.operations';
import { productListStyles, newStyle } from './ProductListScreen';
import randomMC from 'random-material-color';

import ReceiptPaymentTypeRealm from '../../database/reciept_payment_types/reciept_payment_types.operations';
const uuidv1 = require('uuid/v1');
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
class OrderView extends React.PureComponent {

	constructor(props) {
		super(props);
		slowlog(this, /.*/);

		let { width } = Dimensions.get('window');
		// Empirically we know that this view has flex of 1 and the view beside it,
		// (OrderSummaryScreen has a flex of .6 This makes the width of this view 1/1.6 * screen width
		// Since there is no way to dynamilcally determine view width until the layout is complete, use
		// this to set width. (Note this will break if view layout changes
		this.viewWidth = 1 / 1.6 * width;
		//this.salesChannelId = this.props.selectedCustomer.hasOwnProperty('salesChannelId') ? this.props.selectedCustomer.salesChannelId : this.props.navigation.state.params.selectedCustomer.salesChannelId;
		this.salesChannelId =  this.props.selectedCustomer.salesChannelId;

		this.numColumns = 4;
		this.horizontal = false;
		this.removeClippedSubviews = true;


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
			salesChannel: SalesChannelRealm.getSalesChannelFromId(this.salesChannelId),
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
		this.onPay = this.onPay.bind(this);
		this.handleCompleteSale = this.handleCompleteSale.bind(this);
		this.orderItems = [...this.props.orderItems];
	}

	static whyDidYouRender = true;
	orderSummaryElement = () => {
		return (
			<View style={styles.container}>
				<View style={orderItemStyles.rowDirection}>
					<Text style={[styles.orderSummaryViewTextOne, styles.summaryText]}>{i18n.t('order-summary')}</Text>
					<Text style={[orderItemStyles.flexOne, styles.summaryText]}>{i18n.t('cart')} ({this.getTotalOrders()})</Text>
				</View>
			</View>
		);
	}

	getTotalOrders = () => {
		return this.props.orderItems.reduce((total, item) => {
			if (item.product.description != 'discount' && item.product.description != 'delivery') {
				return (total + item.quantity);
			} else {
				return (total + 0);
			}
		}, 0);
	};

	// Order Total //
	orderTotalElement = () => {
		return (
			<View style={styles.containerTotal}>
				<Text style={[orderItemStyles.flexTwo, styles.totalText]}>{i18n.t('order-total')}</Text>
				<Text style={[orderItemStyles.flexThree, styles.totalText]}>{this.getCurrency().toUpperCase()} {this.getAmount()}</Text>
			</View>
		);
	}

	getAmount = () => {
		let propducts = this.props.orderItems;
		if (propducts.length > 0) {
			let totalAmount = 0;
			for (let i of propducts) {
				if (i.product.description === 'discount') {
					totalAmount = totalAmount + i.finalAmount;
				}
				else if (i.product.description === 'delivery') {
					totalAmount = totalAmount + i.finalAmount;
				} else {
					totalAmount = totalAmount + i.finalAmount;
				}
			}
			return totalAmount;

		}
		return 0;
	};

	getCurrency = () => {
		let settings = SettingRealm.getAllSetting();
		return settings.currency;
	};

	// End Order Total //

	// Start Order Items //

	handleOnPress=(item)=> {
		this.setState({ selectedItem: item });
		this.setState({ accumulator: item.quantity });
		this.setState({ firstKey: true });
		this.setState({ isorderItemsModal: true });
		this.refs.productModel.open();
	}

	_renderItem = ({ item, index, separators }) => (
		<TouchableHighlight
			onPress={() => this.handleOnPress(item)}
			onShowUnderlay={separators.highlight}
			onHideUnderlay={separators.unhighlight}>
			{this.getRow(item, index, separators)}
		</TouchableHighlight>
	)

	orderItemsModal = () => {

		if (this.state.isorderItemsModal) {
			return (
				<KeyboardAwareScrollView>
					{/* <TouchableOpacity> */}
						<View style={[orderItemStyles.headerBackground, orderItemStyles.alignment]}>
							<View style={orderItemStyles.third}>
								{this.getProductDescripion()}
							</View>
							<View style={orderItemStyles.sixth}>
								<Text style={[orderItemStyles.center, orderItemStyles.baseItem]}>
									{this.getCurrency(this.state.selectedItem)} {this.getDiscountPrice((this.state.selectedItem.quantity * this.state.selectedItem.unitPrice), this.state.selectedItem)}</Text>
							</View>
							<View
								style={orderItemStyles.cancelstyle}>
								{this.getCancelButton()}
							</View>
						</View>
						<View
							style={orderItemStyles.aseparator}
						/>
						<View style={orderItemStyles.flexAlign}>
							{this.qtyAmount()}

							{this.bottlesReturned()}

							<View
								style={orderItemStyles.aseparator}
							/>

							<View style={orderItemStyles.rowDirection}>
								<View style={orderItemStyles.flexOne}>
									<Text style={[orderItemStyles.textLeft, orderItemStyles.baseItem]}>NOTES</Text>
								</View>
							</View>

							<View style={orderItemStyles.rowDirection}>
								<View style={orderItemStyles.flexHeigth}>
									{this.notesValue()}
								</View>
							</View>

							<View
								style={orderItemStyles.aseparator}
							/>

							{this.discountCmpt()}

							<View
								style={orderItemStyles.btmDiv}>

								<TouchableOpacity style={orderItemStyles.flexOne}
									onPress={() => this.removeDiscount()}>
									<Text style={orderItemStyles.removebtn}>REMOVE</Text>
								</TouchableOpacity>

								<TouchableOpacity style={orderItemStyles.flexOne}
									onPress={() => this.onCancelOrder()}>
									<Text style={orderItemStyles.savebtn}>SAVE</Text>
								</TouchableOpacity>

							</View>

						</View>
					{/* </TouchableOpacity> */}
				</KeyboardAwareScrollView>

			)
		} else {
			return null
		}
	}


	orderItemsElement = () => {
		return (
			<View style={orderItemStyles.container}>
				<FlatList
					data={this.props.orderItems}
					ListHeaderComponent={this.showOrderItemsHeader}
					extraData={this.props.channel.salesChannel}
					renderItem={this._renderItem}
					keyExtractor={item => item.product.productId.toString()}
				/>

				<Modal style={[orderItemStyles.modal, orderItemStyles.modal3]}
					coverScreen={true}
					position={"center"}
					onClosed={this.modalOnClose}
					ref={"productModel"}>
					{this.orderItemsModal()}
				</Modal>

			</View >

		);
	}


	discountCmpt() {
		if (this.state.selectedItem.hasOwnProperty('product')) {
			if (!this.state.selectedItem.product.description.includes('delivery') &&
				!this.state.selectedItem.product.description.includes('discount')
			) {
				return (
					<View>
						<View style={orderItemStyles.rowDirection}>
							<View style={orderItemStyles.flexHeigth}>
								<Text style={[orderItemStyles.textLeft, orderItemStyles.baseItem]}>DISCOUNTS</Text>
							</View>
						</View>


						<View style={orderItemStyles.discountView}>
							<FlatList
								data={this.props.discounts}
								extraData={this.state.selectedDiscounts}
								renderItem={({ item, index, separators }) => (
									this.discountRows(item, index, separators)
								)}
							/>
						</View>

						<View style={orderItemStyles.discountView}>
							<View style={orderItemStyles.flexHeigth}>
								<Text style={[orderItemStyles.baseItem, {
									marginLeft: 12, padding: 10
								}]}>Custom</Text>
							</View>
							<View style={orderItemStyles.flexHeigth}>
								{this.customDiscountValue()}
							</View>
						</View>
						<View
							style={orderItemStyles.aseparator}
						/>
					</View>
				);
			}
		}
	}

	qtyAmount() {
		if (this.state.selectedItem.hasOwnProperty('product')) {
			if (this.state.selectedItem.product.description.includes('delivery') ||
				this.state.selectedItem.product.description.includes('discount')
			) {
				return (
					<View style={orderItemStyles.flexOne}>
						<View style={orderItemStyles.flexOne}>
							<Text style={[orderItemStyles.textLeft, orderItemStyles.baseItem]}>AMOUNT</Text>
						</View>
						<View style={{ flex: 1, height: 40, textAlign: 'center' }} >
							{this.qtyValue()}
						</View>
					</View>
				);
			} else {
				return (
					<View>
						<View style={orderItemStyles.rowDirection}>
							<View style={orderItemStyles.flexOne}>
								<Text style={[orderItemStyles.textLeft, orderItemStyles.baseItem]}>QUANTITY</Text>
							</View>
						</View>
						<View style={{
							flex: 1,
							width: "100%",
							flexDirection: 'row',
							alignItems: 'stretch',

						}}>
							<View style={{ flex: .2, height: 40 }}>
								<TouchableHighlight style={orderItemStyles.flexOne}
									onPress={this.counterChangedHandler.bind(this, 'dec')}>
									<Icon
										size={40}
										style={orderItemStyles.iconleftMargin}
										name="md-remove-circle-outline"
										color="black"
									/>
								</TouchableHighlight>
							</View>
							<View style={{ flex: .6, height: 40, textAlign: 'center' }} >
								<View style={{ flex: .5, alignSelf: 'center' }}>
									{this.qtyValue()}
								</View>
							</View>
							<View style={{ flex: .2, height: 40 }}>
								<TouchableHighlight style={orderItemStyles.flexOne}
									onPress={this.counterChangedHandler.bind(this, 'inc')}>
									<Icon
										size={40}
										style={orderItemStyles.iconleftMargin}
										name="md-add-circle-outline"
										color="black"
									/>
								</TouchableHighlight>
							</View>
						</View>
					</View>
				);
			}
		}

	}

	getCancelButton() {
		return (
			<TouchableHighlight onPress={() => this.onCancelOrder()}>
				<Icon
					size={40}
					name="md-close-circle-outline"
					color="black"
				/>
			</TouchableHighlight>
		);

	}

	qtyValue() {

		let qty = '';

		if (!this.state.selectedItem.hasOwnProperty('quantity')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('quantity')) {
			qty = this.state.selectedItem.quantity.toString();
		}

		return (
			<TextInput
				style={{
					textAlign: 'center',
					height: 50,
					fontSize: 24
				}}
				keyboardType="number-pad"
				onChangeText={(value) => this.changeQuantity(value)}
				value={qty}
				underlineColorAndroid="transparent"
				placeholder='Quantity'
			/>
		)
	}

	bottlesReturned() {
		if (this.state.selectedItem.hasOwnProperty('product')) {
			if (this.state.selectedItem.product.description.includes('refill')) {
				return (
					<View>
						<View
							style={orderItemStyles.aseparator}
						/>
						<View style={[orderItemStyles.rowDirection]}>
							<View style={[orderItemStyles.flexOne]}>
								<Text style={[orderItemStyles.headerItem, orderItemStyles.upperCase]}>Empties Returned</Text>
							</View>
							<View style={[orderItemStyles.flexOne]}>
								<Text style={[orderItemStyles.headerItem, orderItemStyles.upperCase]}>Damaged Bottles</Text>
							</View>
							<View style={[orderItemStyles.flexOne]}>
								<Text style={[orderItemStyles.headerItem, orderItemStyles.upperCase]}>Pending Bottles</Text>
							</View>
						</View>

						<View style={orderItemStyles.emptiesView}>
							<View style={[orderItemStyles.flexOne]}>
								{this.emptiesReturnedValue()}
							</View>
							<View style={[orderItemStyles.flexOne]}>
								{this.emptiesDamagedValue()}
							</View>
							<View style={[orderItemStyles.flexOne]}>
								{this.refillPendingValue()}
							</View>
						</View>
					</View>
				);
			}
		}

	}

	notesValue() {
		let notes = '';
		if (!this.state.selectedItem.hasOwnProperty('notes')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('notes')) {
			notes = this.state.selectedItem.notes;
		}

		return (
			<TextInput
				style={{
					padding: 10
				}}
				onChangeText={this.setNotes}
				value={notes}
				underlineColorAndroid="transparent"
				placeholder="Add a Note"
			/>
		)
	}

	emptiesReturnedValue() {
		let emptiesReturned = '';
		let qty = this.state.selectedItem.quantity.toString();

		if (!this.state.selectedItem.hasOwnProperty('emptiesReturned')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('emptiesReturned')) {
			emptiesReturned = this.state.selectedItem.emptiesReturned;
			if (emptiesReturned === '') {
				emptiesReturned = qty;
			}
		}

		return (
			<TextInput
				style={{
					textAlign: 'center',
					height: 50,
					fontSize: 24
				}}
				onChangeText={this.setEmptiesReturned}
				value={emptiesReturned}
				keyboardType="number-pad"
				underlineColorAndroid="transparent"
				placeholder="0"
			/>
		)
	}

	emptiesDamagedValue() {
		let emptiesDamaged = '';
		if (!this.state.selectedItem.hasOwnProperty('emptiesDamaged')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('emptiesDamaged')) {
			emptiesDamaged = this.state.selectedItem.emptiesDamaged;
		}

		return (
			<TextInput
				style={{
					textAlign: 'center',
					height: 50,
					fontSize: 24
				}}
				onChangeText={this.setEmptiesDamaged}
				value={emptiesDamaged}
				keyboardType="number-pad"
				underlineColorAndroid="transparent"
				placeholder="0"
			/>
		)
	}

	refillPendingValue() {
		let refillPending = '';
		if (!this.state.selectedItem.hasOwnProperty('refillPending')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('refillPending')) {
			refillPending = this.state.selectedItem.refillPending;
		}

		return (
			<TextInput
				style={{
					textAlign: 'center',
					height: 50,
					fontSize: 24
				}}
				onChangeText={this.setRefillPending}
				value={refillPending}
				keyboardType="number-pad"
				underlineColorAndroid="transparent"
				placeholder="0"
			/>
		)
	}

	getProductDescripion() {
		if (this.state.selectedItem.hasOwnProperty('product')) {
			return (
				<Text style={[orderItemStyles.textLeft, orderItemStyles.baseItem]}>{this.state.selectedItem.product.description}</Text>
			)
		}
	}

	customDiscountValue() {

		if (!this.state.selectedItem.hasOwnProperty('product')) {
			return;
		}

		const productIndex = this.props.selectedDiscounts.map(function (e) { return e.product.productId }).indexOf(this.state.selectedItem.product.productId);


		let customValue = 0;
		if (productIndex >= 0) {
			customValue = this.props.selectedDiscounts[productIndex].customDiscount;
		}
		return (
			<TextInput
				style={{
					padding: 10
				}}
				onChangeText={this.customDiscount}
				value={(customValue.toString())}
				keyboardType="number-pad"
				underlineColorAndroid="transparent"
				placeholder="Custom Discount"
			/>
		)
	}

	modalOnClose=()=> {
		DiscountRealm.resetSelected();
		this.setState(state => {
			return {
				selectedDiscounts: {}
			};
		});
		this.props.discountActions.setDiscounts(
			DiscountRealm.getDiscounts()
		);

		PaymentTypeRealm.resetSelected();
		this.props.paymentTypesActions.resetSelectedPayment();
		this.props.paymentTypesActions.setPaymentTypes(
			PaymentTypeRealm.getPaymentTypes());

	}

	onCancelOrder() {
		this.setState({ isorderItemsModal: false });
		this.refs.productModel.close();
	};

	removeDiscount() {
		this.refs.productModel.close();
		this.setState({ isorderItemsModal: false });
		let unitPrice = this.getOrderItemPrice(this.state.selectedItem.product);
		this.props.orderActions.RemoveProductFromOrder(this.state.selectedItem.product, unitPrice);
	};


	showQuantityChanger() {
		this.props.toolbarActions.ShowScreen('quanityChanger');
	}

	getRow = (item) => {
		return (
			<View style={orderItemStyles.emptiesView}>
				<View style={[orderItemStyles.flexTwo]}>
					<Text style={[orderItemStyles.baseItem, orderItemStyles.leftMargin]}>{item.product.description}</Text>
				</View>
				<View style={[{ flex: 1.2 }]}>
					<Text style={[orderItemStyles.baseItem, { textAlign: 'center' }]}>{item.quantity}</Text>
				</View>
				<View style={[orderItemStyles.flexTwo]}>
					<Text numberOfLines={1} style={[orderItemStyles.baseItem, { textAlign: 'right', paddingRight: 5 }]}>
						{this.getCurrency().toUpperCase()} {this.getDiscountPrice((item.quantity * item.unitPrice), item)}
					</Text>
				</View>
			</View>
		);
	};

	customDiscount = searchText => {
		const productIndex = this.props.selectedDiscounts.map(function (e) { return e.product.productId }).indexOf(this.state.selectedItem.product.productId);

		if (Number(searchText) > (this.state.selectedItem.quantity * this.getOrderItemPrice(this.state.selectedItem.product))) {
			Alert.alert("Custom Discount",
				"Discount cannot exceed order amount.",
				[{
					text: 'OK',
					onPress: () => {
					}
				}],
				{ cancelable: false }
			);
			return;
		}

		if (productIndex >= 0) {
			DiscountRealm.isSelected(this.state.selectedDiscounts, false);
			this.props.discountActions.setDiscounts(DiscountRealm.getDiscounts());
			if (this.props.selectedDiscounts[productIndex].discount.length > 0 && this.state.selectedDiscounts.length === 0) {
				this.props.orderActions.SetOrderDiscounts('Custom', searchText, this.state.selectedItem.product, this.props.selectedDiscounts[productIndex].discount, (this.state.selectedItem.quantity * this.getOrderItemPrice(this.state.selectedItem.product)));
			} else {
				this.props.orderActions.SetOrderDiscounts('Custom', searchText, this.state.selectedItem.product, this.state.selectedDiscounts, (this.state.selectedItem.quantity * this.getOrderItemPrice(this.state.selectedItem.product)));
			}

		} else {
			this.props.orderActions.SetOrderDiscounts('Custom', searchText, this.state.selectedItem.product, this.state.selectedDiscounts, (this.state.selectedItem.quantity * this.getOrderItemPrice(this.state.selectedItem.product)));

		}

	};

	setNotes = notes => {
		let emptiesReturned = '';
		if (!this.state.selectedItem.hasOwnProperty('emptiesReturned')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('emptiesReturned')) {
			emptiesReturned = this.state.selectedItem.emptiesReturned;
		}

		let refillPending = '';
		if (!this.state.selectedItem.hasOwnProperty('refillPending')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('refillPending')) {
			refillPending = this.state.selectedItem.refillPending;
		}

		let emptiesDamaged = '';
		if (!this.state.selectedItem.hasOwnProperty('emptiesDamaged')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('emptiesDamaged')) {
			emptiesDamaged = this.state.selectedItem.emptiesDamaged;
		}


		this.props.orderActions.AddNotesToProduct(this.state.selectedItem.product, notes, emptiesReturned, refillPending, emptiesDamaged);
	};

	setEmptiesDamaged = emptiesDamaged => {
		let refillPending = '';
		if (!this.state.selectedItem.hasOwnProperty('refillPending')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('refillPending')) {
			refillPending = this.state.selectedItem.refillPending;
		}

		let emptiesReturned = '';
		if (!this.state.selectedItem.hasOwnProperty('emptiesReturned')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('emptiesReturned')) {
			emptiesReturned = this.state.selectedItem.emptiesReturned;
		}

		let notes = '';
		if (!this.state.selectedItem.hasOwnProperty('notes')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('notes')) {
			notes = this.state.selectedItem.notes;
		}

		this.props.orderActions.AddNotesToProduct(this.state.selectedItem.product, notes, emptiesReturned, refillPending, emptiesDamaged);
	};

	setEmptiesReturned = emptiesReturned => {
		let refillPending = '';
		if (!this.state.selectedItem.hasOwnProperty('refillPending')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('refillPending')) {
			refillPending = this.state.selectedItem.refillPending;
		}

		let emptiesDamaged = '';
		if (!this.state.selectedItem.hasOwnProperty('emptiesDamaged')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('emptiesDamaged')) {
			emptiesDamaged = this.state.selectedItem.emptiesDamaged;
		}

		let notes = '';
		if (!this.state.selectedItem.hasOwnProperty('notes')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('notes')) {
			notes = this.state.selectedItem.notes;
		}

		this.props.orderActions.AddNotesToProduct(this.state.selectedItem.product, notes, emptiesReturned, refillPending, emptiesDamaged);

	};

	setRefillPending = refillPending => {
		let emptiesReturned = '';
		if (!this.state.selectedItem.hasOwnProperty('emptiesReturned')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('emptiesReturned')) {
			emptiesReturned = this.state.selectedItem.emptiesReturned;
		}

		let emptiesDamaged = '';
		if (!this.state.selectedItem.hasOwnProperty('emptiesDamaged')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('emptiesDamaged')) {
			emptiesDamaged = this.state.selectedItem.emptiesDamaged;
		}

		let notes = '';
		if (!this.state.selectedItem.hasOwnProperty('notes')) {
			return;
		}

		if (this.state.selectedItem.hasOwnProperty('notes')) {
			notes = this.state.selectedItem.notes;
		}

		this.props.orderActions.AddNotesToProduct(this.state.selectedItem.product, notes, emptiesReturned, refillPending, emptiesDamaged);

	};

	changeQuantity = value => {
		let unitPrice = this.getOrderItemPrice(this.state.selectedItem.product);
		if (Number(value) != 0) {

			if (this.state.selectedItem.product.description.includes('discount')) {
				if (Number(value) > this.calculateOrderDue()) {
					Alert.alert("Discount",
						"Discount cannot exceed Order amount.",
						[{
							text: 'OK',
							onPress: () => {
							}
						}],
						{ cancelable: false }
					);
					return;
				}

			}

			this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, Number(value), unitPrice);
			this.setState({
				accumulator: Number(value)
			});
		}

		if (!value) {
			this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, '', unitPrice);
			this.setState({
				accumulator: ''
			})
		}
	};

	calculateOrderDue() {
		let totalAmount = 0;
		for (let i of this.props.orderItems) {
			if (i.product.description === 'discount') {
				totalAmount = totalAmount + i.finalAmount;
			}
			else if (i.product.description === 'delivery') {
				totalAmount = totalAmount + i.finalAmount;
			} else {
				totalAmount = totalAmount + i.finalAmount;
			}
		}
		return totalAmount;
	}

	discountRows = (item, index, separators) => {
		const productIndex = this.props.selectedDiscounts.map(function (e) { return e.product.productId }).indexOf(this.state.selectedItem.product.productId);

		let isDiscountAvailable = false;
		if (productIndex >= 0) {
			isDiscountAvailable = this.props.selectedDiscounts[productIndex].discount.id === item.id;
		}

		return (
			<View style={orderItemStyles.discountRow}>
				<View style={orderItemStyles.flexHeigth}>
					<Text style={[{ marginLeft: 12 }, orderItemStyles.baseItem]}>{item.applies_to}-{item.amount}</Text>
				</View>
				<View style={orderItemStyles.flexHeigth}>
					<ToggleSwitch
						isOn={item.isSelected || isDiscountAvailable}
						onColor="green"
						offColor="red"
						labelStyle={{ color: "black", fontWeight: "900" }}
						size="large"
						onToggle={isOn => {
							DiscountRealm.isSelected(item, isOn === true ? true : false);

							if (this.state.selectedDiscounts.hasOwnProperty('id')) {
								DiscountRealm.isSelected(this.state.selectedDiscounts, false);
							}

							this.props.discountActions.setDiscounts(DiscountRealm.getDiscounts());

							if (isOn) {
								const selectedDiscounts = item;
								this.props.orderActions.SetOrderDiscounts('Not Custom', 0, this.state.selectedItem.product, selectedDiscounts, (this.state.selectedItem.quantity * this.getOrderItemPrice(this.state.selectedItem.product)));
								this.setState({ selectedDiscounts });
							}

							if (!isOn) {
								this.props.orderActions.RemoveProductDiscountsFromOrder(this.state.selectedItem.product);
								this.setState({ selectedDiscounts: {} });
							}
						}}
					/>

				</View>

			</View>
		);
	};

	showOrderItemsHeader = () => {
		return (
			<View style={orderItemStyles.headerBackground}>
				<View style={[orderItemStyles.flexTwo]}>
					<Text style={[orderItemStyles.headerItem, orderItemStyles.headerLeftMargin]}>{i18n.t('item')}</Text>
				</View>
				<View style={[orderItemStyles.flexOne]}>
					<Text style={[orderItemStyles.headerItem]}>{i18n.t('quantity')}</Text>
				</View>
				<View style={[orderItemStyles.flexTwo]}>
					<Text style={[orderItemStyles.headerItem, { textAlign: 'center' }]}>{i18n.t('charge')}</Text>
				</View>
			</View>
		);
	};

	counterChangedHandler(action) {
		let unitPrice = this.getOrderItemPrice(this.state.selectedItem.product);
		switch (action) {
			case 'inc':
				if (this.state.accumulator <= 0) {
					this.refs.productModel.close();
					this.setState({ isorderItemsModal: false });
					this.props.orderActions.RemoveProductFromOrder(this.state.selectedItem.product, unitPrice);
				} else {
					this.setState((prevState) => {
						this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, prevState.accumulator + 1, unitPrice);
						return {
							accumulator: prevState.accumulator + 1
						}
					})

					//this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, this.state.accumulator, unitPrice);
				}
				break;
			case 'dec':
				if (this.state.accumulator <= 0) {
					this.refs.productModel.close();
					this.setState({ isorderItemsModal: false });
					this.props.orderActions.RemoveProductFromOrder(this.state.selectedItem.product, unitPrice);
				} else {
					this.setState((prevState) => {
						this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, prevState.accumulator - 1, unitPrice);
						return { accumulator: prevState.accumulator - 1 }
					})

					//this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, this.state.accumulator, unitPrice);
				}
				break;
		}
	}

	// Wrong sales channel for Retailers or Resellers.
	getOrderItemPrice = (item) => {
		if (!item) {
			return 0;
		}
		let salesChannel = SalesChannelRealm.getSalesChannelFromName(this.props.channel.salesChannel);
		if (salesChannel) {
			let productMrp = ProductMRPRealm.getFilteredProductMRP()[ProductMRPRealm.getProductMrpKeyFromIds(item.productId, salesChannel.id)];
			if (productMrp) {
				return productMrp.priceAmount;
			}
		}
		return item.unitPrice;	// Just use product price
	};

	getCurrency = () => {
		let settings = SettingRealm.getAllSetting();
		return settings.currency;
	};

	getDiscountPrice = (amountPerQuantity, item) => {
		if (!item.hasOwnProperty('discount')) {
			return amountPerQuantity;
		}

		if (Number(item.discount) === 0) {
			return amountPerQuantity;
		}

		if (item.type === 'Flat') {
			return amountPerQuantity - Number(item.discount);
		}

		if (item.type === 'Percentage') {
			return amountPerQuantity * (Number(item.discount) / 100);
		}
	};

	// End Order Items  //

	orderItemsComponent(){
		return (
			<View style={orderItemStyles.orderSideBar}>
				{this.orderSummaryElement()}
				{this.orderTotalElement()}
				{this.orderItemsElement()}
				{this.orderCheckOutElement()}
			</View>
		);
	}


	render() {
		return (
			<View style={styles.orderView}>
			{this.productList()}
			{this.orderItemsComponent()}
		</View>
		);
	}

	// render() {
	// 	return (
	// 		<View style={styles.orderView}>
	// 		<Text>Order view</Text>
	// 	</View>
	// 	);
	// }

	productList() {
		if (this.state.salesChannel) {
			return (
				<View style={productListStyles.container}>
					<FlatList
						data={this.prepareData()}
						renderItem={this.renderProductList}
						keyExtractor={item => item.productId}
						numColumns={this.numColumns}
						horizontal={this.horizontal}
						removeClippedSubviews={this.removeClippedSubviews}
					/>
				</View>
			);
		}
		return null;
	}

	renderProductList = ({ item, index, separators }) => (
		this.productListItem(item, index, this.viewWidth, separators)
	);

	productListItem = (item, index, viewWidth, separators) => {
		return (
			<TouchableOpacity
				onPress={() => this.setOrderItem(item)}
				onShowUnderlay={separators.highlight}
				onHideUnderlay={separators.unhighlight}>
				<View
					style={[
						this.getItemBackground(index), newStyle(viewWidth).heights
					]}>
					<Image
						source={{ uri: item.base64encodedImage }}
						resizeMethod="scale"
						style={productListStyles.flexOne}
					/>
					<Text
						style={[productListStyles.imageLabel, this.getLabelBackground(item.categoryId)]}>
						{item.description}
						{'\n'}
						{this.getProductPrice(item)}
					</Text>
				</View>
			</TouchableOpacity>
		)
	}

	setOrderItem = (item) => {
		console.log('order selected');
		requestAnimationFrame(() => {
			// InteractionManager.runAfterInteractions(() => {
			const unitPrice = this.getProductPrice(item);
			this.props.orderActions.AddProductToOrder(item, 1, unitPrice);
		});
		// });
	}


	getProductPrice = item => {
		let salesChannel = SalesChannelRealm.getSalesChannelFromName(
			this.state.salesChannel.name
		);
		if (salesChannel) {
			let productMrp = ProductMRPRealm.getFilteredProductMRP()[
				ProductMRPRealm.getProductMrpKeyFromIds(
					item.productId,
					salesChannel.id
				)
			];
			if (productMrp) {
				return productMrp.priceAmount;
			}
		}
		return item.priceAmount; // Just use product price
	};


	prepareData = () => {
		let productMrp = ProductMRPRealm.getFilteredProductMRP();
		let ids = Object.keys(productMrp).map(key => productMrp[key].productId);
		return this.props.products.filter(prod => ids.includes(prod.productId));
	};

	getItemBackground = index => {
		return index % 2 === 0 ? productListStyles.lightBackground : productListStyles.darkBackground;
	};

	getLabelBackground = (categoryId) => {
		return {
			backgroundColor: `${randomMC.getColor({
				text: `${categoryId}-${this.state.salesChannel.name}`
			})}`
		};
	};

	componentWillUnmount() {
		this.props.orderActions.ClearOrder();
	}


	componentDidMount() {
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

	handleCompleteSale() {
		// requestAnimationFrame(() => {
		this.onCompleteOrder();
		// });
	};

	deliveryMode = () => {
		this.setState({ isWalkIn: false });
		if (this.props.delivery === 'delivery') {
			this.props.paymentTypesActions.setDelivery('walkin');
			return;
		}
		this.props.paymentTypesActions.setDelivery('delivery');
	}

	bottleTrackerModal = () => {
		if (this.state.isBottleTrackerModal) {
			return (
				<ScrollView>
					<TouchableOpacity>
						<View style={{ flex: 1, paddingLeft: 10 }}>
							<View style={orderItemStyles.bottleTracker}>
								<View style={orderItemStyles.rowDirection}>
									<Text style={[orderItemStyles.textLeft, orderCheckOutStyles.headerItem]}>Bottle Tracker.</Text>
								</View>
								<View
									style={{
										justifyContent: 'flex-end',
										flexDirection: 'row',
										right: 10,
										top: 0
									}}>
									{this.closeModalBtn('modal7')}
								</View>
							</View>

							<View
								style={{
									flex: 1
								}}>
								<FlatList
									data={this.props.orderItems}
									ListHeaderComponent={this.showBottlesHeader}
									// extraData={this.state.refresh}
									renderItem={({ item, index, separators }) => (
										<View>
											{this.getBottleRow(item, index, separators)}
										</View>
									)}
									keyExtractor={item => item.product.description}
									initialNumToRender={50}
								/>
							</View>
						</View>
					</TouchableOpacity>
				</ScrollView>)
		} else {
			return null;
		}
	}


	additionalNotesModal = () => {
		if (this.state.isAdditionalNotesModal) {
			return (

				<ScrollView>
					<TouchableOpacity>
						<View style={{ flex: 1, paddingLeft: 10 }}>
							<View style={orderItemStyles.bottleTracker}>
								<View style={orderItemStyles.rowDirection}>
									<Text style={[orderItemStyles.textLeft, orderCheckOutStyles.headerItem]}>Additional Notes.</Text>
								</View>
								<View
									style={{
										justifyContent: 'flex-end',
										flexDirection: 'row',
										right: 10,
										top: 0
									}}>
									{this.closeModalBtn("notesModal")}
								</View>
							</View>

							<View
								style={{
									flex: 1
								}}>
								<TextInput
									style={{
										padding: 10
									}}
									onChangeText={this.setOrderNotes}
									value={this.state.notes}
									underlineColorAndroid="transparent"
									placeholder="Add a Note"
								/>
							</View>
						</View>
					</TouchableOpacity>
				</ScrollView>
			)
		} else {
			return null;
		}
	}

	paymentModalModal = (isRefill) => {
		if (this.state.isPaymentModal) {
			return (

				<View style={{ flex: 1, padding: 0, margin: 0 }}>
					<ScrollView>


						<View
							style={{
								justifyContent: 'flex-end',
								flexDirection: 'row',
								right: 10,
								top: 0
							}}>
							{this.closeModalBtn("modal6")}
						</View>
						<Card containerStyle={{ backgroundColor: '#ABC1DE', padding: 5 }}>

							<View style={orderItemStyles.rowDirection}>
								{/* {this.getSaleAmount()} */}
								<PaymentDescription
									styles={{ fontWeight: 'bold' }}
									title={`${i18n.t('sale-amount-due')}: `}
									total={this.calculateOrderDue()}
								/>
								<PaymentDescription
									style={{ color: 'white' }}
									title={`${i18n.t('customer-wallet')}:`}
									total={this.currentCredit()}
								/>
							</View>


							<View style={orderItemStyles.rowDirection}>
								<PaymentDescription
									title={`${i18n.t('previous-amount-due')}:`}
									total={this.calculateLoanBalance()}
								/>
								<PaymentDescription
									title={`${i18n.t('total-amount-due')}:`}
									total={this.calculateTotalDue()}
								/>
							</View>
						</Card>

						<View
							style={{
								flex: 1,
								marginTop: 0,
								marginLeft: 20,
								marginRight: 20
							}}>


							<View style={orderItemStyles.paymentMethod}>
								<Text style={[orderItemStyles.textLeft, orderCheckOutStyles.baseItem]}>Payment Method</Text>
							</View>

							<FlatList
								data={this.props.paymentTypes}
								renderItem={({ item, index, separators }) => (
									this.paymentTypesRow(item, index, separators)
								)}
								extraData={this.props.selectedPaymentTypes}
								numColumns={3}
								contentContainerStyle={orderCheckOutStyles.container}
							/>

							<View style={orderItemStyles.rowDirection}>
								<View style={orderItemStyles.flexOne}>
									<Text style={[orderItemStyles.textLeft, orderCheckOutStyles.baseItem]}>Delivery Mode</Text>

								</View>
							</View>

							<View style={orderItemStyles.deliveryMode}>
								<CheckBox
									title={'Delivery'}
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
									checked={this.props.delivery === 'delivery'}
									onPress={() => {
										this.setState({ isWalkIn: false });
										if (this.props.delivery === 'delivery') {
											this.props.paymentTypesActions.setDelivery('walkin');
											return;
										}
										this.props.paymentTypesActions.setDelivery('delivery');
									}}
								/>
								<CheckBox
									title={'Walk In'}
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
									checked={this.props.delivery === 'walkin'}
									onPress={() => {
										this.setState({ isWalkIn: false });
										if (this.props.delivery === 'walkin') {
											this.props.paymentTypesActions.setDelivery('delivery');
											return;
										}
										this.props.paymentTypesActions.setDelivery('walkin');
									}}
								/>

								{isRefill.length > 0 && (
									<TouchableHighlight underlayColor='#c0c0c0'
										onPress={this.onBottles}>
										<Text
											style={orderItemStyles.btnStyle}>Bottles returned</Text>
									</TouchableHighlight>
								)}

								<TouchableHighlight underlayColor='#c0c0c0'
									onPress={this.onNotes}>
									<Text
										style={orderItemStyles.btnStyle}>Additional Notes</Text>
								</TouchableHighlight>

							</View>
							<View style={orderItemStyles.bottleTracker}>
								<Text style={[orderCheckOutStyles.baseItem, orderItemStyles.oldSale]}>Are you recording an old sale?</Text>
								<View
									style={{
										padding: 10
									}}>
									<Button
										style={orderItemStyles.flexOne}
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
							</View>
						</View>

					</ScrollView>
					<View style={orderCheckOutStyles.completeOrderBtn}>
						<View style={orderItemStyles.justifyCenter}>
							<TouchableHighlight
								underlayColor="#c0c0c0"
								disabled={this.state.buttonDisabled}
								onPress={this.handleCompleteSale}>
								<Text
									style={[
										orderItemStyles.completeSale,
										orderCheckOutStyles.buttonText
									]}>
									{i18n.t('complete-sale')}
								</Text>
							</TouchableHighlight>
						</View>
					</View>
				</View>

				// </Modal>

			)
		} else {
			return null;
		}
	}



	orderCheckOutElement = () => {
		let filterProducts = this.props.orderItems
		let isRefill = filterProducts.filter(element => {
			if (element.hasOwnProperty('product')) {
				if (element.product.description.includes('refill')) {
					return true;
				}
			}
			return false;
		});

		return (
			<View style={orderCheckOutStyles.container}>
				<View style={[{ flexDirection: 'row' }, this.getOpacity()]}>
					<View style={orderCheckOutStyles.onPayView}>
						<TouchableHighlight underlayColor='#c0c0c0'
							onPress={() => this.onPay()}>
							<Text
								style={orderCheckOutStyles.onPayText, orderCheckOutStyles.buttonText}>{i18n.t('pay')}</Text>
						</TouchableHighlight>
					</View>
				</View>

				<Modal style={orderCheckOutStyles.modal2}
					coverScreen={true}
					position={"center"} ref={"modal7"}
					isDisabled={this.state.isBottleTrackerModal}>
					{this.bottleTrackerModal()}
				</Modal>

				<Modal style={orderCheckOutStyles.modal2}
					coverScreen={true}
					position={"center"} ref={"notesModal"}
					isDisabled={this.state.isAdditionalNotesModal}>
					{this.additionalNotesModal()}
				</Modal>

				<Modal
					style={orderCheckOutStyles.modal3}
					coverScreen={true}
					position={"center"} ref={"modal6"}
					onClosed={this.modalOnClose}>
					{this.paymentModalModal(isRefill)}
				</Modal>

			</View>
		)
	}

	showBottlesHeader = () => {
		return (
			<View style={[orderItemStyles.rowDirection]}>
				<View style={orderItemStyles.flexOne}>
					<Text style={[orderCheckOutStyles.headerBtlItem]}>Product</Text>
				</View>
				<View style={[orderItemStyles.flexOne]}>
					<Text style={[orderCheckOutStyles.headerBtlItem]}>Empties Returned</Text>
				</View>
				<View style={[orderItemStyles.flexOne]}>
					<Text style={[orderCheckOutStyles.headerBtlItem]}>Damaged Bottles</Text>
				</View>
				<View style={[orderItemStyles.flexOne]}>
					<Text style={[orderCheckOutStyles.headerBtlItem]}>Pending Bottles</Text>
				</View>
			</View>

		);
	};

	setOrderNotes = notes => {
		this.setState({ notes });
	}

	getBottleRow = (item) => {
		if (item.product.description.includes('refill')) {
			return (
				<View style={orderItemStyles.discountRow}>
					<View style={{ flex: 1, height: 45, flexDirection: 'row' }}>
						<Text style={[{ textAlign: 'left', fontSize: 20, paddingLeft: 10 }, orderCheckOutStyles.baseItem]}>{item.product.description}</Text>
					</View>
					<View style={[orderItemStyles.flexOne]}>
						<TextInput
							style={{
								textAlign: 'center',
								height: 45,
								fontSize: 20
							}}
							keyboardType="number-pad"
							onChangeText={(value) => this.setEmptiesReturnedCheckOut(value, item)}
							underlineColorAndroid="transparent"
							placeholder="0"
							value={(item.emptiesReturned == '') ? item.quantity.toString() : item.emptiesReturned}
						/>
					</View>
					<View style={[orderItemStyles.flexOne]}>
						<TextInput
							style={orderItemStyles.bottleTextInput}
							keyboardType="number-pad"
							onChangeText={(value) => this.setEmptiesDamagedCheckOut(value, item)}
							underlineColorAndroid="transparent"
							placeholder="0"
							value={item.emptiesDamaged}
						/>
					</View>
					<View style={[orderItemStyles.flexOne]}>
						<TextInput
							style={{
								textAlign: 'center',
								height: 45,
								fontSize: 20
							}}
							keyboardType="number-pad"
							onChangeText={(value) => this.setRefillPendingCheckOut(value, item)}
							underlineColorAndroid="transparent"
							placeholder="0"
							value={item.refillPending}
						/>
					</View>
				</View>
			);
		} else {
			return (<View />);
		}
	}

	setEmptiesReturnedCheckOut = (emptiesReturned, item) => {
		let refillPending = '';
		if (!item.hasOwnProperty('refillPending')) {
			return;
		}

		if (item.hasOwnProperty('refillPending')) {
			refillPending = item.refillPending;
		}

		let emptiesDamaged = '';
		if (!item.hasOwnProperty('emptiesDamaged')) {
			return;
		}

		if (item.hasOwnProperty('emptiesDamaged')) {
			emptiesDamaged = item.emptiesDamaged;
		}

		let notes = '';
		if (!item.hasOwnProperty('notes')) {
			return;
		}

		if (item.hasOwnProperty('notes')) {
			notes = item.notes;
		}

		this.props.orderActions.AddNotesToProduct(item.product, notes, emptiesReturned, refillPending, emptiesDamaged);

	};

	setEmptiesDamagedCheckOut = (emptiesDamaged, item) => {
		let refillPending = '';
		if (!item.hasOwnProperty('refillPending')) {
			return;
		}

		if (item.hasOwnProperty('refillPending')) {
			refillPending = item.refillPending;
		}

		let emptiesReturned = '';
		if (!item.hasOwnProperty('emptiesReturned')) {
			return;
		}

		if (item.hasOwnProperty('emptiesReturned')) {
			emptiesReturned = item.emptiesReturned;
		}

		let notes = '';
		if (!item.hasOwnProperty('notes')) {
			return;
		}

		if (item.hasOwnProperty('notes')) {
			notes = item.notes;
		}

		this.props.orderActions.AddNotesToProduct(item.product, notes, emptiesReturned, refillPending, emptiesDamaged);
	};

	setRefillPendingCheckOut = (refillPending, item) => {
		let emptiesReturned = '';
		if (!item.hasOwnProperty('emptiesReturned')) {
			return;
		}

		if (item.hasOwnProperty('emptiesReturned')) {
			emptiesReturned = item.emptiesReturned;
		}

		let emptiesDamaged = '';
		if (!item.hasOwnProperty('emptiesDamaged')) {
			return;
		}

		if (item.hasOwnProperty('emptiesDamaged')) {
			emptiesDamaged = item.emptiesDamaged;
		}

		let notes = '';
		if (!item.hasOwnProperty('notes')) {
			return;
		}

		if (item.hasOwnProperty('notes')) {
			notes = item.notes;
		}

		this.props.orderActions.AddNotesToProduct(item.product, notes, emptiesReturned, refillPending, emptiesDamaged);

	};

	paymentTypesRow = (item, index, separators) => {

		let isSelectedAvailable = false;
		if (this.props.selectedPaymentTypes.length > 0) {
			const itemIndex = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(item.id);
			if (itemIndex >= 0) {
				isSelectedAvailable = true;
			}
		}

		if (this.props.selectedPaymentTypes.length === 0) {
			if (this.currentCredit() <= 0) {
				if (item.name === 'cash') {
					PaymentTypeRealm.isSelected(item, item.isSelected === true ? false : true);
					this.props.paymentTypesActions.setSelectedPaymentTypes({
						...item, created_at: new Date(),
						isSelected: item.isSelected === true ? false : true, amount: this.calculateOrderDue()
					});
					isSelectedAvailable = true;
				}
			}

		}

		if (item.name != 'loan' && item.name != 'credit') {

			return (
				<View style={orderItemStyles.discountRow}>
					<View style={{ flex: 1, height: 45 }}>
						<View style={orderCheckOutStyles.checkBoxRow}>
							<View style={[orderItemStyles.flexOne]}>
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
										this.checkBoxType(item);
									}}
								/>
							</View>
							<View style={[orderItemStyles.flexOne]}>{this.showTextInput(item)}</View>
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

								if (this.props.selectedPaymentTypes.length >= 0) {
									const itemIndex2 = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(this.state.selectedType.id);
									if (itemIndex2 >= 0) {
										this.props.selectedPaymentTypes[itemIndex].amount = Number(textValue);
										this.props.paymentTypesActions.updateSelectedPaymentType({ ...this.props.selectedPaymentTypes[itemIndex2], amount: Number(textValue) }, itemIndex2);
										this.setState({
											selectedType: { ...this.props.selectedPaymentTypes[itemIndex2], amount: Number(textValue) }
										});
									}
								}

								this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());

							}
							}
							onFocus={(text) => {
								this.setState({
									selectedType: item
								});
							}
							}
							keyboardType="numeric"
							value={(this.props.selectedPaymentTypes[itemIndex].amount).toString()}
							style={[orderCheckOutStyles.cashInput]}
						/>
					);
				}
			}
		}
	}

	checkBoxType = (item) => {
		const itemIndex = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(item.id);
		if (itemIndex >= 0) {

			let secondItemObj = this.props.selectedPaymentTypes.filter(obj => obj.id != item.id).map(function (e) { return e.id });

			if (secondItemObj.length > 0) {
				const seconditemIndex2 = this.props.selectedPaymentTypes.map(function (e) { return e.id }).indexOf(secondItemObj[0]);
				this.props.paymentTypesActions.updateSelectedPaymentType({ ...this.props.selectedPaymentTypes[seconditemIndex2], amount: Number(this.calculateOrderDue()) }, seconditemIndex2);

				PaymentTypeRealm.isSelected(item, false);
				this.props.paymentTypesActions.removeSelectedPaymentType(item, itemIndex);
				this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
			}

			if (secondItemObj.length === 0) {
				this.props.paymentTypesActions.removeSelectedPaymentType(item, itemIndex);
				this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
			}
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
	};




	getSaleAmount() {
		return (
			<PaymentDescription
				styles={{ fontWeight: 'bold' }}
				title={`${i18n.t('sale-amount-due')}: `}
				total={this.calculateOrderDue()}
			/>
		);
	}


	closeModalBtn(modal) {
		return (
			<TouchableHighlight onPress={() => this.closeModal(modal)}>
				<Icon
					size={40}
					name="md-close-circle-outline"
					color="black"
				/>
			</TouchableHighlight>
		);
	}

	_roundToDecimal(value) {
		return parseFloat(value.toFixed(2));
	}



	calculateTotalDue() {
		return this._roundToDecimal(
			this.calculateOrderDue() + this.calculateLoanBalance()
		);
	}

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

	onPay = () => {
		this.setState({ isPaymentModal: true });
		this.refs.modal6.open();
	};

	onBottles = () => {
		this.setState({ isBottleTrackerModal: true })
		this.refs.modal7.open();

	};

	onNotes = () => {
		this.setState({ isAdditionalNotesModal: true })
		this.refs.notesModal.open();
	};

	calculateLoanBalance() {
		console.log('this.props.selectedCustomer', this.props.selectedCustomer)
		return this.props.selectedCustomer.dueAmount;
	}

	updateWallet = (amount) => {
		//this.props.selectedCustomer.walletBalance = Number(this.props.selectedCustomer.walletBalance) + Number(amount);
		CustomerRealm.updateCustomerWalletBalance(
			this.props.selectedCustomer,
			amount
		);
		this.props.customerActions.CustomerSelected(this.props.selectedCustomer);
		this.props.customerActions.setCustomers(
			CustomerRealm.getAllCustomer()
		);
	}

	topUpWallet = (amount, balance, recieptId) => {
		CreditRealm.createCredit(
			this.props.selectedCustomer.customerId,
			Number(amount),
			Number(balance),
			recieptId
		);
		this.props.topUpActions.setTopups(CreditRealm.getAllCredit());
		this.setState({
			topUpExpected: amount
		})
	}

	logCredit = (amount, balance, recieptId) => {
		CustomerDebtRealm.createCustomerDebt(amount, this.props.selectedCustomer.customerId, balance, recieptId);
		this.props.paymentTypesActions.setCustomerPaidDebt(
			CustomerDebtRealm.getCustomerDebts()
		);
		this.setState({
			loanPaid: amount
		})
	}

	updateLoanBalance = (amount) => {
		CustomerRealm.updateCustomerDueAmount(
			this.props.selectedCustomer,
			amount
		);
		this.props.customerActions.CustomerSelected(this.props.selectedCustomer);
		this.props.customerActions.setCustomers(
			CustomerRealm.getAllCustomer()
		);
	}

	onCompleteOrder = () => {
		this.setState({
			buttonDisabled: true
		});
		let recieptId = uuidv1();
		let totalAmountPaid = this.props.selectedPaymentTypes.reduce((total, item) => { return (total + item.amount) }, 0);

		if (this.currentCredit() > this.calculateOrderDue()) {
			if (totalAmountPaid > 0) {
				this.props.selectedCustomer.walletBalance =
					Number(this.props.selectedCustomer.walletBalance) + Number(totalAmountPaid) - (this.calculateOrderDue());
				this.updateWallet(this.props.selectedCustomer.walletBalance);
				this.topUpWallet(Number(totalAmountPaid - this.calculateOrderDue()), this.props.selectedCustomer.walletBalance, recieptId);
			} else if (totalAmountPaid <= 0) {
				this.props.selectedCustomer.walletBalance = Number(this.props.selectedCustomer.walletBalance) - this.calculateOrderDue();
				this.updateWallet(this.props.selectedCustomer.walletBalance);

				//this.topUpWallet(Number(totalAmountPaid - this.calculateOrderDue()), this.props.selectedCustomer.walletBalance, recieptId);
			}
			const creditIndex = this.props.paymentTypes.map(function (e) { return e.name }).indexOf("credit");
			if (creditIndex >= 0) {
				this.props.paymentTypesActions.setSelectedPaymentTypes({ ...this.props.paymentTypes[creditIndex], created_at: new Date(), isSelected: this.props.paymentTypes[creditIndex].isSelected === true ? false : true, amount: this.calculateOrderDue() - totalAmountPaid });
			}
		}
		else if (this.currentCredit() <= this.calculateOrderDue()) {
			if (this.currentCredit() > 0) {
				if (totalAmountPaid > 0) {
					let totalAmountAvailable = Number(totalAmountPaid) + this.currentCredit();
					if (totalAmountAvailable > this.calculateOrderDue()) {
						this.props.selectedCustomer.walletBalance = Number(totalAmountAvailable) - this.calculateOrderDue();
						this.updateWallet(this.props.selectedCustomer.walletBalance);

					} else if (totalAmountAvailable < this.calculateOrderDue()) {

						this.props.selectedCustomer.dueAmount = this.calculateOrderDue() - totalAmountAvailable;

						this.updateLoanBalance(this.props.selectedCustomer.dueAmount);
						const loanIndex = this.props.paymentTypes.map(function (e) { return e.name }).indexOf("loan");

						if (loanIndex >= 0) {
							this.props.paymentTypesActions.setSelectedPaymentTypes({ ...this.props.paymentTypes[loanIndex], created_at: new Date(), isSelected: this.props.paymentTypes[loanIndex].isSelected === true ? false : true, amount: (this.calculateOrderDue() - totalAmountPaid) - this.currentCredit() });
						}

						const creditIndex = this.props.paymentTypes.map(function (e) { return e.name }).indexOf("credit");
						if (creditIndex >= 0) {
							this.props.paymentTypesActions.setSelectedPaymentTypes({ ...this.props.paymentTypes[creditIndex], created_at: new Date(), isSelected: this.props.paymentTypes[creditIndex].isSelected === true ? false : true, amount: this.currentCredit() });
						}

						this.props.selectedCustomer.walletBalance = 0;
						this.updateWallet(this.props.selectedCustomer.walletBalance);
					}

				} else if (totalAmountPaid <= 0) {
					this.props.selectedCustomer.dueAmount = Number(this.props.selectedCustomer.dueAmount) + (this.calculateOrderDue() - this.currentCredit());

					this.updateLoanBalance(this.props.selectedCustomer.dueAmount);
					const loanIndex = this.props.paymentTypes.map(function (e) { return e.name }).indexOf("loan");
					if (loanIndex >= 0) {
						this.props.paymentTypesActions.setSelectedPaymentTypes({ ...this.props.paymentTypes[loanIndex], created_at: new Date(), isSelected: this.props.paymentTypes[loanIndex].isSelected === true ? false : true, amount: this.calculateOrderDue() - this.currentCredit() });
					}
					const creditIndex = this.props.paymentTypes.map(function (e) { return e.name }).indexOf("credit");
					if (creditIndex >= 0) {
						this.props.paymentTypesActions.setSelectedPaymentTypes({ ...this.props.paymentTypes[creditIndex], created_at: new Date(), isSelected: this.props.paymentTypes[creditIndex].isSelected === true ? false : true, amount: this.currentCredit() });
					}

					this.props.selectedCustomer.walletBalance = 0;
					this.updateWallet(this.props.selectedCustomer.walletBalance);
				}
			} else if (this.currentCredit() <= 0) {
				if (totalAmountPaid > 0) {
					if (totalAmountPaid > this.calculateOrderDue()) {
						if (this.calculateLoanBalance() === 0) {
							this.props.selectedCustomer.walletBalance = Number(this.props.selectedCustomer.walletBalance) + Number(totalAmountPaid - this.calculateOrderDue());
							this.updateWallet(this.props.selectedCustomer.walletBalance);
							this.topUpWallet(Number(totalAmountPaid - this.calculateOrderDue()), this.props.selectedCustomer.walletBalance, recieptId);

						} else if (this.calculateLoanBalance() > 0) {
							let postToLoan = Number(totalAmountPaid) - this.calculateOrderDue();
							if (postToLoan > this.calculateLoanBalance()) {
								const topUpExpected = Number(postToLoan) - this.calculateLoanBalance();
								//this.props.selectedCustomer.dueAmount = 0;
								this.updateLoanBalance(0);
								this.logCredit(Number(this.props.selectedCustomer.dueAmount), 0, recieptId);
								this.props.selectedCustomer.walletBalance = Number(this.props.selectedCustomer.walletBalance) + topUpExpected;
								this.updateWallet(this.props.selectedCustomer.walletBalance);
								this.topUpWallet(topUpExpected, this.props.selectedCustomer.walletBalance, recieptId);
							} else if (postToLoan <= this.calculateLoanBalance()) {
								this.props.selectedCustomer.dueAmount = Number(this.props.selectedCustomer.dueAmount) - postToLoan;
								this.updateLoanBalance(this.props.selectedCustomer.dueAmount);
								this.logCredit(Number(postToLoan), this.props.selectedCustomer.dueAmount, recieptId);
							}
						}
					} else if (totalAmountPaid < this.calculateOrderDue()) {

						this.props.selectedCustomer.dueAmount = Number(this.calculateLoanBalance()) + this.calculateOrderDue() - totalAmountPaid;

						this.updateLoanBalance(this.props.selectedCustomer.dueAmount);
						const loanIndex = this.props.paymentTypes.map(function (e) { return e.name }).indexOf("loan");
						if (loanIndex >= 0) {
							this.props.paymentTypesActions.setSelectedPaymentTypes({ ...this.props.paymentTypes[loanIndex], created_at: new Date(), isSelected: this.props.paymentTypes[loanIndex].isSelected === true ? false : true, amount: this.calculateOrderDue() - totalAmountPaid });
						}
					}

				} else if (totalAmountPaid <= 0) {
					this.props.selectedCustomer.dueAmount = Number(this.calculateLoanBalance()) + this.calculateOrderDue() - totalAmountPaid;
					this.updateLoanBalance(this.props.selectedCustomer.dueAmount);
					const loanIndex = this.props.paymentTypes.map(function (e) { return e.name }).indexOf("loan");
					if (loanIndex >= 0) {
						this.props.paymentTypesActions.setSelectedPaymentTypes({ ...this.props.paymentTypes[loanIndex], created_at: new Date(), isSelected: this.props.paymentTypes[loanIndex].isSelected === true ? false : true, amount: this.calculateOrderDue() - totalAmountPaid });
					}
				}
			}

		}

		this.saveOrder(true, recieptId);
	};

	invoiceid = () => {
		var d = new Date().getTime();
		//   var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
		var uuid = 'xxxx'.replace(/[xy]/g, (c) => {
			var r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
		return uuid;
	};

	saveOrder = (status, recieptId) => {
		let receipt = null;
		let price_total = 0;
		let totalAmount = 0;
		// Assumes that there is at least one product
		let receiptDate = this.state.receiptDate
			? this.state.receiptDate
			: new Date(Date.now());

		receipt = {
			id: recieptId,
			uuid: SettingRealm.getAllSetting().siteId + '-' + this.invoiceid(),
			created_at: receiptDate,
			currency_code: this.props.orderItems[0].product.priceCurrency,
			customer_account_id: this.props.selectedCustomer.customerId,
			isWalkIn: this.props.payment.isWalkIn,
			amount_cash: this.props.payment.cash,
			delivery: this.props.delivery,
			notes: this.state.notes,
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
		let cogs_total = 0;

		receipt.products = this.props.orderItems.map(product => {
			let receiptLineItem = {};
			let tempValue = this.getItemCogs(product.product) * product.quantity;
			receiptLineItem.price_total = product.finalAmount;
			receiptLineItem.totalAmount = product.finalAmount;
			receiptLineItem.quantity = product.quantity;
			receiptLineItem.notes = product.notes;
			receiptLineItem.is_delete = 1;
			receiptLineItem.emptiesReturned = Number(product.emptiesReturned);
			receiptLineItem.refillPending = Number(product.refillPending);
			receiptLineItem.emptiesDamaged = Number(product.emptiesDamaged);
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

		if (receipt != null) {
			const creditIndex = this.props.selectedPaymentTypes.map(function (e) { return e.name }).indexOf("credit");

			receipt.customer_account = this.props.selectedCustomer;
			if (this.props.selectedPaymentTypes.length > 0) {
				ReceiptPaymentTypeRealm.createManyReceiptPaymentType(this.props.selectedPaymentTypes, receipt.id);
				this.props.paymentTypesActions.setRecieptPaymentTypes(
					ReceiptPaymentTypeRealm.getReceiptPaymentTypes()
				);
			}


			OrderRealm.createOrder(receipt);
			this.props.receiptActions.setReceipts(
				OrderRealm.getAllOrder()
			);


			this.saveCustomerFrequency(OrderRealm.getAllOrder().filter(r => r.customer_account_id === this.props.selectedCustomer.customerId));
			this.props.customerReminderActions.setCustomerReminders(
				CustomerReminderRealm.getCustomerReminders()
			);

			Alert.alert(
				'Payment Made',
				'Loan Cleared: ' + this.state.loanPaid +
				'\nCustomer Wallet Topup: ' + this.state.topUpExpected +
				'\nCustomer\'s Loan Balance: ' + this.props.selectedCustomer.dueAmount +
				'\nCustomer Wallet Balance: ' + this.currentCredit(),
				[{
					text: 'OK',
					onPress: () => {
						this.props.receiptActions.setTransaction(receipt);
						this.closeModal('modal6')
						this.props.navigation.navigate('ListCustomerStack', { screen:"CustomerList" });
					}
				}],
				{ cancelable: false }
			);

		} else {

		}
		return true;
	};

	datediff = (date1, date2) => {
		date1 = new Date(date1);
		date2 = new Date(date2);
		const diffTime = Math.abs(date2 - date1);
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	};

	groupBy = key => array =>
		array.reduce((objectsByKeyValue, obj) => {
			const value = obj[key];
			objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
			return objectsByKeyValue;
		}, {});


	pairwiseDifference = (arr, n) => {
		let diff = 0,
			arrCalc = [];
		for (let i = 0; i < n - 1; i++) {
			diff = this.datediff(arr[i], arr[i + 1]);
			arrCalc.push(diff);
		}
		return arrCalc;
	};

	addDays = (theDate, days) => {
		if (days > 20) {
			days = 10;
		}
		return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
	}

	getRemindersNew = (data) => {
		const groupCustomers = this.groupBy("customer_account_id");
		groupCustomers(data);

		let final = [];
		for (let key of Object.keys(groupCustomers(data))) {
			let dateArray = groupCustomers(data)[key].map(e => e.created_at);
			const arrAvg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
			const dateLength = groupCustomers(data)[key].map(e => e.created_at).length - 1;
			const lastDay = groupCustomers(data)[key].map(e => e.created_at)[dateLength];
			final.push({
				customer_account_id: key,
				name: groupCustomers(data)[key][0].customer_account.name,
				phoneNumber: groupCustomers(data)[key][0].customer_account.hasOwnProperty('phone_number') ? groupCustomers(data)[key][0].customer_account.phone_number : 'N/A',
				address: groupCustomers(data)[key][0].customer_account.hasOwnProperty('address') ? groupCustomers(data)[key][0].customer_account.address : groupCustomers(data)[key][0].customer_account.address_line1,
				frequency: this.pairwiseDifference(dateArray, dateArray.length) > 10 ? 10 : this.pairwiseDifference(dateArray, dateArray.length),
				avg: Math.ceil(arrAvg(this.pairwiseDifference(dateArray, dateArray.length))) >= 0 ? Math.ceil(arrAvg(this.pairwiseDifference(dateArray, dateArray.length))) : 0,
				reminder: this.addDays(new Date(lastDay), Math.ceil(arrAvg(this.pairwiseDifference(dateArray, dateArray.length)))),
				dates: groupCustomers(data)[key].map(e => e.created_at),
				last_purchase_date: new Date(lastDay)
			});
		}
		return final;
	}

	saveCustomerFrequency(receipts) {
		CustomerReminderRealm.createCustomerReminder(this.getRemindersNew(receipts)[0], SettingRealm.getAllSetting().siteId)
	}


	closeModal = (modal) => {
		if (modal === 'modal7') {
			this.setState({ isBottleTrackerModal: false })
		}

		if (modal === 'notesModal') {
			this.setState({ isAdditionalNotesModal: false })
		}
		if (modal === 'modal6') {
			this.setState({ isPaymentModal: false })
		}

		this.refs[modal].close();
	};

	currentCredit() {
		return this.props.selectedCustomer.walletBalance;
	}

	getOpacity = () => {
		if (this.props.orderItems.length == 0) {
			return { opacity: .2 };
		} else {
			return { opacity: 1 };
		}
	}

	// End OrderCheckout //

}

function mapStateToProps(state, props) {
	return {
		orderItems: state.orderReducer.products,
		discounts: state.discountReducer.discounts,
		products: state.productReducer.products,
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
		productActions: bindActionCreators(ProductActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch),
		paymentTypesActions: bindActionCreators(PaymentTypesActions, dispatch),
		topUpActions: bindActionCreators(TopUpActions, dispatch),
		customerReminderActions: bindActionCreators(CustomerReminderActions, dispatch),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderView);

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
	orderView: {
		flex: 1,
		backgroundColor: "#ABC1DE",
		flexDirection: 'row'
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


