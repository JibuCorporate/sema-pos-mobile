import { StyleSheet } from 'react-native';
import { colors } from '../styles/sema_colors';

export default StyleSheet.create({
  viewMargins: {
    marginRight: 10, marginLeft: 20,
  },
  viewFlex: {
    flex: 1,
  },
  imageStyle: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  sideMenuContainer: {
    flex: 1,
    backgroundColor: colors.white,
    paddingTop: 20,
  },

  viewCont: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray,
    marginTop: 15,
  },
  drawerItemStyle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  },
  sideMenuProfileIcon: {
    resizeMode: 'center',
    width: 150,
    height: 150,
    marginTop: 20,
    borderRadius: 150 / 2,
  },
});
