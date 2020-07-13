import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import customSiderBarStyles from './customSidebarMenu.styles';
import { colors } from '../styles/sema_colors';

const txtStyle = StyleSheet.create({
	drawerSty: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop: 10,
		paddingBottom: 10,
		backgroundColor: colors.gray
	},
	txtCol: {
		color: colors.black,
		fontSize: 15
	}
});

export default class SideBarButton extends React.PureComponent {
	handleOnPress() {
		const {  item, onLogout, onSynchronize, navigation } = this.props;
		console.log('item',item)
		requestAnimationFrame(() => {
			global.currentScreenIndex = item.screenToNavigate;
			if (item.screenToNavigate === 'LogOut') {
				onLogout();
			}

			if (item.screenToNavigate === 'Sync') {
				onSynchronize();
			}

			if (item.screenToNavigate !== 'LogOut' && item.screenToNavigate !== 'Sync') {
				navigation.navigate(item.screenToNavigate);
			}
		});
	}

	render() {
		const { item } = this.props;
		return (
			<TouchableOpacity style={txtStyle.drawerSty} onPress={this.handleOnPress.bind(this)}>
				<View style={customSiderBarStyles.viewMargins}>
					<Icon name={item.navOptionThumb} size={25} color="#808080" />
				</View>
				<Text style={txtStyle.txtCol}>{item.navOptionName}</Text>
			</TouchableOpacity>
		);
	}
}
