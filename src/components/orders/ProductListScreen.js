
import { StyleSheet } from 'react-native';

export const newStyle = (viewWidth) => StyleSheet.create({
	heights: {
		flex: 1,
		height: viewWidth / 4,
		width: viewWidth / 4
	}
});

export const productListStyles = StyleSheet.create({
	container: {
		flex: 1,
		borderColor: '#ABC1DE',
		borderTopWidth: 5
	},

	flexOne: {
		flex: 1,
	},

	imageLabel: {
		fontWeight: 'bold',
		paddingTop: 5,
		paddingBottom: 5,
		textAlign: 'center',
		color: 'white'
	},

	lightBackground: {
		backgroundColor: '#ABC1DE'
	},

	darkBackground: {
		backgroundColor: '#ABC1DE'
	}
});
