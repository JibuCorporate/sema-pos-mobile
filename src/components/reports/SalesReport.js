import React from 'react';

import { Text, View, StyleSheet, FlatList, ScrollView, RefreshControl } from 'react-native';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import * as reportActions from "../../actions/ReportActions";
import SettingRealm from "../../database/settings/settings.operations";
import DateFilter from "./DateFilter";
import i18n from '../../app/i18n';

class SalesReport extends React.PureComponent {
	constructor(props) {
		super(props);
		this.currentDate = new Date();
		this.previousDate = this.addDays(new Date(), 1);
		this.state = {
			refreshing: false,
		};
	}

	_onRefresh = () => {
		this.updateReport();
	}


	addDays = (theDate, days) => {
		return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
	};

	getCurrency = () => {
		let settings = SettingRealm.getAllSetting();
		return settings.currency;
	};

	render() {
		return (
			<View style={styles.mainCont}>
				<ScrollView
					refreshControl={
						<RefreshControl
							refreshing={this.state.refreshing}
							onRefresh={this._onRefresh}
						/>
					}>
					<View style={styles.saleTotals}>
						<View style={styles.salesubconttotals}>
							<DateFilter />
							<View style={styles.salesmaincont}>
								<View style={styles.salestabs} >
									<Text style={styles.totalLabel4}>{i18n.t('total-liters').toUpperCase()}</Text>
									<Text style={styles.totalItem6}>{this.props.salesData.totalLiters.toFixed(1)} L</Text>
								</View>
								<View style={styles.salestabs} >
									<Text style={styles.totalLabel4}>{i18n.t('total-sales').toUpperCase()}</Text>
									<Text style={styles.totalItem6}>{this.getCurrency()} {this.props.salesData.totalSales.toFixed(1)}</Text>
								</View>
								<View style={styles.salestabs} >
									<Text style={styles.totalLabel4}>DEBT COLLECTED</Text>
									<Text style={styles.totalItem6}>{this.getCurrency()} {this.props.salesData.totalDebt.toFixed(1)}</Text>
								</View>
								<View style={styles.salestabs} >
									<Text style={styles.totalLabel4}>TOTAL EARNINGS</Text>
									<Text style={styles.totalItem6}>
										{this.getCurrency()} {this.props.salesData.totalTypes.length > 0 ? this.props.salesData.totalTypes.slice(-1)[0].totalAmount.toFixed(1) : 0}</Text>
								</View>
							</View>
						</View>
					</View>
					<View style={styles.salesBreakdown}>
						<View style={styles.salespart}>
							<FlatList
								data={this.getSalesData()}
								ListHeaderComponent={this.showHeader}
								extraData={this.state.refreshing}
								renderItem={this._renderItem}
								keyExtractor={item => item.sku}
								initialNumToRender={50}
							/>
						</View>
						<View style={styles.paypart}>
							<FlatList
								data={this.props.salesData.totalTypes}
								ListHeaderComponent={this.showPaymentHeader}
								extraData={this.state.refreshing}
								renderItem={this._renderPaymentItem}
								keyExtractor={item => item.name}
							/>

						</View>

					</View>
				</ScrollView>
			</View>
		);
	}

	_renderItem = ({ item, index, separators }) => {
        return (
			<View style={styles.rowBackground}>
				<View style={styles.flex1}>
					<Text numberOfLines={1} style={styles.rowItem, styles.leftMargin}>
						{item.description}</Text>
				</View>
				<View style={styles.flex1}>
					<Text style={styles.rowItemCenter}>{item.quantity}</Text>
				</View>
				<View style={styles.flex1}>
					<Text style={styles.rowItemCenter}>{!isNaN(item.totalLiters) ? item.totalLiters.toFixed(1) : 0}</Text>
				</View>
				<View style={styles.flex1}>
					<Text style={styles.rowItemCenter}>{item.totalSales.toFixed(2)}</Text>
				</View>
			</View>
		);

		};

	_renderPaymentItem = ({ item, index, separators }) => {
			return (
				<View style={styles.rowBackground}>

				<View style={styles.flex1}>
					<Text style={styles.rowItemCenter}>
						{item.name == 'credit' ? 'WALLET' : item.name.toUpperCase()}
					</Text>
				</View>

				<View style={styles.flex1}>
					<Text style={styles.rowItemCenter}>{item.totalAmount !== null ? item.totalAmount.toFixed(2) : 0}</Text>
				</View>
			</View>
			);

			};

	getSalesData() {
		let sales = [];
		if (this.props.dateFilter.hasOwnProperty("currentDate") && this.props.dateFilter.hasOwnProperty("previousDate")) {
			if (this.props.dateFilter.currentDate === this.currentDate && this.props.dateFilter.previousDate === this.previousDate) {
				sales = this.props.salesData.salesItems;
			} else {
				// Get new data
				this.currentDate = this.props.dateFilter.currentDate;
				this.previousDate = this.props.dateFilter.previousDate;
				this.updateReport();
				sales = this.props.salesData.salesItems;
			}
		} else {
			sales = this.props.salesData.salesItems;
		}
		return sales;
	}

