import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ProductListScreen from './ProductListScreen';
import OrderSummaryScreen from './OrderSummaryScreen';
import * as OrderActions from '../../actions/OrderActions';
import { colors } from '../../styles/sema_colors';

if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	whyDidYouRender(React, {
		trackAllPureComponents: true
	});
}

const styles = StyleSheet.create({
	orderView: {
		backgroundColor: colors.darkBlue,
		flex: 1,
		flexDirection: 'row'
	}
});
class OrderView extends React.PureComponent {
	static whyDidYouRender = true;

	componentWillUnmount() {
		const { orderActions } = this.props;
		orderActions.ClearOrder();
	}

	render() {
		return (
			<View style={styles.orderView}>
				<ProductListScreen />
				<OrderSummaryScreen />
			</View>
		);
	}
}

function mapDispatchToProps(dispatch) {
	return {
		orderActions: bindActionCreators(OrderActions, dispatch)
	};
}

export default connect(null, mapDispatchToProps)(OrderView);
