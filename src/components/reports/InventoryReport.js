import React from 'react';
if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	whyDidYouRender(React);
}
import { Text, View, StyleSheet, TouchableHighlight, FlatList, Modal, TextInput } from 'react-native';
import { bindActionCreators } from "redux";
import * as WastageActions from "../../actions/WastageActions";
import * as ProductActions from "../../actions/ProductActions";
import * as InventoryActions from '../../actions/InventoryActions';
import { connect } from "react-redux";
import DateFilter from "./DateFilter";
import InventroyRealm from "../../database/inventory/inventory.operations";

import { isSameDay } from 'date-fns';

import i18n from '../../app/i18n';
class InventoryEdit extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = { inventoryQuantity: this.props.quantity };
		this.quantityInput = React.createRef();
	}




	render() {
		return (
			<Modal visible={this.isVisible()}
				transparent={true}
				onRequestClose={this.closeCurrentSkuHandler.bind(this)}>
				<View style={{ justifyContent: 'center', alignItems: 'center' }}>

					<View style={[styles.editInventory]}>
						<View>
							<Text style={{ fontSize: 24, fontWeight: 'bold' }}>{this.props.headerTitle}</Text>
						</View>
						<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
							<Text style={{ fontSize: 18, fontWeight: 'bold', flex: .7, paddingLeft: 20 }}>{this.props.title}</Text>
							<TextInput
								reference='quantityInput'
								style={[styles.inventoryInput, { flex: .5, paddingRight: 40, marginRight: 20 }]}
								underlineColorAndroid='transparent'
								onSubmitEditing={() => this.props.okMethod(this.props.wastageName, this.state.inventoryQuantity)}
								keyboardType='decimal-pad'
								onChangeText={this.onChangeText.bind(this)}
								value={this.state.inventoryQuantity}
								ref={this.quantityInput}
								autoFocus={true}
								placeholder="Current Value">

							</TextInput>
						</View>
						<View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
							<View style={{ backgroundColor: "#2858a7", borderRadius: 10, flex: .3 }}>
								<TouchableHighlight underlayColor='#c0c0c0' onPress={() => {
									this.props.okMethod(this.props.wastageName, this.state.inventoryQuantity);
								}}>
									<Text style={styles.buttonText}>{i18n.t('ok')}</Text>
								</TouchableHighlight>
							</View>
							<View style={{ flex: .1, backgroundColor: 'white' }}>
							</View>
							<View style={{ backgroundColor: "#2858a7", borderRadius: 10, flex: .3 }}>
								<TouchableHighlight underlayColor='#c0c0c0' onPress={() => this.props.cancelMethod()}>
									<Text style={styles.buttonText}>{i18n.t('cancel')}</Text>
								</TouchableHighlight>
							</View>
						</View>
					</View>
				</View>
			</Modal>
		);

	}
	closeCurrentSkuHandler() {
		this.props.cancelMethod();
	};
	isVisible() {
		if (this.props.type === "wastageName") {
			return this.props.skuToShow === this.props.wastageName;
		} else if (this.props.type === "currentMeter") {
			return this.props.visible;
		} else {
			return false;
		}
	}
	onChangeText = (text) => {
		this.setState({ inventoryQuantity: text });
	}

}


class InventoryReport extends React.PureComponent {
	constructor(props) {
		super(props);

		// this.startDate = new Date();
		// this.endDate = this.addDays(new Date(), 1);
		let currentDate = new Date();
		this.startDate = null;
		this.endDate = null;
		this.state = {
			currentSkuEdit: "",
			notDispatchedEdit: "",
			refresh: false,
			currentMeterVisible: false
		};
	}




	addDays = (theDate, days) => {
		return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
	};

