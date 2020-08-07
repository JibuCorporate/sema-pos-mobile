import React from 'react';

import {
    View,
    StyleSheet,
    ActivityIndicator,
	StatusBar,
	InteractionManager
} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as SettingsActions from '../actions/SettingsActions';
import * as NetworkActions from '../actions/NetworkActions';
import SettingRealm from '../database/settings/settings.operations';

import Synchronization from '../services/Synchronization';
import Communications from '../services/Communications';
import NetInfo from "@react-native-community/netinfo";
import { withNavigation } from 'react-navigation';

class AuthLoadingScreen extends React.PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            animating: true,
            isConnected: false,
        };
    }

    componentDidMount() {
		InteractionManager.runAfterInteractions(() => {
        let settings = SettingRealm.getAllSetting();
        Communications.initialize(
            settings.semaUrl,
            settings.site,
            settings.user,
            settings.password,
            settings.token,
            settings.siteId
        );

        if (settings.site === "" && settings.siteId === 0) {
            this.props.settingsActions.setSettings({ ...settings, loginSync: true });
            this.props.navigation.navigate('Login');
        }

        if (settings.site != "" && settings.siteId > 0) {

            if (settings.token.length > 1) {
                this.props.settingsActions.setSettings({ ...settings, loginSync: false });
                this.props.navigation.navigate('App');
            }

            if (settings.token.length === 0) {
                this.props.settingsActions.setSettings(settings);
                this.props.navigation.navigate('Login');
            }
        }

        NetInfo.isConnected.fetch().then(isConnected => {
            this.props.networkActions.NetworkConnection(isConnected);
            Synchronization.setConnected(isConnected);
		});
	});
    }

    subtractDays = (theDate, days) => {
        return new Date(theDate.getTime() - days * 24 * 60 * 60 * 1000);
    };

    render() {
        const animating = this.state.animating;
        return (
            <View style={styles.container}>
                <ActivityIndicator animating={animating} size={120} color="#ABC1DE" />
               		 <StatusBar barStyle="default" />
            </View>
        );
    }
}
function mapStateToProps(state, props) {
	return {
		settings: state.settingsReducer.settings,
	};
}

function mapDispatchToProps(dispatch) {
    return {
		settingsActions: bindActionCreators(SettingsActions, dispatch),
		networkActions: bindActionCreators(NetworkActions, dispatch)
    };
}

export default connect(
	mapStateToProps,
    mapDispatchToProps
)(withNavigation(AuthLoadingScreen));
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
