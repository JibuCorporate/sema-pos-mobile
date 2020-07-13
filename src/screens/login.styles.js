import { StyleSheet } from 'react-native';
import {
	widthPercentageToDP as wp,
	heightPercentageToDP as hp
} from 'react-native-responsive-screen';
import { colors } from '../styles/sema_colors';

export default StyleSheet.create({
	activityIndicator: {
		alignItems: 'center',
		bottom: 0,
		justifyContent: 'center',
		left: 0,
		position: 'absolute',
		right: 0,
		top: 0
	},

	btnstyle: {
		borderRadius: 8,
		marginBottom: 0,
		marginLeft: 0,
		marginRight: 0,
		marginTop: 10,
		padding: 10
	},
	buttonText: {
		color: colors.white,
		fontSize: 24,
		fontWeight: 'bold',
		paddingLeft: 30,
		paddingRight: 30,
		textAlign: 'center'
	},
	cardstyle: {
		borderRadius: 5,
		elevation: 10,
		marginTop: 30,
		width: wp('50%')
	},
	checkLabel: {
		fontSize: 24,
		left: 20
	},
	container: {
		backgroundColor: colors.transparent,
		flex: 1,
		height: hp('100%'),
		width: wp('100%')
	},
	ctnerstyle: {
		alignItems: 'center',
		backgroundColor: colors.transparent,
		flex: 1
	},

	disnone: { display: 'none' },
	dropdownText: {
		fontSize: 24
	},
	fonsty: { fontSize: 26 },
	headerText: {
		color: colors.black,
		fontSize: 24,
		marginLeft: 100
	},
	imgBackground: {
		flex: 1,
		height: hp('100%'),
		width: wp('100%')
	},

	inputContainer: {
		backgroundColor: colors.white,
		borderColor: colors.lightBlue,
		borderRadius: 10,
		borderWidth: 2
	},
	inputText: {
		alignSelf: 'center',
		backgroundColor: colors.lightGray,
		borderColor: colors.lightGray,
		borderRadius: 8,
		borderWidth: 2,
		margin: 5
	},

	labelText: {
		alignSelf: 'flex-end',
		fontSize: 18,
		marginRight: 20
	},

	pickerstyle: {
		alignSelf: 'center',
		padding: 10,
		width: '95%'
	},
	scrollst: {
		backgroundColor: colors.transparent,
		flex: 1
	},
	spinnerTextStyle: {
		color: colors.darkBlue,
		fontSize: 50,
		fontWeight: 'bold'
	},
	submit: {
		backgroundColor: colors.lightBlue,
		borderRadius: 20,
		marginTop: '1%'
	},
	updating: {
		alignItems: 'center',
		backgroundColor: colors.skyBlue,
		borderColor: colors.lightBlue,
		borderRadius: 10,
		borderWidth: 5,
		height: 100,
		justifyContent: 'center',
		width: 500
	}
});