	render() {
		return (
			<View style={{ flex: 1 }}>
				<View style={{ flex: .1, flexDirection: 'row' }}>
					<DateFilter />
				</View>

				<View style={{ flex: .65, backgroundColor: 'white', marginLeft: 10, marginRight: 10, marginTop: 10 }}>
					<View style={{ flex: 1, flexDirection: 'row' }}>
						<FlatList
							style={{ flex: .5 }}
							data={this.getInventoryData()}
							extraData={this.state.refresh}
							ListHeaderComponent={this.showHeader}
							renderItem={({ item, index, separators }) => (
								<View>
									{this.getRow(item, index, separators)}
								</View>
							)}
							keyExtractor={item => item.wastageName}
							initialNumToRender={50}
						/>

						<View style={[{ flex: .5, padding: 5 }]}>
							<View style={{ flex: .3, flexDirection: 'row', alignItems: "center" }}>
								<Text style={[styles.totalItem, { flex: .45 }]}>{i18n.t('opening-meter')}</Text>
								<Text style={[styles.rowItemCenter, {
									flex: .55,
									borderRadius: 5,
									fontSize: 25,
									fontWeight: 'bold',
									backgroundColor: '#CCC'
								}]}>{this.getInventoryMeterForDisplay(false)}</Text>
							</View>
							<View style={[{ flex: .3, flexDirection: 'row', alignItems: "center" }]}>
								<Text style={[styles.totalItem, { flex: .45 }]}>{i18n.t('closing-meter')}</Text>
								{this.getCurrentMeter()}
								<InventoryEdit
									type="currentMeter"
									visible={this.state.currentMeterVisible}
									wastageName={""}
									headerTitle="Closing Meter"
									title="Closing Meter"
									quantity={this.getInventoryCurrentMeterForEdit()}
									cancelMethod={this.onCancelCurrentMeter.bind(this)}
									okMethod={this.onOkCurrentMeter.bind(this)}>
								</InventoryEdit>
							</View>
						</View>


					</View>
				</View>

				<View style={{
					flex: .25,
					backgroundColor: '#2462a0',
					color: '#fff',
					borderRadius: 8,
					marginLeft: 10,
					marginRight: 10,
					marginBottom: 10,
				}}>
					<View style={{
						flex: 1,
						borderRadius: 10,
						flexDirection: 'row',
						marginTop: 10,
						overflow: 'hidden',
						color: '#fff'
					}}>
						<View style={{ flex: .33, color: '#fff', padding: 10 }} >
							<Text style={[styles.totalLabel, { flex: .25, fontWeight: 'bold', color: '#fff' }]}>{i18n.t('output').toUpperCase()}</Text>
							<Text style={[styles.totalLabel, { flex: .25, color: '#fff', padding: 5 }]}> ({i18n.t('sales')} + {i18n.t('inventory')} +  {i18n.t('not-dispatched').toLowerCase()})</Text>
							<Text style={[styles.totalItem, { flex: .5, fontSize: 28, color: '#fff' }]}>{this.getOutput()}</Text>
						</View>
						<View style={{ flex: .33, color: '#fff', padding: 10 }} >
							<Text style={[styles.totalLabel, { flex: .25, fontWeight: 'bold', color: '#fff' }]}>{i18n.t('total-production').toUpperCase()}</Text>
							<Text style={[styles.totalLabel, { flex: .25, color: '#fff', padding: 5 }]}> (Closing Meter - Opening Meter)</Text>
							<Text style={[styles.totalItem, { flex: .5, fontSize: 28, color: '#fff' }]}>{this.getTotalProduction()}</Text>
						</View>
						<View style={{ flex: .33, color: '#fff', padding: 10 }} >
							<Text style={[styles.totalLabel, { flex: .25, fontWeight: 'bold', color: '#fff' }]}>{i18n.t('wastage').toUpperCase()}</Text>
							<Text style={[styles.totalLabel, { flex: .25, color: '#fff', padding: 5 }]}> (Production - Output) %</Text>
							<Text style={[styles.totalItem, { flex: .5, fontSize: 28, color: '#fff' }]}>{this.getWastage()}</Text>
						</View>
					</View>
				</View>

			</View>
		);
	}

	getInventoryCurrentMeterForEdit() {
		let value = null
		if (this.props.wastageData.hasOwnProperty("inventory")) {
			value = this.props.wastageData.inventory.currentMeter;
		}
		if (value == null) return "";
		else return value.toFixed(2);
	}

	getInventoryData() {
		if (this.props.dateFilter.hasOwnProperty("startDate") && this.props.dateFilter.hasOwnProperty("endDate")) {
			if (isSameDay(this.props.dateFilter.startDate, this.startDate) && isSameDay(this.props.dateFilter.endDate, this.endDate)) {
				return this.props.wastageData.salesAndProducts.salesItems;
			} else {
				this.startDate = this.props.dateFilter.startDate;
				this.endDate = this.props.dateFilter.endDate;
				this.props.wastageActions.GetInventoryReportData(this.startDate, this.endDate, this.props.products);
				return this.props.wastageData.salesAndProducts.salesItems;
			}
		}
	}


