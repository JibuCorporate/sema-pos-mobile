import React from 'react';
if (process.env.NODE_ENV === 'development') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
        trackAllPureComponents: true,
    });
}
import {
	View,
	Text,
	StyleSheet,
	Image,
	TouchableOpacity,
	TouchableNativeFeedback,
	Alert,
	ToastAndroid,
	ScrollView,
	SafeAreaView,
	Dimensions,
	InteractionManager
} from 'react-native';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Icon from 'react-native-vector-icons/Ionicons';

import CustomerRealm from '../../database/customers/customer.operations';
import OrderRealm from '../../database/orders/orders.operations';
import SettingRealm from '../../database/settings/settings.operations';
import * as CustomerActions from '../../actions/CustomerActions';
import * as receiptActions from '../../actions/ReceiptActions';
import * as paymentTypesActions from '../../actions/PaymentTypesActions';
import * as TopUpActions from '../../actions/TopUpActions';
import CreditRealm from '../../database/credit/credit.operations';
import CustomerDebtRealm from '../../database/customer_debt/customer_debt.operations';
import ProductsRealm from '../../database/products/product.operations';

import ReceiptPaymentTypeRealm from '../../database/reciept_payment_types/reciept_payment_types.operations';
import PaymentTypeRealm from '../../database/payment_types/payment_types.operations';
import { format, parseISO, isBefore } from 'date-fns';
import i18n from '../../app/i18n';
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";

class ReceiptLineItem extends React.PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View style={styles.receiptlinecont}>
				<Image
					source={{ uri: this.getImage() }}
					style={styles.productImage}
				/>
				<View style={styles.receipttext}>
					<View style={styles.itemData}>
						<Text style={styles.label, styles.font15}>{this.getDescription()}</Text>
					</View>
					<View style={styles.itemData}>
						<Text style={styles.label, styles.font16}>{this.props.quantity} </Text>
					</View>
				</View>
				<View style={styles.itemData, styles.rlidata}>
					<Text style={[styles.label, styles.receiptitemamt]}>
						{this.props.currency} {this.props.totalAmount}</Text>
				</View>
			</View>
		);
	}

	getImage = () => {
		const productImage = ProductsRealm.getProducts().find(e => e.productId === this.props.productId);
		return productImage.base64encodedImage;
	};

	getDescription = () => {
		const productImage = ProductsRealm.getProducts().find(e => e.productId === this.props.productId);
		return productImage.description;
	};

}

class PaymentTypeItem extends React.PureComponent {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<View style={styles.receiptlinecont}>
				<View style={styles.itemData3}>
					<Icon name={`md-cash`} size={25} color="#808080" />
					<Text style={[styles.label, styles.payitemname]}>
						{this.props.name == 'credit' ? 'Wallet' : this.props.name}</Text>
				</View>
				<View style={styles.itemData1}>
					<Text style={[styles.label, styles.payitemamt]}>{this.props.currency} {this.props.amount} </Text>
				</View>

			</View>
		);
	}
}

class TransactionDetail extends React.PureComponent {
	constructor(props) {
		super(props);
	}

	onDeleteReceipt(item) {
		return () => {
			if (item.is_delete === 0) {
				return ToastAndroid.show(
					'Receipt already deleted',
					ToastAndroid.SHORT
				);
			}

			Alert.alert(
				'Confirm Receipt Deletion',
				'Are you sure you want to delete this receipt? (this cannot be undone)',
				[
					{
						text: i18n.t('no'),
						onPress: () => { },
						style: 'cancel'
					},
					{
						text: i18n.t('yes'),
						onPress: () => {
							this.deleteReceipt(item);
						}
					}
				],
				{ cancelable: true }
			);
		};
	}


	onTopupCreditDelete(item) {
		return () => {

			if (!item.active) {
				return ToastAndroid.show(
					`${item.type} already deleted`,
					ToastAndroid.SHORT
				);
			}

			Alert.alert(
				`Confirm ${item.type}  Deletion`,
				`Are you sure you want to delete this ${item.type}? (this cannot be undone)`,
				[
					{
						text: i18n.t('no'),
						onPress: () => { },
						style: 'cancel'
					},
					{
						text: i18n.t('yes'),
						onPress: () => {
							this.deleteReceipt(item);
						}
					}
				],
				{ cancelable: true }
			);
		};
	}

