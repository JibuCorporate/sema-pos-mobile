import React from 'react';
import { View } from 'react-native';
import orderItemStyles from './orderItemStyles';
import OrderSummary from './orderSummary';
import OrderItems from './orderItems';
import OrderCheckOut from './orderCheckOut';

if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	whyDidYouRender(React, {
		trackAllPureComponents: true
	});
}
class OrderSummaryScreen extends React.PureComponent {
	static whyDidYouRender = true;

	render() {
		return (
			<View style={orderItemStyles.orderSideBar}>
				<OrderSummary />
				<OrderItems />
				<OrderCheckOut />
			</View>
		);
	}
}
export default OrderSummaryScreen;