	getTotalLiters() {
		if (this.props.wastageData.salesAndProducts.totalLiters && this.props.wastageData.salesAndProducts.totalLiters !== 'N/A') {
			return this.props.wastageData.salesAndProducts.totalLiters.toFixed(2) + ' L';
		} else {
			return '-';
		}

	}

	getItemTotalLiters(item) {
		if (item.totalLiters && item.totalLiters !== 'N/A') {
			return `${item.totalLiters.toFixed(2)} L`;
		}
		return 'N/A';
	}

	getItemLitersPerSku(item) {
		if (item.litersPerSku && item.litersPerSku !== 'N/A') {
			return `${item.litersPerSku} L`;
		}
		return 'N/A';
	}

	getRow = (item) => {
		return (
			<View style={[{ flex: 1, flexDirection: 'row', alignItems: 'center' }, styles.rowBackground]}>
				<View style={[{ flex: 1 }]}>
					<Text numberOfLines={1} style={[styles.rowItem, styles.leftMargin]}>{item.wastageName}</Text>
				</View>
				<View style={[{ flex: .5 }]}>
					<Text style={[styles.rowItemCenter]}>{item.quantity}</Text>
				</View>

				{this.getCurrentInventory(item)}
				{this.getCurrentNotDispatched(item)}

				<InventoryEdit
					type="wastageName"
					skuToShow={this.state.currentSkuEdit}
					wastageName={item.wastageName}
					headerTitle="Closing Stock"
					title={item.wastageName}
					quantity={this.getInventorySkuForEdit(true, item)}
					cancelMethod={this.onCancelEditCurrentSku.bind(this)}
					okMethod={this.onOkEditCurrentSku.bind(this)}>
				</InventoryEdit>

				<InventoryEdit
					type="wastageName"
					skuToShow={this.state.notDispatchedEdit}
					wastageName={item.wastageName}
					title={item.wastageName}
					headerTitle="Not Dispatched"
					quantity={this.getNotDispatchedEdit(true, item)}
					cancelMethod={this.onCancelNotDispatchedEdit.bind(this)}
					okMethod={this.onOkNotDispatchedEdit.bind(this)}>
				</InventoryEdit>
			</View>
		);
	};

	getInventorySkuForEdit(currentPrev, item) {
		let value = this.getInventorySkuForDisplay(currentPrev, item);
		if (value == '-') return "";
		else return value.toFixed(2);
	}

	getNotDispatchedEdit(currentPrev, item) {
		let value = this.getNotDispatchedSkuForDisplay(currentPrev, item);
		if (value == '-') return "";
		else return value.toFixed(2);
	}

	onCancelEditCurrentSku() {
		this.setState({ currentSkuEdit: "" });
		this.setState({ refresh: !this.state.refresh });
	}


	onCancelNotDispatchedEdit() {
		this.setState({ notDispatchedEdit: "" });
		this.setState({ refresh: !this.state.refresh });
	}

	onOkNotDispatchedEdit(wastageName, newQuantity) {
		this.setState({ notDispatchedEdit: "" });
		let update = null;
		if (newQuantity.trim().length > 0) {
			update = parseInt(newQuantity);
		}

		if (Number(update) > 0) {
			let checkWastageName = this.props.wastageData.inventory.currentProductSkus.filter(element =>
				element.wastageName === wastageName
			);
			if (checkWastageName.length > 0) {
				InventroyRealm.createInventory({
					type: 'notdispatched',
					closingStockId: checkWastageName[0].closingStockId,
					notDispatched: update,
					kiosk_id: this.props.settings.siteId,
					product_id: wastageName,
					wastageName: wastageName
				},
					this.props.dateFilter.startDate);
			} else if (checkWastageName.length === 0) {
				InventroyRealm.createInventory({
					type: 'notdispatched',
					notDispatched: update,
					kiosk_id: this.props.settings.siteId,
					product_id: wastageName,
					wastageName: wastageName
				},
					this.props.dateFilter.startDate);
			}
			this.props.wastageActions.GetInventoryReportData(this.startDate, this.endDate, this.props.products);
			this.setState({ refresh: true });
		} else {
			// TODO - Show alert
		}
	}