	deleteReceipt(item) {

		if (item.isReceipt) {
			OrderRealm.softDeleteOrder(item);
			const loanIndex = item.paymentTypes.map(function (e) { return e.name }).indexOf("loan");
			if (loanIndex >= 0) {
				item.customerAccount.dueAmount = Number(item.customerAccount.dueAmount) - Number(this.props.selectedPaymentTypes[loanIndex].amount);
				CustomerRealm.updateCustomerDueAmount(
					item.customerAccount,
					item.customerAccount.dueAmount
				);
				this.props.customerActions.CustomerSelected(this.props.selectedCustomer);
				this.props.customerActions.setCustomers(
					CustomerRealm.getAllCustomer()
				);
			}
			this.props.receiptActions.setReceipts(
				OrderRealm.getAllOrder()
			);
		}


		if (item.isDebt) {
			item.customerAccount.dueAmount = Number(item.customerAccount.dueAmount) + Number(item.totalAmount);
			CustomerRealm.updateCustomerDueAmount(
				item.customerAccount,
				item.customerAccount.dueAmount
			);
			CustomerDebtRealm.softDeleteCustomerDebt(item);
			this.props.customerActions.setCustomers(
				CustomerRealm.getAllCustomer()
			);
			this.props.paymentTypesActions.setCustomerPaidDebt(
				CustomerDebtRealm.getCustomerDebts()
			);
		}

		if (item.isTopUp) {
			item.customerAccount.walletBalance = Number(item.customerAccount.walletBalance) - Number(item.totalAmount);
			CustomerRealm.updateCustomerWalletBalance(
				item.customerAccount,
				item.customerAccount.walletBalance
			);
			CreditRealm.softDeleteCredit(item);
			this.props.customerActions.setCustomers(
				CustomerRealm.getAllCustomer()
			);
			this.props.topUpActions.setTopups(
				CreditRealm.getAllCredit()
			);
		}


	}

	renderTopUp = (item) => {

		if (item.isTopUp) {
			return (
				<View
					style={styles.topupdebtcont}>
					<View style={styles.flex1}>
						<View
							style={styles.flexAndDirection}>
							<View style={styles.itemData3}>
								<Text style={styles.label, styles.tdlbl}>{'Top Up Amount'}</Text>

							</View>
							<View style={styles.itemData1}>
								<Text style={styles.label, styles.tdlbamt}>{this.props.currency} {item.topUp.topup} </Text>
							</View>
						</View>
					</View>
				</View>

			)
		} else {
			return (
				<View style={styles.flex1}>
				</View>
			)
		}
	}

	renderDebt = (item) => {

		if (item.isDebt) {
			return (
				<View
					style={styles.topupdebtcont}>
					<View style={styles.flex1}>
						<View style={styles.flexAndDirection}>
							<View style={styles.itemData3}>
								<Text style={styles.label, styles.tdlbl}>
									{'Loan Cleared'}</Text>

							</View>
							<View style={styles.itemData1}>
								<Text style={styles.label, styles.tdlbamt}>{this.getCurrency().toUpperCase()} {item.debt.due_amount} </Text>
							</View>
						</View>
					</View>
				</View>

			)
		} else {
			return (
				<View style={styles.flex1}>
				</View>
			)
		}
	}

	isEmpty(obj) {
		for (var key in obj) {
			if (obj.hasOwnProperty(key))
				return false;
		}
		return true;
	}
	//Receipt Line Items



