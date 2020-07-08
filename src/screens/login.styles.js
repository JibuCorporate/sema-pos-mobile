import { StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { colors } from '../styles/sema_colors';

export default StyleSheet.create({
  scrollst: {
    flex: 1,
    backgroundColor: colors.transparent,
  },

  fonsty: { fontSize: 26 },
  ctnerstyle: {
    flex: 1,
    backgroundColor: colors.transparent,
    alignItems: 'center',
  },
  imgBackground: {
    width: wp('100%'),
    height: hp('100%'),
    flex: 1,
  },
  cardstyle: {
    width: wp('50%'),
    marginTop: 30,
    borderRadius: 5,
    elevation: 10,
  },
  container: {
    flex: 1,
    width: wp('100%'),
    height: hp('100%'),
    backgroundColor: colors.transparent,
  },
  btnstyle: {
    borderRadius: 8, marginLeft: 0, marginRight: 0, marginBottom: 0, marginTop: 10, padding: 10,
  },

  headerText: {
    fontSize: 24,
    color: colors.black,
    marginLeft: 100,
  },
  submit: {
    backgroundColor: colors.lightBlue,
    borderRadius: 20,
    marginTop: '1%',
  },
  disnone: { display: 'none' },
  inputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    borderColor: colors.lightBlue,
    backgroundColor: colors.white,
  },
  inputText: {
    alignSelf: 'center',
    borderWidth: 2,
    borderRadius: 8,
    borderColor: colors.lightGray,
    backgroundColor: colors.lightGray,
    margin: 5,
  },

  buttonText: {
    fontWeight: 'bold',
    fontSize: 24,
    color: colors.white,
    textAlign: 'center',
    paddingLeft: 30,
    paddingRight: 30,
  },
  labelText: {
    fontSize: 18,
    alignSelf: 'flex-end',
    marginRight: 20,
  },

  dropdownText: {
    fontSize: 24,
  },

  pickerstyle: {
    padding: 10, width: '95%', alignSelf: 'center',
  },
  updating: {
    height: 100,
    width: 500,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.skyBlue,
    borderColor: colors.lightBlue,
    borderWidth: 5,
    borderRadius: 10,
  },
  checkLabel: {
    left: 20,
    fontSize: 24,
  },
  activityIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerTextStyle: {
    color: colors.darkBlue,
    fontSize: 50,
    fontWeight: 'bold',
  },
});
