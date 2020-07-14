import React from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	FlatList,
	TextInput,
	TouchableHighlight,
	StyleSheet,
	Alert
} from 'react-native';
import { connect } from 'react-redux';
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/Ionicons';
import ToggleSwitch from 'toggle-switch-react-native';
import { bindActionCreators } from 'redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import orderItemStyles from './orderItemStyles';
import i18n from '../../app/i18n';
import DiscountRealm from '../../database/discount/discount.operations';
import * as OrderActions from '../../actions/OrderActions';
import * as DiscountActions from '../../actions/DiscountActions';
import * as CustomerReminderActions from '../../actions/CustomerReminderActions';
import * as CustomerActions from '../../actions/CustomerActions';
import * as PaymentTypesActions from '../../actions/PaymentTypesActions';
import * as receiptActions from '../../actions/ReceiptActions';
import * as TopUpActions from '../../actions/TopUpActions';
import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';
import ProductMRPRealm from '../../database/productmrp/productmrp.operations';
import SettingRealm from '../../database/settings/settings.operations';
import PaymentTypeRealm from '../../database/payment_types/payment_types.operations';

if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	whyDidYouRender(React, {
		trackAllPureComponents: true
	});
}
class OrderItems extends React.PureComponent {
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
			// isDisabled: false,
			buttonDisabled: false,
			notes: '',
			// swipeToClose: true,
			loanPaid: 0,
			topUpExpected: 0,
			// sliderValue: 0.3,
			selectedPaymentTypes: [],
			selectedType: {},
			checkedType: {},
			textInputs: [],
			isCompleteOrderVisible: false,
			isDateTimePickerVisible: false,
			receiptDate: new Date(),
			selectedPaymentType: 'Cash',

