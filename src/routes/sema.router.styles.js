import { StyleSheet } from 'react-native';
import { colors } from '../styles/sema_colors';

export default StyleSheet.create({
  rowdir: {
    flexDirection: 'row',
  },
  custpicker: {
    marginTop: 12,
    flex: 1,
  },
  smropicker: {
    height: 50,
    width: 190,
    color: colors.white,
    alignContent: 'flex-end',
  },
  cont: {
    flexDirection: 'row',
  },
  drawerIcon: {
    width: 50, height: 30, marginLeft: 10, paddingRight: 20,
  },

});
