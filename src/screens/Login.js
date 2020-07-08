import React from 'react';
import {
  View,
  ScrollView,
  Picker,
  Alert,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { Card, Button, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Events from 'react-native-simple-events';
import Synchronization from '../services/Synchronization';
import loginStyles from './login.styles';
import SettingRealm from '../database/settings/settings.operations';
import CreditRealm from '../database/credit/credit.operations';
import CustomerRealm from '../database/customers/customer.operations';
import InventroyRealm from '../database/inventory/inventory.operations';
import ProductsRealm from '../database/products/product.operations';
import * as SettingsActions from '../actions/SettingsActions';
import * as CustomerActions from '../actions/CustomerActions';
import Communications from '../services/Communications';
import i18n from '../app/i18n';

const backgroundImage = require('../images/bottlesrackmin.jpg');

const supportedUILanguages = [
  { name: 'English', iso_code: 'en' },
  { name: 'Français', iso_code: 'fr' },
];

class Login extends React.PureComponent {
  constructor(props) {
    super(props);

    this.supportedLanguages = React.createRef();

    this.state = {
      user: null,
      password: null,
      selectedLanguage: {},
      isLoading: false,
    };

    this.onShowLanguages = this.onShowLanguages.bind(this);
    this.onLanguageSelected = this.onLanguageSelected.bind(this);
    this.checkLanguage = this.checkLanguage.bind(this);
  }

  onShowLanguages() {
    this.supportedLanguages.current.show();
  }

  onSynchronize() {
    const { settingsActions, navigation } = this.props;
    try {
      this.setState({ isLoading: true });
      Synchronization.synchronize().then(() => {
        settingsActions.setSettings(SettingRealm.getAllSetting());
        this.setState({ isLoading: false });
        navigation.navigate('App');
      });
    } catch (error) {
      // empty
    }
  }

  onChangeEmail = (user) => {
    this.setState({ user });
  };

  onChangePassword = (password) => {
    this.setState({ password });
  };

  onConnection() {
    const { user, password, selectedLanguage } = this.state;
    const { settingsActions, navigation } = this.props;
    let message = '';
    if (!user || !password) {
      Alert.alert(
        i18n.t('no-username'),
        i18n.t('no-credentials'),
        [{ text: i18n.t('ok'), style: 'cancel' }],
        { cancelable: true },
      );
      return;
    }
    this.setState({ isLoading: true });

    Communications.login(user, password)
      .then((result) => {
        if (result.status === 200) {
          if (result.response.userSatus) {
            const oldSettings = { ...SettingRealm.getAllSetting() };
            let currency = '';
            if (result.response.data.kiosk.region_id === 201) {
              currency = 'UGX';
            } else if (result.response.data.kiosk.region_id === 301) {
              currency = 'RWF';
            } else if (result.response.data.kiosk.region_id === 401) {
              currency = 'KES';
            } else if (result.response.data.kiosk.region_id === 501) {
              currency = 'TZS';
            } else if (result.response.data.kiosk.region_id === 601) {
              currency = 'USD';
            } else if (result.response.data.kiosk.region_id === 602) {
              currency = 'USD';
            } else if (result.response.data.kiosk.region_id === 701) {
              currency = 'ZMW';
            } else if (result.response.data.kiosk.region_id === 801) {
              currency = 'FBU';
            }
            SettingRealm.saveSettings(
              'http://142.93.115.206:3002/',
              result.response.data.kiosk.name,
              user,
              password,
              selectedLanguage,
              result.response.token,
              result.response.data.kiosk.id,
              result.response.data.kiosk.region_id,
              false,
              currency,
            );

            Communications.initialize(
              'http://142.93.115.206:3002/',
              result.response.data.kiosk.name,
              user,
              password,
              result.response.token,
              result.response.data.kiosk.id,
            );

            Communications.setToken(
              result.response.token,
            );
            Communications.setSiteId(result.response.data.kiosk.id);
            SettingRealm.setTokenExpiration();

            if (this.isSiteIdDifferent(result.response.data.kiosk.id, oldSettings.siteId)) {
              this.onSynchronize();
            }

            if (!this.isSiteIdDifferent(result.response.data.kiosk.id, oldSettings.siteId)) {
              settingsActions.setSettings(SettingRealm.getAllSetting());
              this.setState({ isLoading: false });
              navigation.navigate('App');
            }
          } else {
            Alert.alert(
              i18n.t('network-connection'),
              'Account has been De-activated',
              [{ text: i18n.t('ok'), style: 'cancel' }],
              { cancelable: true },
            );
            this.setState({ isLoading: false });
          }
        } else {
          this.setState({ isLoading: false });
          message = `${result.response.msg
          }(Error code: ${
            result.status
          })`;
          Alert.alert(
            i18n.t('network-connection'),
            message,
            [{ text: i18n.t('ok'), style: 'cancel' }],
            { cancelable: true },
          );
        }
      })
      .catch((result) => {
        this.setState({ isLoading: false });
        Alert.alert(
          i18n.t('network-connection'),
          `${result.response.message}. (${result.status})`,
          [{ text: i18n.t('ok'), style: 'cancel' }],
          { cancelable: true },
        );
      });
  }

  onLanguageSelected(langIdx) {
    const { selectedLanguage } = this.state;
    const { settingsActions } = this.props;
    this.setState(
      {
        selectedLanguage: supportedUILanguages.filter(
          (lang, idx) => idx === Number(langIdx),
        )[0],
      },
      () => {
        i18n.locale = selectedLanguage.iso_code;
        SettingRealm.setUILanguage(selectedLanguage);
        settingsActions.setSettings(SettingRealm.getAllSetting());
      },
    );
  }

  getDefaultUILanguage() {
    const { settings } = this.props;
    return settings.uiLanguage.iso_code;
  }

  getDefaultUILanguageIndex() {
    const { settings } = this.props;
    let langIdx = 0;
    supportedUILanguages.forEach((lang, idx) => {
      if (lang.name === settings.uiLanguage.name) {
        langIdx = idx;
      }
    });
    return langIdx;
  }

  subtractDays = (theDate, days) => new Date(theDate.getTime() - days * 24 * 60 * 60 * 1000);

  checkLanguage = (itemValue, itemIndex) => {
    this.onLanguageSelected(itemIndex);
  }

  isSiteIdDifferent(newSiteID, oldSiteID) {
    // Check is locally stored siteID is different from the remote returned siteID
    if (newSiteID !== oldSiteID) {
      // New site - clear all data
      this.clearDataAndSync();
      return true;
    }
    return false;
  }

  clearDataAndSync() {
    const { customerActions, settingsActions } = this.props;
    try {
      Events.trigger('ClearLoggedSales', {});
      settingsActions.setSettings(SettingRealm.getAllSetting());
      customerActions.setCustomers(CustomerRealm.getAllCustomer());
      const saveConnected = Synchronization.isConnected;
      Synchronization.initialize(
        CustomerRealm.getLastCustomerSync(),
        ProductsRealm.getLastProductsync(),
        CreditRealm.getLastCreditSync(),
        InventroyRealm.getLastInventorySync(),
      );
      Synchronization.setConnected(saveConnected);
    } catch (error) {
      // empty
    }
  }

  render() {
    const { selectedLanguage, isLoading } = this.state;
    const serviceItems = supportedUILanguages.map((s) => <Picker.Item key={s.iso_code} value={s.iso_code} label={s.name} />);
    return (
      <ImageBackground
        style={loginStyles.imgBackground}
        resizeMode="cover"
        source={backgroundImage}
      >
        <ScrollView style={loginStyles.scrollst}>
          <View style={loginStyles.ctnerstyle}>
            <Card
              title="Welcome to SEMA"
              titleStyle={loginStyles.fonsty}
              dividerStyle={loginStyles.disnone}
              containerStyle={loginStyles.cardstyle}
            >

              <Input
                label={i18n.t('username-or-email-placeholder')}
                onChangeText={this.onChangeEmail}
                inputContainerStyle={loginStyles.inputText}
              />
              <Input
                label={i18n.t('password-placeholder')}
                secureTextEntry
                onChangeText={this.onChangePassword}
                inputContainerStyle={loginStyles.inputText}
              />
              <Picker
                style={loginStyles.pickerstyle}
                selectedValue={selectedLanguage.iso_code}
                onValueChange={this.checkLanguage}
              >
                {serviceItems}
              </Picker>
              <Button
                onPress={this.onConnection}
                buttonStyle={loginStyles.btnstyle}
                title={i18n.t('connect')}
              />

            </Card>
          </View>
          {
            isLoading && (
              <ActivityIndicator size={100} color="#ABC1DE" />
            )
          }
        </ScrollView>

      </ImageBackground>
    );
  }
}

function mapStateToProps(state) {
  return {
    settings: state.settingsReducer.settings,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    settingsActions: bindActionCreators(SettingsActions, dispatch),
    customerActions: bindActionCreators(CustomerActions, dispatch),
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Login);