			isBottleTrackerModal: false,
			isAdditionalNotesModal: false,
			isPaymentModal: false,
			isorderItemsModal: false
		};
	}

	handleOnPress(item) {
		requestAnimationFrame(() => {
			this.setState({ selectedItem: item });
			this.setState({ accumulator: item.quantity });
			this.setState({ firstKey: true });
			this.setState({ isorderItemsModal: true });
			this.refs.productModel.open();
		});
	}

	_renderItem = ({ item, index, separators }) => (
		<TouchableHighlight
			onPress={() => this.handleOnPress(item)}
			onShowUnderlay={separators.highlight}
			onHideUnderlay={separators.unhighlight}>
			<View style={orderItemStyles.emptiesView}>
				<View style={orderItemStyles.flexTwo}>
					<Text style={[orderItemStyles.baseItem, orderItemStyles.leftMargin]}>
						{item.product.description}
					</Text>
				</View>
				<View style={orderItemStyles.flex12}>
					<Text style={[orderItemStyles.baseItem, orderItemStyles.txtalign]}>
						{item.quantity}
					</Text>
				</View>
				<View style={orderItemStyles.flexTwo}>
					<Text
						numberOfLines={1}
						style={[orderItemStyles.baseItem, orderItemStyles.tatxt]}>
						{this.getCurrency().toUpperCase()}{' '}
						{this.getDiscountPrice(item.quantity * item.unitPrice, item)}
					</Text>
				</View>
			</View>
		</TouchableHighlight>
	);

	orderItemsModal = () => {
		if (this.state.isorderItemsModal) {
			return (
				<KeyboardAwareScrollView>
					{/* <TouchableOpacity> */}
					<View style={[orderItemStyles.headerBackground, orderItemStyles.alignment]}>
						<View style={orderItemStyles.third}>{this.getProductDescripion()}</View>
						<View style={orderItemStyles.sixth}>
							<Text style={[orderItemStyles.center, orderItemStyles.baseItem]}>
								{this.getCurrency(this.state.selectedItem)}{' '}
								{this.getDiscountPrice(
									this.state.selectedItem.quantity *
										this.state.selectedItem.unitPrice,
									this.state.selectedItem
								)}
							</Text>
						</View>
						<View style={orderItemStyles.cancelstyle}>{this.getCancelButton()}</View>
					</View>
					<View style={orderItemStyles.aseparator} />
					<View style={orderItemStyles.flexAlign}>
						{this.qtyAmount()}

						{this.bottlesReturned()}

						<View style={orderItemStyles.aseparator} />

						<View style={orderItemStyles.rowDirection}>
							<View style={orderItemStyles.flexOne}>
								<Text style={[orderItemStyles.textLeft, orderItemStyles.baseItem]}>
									NOTES
								</Text>
							</View>
						</View>

						<View style={orderItemStyles.rowDirection}>
							<View style={orderItemStyles.flexHeigth}>{this.notesValue()}</View>
						</View>

						<View style={orderItemStyles.aseparator} />

						{this.discountCmpt()}

						<View style={orderItemStyles.btmDiv}>
							<TouchableOpacity
								style={orderItemStyles.flexOne}
								onPress={() => this.removeDiscount()}>
								<Text style={orderItemStyles.removebtn}>REMOVE</Text>
							</TouchableOpacity>

							<TouchableOpacity
								style={orderItemStyles.flexOne}
								onPress={() => this.onCancelOrder()}>
								<Text style={orderItemStyles.savebtn}>SAVE</Text>
							</TouchableOpacity>
						</View>
					</View>
					{/* </TouchableOpacity> */}
				</KeyboardAwareScrollView>
			);
		}
		return null;
	};

	discountCmpt() {
		if (this.state.selectedItem.hasOwnProperty('product')) {
			if (
				!this.state.selectedItem.product.description.includes('delivery') &&
				!this.state.selectedItem.product.description.includes('discount')
			) {
				return (
					<View>
						<View style={orderItemStyles.rowDirection}>
							<View style={orderItemStyles.flexHeigth}>
								<Text style={[orderItemStyles.textLeft, orderItemStyles.baseItem]}>
									DISCOUNTS
								</Text>
							</View>
						</View>

						<View style={orderItemStyles.discountView}>
							<FlatList
								data={this.props.discounts}
								extraData={this.state.selectedDiscounts}
								renderItem={this.renderDiscountRow}
							/>
						</View>

						<View style={orderItemStyles.discountView}>
							<View style={orderItemStyles.flexHeigth}>
								<Text
									style={[
										orderItemStyles.baseItem,
										{
											marginLeft: 12,
											padding: 10
										}
									]}>
									Custom
								</Text>
							</View>
							<View style={orderItemStyles.flexHeigth}>
								{this.customDiscountValue()}
							</View>
						</View>
						<View style={orderItemStyles.aseparator} />
					</View>
				);
			}
		}
	}

	qtyAmount() {
		if (this.state.selectedItem.hasOwnProperty('product')) {
			if (
				this.state.selectedItem.product.description.includes('delivery') ||
				this.state.selectedItem.product.description.includes('discount')
			) {
				return (
					<View style={orderItemStyles.flexOne}>
						<View style={orderItemStyles.flexOne}>
							<Text style={[orderItemStyles.textLeft, orderItemStyles.baseItem]}>
								AMOUNT
							</Text>
						</View>
						<View style={orderItemStyles.qtyvalstyle}>{this.qtyValue()}</View>
					</View>
				);
			}
			return (
				<View>
					<View style={orderItemStyles.rowDirection}>
						<View style={orderItemStyles.flexOne}>
							<Text style={[orderItemStyles.textLeft, orderItemStyles.baseItem]}>
								QUANTITY
							</Text>
						</View>
					</View>
					<View style={orderItemStyles.qtyamtstyle}>
						<View style={orderItemStyles.qtyamticon}>
							<TouchableHighlight
								style={orderItemStyles.flexOne}
								onPress={this.counterChangedHandler.bind(this, 'dec')}>
								<Icon
									size={40}
									style={orderItemStyles.iconleftMargin}
									name="md-remove-circle-outline"
									color="black"
								/>
							</TouchableHighlight>
						</View>
						<View style={orderItemStyles.qtyamtval}>
							<View style={orderItemStyles.qtyamtvalcont}>{this.qtyValue()}</View>
						</View>
						<View style={orderItemStyles.qtyamticon2}>
							<TouchableHighlight
								style={orderItemStyles.flexOne}
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

	getCancelButton() {
		return (
			<TouchableHighlight onPress={() => this.onCancelOrder()}>
				<Icon size={40} name="md-close-circle-outline" color="black" />
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
				style={orderItemStyles.qtyTxtInput}
				keyboardType="number-pad"
				onChangeText={(value) => this.changeQuantity(value)}
				value={qty}
				underlineColorAndroid="transparent"
				placeholder="Quantity"
			/>
		);
	}

	bottlesReturned() {
		if (this.state.selectedItem.hasOwnProperty('product')) {
			if (this.state.selectedItem.product.description.includes('refill')) {
				return (
					<View>
						<View style={orderItemStyles.aseparator} />
						<View style={orderItemStyles.rowDirection}>
							<View style={orderItemStyles.flexOne}>
								<Text
									style={[orderItemStyles.headerItem, orderItemStyles.upperCase]}>
									Empties Returned
								</Text>
							</View>
							<View style={orderItemStyles.flexOne}>
								<Text
									style={[orderItemStyles.headerItem, orderItemStyles.upperCase]}>
									Damaged Bottles
								</Text>
							</View>
							<View style={orderItemStyles.flexOne}>
								<Text
									style={[orderItemStyles.headerItem, orderItemStyles.upperCase]}>
									Pending Bottles
								</Text>
							</View>
						</View>

						<View style={orderItemStyles.emptiesView}>
							<View style={orderItemStyles.flexOne}>
								{this.emptiesReturnedValue()}
							</View>
							<View style={orderItemStyles.flexOne}>
								{this.emptiesDamagedValue()}
							</View>
							<View style={orderItemStyles.flexOne}>{this.refillPendingValue()}</View>
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
				style={orderItemStyles.pad10}
				onChangeText={this.setNotes}
				value={notes}
				underlineColorAndroid="transparent"
				placeholder="Add a Note"
			/>
		);
	}

	emptiesReturnedValue() {
		let emptiesReturned = '';
		const qty = this.state.selectedItem.quantity.toString();

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
				style={orderItemStyles.emptiestxtinput}
				onChangeText={this.setEmptiesReturned}
				value={emptiesReturned}
				keyboardType="number-pad"
				underlineColorAndroid="transparent"
				placeholder="0"
			/>
		);
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
				style={orderItemStyles.emptiestxtinput}
				onChangeText={this.setEmptiesDamaged}
				value={emptiesDamaged}
				keyboardType="number-pad"
				underlineColorAndroid="transparent"
				placeholder="0"
			/>
		);
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
				style={orderItemStyles.qtyTxtInput}
				onChangeText={this.setRefillPending}
				value={refillPending}
				keyboardType="number-pad"
				underlineColorAndroid="transparent"
				placeholder="0"
			/>
		);
	}

	getProductDescripion() {
		if (this.state.selectedItem.hasOwnProperty('product')) {
			return (
				<Text style={(orderItemStyles.textLeft, orderItemStyles.baseItem)}>
					{this.state.selectedItem.product.description}
				</Text>
			);
		}
	}

	customDiscountValue() {
		if (!this.state.selectedItem.hasOwnProperty('product')) {
			return;
		}

		const productIndex = this.props.selectedDiscounts
			.map(function (e) {
				return e.product.productId;
			})
			.indexOf(this.state.selectedItem.product.productId);

		let customValue = 0;
		if (productIndex >= 0) {
			customValue = this.props.selectedDiscounts[productIndex].customDiscount;
		}
		return (
			<TextInput
				style={orderItemStyles.pad10}
				onChangeText={this.customDiscount}
				value={customValue.toString()}
				keyboardType="number-pad"
				underlineColorAndroid="transparent"
				placeholder="Custom Discount"
			/>
		);
	}

	modalOnClose() {
		DiscountRealm.resetSelected();
		this.setState((state) => {
			return {
				selectedDiscounts: {}
			};
		});
		this.props.discountActions.setDiscounts(DiscountRealm.getDiscounts());

		PaymentTypeRealm.resetSelected();
		this.props.paymentTypesActions.resetSelectedPayment();
		this.props.paymentTypesActions.setPaymentTypes(PaymentTypeRealm.getPaymentTypes());
	}

	onCancelOrder() {
		this.setState({ isorderItemsModal: false });
		this.refs.productModel.close();
	}

	removeDiscount() {
		this.refs.productModel.close();
		this.setState({ isorderItemsModal: false });
		const unitPrice = this.getItemPrice(this.state.selectedItem.product);
		this.props.orderActions.RemoveProductFromOrder(this.state.selectedItem.product, unitPrice);
	}

	showQuantityChanger() {
		this.props.toolbarActions.ShowScreen('quanityChanger');
	}

	customDiscount = (searchText) => {
		const productIndex = this.props.selectedDiscounts
			.map(function (e) {
				return e.product.productId;
			})
			.indexOf(this.state.selectedItem.product.productId);

		if (
			Number(searchText) >
			this.state.selectedItem.quantity * this.getItemPrice(this.state.selectedItem.product)
		) {
			Alert.alert(
				'Custom Discount',
				'Discount cannot exceed order amount.',
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

		if (productIndex >= 0) {
			DiscountRealm.isSelected(this.state.selectedDiscounts, false);
			this.props.discountActions.setDiscounts(DiscountRealm.getDiscounts());
			if (
				this.props.selectedDiscounts[productIndex].discount.length > 0 &&
				this.state.selectedDiscounts.length === 0
			) {
				this.props.orderActions.SetOrderDiscounts(
					'Custom',
					searchText,
					this.state.selectedItem.product,
					this.props.selectedDiscounts[productIndex].discount,
					this.state.selectedItem.quantity *
						this.getItemPrice(this.state.selectedItem.product)
				);
			} else {
				this.props.orderActions.SetOrderDiscounts(
					'Custom',
					searchText,
					this.state.selectedItem.product,
					this.state.selectedDiscounts,
					this.state.selectedItem.quantity *
						this.getItemPrice(this.state.selectedItem.product)
				);
			}
		} else {
			this.props.orderActions.SetOrderDiscounts(
				'Custom',
				searchText,
				this.state.selectedItem.product,
				this.state.selectedDiscounts,
				this.state.selectedItem.quantity *
					this.getItemPrice(this.state.selectedItem.product)
			);
		}
	};

	setNotes = (notes) => {
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

		this.props.orderActions.AddNotesToProduct(
			this.state.selectedItem.product,
			notes,
			emptiesReturned,
			refillPending,
			emptiesDamaged
		);
	};

	setEmptiesDamaged = (emptiesDamaged) => {
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

		this.props.orderActions.AddNotesToProduct(
			this.state.selectedItem.product,
			notes,
			emptiesReturned,
			refillPending,
			emptiesDamaged
		);
	};

	setEmptiesReturned = (emptiesReturned) => {
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

		this.props.orderActions.AddNotesToProduct(
			this.state.selectedItem.product,
			notes,
			emptiesReturned,
			refillPending,
			emptiesDamaged
		);
	};

	setRefillPending = (refillPending) => {
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

		this.props.orderActions.AddNotesToProduct(
			this.state.selectedItem.product,
			notes,
			emptiesReturned,
			refillPending,
			emptiesDamaged
		);
	};

	changeQuantity = (value) => {
		const unitPrice = this.getItemPrice(this.state.selectedItem.product);
		if (Number(value) != 0) {
			if (this.state.selectedItem.product.description.includes('discount')) {
				if (Number(value) > this.calculateOrderDue()) {
					Alert.alert(
						'Discount',
						'Discount cannot exceed Order amount.',
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
			}

			this.props.orderActions.SetProductQuantity(
				this.state.selectedItem.product,
				Number(value),
				unitPrice
			);
			this.setState({
				accumulator: Number(value)
			});
		}

		if (!value) {
			this.props.orderActions.SetProductQuantity(
				this.state.selectedItem.product,
				'',
				unitPrice
			);
			this.setState({
				accumulator: ''
			});
		}
	};

	calculateOrderDue() {
		let totalAmount = 0;
		for (const i of this.props.orderItems) {
			if (i.product.description === 'discount') {
				totalAmount += i.finalAmount;
			} else if (i.product.description === 'delivery') {
				totalAmount += i.finalAmount;
			} else {
				totalAmount += i.finalAmount;
			}
		}
		return totalAmount;
	}

	renderDiscountRow = ({ item }) => {
		const productIndex = this.props.selectedDiscounts
			.map(function (e) {
				return e.product.productId;
			})
			.indexOf(this.state.selectedItem.product.productId);

		let isDiscountAvailable = false;
		if (productIndex >= 0) {
			isDiscountAvailable =
				this.props.selectedDiscounts[productIndex].discount.id === item.id;
		}

		return (
			<View style={orderItemStyles.discountRow}>
				<View style={orderItemStyles.flexHeigth}>
					<Text style={[orderItemStyles.margLeft, orderItemStyles.baseItem]}>
						{item.applies_to}-{item.amount}
					</Text>
				</View>
				<View style={orderItemStyles.flexHeigth}>
					<ToggleSwitch
						isOn={item.isSelected || isDiscountAvailable}
						onColor="green"
						offColor="red"
						labelStyle={{ color: 'black', fontWeight: '900' }}
						size="large"
						onToggle={(isOn) => {
							DiscountRealm.isSelected(item, isOn === true);

							if (this.state.selectedDiscounts.hasOwnProperty('id')) {
								DiscountRealm.isSelected(this.state.selectedDiscounts, false);
							}

							this.props.discountActions.setDiscounts(DiscountRealm.getDiscounts());

							if (isOn) {
								const selectedDiscounts = item;
								this.props.orderActions.SetOrderDiscounts(
									'Not Custom',
									0,
									this.state.selectedItem.product,
									selectedDiscounts,
									this.state.selectedItem.quantity *
										this.getItemPrice(this.state.selectedItem.product)
								);
								this.setState({ selectedDiscounts });
							}

							if (!isOn) {
								this.props.orderActions.RemoveProductDiscountsFromOrder(
									this.state.selectedItem.product
								);
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
				<View style={orderItemStyles.flexTwo}>
					<Text style={[orderItemStyles.headerItem, orderItemStyles.headerLeftMargin]}>
						{i18n.t('item')}
					</Text>
				</View>
				<View style={orderItemStyles.flexOne}>
					<Text style={orderItemStyles.headerItem}>{i18n.t('quantity')}</Text>
				</View>
				<View style={orderItemStyles.flexTwo}>
					<Text style={[orderItemStyles.headerItem, { textAlign: 'center' }]}>
						{i18n.t('charge')}
					</Text>
				</View>
			</View>
		);
	};

	counterChangedHandler(action) {
		const unitPrice = this.getItemPrice(this.state.selectedItem.product);
		switch (action) {
			case 'inc':
				if (this.state.accumulator <= 0) {
					this.refs.productModel.close();
					this.setState({ isorderItemsModal: false });
					this.props.orderActions.RemoveProductFromOrder(
						this.state.selectedItem.product,
						unitPrice
					);
				} else {
					this.setState((prevState) => {
						this.props.orderActions.SetProductQuantity(
							this.state.selectedItem.product,
							prevState.accumulator + 1,
							unitPrice
						);
						return {
							accumulator: prevState.accumulator + 1
						};
					});

					// this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, this.state.accumulator, unitPrice);
				}
				break;
			case 'dec':
				if (this.state.accumulator <= 0) {
					this.refs.productModel.close();
					this.setState({ isorderItemsModal: false });
					this.props.orderActions.RemoveProductFromOrder(
						this.state.selectedItem.product,
						unitPrice
					);
				} else {
					this.setState((prevState) => {
						this.props.orderActions.SetProductQuantity(
							this.state.selectedItem.product,
							prevState.accumulator - 1,
							unitPrice
						);
						return { accumulator: prevState.accumulator - 1 };
					});

					// this.props.orderActions.SetProductQuantity(this.state.selectedItem.product, this.state.accumulator, unitPrice);
				}
				break;
		}
	}

	// Wrong sales channel for Retailers or Resellers.
	getItemPrice = (item) => {
		if (!item) {
			return 0;
		}
		const salesChannel = SalesChannelRealm.getSalesChannelFromName(
			this.props.channel.salesChannel
		);
		if (salesChannel) {
			const productMrp = ProductMRPRealm.getFilteredProductMRP()[
				ProductMRPRealm.getProductMrpKeyFromIds(item.productId, salesChannel.id)
			];
			if (productMrp) {
				return productMrp.priceAmount;
			}
		}
		return item.unitPrice; // Just use product price
	};

	getCurrency = () => {
		const settings = SettingRealm.getAllSetting();
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

	render() {
		return (
			<View style={orderItemStyles.container}>
				<FlatList
					data={this.props.orderItems}
					ListHeaderComponent={this.showOrderItemsHeader}
					extraData={this.props.channel.salesChannel}
					renderItem={this._renderItem}
					keyExtractor={(item) => item.product.productId.toString()}
				/>

				<Modal
					style={orderItemStyles.modal3}
					coverScreen
					position="center"
					onClosed={() => this.modalOnClose()}
					ref="productModel">
					{this.orderItemsModal()}
				</Modal>
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
		topupTotal: state.topupReducer.total
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
		customerReminderActions: bindActionCreators(CustomerReminderActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderItems);

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'white',
		borderColor: '#2858a7',
		borderRightWidth: 5,
		borderTopWidth: 5,
		flex: 1
	},
	containerTotal: {
		backgroundColor: '#e0e0e0',
		borderColor: '#2858a7',
		borderRightWidth: 5,
		borderTopWidth: 5,
		flex: 2
	},

	iconleftMargin: {
		left: 10,
		textAlign: 'center'
	},
	leftMargin: {
		left: 10
	},
	orderSummaryViewTextOne: { flex: 3, marginLeft: 20 },
	summaryText: {
		alignSelf: 'center',
		color: 'black',
		fontSize: 18,
		fontWeight: 'bold'
	},

	totalText: {
		alignSelf: 'center',
		color: 'black',
		fontSize: 18,
		fontWeight: 'bold',
		marginTop: 10
	}
});
