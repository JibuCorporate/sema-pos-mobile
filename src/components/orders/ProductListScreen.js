import React from 'react';
import {
	View,
	Text,
	FlatList,
	StyleSheet,
	Image,
	Dimensions,
	TouchableOpacity
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import randomMC from 'random-material-color';
import ProductMRPRealm from '../../database/productmrp/productmrp.operations';
import ProductsRealm from '../../database/products/product.operations';
import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';
import * as ProductActions from '../../actions/ProductActions';
import * as OrderActions from '../../actions/OrderActions';
import AppContext from '../../context/app-context';
import { colors } from '../../styles/sema_colors';

if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	whyDidYouRender(React, {
		trackAllPureComponents: true
	});
}

const newStyle = (viewWidth) =>
	StyleSheet.create({
		heights: {
			flex: 1,
			height: viewWidth / 4,
			width: viewWidth / 4
		}
	});

const styles = StyleSheet.create({
	container: {
		borderColor: colors.darkBlue,
		borderTopWidth: 5,
		flex: 1
	},

	darkBackground: {
		backgroundColor: colors.darkBlue
	},

	flexOne: {
		flex: 1
	},

	imageLabel: {
		color: colors.white,
		fontWeight: 'bold',
		paddingBottom: 5,
		paddingTop: 5,
		textAlign: 'center'
	},

	lightBackground: {
		backgroundColor: colors.darkBlue
	}
});

class ProductListScreen extends React.PureComponent {
	static contextType = AppContext;

	static whyDidYouRender = true;

	constructor(props) {
		super(props);
		const { width } = Dimensions.get('window');
		// Empirically we know that this view has flex of 1 and the view beside it,
		// (OrderSummaryScreen has a flex of .6 This makes the width of this view 1/1.6 * screen width
		// Since there is no way to dynamilcally determine view width until the layout is complete, use
		// this to set width. (Note this will break if view layout changes
		this.viewWidth = (1 / 1.6) * width;
		// this.salesChannel;
		// this.state = {
		// 	salesChannel: SalesChannelRealm.getSalesChannelFromId(this.context.selectedCustomer.salesChannelId)
		// }
	}

	handleOnPress = (item) => {
		requestAnimationFrame(() => {
			const { orderActions } = this.props;
			const unitPrice = this.getItemPrice(item);
			orderActions.AddProductToOrder(item, 1, unitPrice);
		});
	};

	getItemPrice = (item) => {
		const { selectedCustomer } = this.context;
		const salesChannel = SalesChannelRealm.getSalesChannelFromName(
			SalesChannelRealm.getSalesChannelFromId(selectedCustomer.salesChannelId).name
		);
		if (salesChannel) {
			const productMrp = ProductMRPRealm.getFilteredProductMRP()[
				ProductMRPRealm.getProductMrpKeyFromIds(item.productId, salesChannel.id)
			];
			if (productMrp) {
				return productMrp.priceAmount;
			}
		}
		return item.priceAmount; // Just use product price
	};

	_renderItem = ({ item, index, separators }) => {
		return (
			<TouchableOpacity
				onPress={() => this.handleOnPress(item)}
				onShowUnderlay={separators.highlight}
				onHideUnderlay={separators.unhighlight}>
				<View style={[this.getItemBackground(index), newStyle(this.viewWidth).heights]}>
					<Image
						source={{ uri: this.getImage(item) }}
						resizeMethod="scale"
						style={styles.flexOne}
					/>
					<Text style={[styles.imageLabel, this.getLabelBackground(item.categoryId)]}>
						{item.description}
						{'\n'}
						{this.getItemPrice(item)}
					</Text>
				</View>
			</TouchableOpacity>
		);
	};

	prepareData = () => {
		const productMrp = ProductMRPRealm.getFilteredProductMRP();
		const ids = Object.keys(productMrp).map((key) => productMrp[key].productId);
		return ProductsRealm.getProducts().filter((prod) => ids.includes(prod.productId));
	};

	getImage = (item) => {
		return item.base64encodedImage;
	};

	getItemBackground = (index) => {
		return index % 2 === 0 ? styles.lightBackground : styles.darkBackground;
	};

	getLabelBackground = (categoryId) => {
		const { selectedCustomer } = this.context;
		return {
			backgroundColor: `${randomMC.getColor({
				text: `${categoryId}-${
					SalesChannelRealm.getSalesChannelFromId(selectedCustomer.salesChannelId).name
				}`
			})}`
		};
	};

	render() {
		const { selectedCustomer } = this.context;
		if (SalesChannelRealm.getSalesChannelFromId(selectedCustomer.salesChannelId)) {
			return (
				<View style={styles.container}>
					<FlatList
						data={this.prepareData()}
						renderItem={this._renderItem}
						keyExtractor={(item) => item.productId}
						numColumns={4}
						horizontal={false}
					/>
				</View>
			);
		}
		return null;
	}
}

function mapStateToProps(state) {
	return {
		selectedCustomer: state.customerReducer.selectedCustomer,
		channel: state.orderReducer.channel,
		products: state.productReducer.products
	};
}

function mapDispatchToProps(dispatch) {
	return {
		productActions: bindActionCreators(ProductActions, dispatch),
		orderActions: bindActionCreators(OrderActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductListScreen);