	render() {
		var receiptLineItems;
		var paymentTypes;

		if (!this.isEmpty(this.props.item)) {

			if (this.props.item.isReceipt) {

				if (this.props.item.receiptLineItems !== undefined) {
					receiptLineItems = this.props.item.receiptLineItems.map((lineItem, idx) => {
						return (
							<ReceiptLineItem
								quantity={lineItem.quantity}
								totalAmount={lineItem.totalAmount ? lineItem.totalAmount : lineItem.price_total}
								productId={lineItem.product_id}
								currency={this.props.currency}
								key={lineItem.receiptId + idx}
							/>
						);
					});
				} else {
					receiptLineItems = {};
				}

				if (this.props.item.paymentTypes !== undefined) {
					paymentTypes = this.props.item.paymentTypes.map((paymentItem, idx) => {
						return (
							<PaymentTypeItem
								key={paymentItem.id + idx}
								amount={paymentItem.amount}
								currency={this.props.currency}
								name={paymentItem.name}
								lineItemIndex={idx}
							/>
						);
					});
				} else {
					paymentTypes = {};
				}

				if (this.props.item.hasOwnProperty("customerAccount")) {
					return (
						<View style={styles.transcont}>
							<ScrollView style={styles.flex1}>
								<View style={styles.deleteButtonContainer}>
									<TouchableOpacity
										onPress={this.onDeleteReceipt(this.props.item)}
										style={ostyle(this.props.item.active).touchstyle}>
										<Text style={styles.receiptDeleteButtonText}>X</Text>
									</TouchableOpacity>
								</View>
								<View style={styles.itemData}>
									<Text style={styles.customername}>{this.props.item.customerAccount.name}</Text>
								</View>
								<Text>
									{format(parseISO(this.props.item.createdAt), 'iiii d MMM yyyy')}
								</Text>
								<View>

								</View>
								<View style={styles.receiptStats}>
									{this.props.item.is_delete === 0 && (
										<Text style={styles.receiptStatusText}>
											{'Deleted -'.toUpperCase()}
										</Text>
									)}
									{!this.props.item.active ? (
										<View style={styles.rowFlex}>
											<Text style={styles.receiptPendingText}>
												{' Pending'.toUpperCase()}
											</Text>
										</View>
									) : (
											<View style={styles.rowFlex}>
												{!this.props.item.active && <Text> - </Text>}
												<Text style={styles.receiptSyncedText}>
													{' Synced'.toUpperCase()}
												</Text>
											</View>
										)}
								</View>
								<View>
									<Text style={styles.detailheader}>PAYMENT</Text>
								</View>

								{paymentTypes}

								<View>
									<Text style={styles.detailheader}>PRODUCTS</Text>
								</View>

								{receiptLineItems}

								<View style={styles.itemspurchcont}>
									<Text style={styles.customername, styles.itemsplbl}>Items Purchased</Text>
									<Text style={[styles.customername, styles.itemsPurchasedValue]}>
										{this.props.currency} {this.props.item.totalAmount ? this.props.item.totalAmount : this.props.item.price_total}
									</Text>
								</View>

								{this.renderTopUp(this.props.item)}

								{this.renderDebt(this.props.item)}

								<View>
									<Text style={styles.detailheader}>NOTES</Text>
								</View>
								<View>
									<Text style={styles.notesst}>{this.props.item.notes}</Text>
								</View>

							</ScrollView>
						</View>
					)
				} else {
					return (
						<View style={styles.flex1}>
							<Text style={styles.notesst}>{"Select a receipt to view its details."}</Text>
						</View>
					)
				}

			} else {
				return (
					<View
						style={styles.detcont}>
						<View style={styles.detsubcont}>
							<ScrollView style={styles.flex1}>
								<View style={styles.deleteButtonContainer}>
									<TouchableOpacity
										onPress={this.onTopupCreditDelete(this.props.item)}
										style={ostyle(this.props.item.active).touchstyle}>
										<Text style={styles.receiptDeleteButtonText}>X</Text>
									</TouchableOpacity>
								</View>
								<View style={styles.itemData}>
									<Text style={styles.customername}>{this.props.item.customerAccount.name}</Text>
								</View>
								<Text>
									{format(parseISO(this.props.item.createdAt), 'iiii d MMM yyyy')}
								</Text>
								<View>

								</View>
								<View style={styles.receiptStats}>
									{!this.props.item.active && (
										<Text style={styles.receiptStatusText}>
											{'Deleted -'.toUpperCase()}
										</Text>
									)}
									{!this.props.item.synched ? (
										<View style={styles.rowFlex}>
											<Text style={styles.receiptPendingText}>
												{' Pending'.toUpperCase()}
											</Text>
										</View>
									) : (
											<View style={styles.rowFlex}>
												{!this.props.item.synched && <Text> - </Text>}
												<Text style={styles.receiptSyncedText}>
													{' Synced'.toUpperCase()}
												</Text>
											</View>
										)}
								</View>
								<View>
									<Text style={styles.detailheader}>Amount</Text>
								</View>

								<View
									style={styles.detcont}>
									<View style={styles.itemData3}>
										<Text style={styles.label, styles.tdlbl}>
											{this.props.item.type}</Text>

									</View>
									<View style={styles.itemData1}>
										<Text style={styles.label, styles.tdlbamt}>{this.props.currency} {this.props.item.totalAmount} </Text>
									</View>
								</View>


								<View
									style={styles.detcont}>
									<View style={styles.itemData3}>
										<Text style={styles.label, styles.tdlbl}>
											Balance</Text>

									</View>
									<View style={styles.itemData1}>
										<Text style={styles.label, styles.tdlbamt}>{this.props.currency} {this.props.item.balance} </Text>
									</View>
								</View>

								<View>
									<Text style={styles.detailheader}>NOTES</Text>
								</View>
								<View>
									<Text style={styles.notesst}>{this.props.item.notes}</Text>
								</View>
							</ScrollView>
						</View>



					</View>


				)
			}

		} else {
			return null;
		}

	}

}