	onOkEditCurrentSku(wastageName, newQuantity) {
		this.setState({ currentSkuEdit: "" });
		let update = null;
		if (newQuantity.trim().length > 0) {
			update = parseInt(newQuantity);
		}
		if (Number(update) > 0) {
			let checkWastageName = this.props.wastageData.inventory.currentProductSkus.filter(element =>
				element.wastageName === wastageName
			);
			if (checkWastageName.length > 0) {
				InventroyRealm.createInventory({
					type: 'closing',
					closingStockId: checkWastageName[0].closingStockId,
					inventory: update,
					quantity: update,
					kiosk_id: this.props.settings.siteId,
					product_id: wastageName,
					wastageName: wastageName
				},
					this.props.dateFilter.startDate);
			} else if (checkWastageName.length === 0) {
				InventroyRealm.createInventory({
					type: 'closing',
					inventory: update,
					quantity: update,
					kiosk_id: this.props.settings.siteId,
					product_id: wastageName,
					wastageName: wastageName
				},
					this.props.dateFilter.startDate);
			}
			this.props.wastageActions.GetInventoryReportData(this.startDate, this.endDate, this.props.products);
			this.setState({ refresh: true });
		} else {
			// TODO - Show alert
		}
	}

	showHeader = () => {
		return (
			<View
				style={[{ flex: 1, flexDirection: 'row', height: 50, alignItems: 'center' }, styles.headerBackground]}>
				<View style={[{ flex: 1 }]}>
					<Text style={[styles.headerItem, styles.leftMargin]}>PRODUCT</Text>
				</View>
				<View style={[{ flex: 1 }]}>
					<Text style={[styles.headerItemCenter]}>QUANTITY SOLD</Text>
				</View>
				<View style={[{ width: 20 }]} />
				<View style={[{ flex: 1 }]}>
					<Text style={[styles.headerItemCenter]}>{i18n.t('closing-stock').toUpperCase()}</Text>
				</View>
				<View style={[{ flex: 1 }]}>
					<Text style={[styles.headerItemCenter]}>{i18n.t('not-dispatched').toUpperCase()}</Text>
				</View>
			</View>
		);
	};


	getCurrentInventory(item) {
		return (
			<View style={[{ flex: .7 }]}>
				<TouchableHighlight
					style={styles.currentInventory}
					onPress={() => this.displayEditCurrentSku(item.wastageName)}
					underlayColor='#18376A'>
					<Text style={[styles.currentInventoryText, { padding: 5 }]}>{this.getInventorySkuForDisplay(true, item)}</Text>
				</TouchableHighlight>
			</View>
		);
	}


	getCurrentNotDispatched(item) {
		return (
			<View style={[{ flex: .7 }]}>
				<TouchableHighlight
					style={styles.currentInventory}
					onPress={() => this.displayNotDispatcheModal(item.wastageName)}
					underlayColor='#18376A'>
					<Text style={[styles.currentInventoryText, { padding: 5 }]}>{this.getNotDispatchedSkuForDisplay(true, item)}</Text>
				</TouchableHighlight>
			</View>
		);
	}

	getNotDispatchedSkuForDisplay(currentPrev, item) {
		let inventoryArray = (currentPrev) ? this.props.wastageData.inventory.currentProductSkus : this.props.wastageData.inventory.previousProductSkus;
		for (let index = 0; index < inventoryArray.length; index++) {
			if (inventoryArray[index].wastageName === item.wastageName) {
				if (inventoryArray[index].notDispatched != null && !isNaN(inventoryArray[index].notDispatched)) {
					return inventoryArray[index].notDispatched;
				}
				break;
			}
		}
		return 0;		// No data
	}

	getInventorySkuForDisplay(currentPrev, item) {
		let inventoryArray = (currentPrev) ? this.props.wastageData.inventory.currentProductSkus : this.props.wastageData.inventory.previousProductSkus;
		for (let index = 0; index < inventoryArray.length; index++) {
			if (inventoryArray[index].wastageName === item.wastageName) {
				if (inventoryArray[index].inventory != null && !isNaN(inventoryArray[index].inventory)) {
					return inventoryArray[index].inventory;
				}
				break;
			}
		}
		return 0;		// No data
	}

