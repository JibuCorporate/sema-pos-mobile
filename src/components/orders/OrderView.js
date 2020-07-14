import React from "react";
if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	whyDidYouRender(React, {
		trackAllPureComponents: true,
	});
}
import { View, StyleSheet } from 'react-native';
import ProductListScreen from './ProductListScreen';
import OrderSummaryScreen from "./OrderSummaryScreen";
import * as OrderActions from "../../actions/OrderActions";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
class OrderView extends React.PureComponent {
	constructor(props) {
		super(props);
	}
	static whyDidYouRender = true;

	render() {
		return (
			<View style={styles.orderView}>
				<ProductListScreen />
				<OrderSummaryScreen/>
			</View>
		);
	}

	componentWillUnmount() {
		this.props.orderActions.ClearOrder();
	}

}
 
function mapDispatchToProps(dispatch) {
	return {
		orderActions: bindActionCreators(OrderActions, dispatch),
	};
}

export default connect(null, mapDispatchToProps)(OrderView);

const styles = StyleSheet.create({
	orderView: {
		flex: 1,
		backgroundColor: "#ABC1DE",
		flexDirection: 'row'
	}
});