class Transactions extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			refresh: false,
			refreshing: false,
			searchString: '',
			hasScrolled: false,
			paymentTypeValue: '',
			dataProvider: new DataProvider((r1, r2) => { return r1 !== r2; }),
			// selected: {}
			selected:
			this.prepareSectionedData().length > 0 ? this.prepareSectionedData()[1].item : {},
		};

		let { width } = Dimensions.get("window");

		this.layoutProvider = new LayoutProvider((i) => {
			return this.state.dataProvider.getDataForIndex(i).type;
		}, (type, dim) => {
			switch (type) {
				case 'NORMAL':
					dim.width = width / 4;
					dim.height = 85;
					break;
				case 'SECTION':
					dim.width = width / 4;
					dim.height = 40;
					break;
				default:
					dim.width = 0;
					dim.height = 0;
					break;
			};
		});
		this.rowRenderer = this.rowRenderer.bind(this);
	}

	// UNSAFE_componentWillReceiveProps(){
	// 	this.setState({
	// 		dataProvider: this.state.dataProvider.cloneWithRows(this.prepareSectionedData()),
	// 		selected:
	// 		this.prepareSectionedData().length > 0 ? this.prepareSectionedData()[1].item : {}
	// 	});
	// }

	// componentDidUpdate(prevState) {
	// 	// Typical usage (don't forget to compare props):
	// 	return false;
	//   }

	componentDidMount() {
		InteractionManager.runAfterInteractions(() => {
			this.setState({
				dataProvider: this.state.dataProvider.cloneWithRows(this.prepareSectionedData()),
				selected:
				this.prepareSectionedData().length > 0 ? this.prepareSectionedData()[1].item : {}
			});
			this.props.navigation.setParams({ paymentTypeValue: 'all' });
			this.props.navigation.setParams({ checkPaymentTypefilter: this.checkPaymentTypefilter });
		});
	}

	comparePaymentTypeReceipts = () => {
		let receiptsPaymentTypes = this.comparePaymentTypes();
		let customerReceipts = OrderRealm.getAllOrder();
		let finalCustomerReceiptsPaymentTypes = [];
		for (let customerReceipt of customerReceipts) {
			let paymentTypes = [];
			for (let receiptsPaymentType of receiptsPaymentTypes) {
				if (receiptsPaymentType.receipt_id === customerReceipt.id) {
					paymentTypes.push(receiptsPaymentType);
				}
			}
			customerReceipt.paymentTypes = paymentTypes;
			finalCustomerReceiptsPaymentTypes.push(customerReceipt);

		}
		return finalCustomerReceiptsPaymentTypes;
	}

	comparePaymentTypes = () => {
		let receiptsPaymentTypes = ReceiptPaymentTypeRealm.getReceiptPaymentTypes();
		let paymentTypes = PaymentTypeRealm.getPaymentTypes();

		let finalreceiptsPaymentTypes = [];

		for (let receiptsPaymentType of receiptsPaymentTypes) {
			const rpIndex = paymentTypes.map(function (e) { return e.id }).indexOf(receiptsPaymentType.payment_type_id);
			if (rpIndex >= 0) {
				receiptsPaymentType.name = paymentTypes[rpIndex].name;
				finalreceiptsPaymentTypes.push(receiptsPaymentType);

			}
		}
		return finalreceiptsPaymentTypes;
	}

	prepareData = () => {
		// Used for enumerating receipts
		const totalCount = OrderRealm.getAllOrder().length;

		let receipts = this.comparePaymentTypeReceipts().map((receipt, index) => {
			return {
				active: receipt.active,
				synched: receipt.synched,
				id: receipt.id,
				receiptId: receipt.id,
				createdAt: receipt.created_at,
				topUp: CreditRealm.getCreditByRecieptId(receipt.id),
				debt: CustomerDebtRealm.getCustomerDebtByRecieptId(receipt.id),
				isDebt: CustomerDebtRealm.getCustomerDebtByRecieptId(receipt.id) === undefined ? false : true,
				isTopUp: CreditRealm.getCreditByRecieptId(receipt.id) === undefined ? false : true,
				sectiontitle: format(parseISO(receipt.created_at), 'iiii d MMM yyyy'),
				//customerAccount: receipt.customer_account,
				customerAccount: CustomerRealm.getCustomerById(receipt.customer_account_id) ? CustomerRealm.getCustomerById(receipt.customer_account_id) : receipt.customer_account_id,
				receiptLineItems: receipt.receipt_line_items,
				paymentTypes: receipt.paymentTypes,
				isLocal: receipt.isLocal || false,
				key: receipt.isLocal ? receipt.key : null,
				index,
				updated: receipt.updated,
				is_delete: receipt.is_delete,
				amountLoan: receipt.amount_loan,
				totalCount,
				currency: receipt.currency_code,
				isReceipt: true,
				type: 'Receipt',
				totalAmount: receipt.total,
				notes: receipt.notes
			};
		});

		receipts.sort((a, b) => {
			return isBefore(new Date(a.createdAt), new Date(b.createdAt))
				? 1
				: -1;
		});

		return [...receipts];
	}

	prepareCustomerDebt = () => {
		let debtArray = CustomerDebtRealm.getCustomerDebtsTransactions();
		const totalCount = debtArray.length;

		let debtPayment = debtArray.map((receipt, index) => {
			return {
				active: receipt.active,
				synched: receipt.synched,
				notes: receipt.notes,
				id: receipt.customer_debt_id,
				customer_debt_id: receipt.customer_debt_id,
				receiptId: receipt.receipt_id,
				createdAt: receipt.created_at,
				sectiontitle: format(parseISO(receipt.created_at), 'iiii d MMM yyyy'),
				customerAccount: CustomerRealm.getCustomerById(receipt.customer_account_id) ? CustomerRealm.getCustomerById(receipt.customer_account_id) : receipt.customer_account_id,
				receiptLineItems: undefined,
				paymentTypes: undefined,
				description: [{ amount: receipt.due_amount, name: 'cash' }],
				isLocal: receipt.isLocal || false,
				key: null,
				index,
				updated: receipt.updated_at,
				// is_delete: receipt.is_delete,
				// amountLoan: receipt.amount_loan,
				totalCount,
				// currency: receipt.currency_code,
				isReceipt: false,
				isDebt: true,
				isTopUp: false,
				type: 'Debt Payment',
				totalAmount: receipt.due_amount,
				balance: receipt.balance
			};
		});

		debtPayment.sort((a, b) => {
			return isBefore(new Date(a.createdAt), new Date(b.createdAt))
				? 1
				: -1;
		});
		return [...debtPayment];
	}

	prepareTopUpData = () => {
		// Used for enumerating receipts
		let creditArray = CreditRealm.getCreditTransactions();
		const totalCount = creditArray.length;
		let topups = creditArray.map((receipt, index) => {
			return {
				active: receipt.active,
				synched: receipt.synched,
				id: receipt.top_up_id,
				top_up_id: receipt.top_up_id,
				notes: receipt.notes,
				receiptId: receipt.receipt_id,
				createdAt: receipt.created_at,
				sectiontitle: format(parseISO(receipt.created_at), 'iiii d MMM yyyy'),
				customerAccount: CustomerRealm.getCustomerById(receipt.customer_account_id) ? CustomerRealm.getCustomerById(receipt.customer_account_id) : receipt.customer_account_id,
				receiptLineItems: undefined,
				paymentTypes: undefined,
				description: [{ amount: receipt.due_amount, name: 'cash' }],
				isLocal: receipt.isLocal || false,
				key: null,
				index,
				updated: receipt.updated_at,
				// is_delete: receipt.is_delete,
				// amountLoan: receipt.amount_loan,
				totalCount,
				// currency: receipt.currency_code,
				isReceipt: false,
				isDebt: false,
				isTopUp: true,
				type: 'Top Up',
				balance: receipt.balance,
				totalAmount: receipt.topup
			};
		});

		topups.sort((a, b) => {
			return isBefore(new Date(a.createdAt), new Date(b.createdAt))
				? 1
				: -1;
		});
		return [...topups];
	}

	groupBySectionTitle = (objectArray, property) => {
		return objectArray.reduce(function (acc, obj) {
			let key = obj[property];
			if (!acc[key]) {
				acc[key] = [];
			}
			acc[key].push(obj);
			return acc;
		}, {});
	}

	prepareSectionedData() {
		// Used for enumerating receipts
		let receipts = this.prepareData();
		let topups = this.prepareTopUpData();
		let deptPayment = this.prepareCustomerDebt();
		let finalArray = (deptPayment.concat(topups)).concat(receipts).sort((a, b) => {
			return isBefore(new Date(a.createdAt), new Date(b.createdAt))
				? 1
				: -1;
		});

		let transformedarray = this.groupBySectionTitle(finalArray, 'sectiontitle');
		const transactionData = [];

		for (let i of Object.getOwnPropertyNames(transformedarray)) {
			transactionData.push({
				type: "SECTION",
				item: {"title" : i},
			});

			for (let rectopdebt of transformedarray[i]) {
				transactionData.push({
					type: "NORMAL",
					item: rectopdebt,
				});
			}
		}

		return transactionData;
	}

	checkPaymentTypefilter = (searchText) => {
		this.props.navigation.setParams({ paymentTypeValue: searchText });
		this.props.customerActions.SearchPaymentType(searchText);
	};

	setSelected(item) {
		// this.props.receiptActions.setIsUpate(true);
		this.setState({ selected: item });
	}

	getItemLayout = (data, index) => ({
		length: 50,
		offset: 50 * index,
		index
	});

	getCurrency = () => {
		let settings = SettingRealm.getAllSetting();
		return settings.currency;
	};

	getTransactionDetail() {

		if (this.state.selected) {
			return (
				<View style={styles.detmain}>
					<View style={styles.detailcont}>
						<SafeAreaView style={styles.container}>
							<RecyclerListView
								style={styles.flex1}
								rowRenderer={this.rowRenderer}
								dataProvider={this.state.dataProvider}
								layoutProvider={this.layoutProvider}
							/>
						</SafeAreaView>
					</View>

					<View style={styles.transdetcont}>
						<TransactionDetail
							item={this.state.selected}
							currency={this.getCurrency().toUpperCase()}
							customerActions={this.props.customerActions}
							paymentTypesActions={this.props.paymentTypesActions}
							topUpActions={this.props.topUpActions}
							receiptActions={this.props.receiptActions}
						/>
					</View>
				</View>

			);
		} else {
			return (
				<View style={styles.detmain}>
					<Text style={styles.emptystate}>Record customers sales.</Text>

				</View>
			);
		}
	}

	render() {
		return (
			<View style={styles.flex1}>
				{this.getTransactionDetail()}
				<SearchWatcher parent={this}>
					{this.props.paymentTypeFilter}
				</SearchWatcher>
			</View>
		);
		return null;
	}

	filterItems = data => {
		let filter = {
			paymentTypes: this.props.paymentTypeFilter.length > 0 ? this.props.paymentTypeFilter === 'all' ? "" : this.props.paymentTypeFilter : "",
		};

		let filteredItems = data.filter(function (item) {
			for (var key in filter) {
				if (key === "paymentTypes") {
					if (filter[key].length === 0) {
						return true;
					}
					if (item[key] != undefined) {
						let filteredTypes = item[key].filter(function (elements) {
							if (elements["name"] === filter[key]) {
								return true;
							}
						});
						if (filteredTypes.length > 0) {
							return true;
						}
					}
				}
			}
		});

		return filteredItems;
	};


	renderSeparator() {
		return (
			<View
				style={styles.aseparator}
			/>
		);
	}

	rowRenderer = (type, data, index) => {
		switch (type) {
				case 'NORMAL':
					return (
						<TouchableNativeFeedback onPress={() => this.setSelected(data.item)}>
							<View key={index} style={styles.rcptPad}>
								<View style={styles.itemData}>
									<Text style={styles.customername}>{data.item.isReceipt ? data.item.customerAccount.name : data.item.customerAccount.name}</Text>
								</View>
								<Text style={styles.customername}>
									{this.getCurrency().toUpperCase()} {data.item.totalAmount}
								</Text>
								{/* <View style={styles.receiptStats}> */}
									{data.item.isReceipt ? data.item.is_delete === 0 && (
										<Text style={styles.receiptStatusText}>
											{'Deleted - '.toUpperCase()}
										</Text>
									) : !data.item.isReceipt ? !data.item.active && (
										<Text style={styles.receiptStatusText}>
											{'Deleted - '.toUpperCase()}
										</Text>
									) : null}

									{!data.item.isReceipt ? !data.item.synched ? (
										<View style={styles.rowFlex}>
											<Text style={styles.receiptPendingText}>
												{' Pending'.toUpperCase()}
											</Text>
										</View>
									) : (
											<View style={styles.rowFlex}>
												{!data.item.synched && <Text> - </Text>}
												<Text style={styles.receiptSyncedText}>
													{' Synced'.toUpperCase()}
												</Text>
											</View>
										) :
										!data.item.active ? (
											<View style={styles.rowFlex}>
												<Text style={styles.receiptPendingText}>
													{' Pending'.toUpperCase()}
												</Text>
											</View>
										) : (
												<View style={styles.rowFlex}>
													{!data.item.active && <Text> - </Text>}
													<Text style={styles.receiptSyncedText}>
														{' Synced'.toUpperCase()}
													</Text>
												</View>
											)}
							</View>
						</TouchableNativeFeedback>
					);
				case "SECTION":
					return (
						<View style={styles.flex1}>
							<Text style={styles.sectionTitle}>{data.item.title}</Text>
						</View>
					);

				default:
					return null;
			}
	}

}