	getTotalForSkuDisplay(item) {
		if (!item.litersPerSku || item.litersPerSku === 'N/A') return '-';
		let current = this.getInventorySkuForDisplay(true, item);
		if (current == '-') return '-';
		let previous = this.getInventorySkuForDisplay(false, item);
		if (previous == '-') return '-';
		return `${((current - previous) * item.litersPerSku).toFixed(2)} L`;
	}


	getTotalForSkuDisplayNotDispatched(item) {
		if (!item.litersPerSku || item.litersPerSku === 'N/A') return '-';
		let current = this.getNotDispatchedSkuForDisplay(true, item);
		if (current == '-') return '-';
		let previous = this.getNotDispatchedSkuForDisplay(false, item);
		if (previous == '-') return '-';
		return `${((current - previous) * item.litersPerSku).toFixed(2)} L`;
	}

	getTotalInventory() {
		try {
			let result = 0;
			let valid = false;
			for (let index = 0; index < this.props.wastageData.salesAndProducts.salesItems.length; index++) {
				let inventoryItem = this.getTotalForSkuDisplay(this.props.wastageData.salesAndProducts.salesItems[index]);
				if (inventoryItem != '-') {
					valid = true;
					result += parseFloat(inventoryItem);
				}
			}
			if (valid) {
				return result.toFixed(2) + ' L';
			} else {
				return '-';
			}
		} catch (error) {

		}
		return '-';
	}


	getTotalNotDispatched() {
		try {
			let result = 0;
			let valid = false;
			for (let index = 0; index < this.props.wastageData.salesAndProducts.salesItems.length; index++) {
				let inventoryItem = this.getTotalForSkuDisplayNotDispatched(this.props.wastageData.salesAndProducts.salesItems[index]);
				if (inventoryItem != '-') {
					valid = true;
					result += parseFloat(inventoryItem);
				}
			}
			if (valid) {
				return result.toFixed(2) + ' L';
			} else {
				return '-';
			}
		} catch (error) {

		}
		return '-';
	}

	getOutput() {
		let sales = 0;
		let inventory = 0;
		let notDispatched = 0;
		let totalSales = this.getTotalLiters();
		let getTotalInventory = this.getTotalInventory();
		let getTotalNotDispatched = this.getTotalNotDispatched();
		if (totalSales == '-' && getTotalInventory == '-' && getTotalNotDispatched == '-') {
			return '-';
		}
		if (totalSales != '-') {
			sales = parseFloat(totalSales);
		}
		if (getTotalInventory != '-') {
			inventory = parseFloat(getTotalInventory);
		}
		if (getTotalNotDispatched != '-') {
			notDispatched = parseFloat(getTotalNotDispatched);
		}
		return (sales + inventory + notDispatched).toFixed(2) + ' L';
	}

	displayEditCurrentSku(wastageName) {
		this.setState({ currentSkuEdit: wastageName });
		this.setState({ refresh: !this.state.refresh });
	}

	displayNotDispatcheModal(wastageName) {
		this.setState({ notDispatchedEdit: wastageName });
		this.setState({ refresh: !this.state.refresh });
	}


	getCurrentMeter(value) {
		return (
			<View style={[{ flex: .6 }]}>
				<TouchableHighlight
					style={styles.currentInventory}
					onPress={() => { this.displayCurrentMeter() }}
					underlayColor='#18376A'>
					<Text style={[styles.currentInventoryText, { padding: 5, fontWeight: 'bold', fontSize: 25 }]}>{this.getInventoryMeterForDisplay(true)}</Text>
				</TouchableHighlight>
			</View>
		);
	}

	getInventoryMeterForDisplay(currentPrev) {
		let meter = 0;
		if (this.props.wastageData.hasOwnProperty("inventory")) {
			meter = (currentPrev) ? this.props.wastageData.inventory.currentMeter : this.props.wastageData.inventory.previousMeter;
		}

		if (meter != null && !isNaN(meter)) {
			return meter.toFixed(2) + ' L';
		} else {
			return 0;		// No data
		}
	}

