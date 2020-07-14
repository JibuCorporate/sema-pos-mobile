import { StyleSheet } from 'react-native';
import { colors } from '../../styles/sema_colors';

const widthQuanityModal = '70%';
const heightQuanityModal = 500;
export default StyleSheet.create({
	accumulator: {
		color: colors.black,
		flex: 1,
		fontSize: 30,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	alignment: { margin: 0, paddingLeft: 20 },

	aseparator: {
		backgroundColor: colors.lightGray,
		height: 1,
		marginBottom: 10,
		width: '100%'
	},

	baseItem: {
		color: colors.black,
		fontSize: 16,
		fontWeight: 'bold',
		paddingBottom: 4,
		paddingTop: 4
	},

	bgpad: { backgroundColor: colors.darkBlue, padding: 5 },

	bottleTextInput: {
		fontSize: 20,
		height: 45,
		textAlign: 'center'
	},

	bottleTracker: { flex: 1, flexDirection: 'row', height: 50 },

	btmDiv: {
		alignContent: 'space-between',
		bottom: 0,
		flex: 1,
		flexDirection: 'row',
		marginTop: 10,
		right: 0
	},

	btn: {
		backgroundColor: colors.darkBlue,
		color: colors.white,
		margin: 10,
		padding: 10
	},

	btnModal: {
		backgroundColor: colors.transparent,
		height: 50,
		position: 'absolute',
		right: 0,
		top: 0,
		width: 50
	},
	btnStyle: {
		alignSelf: 'flex-end',
		backgroundColor: colors.darkBlue,
		borderRadius: 5,
		color: colors.white,
		margin: 10,
		padding: 10,
		textAlign: 'center'
	},

	cancelstyle: {
		flex: 0.1,
		flexDirection: 'row',
		justifyContent: 'flex-end',
		right: 0,
		top: 0
	},

	center: { textAlign: 'center' },

	chkCont: { flex: 1, height: 45 },

	clearContainer: {
		alignItems: 'center',
		flex: 1,
		height: (0.7 * heightQuanityModal) / 4,
		justifyContent: 'center',
		width: (widthQuanityModal * 2) / 3
	},

	closeModalBtn: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		right: 10,
		top: 0
	},

	completeSale: { paddingBottom: 10, paddingTop: 10 },

	container: {
		backgroundColor: colors.white,
		borderColor: colors.lightBlue,
		borderRightWidth: 5,
		borderTopWidth: 5,
		flex: 6
	},

	deliveryMode: {
		flex: 1,
		flexDirection: 'row',
		alignContent: 'center',
		paddingBottom: 10
	},
	digit: {
		color: colors.black,
		fontSize: 30,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	digitContainer: {
		alignItems: 'center',
		flex: 1,
		height: (0.7 * heightQuanityModal) / 4,
		justifyContent: 'center',
		width: widthQuanityModal / 3
	},
	discountRow: { flex: 1, flexDirection: 'row', backgroundColor: colors.white },
	discountView: { flex: 1, flexDirection: 'row', alignContent: 'center' },
	doneButton: {
		color: colors.white,
		flex: 1,
		fontSize: 30,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	emptiesView: {
		flex: 1,
		flexDirection: 'row',
		backgroundColor: colors.white,
		padding: 5
	},
	emptiestxtinput: {
		fontSize: 24,
		height: 50,
		textAlign: 'center'
	},
	flex12: { flex: 1.2 },
	flexAlign: { flex: 1, paddingLeft: 20, paddingRight: 20 },
	flexHeigth: { flex: 1, height: 50 },
	flexOne: { flex: 1 },
	flexPadLeft: {
		flex: 1,
		paddingLeft: 10
	},
	flexThree: { flex: 3 },
	flexTwo: { flex: 2 },
	flexmargins: {
		flex: 1,
		marginLeft: 20,
		marginRight: 20,
		marginTop: 0
	},
	flexpadmargin: { flex: 1, margin: 0, padding: 0 },
	headerBackground: {
		backgroundColor: colors.skyBlue,
		flex: 1,
		flexDirection: 'row'
	},
	headerItem: {
		color: colors.black,
		fontSize: 18,
		fontWeight: 'bold',
		paddingBottom: 5,
		paddingTop: 5
	},

	headerLeftMargin: {
		left: 10
	},
	justifyCenter: { justifyContent: 'center' },
	leftMargin: {
		left: 10
	},

	margLeft: { marginLeft: 12 },

	modal2: {
		backgroundColor: colors.darkBlue,
		height: 230
	},
	modal3: {
		height: heightQuanityModal,
		width: widthQuanityModal
	},
	modal4: {
		height: 300
	},
	modalCalculator: {
		flex: 0.7,
		flexDirection: 'row'
	},
	modalDone: {
		alignItems: 'center',
		backgroundColor: colors.lightBlue,
		flex: 0.15,
		flexDirection: 'row'
	},
	modalTotal: {
		flex: 0.15,
		flexDirection: 'row',
		backgroundColor: colors.white,
		alignItems: 'center',
		borderColor: colors.black,
		borderWidth: 4,
		borderRadius: 3
	},

	oldSale: { fontSize: 16, paddingTop: 10, textAlign: 'left' },

	orderSideBar: {
		backgroundColor: colors.blue,
		borderColor: colors.lightBlue,
		borderLeftWidth: 5,
		flex: 0.6
	},
	pad10: {
		padding: 10
	},
	paymentMethod: { flex: 1, flexDirection: 'row', padding: 0 },
	production: {
		fontSize: 24,
		fontWeight: 'bold'
	},
	qtyTxtInput: {
		fontSize: 24,
		height: 50,
		textAlign: 'center'
	},
	qtyamticon: { flex: 0.2, height: 40 },
	qtyamticon2: { flex: 0.2, height: 40 },
	qtyamtstyle: {
		alignItems: 'stretch',
		flex: 1,
		flexDirection: 'row',
		width: '100%'
	},
	qtyamtval: { flex: 0.6, height: 40, textAlign: 'center' },
	qtyamtvalcont: { alignSelf: 'center', flex: 0.5 },
	qtyvalstyle: { flex: 1, height: 40, textAlign: 'center' },
	quantityModal: {
		alignItems: 'center',
		backgroundColor: colors.lightGray,
		borderColor: colors.darkBlue,
		borderRadius: 4,
		borderWidth: 2,
		bottom: 120,
		height: heightQuanityModal,
		position: 'absolute',
		right: 100,
		width: widthQuanityModal
	},

	removebtn: {
		alignSelf: 'flex-start',
		backgroundColor: colors.red,
		color: colors.white,
		fontWeight: 'bold',
		padding: 10
	},

	rightMargin: {
		left: 10
	},
	rowDirection: { flex: 1, flexDirection: 'row' },
	savebtn: {
		alignSelf: 'flex-end',
		backgroundColor: colors.darkBlue,
		color: colors.white,
		fontWeight: 'bold',
		padding: 10
	},
	sixth: { flex: 0.6 },
	tatxt: { paddingRight: 5, textAlign: 'right' },
	text: {
		color: colors.black,
		fontSize: 22
	},
	textLeft: { textAlign: 'left' },
	third: { flex: 0.3 },
	totalItem: {
		fontSize: 18,
		fontWeight: 'bold',
		paddingLeft: 10
	},
	txtalign: { textAlign: 'center' },
	upperCase: { textTransform: 'uppercase' },

	wrapper: {
		flex: 1,
		paddingTop: 50
	}
});