class SearchWatcher extends React.PureComponent {
	render() {
		return this.searchEvent();
	}

	// TODO: Use states instead of setTimeout
	searchEvent() {
		let that = this;

		setTimeout(() => {
			if (
				that.props.parent.props.paymentTypeFilter !==
				that.props.parent.state.paymentTypeFilter
			) {
				that.props.parent.state.paymentTypeFilter =
					that.props.parent.props.paymentTypeFilter;
				that.props.parent.setState({
					refresh: !that.props.parent.state.refresh
				});
			}
		}, 50);
		return null;
	}
}

function mapStateToProps(state, props) {
	return {
		settings: state.settingsReducer.settings,
		isUpdate: state.receiptReducer.isUpdate,
		transactions: state.receiptReducer.transactions,
		products: state.productReducer.products,
		paymentTypeFilter: state.customerReducer.paymentTypeFilter,
	};
}

function mapDispatchToProps(dispatch) {
	return {
		customerActions: bindActionCreators(CustomerActions, dispatch),
		paymentTypesActions: bindActionCreators(paymentTypesActions, dispatch),
		topUpActions: bindActionCreators(TopUpActions, dispatch),
		receiptActions: bindActionCreators(receiptActions, dispatch)
	};
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Transactions);

const ostyle = (actives) => StyleSheet.create({
	touchstyle: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: (actives) ? 'red' : 'grey'
	}
})

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff'
	},

	flexAndDirection: {
		flex: 1,
		flexDirection: 'row'
	},

	flex1: {
		flex: 1
	},

	flex3: {
		flex: 3
	},

	flex2: {
		flex: 2
	},

	flex15: {
		flex: 1.5
	},

	transdetcont: { flex: 3, backgroundColor: '#fff', paddingLeft: 20 },

	aseparator: {
		height: 1,
		backgroundColor: '#ddd',
		width: '100%'
	},

	itemsplbl: {
		flex: 3, fontWeight: 'bold'
	},

	detailcont: {
		flex: 1, backgroundColor: '#fff', borderRightWidth: 1, borderRightColor: '#CCC'
	},

	font15: {
		fontSize: 15
	},
	font16: {
		fontSize: 16
	},

	receiptlinecont: {
		flex: 1,
		flexDirection: 'row',
		marginBottom: 10,
		marginTop: 10
	},

	itemsPurchasedValue: {
		flex: 1, fontWeight: 'bold',
		paddingRight: 20, alignSelf: 'flex-end'
	},
	sectionTitle: {
		fontSize: 16,
		backgroundColor: '#ABC1DE',
		color: '#000',
		fontWeight: 'bold',
		padding: 10,
		textTransform: 'uppercase'
	},
	headerText: {
		fontSize: 24,
		color: 'black',
		marginLeft: 100
	},
	leftMargin: {
		left: 10
	},

	emptystate: {
		fontSize: 20, fontWeight: 'bold', alignSelf: "center", alignContent: "center", padding: 20
	},

	detmain: {
		flex: 1, flexDirection: 'row'
	},
	headerItem: {
		fontWeight: 'bold',
		fontSize: 18
	},
	headerBackground: {
		backgroundColor: '#ABC1DE'
	},

	headerBg: {
		backgroundColor: '#ABC1DE',
		flex: 1,
		flexDirection: 'row',
		height: 50,
		alignItems: 'center'
	},
	submit: {
		backgroundColor: '#2858a7',
		borderRadius: 20,
		marginTop: '1%'
	},

	rcptPad: {
		padding: 10,
		borderBottomColor: "#CCC",
		borderBottomWidth: 1
	},
	inputContainer: {
		borderWidth: 2,
		borderRadius: 10,
		borderColor: '#2858a7',
		backgroundColor: 'white'
	},
	leftToolbar: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center'
	},
	detsubcont: {
		flex: 1, padding: 15
	},
	rightToolbar: {
		flexDirection: 'row-reverse',
		flex: 0.34,
		alignItems: 'center'
	},
	buttonText: {
		fontWeight: 'bold',
		fontSize: 28,
		color: 'white',
		textAlign: 'center',
		width: 300
	},

	detcont: {
		flex: 1,
		flexDirection: 'row',
		marginBottom: 5,
		marginTop: 5
	},
	commandBarContainer: {
		flex: 1,
		backgroundColor: '#ABC1DE',
		height: 80,
		alignSelf: 'center',
		marginLeft: 20,
		marginRight: 20
	},
	dropdownText: {
		fontSize: 24
	},
	receiptPendingText: {
		color: 'orange'
	},

	receiptSyncedText: {
		color: 'green'
	},

	receiptStats: {
		flex: 1,
		flexDirection: 'row'
	},

	rowFlex: {
		flexDirection: 'row'
	},

	notesst: {
		fontSize: 13, fontWeight: "bold", marginTop: 5
	},

	container: {
		flex: 1,
		backgroundColor: '#fff'
	},

	receiptStatusText: {
		color: 'red',
		fontWeight: 'bold'
	},

	transcont: {
		flex: 1, padding: 15
	},

	deleteButtonContainer: {
		width: 40,
		height: 40,
		alignSelf: 'flex-end',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'absolute',
		zIndex: 1,
		top: 15,
		right: 15
	},

	detailheader: {
		fontSize: 16, fontWeight: "bold", marginTop: 10
	},

	receiptDeleteButton: {
		width: '100%',
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center'
	},

	receiptDeleteButtonText: {
		fontSize: 25,
		color: '#fff',
		fontWeight: 'bold'
	},

	productImage: {
		flex: .1,
		width: 80,
		height: 80,
		marginRight: 5,
		marginLeft: 20,
		borderWidth: 5,
		borderColor: '#eee'
	},

	label: {
		color: '#111'
	},

	customername: {
		color: '#111',
		fontSize: 18
	},

	itemData: {
		flexDirection: 'row',
		padding: 1
	},

	itemData1: {
		flex: 1,
		flexDirection: 'row',
		padding: 1
	},

	itemData3: {
		flex: 1,
		flexDirection: 'row',
		padding: 1
	},
	updating: {
		height: 100,
		width: 500,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#ABC1DE',
		borderColor: '#2858a7',
		borderWidth: 5,
		borderRadius: 10
	}, payitemname: {
		paddingLeft: 10, fontSize: 15, textTransform: 'capitalize', fontWeight: 'bold'
	},

	itemspurchcont: {
		flex: 1, marginTop: 20, flexDirection: 'row', fontWeight: 'bold'
	},
	payitemamt: {
		fontSize: 15, fontWeight: 'bold', alignItems: 'flex-end', textAlign: 'right'
	}, receiptitemamt: {
		fontSize: 15, padding: 10, textAlign: 'right'
	},
	receipttext: {
		justifyContent: 'space-around', flex: .65
	},

	rlidata: {
		flex: .25, alignSelf: 'flex-end'
	},

	topupdebtcont: {
		flex: 1,
		flexDirection: 'row',
		marginTop: 10
	},
	tdlbl: {
		fontSize: 15, textTransform: 'capitalize', fontWeight: 'bold'
	},
	tdlbamt: {
		fontSize: 15, fontWeight: 'bold', alignItems: 'flex-end', textAlign: 'right'
	}
});