	getTotalProduction() {
		let current = this.getInventoryMeterForDisplay(true);
		let previous = this.getInventoryMeterForDisplay(false);
		if (current == '-' || previous == '-') {
			return '-'
		} else {
			return (parseFloat(current) - parseFloat(previous)).toFixed(2) + ' L';
		}
	}

	getWastage() {
		let totalProduction = this.getTotalProduction();
		let output = this.getOutput();
		if (totalProduction == '-' || output == '-') {
			return 'N/A'
		} else {
			if (parseFloat(totalProduction) == 0) {
				return 'N/A'
			}
			let wastage = ((parseFloat(totalProduction) - parseFloat(output)) / parseFloat(totalProduction) * 100);
			if (isNaN(wastage)) {
				return 'N/A'
			} else {
				return wastage.toFixed(2) + ' %';
			}
		}

	}

	displayCurrentMeter() {
		this.setState({ currentMeterVisible: true });

	}

	onCancelCurrentMeter() {
		this.setState({ currentMeterVisible: false });

	}

	onOkCurrentMeter(wastageName, newQuantity) {
		this.setState({ currentMeterVisible: false });
		let update = null;
		if (newQuantity.trim().length > 0) {
			update = parseFloat(newQuantity);
		}
		if (!isNaN(update)) {
			this.props.wastageData.inventory.currentMeter = update;
			InventroyRealm.createMeterReading(this.props.wastageData.inventory, update, this.props.dateFilter.startDate, this.props.settings.siteId);
			this.setState({ refresh: !this.state.refresh });
		} else {
			// TODO - Show alert
		}
	}
}

function mapStateToProps(state, props) {
	return {
		wastageData: state.wastageReducer.inventoryData,
		products: state.productReducer.products,
		dateFilter: state.reportReducer.dateFilter,
		settings: state.settingsReducer.settings
	};
}

function mapDispatchToProps(dispatch) {
	return {
		wastageActions: bindActionCreators(WastageActions, dispatch),
		productActions: bindActionCreators(ProductActions, dispatch),
		inventoryActions: bindActionCreators(InventoryActions, dispatch),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(InventoryReport);
const styles = StyleSheet.create({

	headerItem: {
		fontWeight: "bold",
		fontSize: 18
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
		padding: 5
	},

	headerBackground: {
		backgroundColor: 'white'
	},
	totalItem: {
		fontWeight: "bold",
		fontSize: 18,
		paddingLeft: 10,
	},
	titleItem: {
		fontWeight: "bold",
		fontSize: 20
	},
	titleText: {
		backgroundColor: 'white',
		height: 25,
		flexDirection: 'row',

	},
	leftHeader: {
		flexDirection: 'row',
		flex: .62,
		alignItems: 'center'

	},
	rightHeader: {
		flexDirection: 'row-reverse',
		flex: .38,
		alignItems: 'center',
		justifyContent: 'flex-end'

	},
	titleContent: {
		backgroundColor: 'white',
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	leftContent: {
		flexDirection: 'row',
		flex: .6,
		alignItems: 'center'

	},
	rightContent: {
		flexDirection: 'row-reverse',
		flex: .38,
		alignItems: 'center'

	},

	currentInventory: {
		marginRight: 2,
		marginLeft: 2,
		// marginTop:2,
		// paddingTop:2,
		// paddingBottom:2,
		backgroundColor: '#2858a7',
		borderRadius: 5,
		borderWidth: 1,
		borderColor: '#fff'
	},
	currentInventoryText: {
		fontSize: 16,
		color: '#fff',
		textAlign: 'center',
	},
	production: {
		fontWeight: "bold",
		fontSize: 24,
	},
	editInventory: {
		height: 300,
		width: 500,
		justifyContent: 'space-evenly',
		alignItems: 'center',
		backgroundColor: 'white',
		borderColor: "#2858a7",
		borderWidth: 5,
		borderRadius: 10
	},
	buttonText: {
		fontWeight: 'bold',
		fontSize: 28,
		color: 'white',
		textAlign: 'center',
		// width:180
	},
	inventoryInput: {
		textAlign: 'left',
		height: 50,
		width: 100,
		borderWidth: 2,
		fontSize: 20,
		borderColor: '#404040',
	}
});
