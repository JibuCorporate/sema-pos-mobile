import React from "react";
// if (process.env.NODE_ENV === 'development') {
//     const whyDidYouRender = require('@welldone-software/why-did-you-render');
//     whyDidYouRender(React, {
//         trackAllPureComponents: true,
//     });
// }
import { View, StyleSheet } from 'react-native';
import ProductListScreen from './ProductListScreen';
import OrderSummaryScreen from "./OrderSummaryScreen";
import * as OrderActions from "../../actions/OrderActions";

import * as CustomerActions from "../../actions/CustomerActions";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import AppContext from '../../context/app-context';

class OrderView extends React.PureComponent {
	constructor(props) {
		super(props);
	}
	static contextType = AppContext;
	// static whyDidYouRender = true;

	render() {
		return (
			<View style={styles.orderView}>
				<ProductListScreen />
				<OrderSummaryScreen />
			</View>
		);
	}

	componentWillUnmount() {
		this.props.orderActions.ClearOrder();
	}

}
function mapStateToProps(state) {
	return {
		selectedCustomer: state.customerReducer.selectedCustomer
	};
}
function mapDispatchToProps(dispatch) {
	return {
		orderActions: bindActionCreators(OrderActions, dispatch),
		customerActions: bindActionCreators(CustomerActions, dispatch),
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderView);

const styles = StyleSheet.create({
	orderView: {
		flex: 1,
		backgroundColor: "#ABC1DE",
		flexDirection: 'row'
	}
});
