import { StyleSheet } from 'react-native';
import { colors } from '../styles/sema_colors';

export default StyleSheet.create({
	cont: {
		flexDirection: 'row'
	},
	custpicker: {
		flex: 1,
		marginTop: 12
	},
	drawerIcon: {
		height: 30,
		marginLeft: 10,
		paddingRight: 20,
		width: 50
	},
	rowdir: {
		flexDirection: 'row'
	},
	smropicker: {
		alignContent: 'flex-end',
		color: colors.white,
		height: 50,
		width: 190
	}
});
