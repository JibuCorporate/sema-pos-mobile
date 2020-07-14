import React from "react";
if (process.env.NODE_ENV === 'development') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
        trackAllPureComponents: true,
    });
}
import { View,  StyleSheet} from "react-native";
import orderItemStyles from "./orderItemStyles";
import AppContext from '../../context/app-context';
import OrderSummary from './orderSummary';
import OrderItems from './orderItems';
import OrderCheckOut from './orderCheckOut';
class OrderSummaryScreen extends React.PureComponent {
	static contextType = AppContext;
	constructor(props) {
		super(props);
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


export default OrderSummaryScreen;

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


