import React from 'react';
import { View, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Synchronization from '../services/Synchronization';
import SettingRealm from '../database/settings/settings.operations';
import Communications from '../services/Communications';
import * as SettingsActions from '../actions/SettingsActions';
import i18n from '../app/i18n';
import customSiderBarStyles from './customSidebarMenu.styles';

import SidebBarElement from './sideBarElement';

const logo = require('../images/jibulogo.png');

if (process.env.NODE_ENV === 'development') {
	const whyDidYouRender = require('@welldone-software/why-did-you-render');
	whyDidYouRender(React, {
		trackAllPureComponents: true
	});
}

class CustomSidebarMenu extends React.Component {
	static whyDidYouRender = true;

	constructor(props) {
		super(props);
		this.state = {
			isLoading: false
		};

		this.headerImage = '';

		this.items = [
			{
				navOptionThumb: 'person',
				navOptionName: 'Customers',
				screenToNavigate: 'ListCustomers'
			},
			{
				navOptionThumb: 'pricetags',
				navOptionName: 'Transactions',
				screenToNavigate: 'Transactions'
			},
			{
				navOptionThumb: 'stats-chart',
				navOptionName: 'Sales Report',
				screenToNavigate: 'SalesReport'
			},
			{
				navOptionThumb: 'trash-bin',
				navOptionName: 'Wastage Report',
				screenToNavigate: 'Inventory'
			},
			{
				navOptionThumb: 'alarm',
				navOptionName: 'Reminders',
				screenToNavigate: 'Reminders'
			},
			{
				navOptionThumb: 'sync',
				navOptionName: 'Sync',
				screenToNavigate: 'Sync'
			},
			{
				navOptionThumb: 'log-out',
				navOptionName: 'LogOut',
				screenToNavigate: 'LogOut'
			}
		];
	}

	shouldComponentUpdate() {
		return false;
	}

	onLogout = () => {
		const { settingsActions, navigation } = this.props;
		const settings = SettingRealm.getAllSetting();

		// // Save with empty token - This will force username/password validation
		SettingRealm.saveSettings(
			settings.semaUrl,
			settings.site,
			settings.user,
			settings.password,
			settings.uiLanguage,
			'',
			settings.siteId,
			false,
			settings.currency
		);
		settingsActions.setSettings(SettingRealm.getAllSetting());
		// As we are not going to the Login, the reason no reason to disable the token
		Communications.setToken('');
		navigation.navigate('Login');
	};

	onSynchronize = () => {
		try {
			this.setState({ isLoading: true });
			Synchronization.synchronize().then((syncResult) => {
				this.setState({ isLoading: false });
				Alert.alert(
					i18n.t('sync-results'),
					this.getSyncResults(syncResult),
					[{ text: i18n.t('ok'), style: 'cancel' }],
					{ cancelable: true }
				);
			});
		} catch (error) {
			// empty
		}
	};

	 getSyncResults=(syncResult)=> {
		 console.log('syncResult-syncResult', syncResult)
		try {
			if (
				syncResult.customers.customers === 0 &&
				syncResult.products.products === 0 &&
				syncResult.orders.orders === 0 &&
				syncResult.meterReading.meterReading === 0 &&
				syncResult.wastageReport.wastageReport === 0 &&
				syncResult.recieptPayments.recieptPayments === 0 &&
				syncResult.topups.topups === 0 &&
				syncResult.customerReminder.customerReminder === 0
			) {
				return i18n.t('data-is-up-to-date');
			}
			let final1 = '';
			let final2 = '';
			let final3 = '';
			let final4 = '';
			let final5 = '';

			let final6 = '';
			let final7 = '';
			let final8 = '';
			let final9 = '';
			let final10 = '';
			const final11 = '';

			if (syncResult.customers.customers > 0) {
				final1 = `${
					syncResult.customers.successError === 'success'
						? `${syncResult.customers.customers} ${i18n.t('customers-updated')}`
						: `${syncResult.customers.successMessage.message} Please Synchronise Before making any changes`
				}`;
			}

			if (syncResult.products.products > 0) {
				final2 = `\n${
					syncResult.products.successError === 'success'
						? `${syncResult.products.products + i18n.t('products-updated')}`
						: `${syncResult.products.successMessage.message} Please Synchronise Before making any changes`
				}`;
			}

			if (syncResult.wastageReport.wastageReport > 0) {
				final3 = `\n${
					syncResult.wastageReport.successError === 'success'
						? `${syncResult.wastageReport.wastageReport} ${i18n.t(
								'wastageReport-updated'
						  )}`
						: `${syncResult.wastageReport.successMessage.message} Please Synchronise Before making any changes`
				}`;
			}

			if (syncResult.orders.orders > 0) {
				final4 = `\n${
					syncResult.orders.successError === 'success'
						? `${syncResult.orders.orders} ${i18n.t('sales-receipts-updated')}`
						: `${syncResult.orders.successMessage.message} Please Synchronise Before making any changes`
				}`;
			}

			if (syncResult.debt.debt > 0) {
				final5 = `\n${
					syncResult.debt.successError === 'success'
						? `${syncResult.debt.debt} ${i18n.t('debt-updated')}`
						: `${syncResult.debt.successMessage.message} Please Synchronise Before making any changes`
				}`;
			}

			if (syncResult.meterReading.meterReading > 0) {
				final6 = `\n${
					syncResult.meterReading.successError === 'success'
						? `${syncResult.meterReading.meterReading} ${i18n.t(
								'meterReading-updated'
						  )}`
						: `${syncResult.meterReading.successMessage.message} Please Synchronise Before making any changes`
				}`;
			}

			if (syncResult.recieptPayments.recieptPayments > 0) {
				final7 = `\n${
					syncResult.recieptPayments.successError === 'success'
						? `${syncResult.recieptPayments.recieptPayments} ${i18n.t(
								'recieptPayments-updated'
						  )}`
						: `${syncResult.recieptPayments.successMessage.message} Please Synchronise Before making any changes`
				}`;
			}

			if (syncResult.customerReminder.customerReminder > 0) {
				final8 = `\n${
					syncResult.customerReminder.successError === 'success'
						? `${syncResult.customerReminder.customerReminder} ${i18n.t(
								'customer-reminder-updated'
						  )}`
						: `${syncResult.customerReminder.successMessage.message} Please Synchronise Before making any changes`
				}`;
			}

			if (syncResult.productMrps.productMrps > 0) {
				final9 = `\n${
					syncResult.productMrps.successError === 'success'
						? `${syncResult.productMrps.productMrps} ${i18n.t('pricing-sheme-updated')}`
						: `${syncResult.productMrps.successMessage.message} Please Synchronise Before making any changes`
				}`;
			}

			if (syncResult.salesChannels.salesChannels > 0) {
				final10 = `\n${
					syncResult.salesChannels.successError === 'success'
						? `${syncResult.salesChannels.salesChannels} ${i18n.t(
								'salechannel-updated'
						  )}`
						: `${syncResult.salesChannels.successMessage.message} Please Synchronise Before making any changes`
				}`;
			}

			if (syncResult.topups.topups > 0) {
				final10 = `\n${
					syncResult.topups.successError === 'success'
						? `${syncResult.topups.topups} ${i18n.t('topups-updated')}`
						: `${syncResult.topups.successMessage.message} Please Synchronise Before making any changes`
				}`;
			}

			return (
				final1 +
				final2 +
				final3 +
				final4 +
				final5 +
				final6 +
				final7 +
				final8 +
				final9 +
				final10 +
				final11
			);
		} catch (error) {
			return 'Error';
		}
	}

	render() {
		const { isLoading } = this.state;
		return (
			<View style={customSiderBarStyles.sideMenuContainer}>
				<ScrollView style={customSiderBarStyles.viewFlex}>
					<Image
						source={logo}
						resizeMode="stretch"
						style={customSiderBarStyles.imageStyle}
					/>
					{/* Divider between Top Image and Sidebar Option */}
					<View style={customSiderBarStyles.viewCont} />
					{/* Setting up Navigation Options from option array using loop */}
					<View style={customSiderBarStyles.viewFlex}>
						{this.items.map((item) => (
							<View style={customSiderBarStyles.viewFlex} key={item.navOptionName}>
								<SidebBarElement
									item={item}
									onSynchronize={this.onSynchronize}
									onLogout={this.onLogout}
								/>
							</View>
						))}
					</View>
					{isLoading && <ActivityIndicator size={60} color="#ABC1DE" />}
				</ScrollView>
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
		settingsActions: bindActionCreators(SettingsActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomSidebarMenu);
