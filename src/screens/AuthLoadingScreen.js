import React from 'react';

import { View, StyleSheet, ActivityIndicator, StatusBar, InteractionManager } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import NetInfo from '@react-native-community/netinfo';
import { withNavigation } from 'react-navigation';
import * as SettingsActions from '../actions/SettingsActions';
import * as NetworkActions from '../actions/NetworkActions';
import SettingRealm from '../database/settings/settings.operations';

import Synchronization from '../services/Synchronization';
import Communications from '../services/Communications';

const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		flex: 1,
		justifyContent: 'center'
	}
});

class AuthLoadingScreen extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			animating: true
		};
	}

	componentDidMount() {
		const { settingsActions, navigation, networkActions } = this.props;
		InteractionManager.runAfterInteractions(() => {
			const settings = SettingRealm.getAllSetting();
			Communications.initialize(
				settings.semaUrl,
				settings.site,
				settings.user,
				settings.password,
				settings.token,
				settings.siteId
			);

			if (settings.site === '' && settings.siteId === 0) {
				settingsActions.setSettings({ ...settings, loginSync: true });
				navigation.navigate('Login');
			}

			if (settings.site !== '' && settings.siteId > 0) {
				if (settings.token.length > 1) {
					settingsActions.setSettings({ ...settings, loginSync: false });
					navigation.navigate('App');
				}

				if (settings.token.length === 0) {
					settingsActions.setSettings(settings);
					navigation.navigate('Login');
				}
			}

			NetInfo.isConnected.fetch().then((isConnected) => {
				networkActions.NetworkConnection(isConnected);
				Synchronization.setConnected(isConnected);
			});
		});
	}

	subtractDays = (theDate, days) => {
		return new Date(theDate.getTime() - days * 24 * 60 * 60 * 1000);
	};

	render() {
		const { animating } = this.state;
		return (
			<View style={styles.container}>
				<ActivityIndicator animating={animating} size={120} color="#ABC1DE" />
				<StatusBar barStyle="default" />
			</View>
		);
	}
}
function mapStateToProps(state) {
	return {
		settings: state.settingsReducer.settings
	};
}

function mapDispatchToProps(dispatch) {
	return {
		settingsActions: bindActionCreators(SettingsActions, dispatch),
		networkActions: bindActionCreators(NetworkActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(withNavigation(AuthLoadingScreen));