	getRow = (item) => {
		return (
			<View style={styles.rowBackground}>
				<View style={styles.flex1}>
					<Text numberOfLines={1} style={styles.rowItem, styles.leftMargin}>
						{item.description}</Text>
				</View>
				<View style={styles.flex1}>
					<Text style={styles.rowItemCenter}>{item.quantity}</Text>
				</View>
				<View style={styles.flex1}>
					<Text style={styles.rowItemCenter}>{!isNaN(item.totalLiters) ? item.totalLiters.toFixed(1) : 0}</Text>
				</View>
				<View style={styles.flex1}>
					<Text style={styles.rowItemCenter}>{item.totalSales.toFixed(2)}</Text>
				</View>
			</View>
		);
	};

	getPaymentRow = (item) => {
		return (
			<View style={styles.rowBackground}>

				<View style={styles.flex1}>
					<Text style={styles.rowItemCenter}>
						{item.name == 'credit' ? 'WALLET' : item.name.toUpperCase()}
					</Text>
				</View>

				<View style={styles.flex1}>
					<Text style={styles.rowItemCenter}>{item.totalAmount !== null ? item.totalAmount.toFixed(2) : 0}</Text>
				</View>
			</View>
		);
	};

	showHeader = () => {
		return (
			<View style={styles.headerBackground}>
				<View style={styles.flex1}>
					<Text style={styles.headerItem, styles.leftMargin}>{'Product'.toUpperCase()}</Text>
				</View>
				<View style={styles.flex1}>
					<Text style={styles.headerItemCenter}>{i18n.t('quantity').toUpperCase()}</Text>
				</View>
				<View style={styles.flex1}>
					<Text style={styles.headerItemCenter}>{i18n.t('total-liters').toUpperCase()}</Text>
				</View>
				<View style={styles.flex1}>
					<Text style={styles.headerItemCenter}>{i18n.t('total-sales').toUpperCase()}</Text>
				</View>
			</View>
		);
	};

	showPaymentHeader = () => {
		return (
			<View style={styles.headerBackground}>
				<View style={styles.flex1}>
					<Text style={styles.headerItemCenter}>PAYMENT METHOD</Text>
				</View>
				<View style={styles.flex1}>
					<Text style={styles.headerItemCenter}>AMOUNT</Text>
				</View>
			</View>
		);
	};

	updateReport() {
		this.props.reportActions.GetSalesReportData(this.currentDate, this.previousDate);
	}
}

function mapStateToProps(state, props) {
	return {
		salesData: state.reportReducer.salesData,
		dateFilter: state.reportReducer.dateFilter,
		receiptsPaymentTypes: state.paymentTypesReducer.receiptsPaymentTypes,
		paymentTypes: state.paymentTypesReducer.paymentTypes,
		receipts: state.receiptReducer.receipts,
	};
}

function mapDispatchToProps(dispatch) {
	return { reportActions: bindActionCreators(reportActions, dispatch) };
}

//Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(SalesReport);

const styles = StyleSheet.create({

	flex2: {
		flex: 2
	},

	flex1: {
		flex: 1
	},

	mainCont: {
		flex: 1, backgroundColor: 'white'
	},

	saleTotals: {
		flex: .2,
		backgroundColor: 'white',
		marginLeft: 10,
		marginRight: 10,
		marginBottom: 10,
	},

	salesubconttotals:{
		flex: 1, flexDirection: 'row'
	},

	salesmaincont: {
		flex: .7, height: 90, borderRadius: 10, flexDirection: 'row', marginTop: 10, backgroundColor: '#2462a0', overflow: 'hidden', color: '#fff'
	},

	salestabs:{
		height: 90, flex: 1, color: '#fff'
	},

	salesBreakdown:{
		flex: .8, flexDirection: 'row', backgroundColor: 'white', marginLeft: 10, marginRight: 10, marginTop: 10,
	},

	headerItem: {
		fontWeight: "bold",
		fontSize: 18,
	},
	headerItemCenter: {
		fontWeight: "bold",
		fontSize: 18,
		textAlign: 'center'
	},
	rowItem: {
		fontSize: 16,
		paddingLeft: 10,
		paddingTop: 5,
		paddingBottom: 5
	},
	rowItemCenter: {
		fontSize: 16,
		paddingLeft: 10,
		paddingTop: 5,
		paddingBottom: 5,
		textAlign: 'center'
	},

	rowBackground: {
		backgroundColor: 'white',
		borderLeftWidth: 1,
		borderColor: '#f1f1f1',
		borderTopWidth: 1,
		borderBottomWidth: 1,
		borderRightWidth: 1,
		padding: 5,
		flex: 1, flexDirection: 'row', alignItems: 'center'
	},

	headerBackground: {
		backgroundColor: '#f1f1f1',
		borderColor: '#CCC',
		padding: 5,
		flex: 1,
		flexDirection: 'row',
		 height: 50, alignItems: 'center'
	},
	totalItem: {
		fontWeight: "bold",
		fontSize: 24,
		color: 'white',
		paddingLeft: 10,
	},
	totalLabel: {
		fontWeight: "bold",
		fontSize: 18,
		color: 'white',
		paddingLeft: 10,
	},
	totalItem6: {
		fontWeight: "bold",
		fontSize: 24,
		color: 'white',
		paddingLeft: 10,
		flex: .6
	},
	totalLabel4: {
		fontWeight: "bold",
		fontSize: 18,
		color: 'white',
		paddingLeft: 10,
		flex: .4
	},
	titleItem: {
		fontWeight: "bold",
		fontSize: 20
	},
	titleText: {
		backgroundColor: 'white',
		height: 36,
		flexDirection: 'row',

	},

	leftHeader: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center'

	},

	salespart:{
		flex: .6, padding: 10
	},

	paypart: {
		flex: .4, padding: 10
	}

});
