import { StyleSheet } from 'react-native';

const widthQuanityModal = '70%';
const heightQuanityModal = 500;
export default orderItemStyles = StyleSheet.create({
  container: {
    flex: 6,
    backgroundColor: 'white',
    borderColor: '#2858a7',
    borderTopWidth: 5,
    borderRightWidth: 5,
  },
  headerBackground: {
    backgroundColor: '#ABC1DE',
    flex: 1,
    flexDirection: 'row',
  },

  qtyvalstyle: { flex: 1, height: 40, textAlign: 'center' },

  qtyamticon: { flex: 0.2, height: 40 },

  qtyamtval: { flex: 0.6, height: 40, textAlign: 'center' },

  qtyamtvalcont: { flex: 0.5, alignSelf: 'center' },

  qtyamticon2: { flex: 0.2, height: 40 },

  qtyamtstyle: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',

  },

  emptiestxtinput: {
    textAlign: 'center',
    height: 50,
    fontSize: 24,
  },

  flex12: { flex: 1.2 },
  pad10: {
    padding: 10,
  },

  flexmargins: {
    flex: 1,
    marginTop: 0,
    marginLeft: 20,
    marginRight: 20,
  },

  margLeft: { marginLeft: 12 },

  chkCont: { flex: 1, height: 45 },

  bgpad: { backgroundColor: '#ABC1DE', padding: 5 },

  flexpadmargin: { flex: 1, padding: 0, margin: 0 },

  txtalign: { textAlign: 'center' },

  tatxt: { textAlign: 'right', paddingRight: 5 },

  flexPadLeft: {
    flex: 1,
    paddingLeft: 10,
  },
  closeModalBtn: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
    right: 10,
    top: 0,
  },
  qtyTxtInput: {
    textAlign: 'center',
    height: 50,
    fontSize: 24,
  },
  orderSideBar: {
    flex: 0.6, backgroundColor: 'blue', borderColor: '#2858a7', borderLeftWidth: 5,
  },
  flexOne: { flex: 1 },
  flexTwo: { flex: 2 },
  flexThree: { flex: 3 },
  third: { flex: 0.3 },
  sixth: { flex: 0.6 },
  alignment: { paddingLeft: 20, margin: 0 },
  leftMargin: {
    left: 10,
  },
  rightMargin: {
    left: 10,
  },
  headerLeftMargin: {
    left: 10,
  },
  headerItem: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'black',
    paddingTop: 5,
    paddingBottom: 5,
  },
  baseItem: {
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
    paddingTop: 4,
    paddingBottom: 4,

  },
  quantityModal: {
    width: widthQuanityModal,
    height: heightQuanityModal,
    position: 'absolute',
    bottom: 120,
    right: 100,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 1)',
    borderWidth: 2,
  },
  modalTotal: {
    flex: 0.15,
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 4,
    borderRadius: 3,
  },
  production: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  modalCalculator: {
    flex: 0.70,
    flexDirection: 'row',
  },

  cancelstyle: {
    flex: 0.1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    right: 0,
    top: 0,
  },
  modalDone: {
    flex: 0.15,
    backgroundColor: '#2858a7',
    flexDirection: 'row',
    alignItems: 'center',

  },
  aseparator: {
    height: 1,
    backgroundColor: '#ddd',
    marginBottom: 10,
    width: '100%',
  },

  removebtn: {
    padding: 10, fontWeight: 'bold', color: '#fff', backgroundColor: '#f00', alignSelf: 'flex-start',
  },

  savebtn: {
    padding: 10, fontWeight: 'bold', color: '#fff', backgroundColor: '#036', alignSelf: 'flex-end',
  },
  digitContainer: {
    flex: 1,
    width: widthQuanityModal / 3,
    height: (0.7 * heightQuanityModal) / 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearContainer: {
    flex: 1,
    width: widthQuanityModal * 2 / 3,
    height: (0.7 * heightQuanityModal) / 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digit: {
    textAlign: 'center',
    color: 'black',
    fontWeight: 'bold',
    fontSize: 30,
  },
  accumulator: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 30,
    flex: 1,
    textAlign: 'center',
  },
  doneButton: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,
    flex: 1,
    textAlign: 'center',
  },

  wrapper: {
    paddingTop: 50,
    flex: 1,
  },

  center: { textAlign: 'center' },
  flexAlign: { flex: 1, paddingRight: 20, paddingLeft: 20 },
  rowDirection: { flex: 1, flexDirection: 'row' },
  upperCase: { textTransform: 'uppercase' },
  flexHeigth: { flex: 1, height: 50 },
  textLeft: { textAlign: 'left' },
  justifyCenter: { justifyContent: 'center' },
  bottleTextInput: {
    textAlign: 'center',
    height: 45,
    fontSize: 20,
  },
  oldSale: { fontSize: 16, paddingTop: 10, textAlign: 'left' },
  completeSale: { paddingTop: 10, paddingBottom: 10 },
  btnStyle: {
    padding: 10, margin: 10, borderRadius: 5, color: 'white', backgroundColor: '#036', textAlign: 'center', alignSelf: 'flex-end',
  },
  modal2: {
    height: 230,
    backgroundColor: '#3B5998',
  },

  modal3: {
    width: widthQuanityModal,
    height: heightQuanityModal,
  },

  modal4: {
    height: 300,
  },
  discountView: { flex: 1, flexDirection: 'row', alignContent: 'center' },
  emptiesView: {
    flex: 1, flexDirection: 'row', backgroundColor: 'white', padding: 5,
  },
  discountRow: { flex: 1, flexDirection: 'row', backgroundColor: 'white' },
  bottleTracker: { flex: 1, flexDirection: 'row', height: 50 },
  paymentMethod: { flex: 1, flexDirection: 'row', padding: 0 },
  deliveryMode: {
    flex: 1, flexDirection: 'row', alignContent: 'center', paddingBottom: 10,
  },
  btn: {
    margin: 10,
    backgroundColor: '#3B5998',
    color: 'white',
    padding: 10,
  },
  totalItem: {
    fontWeight: 'bold',
    fontSize: 18,
    paddingLeft: 10,
  },
  btmDiv: {
    flex: 1,
    marginTop: 10,
    alignContent: 'space-between',
    flexDirection: 'row',
    right: 0,
    bottom: 0,
  },
  btnModal: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    backgroundColor: 'transparent',
  },

  text: {
    color: 'black',
    fontSize: 22,
  },
});
