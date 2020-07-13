import { StyleSheet } from 'react-native';

import { colors } from '../styles/sema_colors';

export default StyleSheet.create({
	headerCont: {
		flexDirection: 'row'
	},

	iconStyle: {
		marginRight: 20
	},

	iconsContainer: {
		flex: 1,
		flexDirection: 'row',
		marginTop: 15
	},

	inputdpn: {
		color: colors.white,
		flex: 0.8
	},

	pickerCont: {
		flex: 1,
		marginTop: 12
	},

	pickerdpn: {
		color: colors.white,
		height: 50,
		width: 200
	}
});
