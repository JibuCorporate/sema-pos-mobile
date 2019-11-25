import React, { Component } from "react";
import { View, StyleSheet } from 'react-native';
import OrderProductScreen from "./OrderProductScreen";
import OrderPaymentScreen from "./OrderPaymentScreen";
import OrderSummaryScreen from "./OrderSummaryScreen";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import * as OrderActions from "../../actions/OrderActions";
import Events from "react-native-simple-events";
import PosStorage from "../../database/PosStorage";

class OrderView extends Component {
	constructor(props) {
		super(props);
	}

	render() {
		console.log('pendingSales', PosStorage.pendingSales);
		console.log('getReceipts', PosStorage.getReceipts());
		console.log('getSales', PosStorage.getSales());

		PosStorage.localOrders(this.lastSalesSync)
			.then(salesReceipts => {
				console.log('loadSalesReceipts', salesReceipts);
			})
			.catch(error => {				
				console.log('Synchronization.synchronizeSales - error ' + error);
			});


		return this.displayView();
	}

	componentDidMount() {
		Events.on('ProductsUpdated', 'productsUpdate2', this.onProductsUpdated.bind(this));
		Events.on('ProductMrpsUpdated', 'productMrpsUpdate1', this.onProductsUpdated.bind(this));
	}

	componentWillUnmount() {
		Events.rm('ProductsUpdated', 'productsUpdate2');
		Events.rm('ProductMrpsUpdated', 'productMrpsUpdate1');
		this.props.orderActions.ClearOrder();
	}

	onProductsUpdated() {
		this.forceUpdate();
	}

	displayView() {
		return (
			<View style={styles.orderView}>
				{this.getProductScreen()}
				{this.getPaymentScreen()}
				<OrderSummaryScreen />
			</View>
		);
	}

	getProductScreen() {
		return this.props.flow.page === 'products' ? <OrderProductScreen /> : null;
	}

	getPaymentScreen() {
		return this.props.flow.page === 'payment' ? <OrderPaymentScreen /> : null;
	}

}
function mapStateToProps(state) {
	return {
		flow: state.orderReducer.flow,
		selectedCustomer: state.customerReducer.selectedCustomer
	};
}

function mapDispatchToProps(dispatch) {
	return { orderActions: bindActionCreators(OrderActions, dispatch) };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderView);

const styles = StyleSheet.create({
	orderView: {
		flex: 1,
		backgroundColor: "#ABC1DE",
		flexDirection: 'row'
	}
});
