import React from 'react';
import { View, StyleSheet, Image, Text, Dimensions, Picker, Alert, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Communications from '../services/Communications';
import Synchronization from '../services/Synchronization';
import * as receiptActions from '../actions/ReceiptActions';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as CustomerActions from '../actions/CustomerActions';
import Icon from 'react-native-vector-icons/Ionicons';
import {
	createDrawerNavigator,
	DrawerContentScrollView,
	DrawerItemList,
	DrawerItem,
} from '@react-navigation/drawer';


import CustomerList from '../screens/CustomerList';
import CustomerEdit from '../screens/CustomerEdit';
import CustomerDetails from '../screens/CustomerDetails';
import CreditHistory from '../screens/CreditHistory';
import Login from '../screens/Login';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import Transactions from '../screens/Transactions';
import SettingRealm from '../database/settings/settings.operations';
import * as SettingsActions from '../actions/SettingsActions';
import OrderView from '../components/orders/OrderView';

import InventoryReport from '../components/reports/InventoryReport';
import RemindersReport from '../components/reports/ReminderReport';
import SalesReport from '../components/reports/SalesReport';

import CustomSidebarMenu from './CustomSidebarMenu';
import CustomerListHeader from './CustomerListHeader';
import CustomerTitle from './CustomerTitle';

import NewNavigationDrawerStructure from './NewNavigationDrawerStructure';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
import { useNavigation } from '@react-navigation/native';

function CreditHistoryStack() {
	return (
		<Stack.Navigator
			initialRouteName="CreditHistory"
			headerMode="none">
			<Stack.Screen
				name="CreditHistory"
				component={CreditHistory}
				options={{
					title: 'Customer Wallet',
				}}
			/>
		</Stack.Navigator>
	)
}

function CustomerTransactionStack() {
	return (
		<Stack.Navigator
			initialRouteName="Transaction"
			headerMode="none">
			<Stack.Screen
				name="Transaction"
				component={CustomerDetails}
				options={{
					title: 'Transaction',
				}}
			/>
		</Stack.Navigator>
	)
}

function TabNavigator() {
	return (
		<Tab.Navigator
			initialRouteName="Transaction"
			tabBarOptions={{
				activeTintColor: 'white',
				inactiveTintColor: '#CCC',
				style: {
					backgroundColor: '#00549C',
					fontSize: 24,
					padding: 10
				},
				labelStyle: {
					fontSize: 18,
					textTransform: 'uppercase'
				},
			}}>
			<Tab.Screen name="Transaction" component={CustomerTransactionStack} />
			<Tab.Screen name="Customer Wallet" component={CreditHistoryStack} />
		</Tab.Navigator>
	)
}

function ListCustomerStack({ route, navigation }) {
	console.log('route', route);
	return (
		<Stack.Navigator
			initialRouteName="CustomerList">
			<Stack.Screen
				name="CustomerList"
				initialParams={{
					isCustomerSelected: false,
					customerTypeValue: 'all',
					customerName: '',
				}}
				component={CustomerList}
				options={({ route }) => ({
					headerTitle: () => <CustomerTitle title={`Customers`} />,
					headerLeft: () => <NewNavigationDrawerStructure navigation={navigation} />,
					headerStyle: {
						backgroundColor: '#00549C',
					},
					headerTintColor: '#fff',
					headerRight: () => <CustomerListHeader navigation={navigation} route={route} />

				})}
			// options={{
			// 	headerTitle: () => <CustomerTitle title={`Customers`} />,
			// 	headerLeft: () => <NewNavigationDrawerStructure navigation={navigation} />,
			// 	headerStyle: {
			// 		backgroundColor: '#00549C',
			// 	},
			// 	headerTintColor: '#fff',
			// 	headerRight: (route) => <CustomerListHeader navigation={navigation} route={route} />
			// }}
			/>
			<Stack.Screen
				name="OrderView"
				component={OrderView}
				options={{
					headerTitle: () => <CustomerTitle />,
					headerStyle: {
						backgroundColor: '#00549C',
					},
					headerTintColor: '#fff', //Set Header text color
				}} />
			<Stack.Screen
				name="CustomerEdit"
				component={CustomerEdit}
				options={{
					title: 'New Customer',
					headerStyle: {
						backgroundColor: '#00549C',
					},
					headerTintColor: '#fff', //Set Header text color
				}} />
			<Stack.Screen
				name="CustomerDetails"
				component={TabNavigator}
				options={{
					title: 'Customer Details',
					headerStyle: {
						backgroundColor: '#00549C'
					},
					headerTintColor: '#fff',
				}} />
		</Stack.Navigator>
	);
}

function TransactionStack({ route, navigation }) {
	return (
		<Stack.Navigator initialRouteName="Transactions">
			<Stack.Screen
				name="Transactions"
				component={Transactions}
				options={{
					title: 'Transactions', //Set Header Title
					headerLeft: () => <NewNavigationDrawerStructure navigation={navigation} />,
					headerStyle: {
						backgroundColor: '#00549C', //Set Header color
					},
					headerTintColor: '#fff',
					headerRight: () => (
						<View
							style={styles.rowdir}>
							<View
								style={styles.custpicker}>
								{/* <Picker
								mode="dropdown"
								selectedValue={route.params.hasOwnProperty('paymentTypeValue')}
								style={styles.smropicker}
								onValueChange={route.params.hasOwnProperty('checkPaymentTypefilter')}>
								<Picker.Item label="All Payment Types" value="all" />
								<Picker.Item label="Cash" value="cash" />
								<Picker.Item label="Mobile" value="mobile" />
								<Picker.Item label="Loan" value="loan" />
								<Picker.Item label="Cheque" value="cheque" />
								<Picker.Item label="Bank" value="bank" />
								<Picker.Item label="Wallet" value="credit" />
							</Picker> */}
							</View>
						</View>
					),
				}}
			/>
		</Stack.Navigator>
	);
}

function SalesReportStack({ route, navigation }) {
	return (
		<Stack.Navigator initialRouteName="SalesReport">
			<Stack.Screen
				name="SalesReport"
				component={SalesReport}
				options={{
					title: 'Sales Report', //Set Header Title
					headerLeft: () => <NewNavigationDrawerStructure navigation={navigation} />,
					headerStyle: {
						backgroundColor: '#00549C', //Set Header color
					},
					headerTintColor: '#fff',
				}}
			/>
		</Stack.Navigator>
	);
}

function InventoryStack({ route, navigation }) {
	return (
		<Stack.Navigator initialRouteName="Inventory">
			<Stack.Screen
				name="InventoryReport"
				component={InventoryReport}
				options={{
					title: 'Wastage Report', //Set Header Title
					headerLeft: () => <NewNavigationDrawerStructure navigation={navigation} />,
					headerStyle: {
						backgroundColor: '#00549C', //Set Header color
					},
					headerTintColor: '#fff',
				}}
			/>
		</Stack.Navigator>
	);
}

function ReminderStack({ route, navigation }) {
	return (
		<Stack.Navigator initialRouteName="Reminders">
			<Stack.Screen
				name="RemindersReport"
				component={RemindersReport}
				options={{
					title: 'Reminders', //Set Header Title
					headerLeft: () => <NewNavigationDrawerStructure navigation={navigation} />,
					headerStyle: {
						backgroundColor: '#00549C', //Set Header color
					},
					headerTintColor: '#fff',
				}}
			/>
		</Stack.Navigator>
	);
}

function LoginStack() {
	return (
		<Stack.Navigator
			initialRouteName="Login"
			headerMode="none">
			<Stack.Screen
				name="Login"
				component={Login}
			/>
		</Stack.Navigator>
	);
}

function onLogout() {
	let settings = SettingRealm.getAllSetting();

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
	SettingsActions.setSettings(SettingRealm.getAllSetting());
	//As we are not going to the Login, the reason no reason to disable the token
	Communications.setToken('');
	// this.props.navigationProps.navigate('Login');
	return (
		<NavigationContainer>
			<LoginStack />
		</NavigationContainer>)
	//navigation.navigate('Login');
};


function CustomDrawerContent(props) {
	console.log('props-props-props', props)
	return (
		<DrawerContentScrollView {...props}>
			<Image source={require('../images/jibulogo.png')} resizeMode={'stretch'} style={{
				width: 100,
				height: 100,
				alignSelf: 'center'
			}} />
			<DrawerItemList {...props} />
			<DrawerItem label="Sync"
				icon={({ focused, color, size }) => <Icon size={25} color={"#808080"} name={'md-sync'} />}
				onPress={() => onSynchronize()} />
			<DrawerItem label="LogOut"
				icon={({ focused, color, size }) => <Icon size={25} color={"#808080"} name={'md-log-out'} />}
				onPress={() => onLogout()} />
		</DrawerContentScrollView>
	);
}


function onSynchronize() {
	console.log('start sync');
    try {
      this.setState({ isLoading: true });
      Synchronization.synchronize().then(syncResult => {
        this.setState({ isLoading: false });

        CustomerActions.setCustomers(
          CustomerRealm.getAllCustomer()
        );

        receiptActions.setReceipts(
          OrderRealm.getAllOrder()
        );

        receiptActions.setTransaction();

        Alert.alert(
          i18n.t('sync-results'),
          _getSyncResults(syncResult),
          [{ text: i18n.t('ok'), style: 'cancel' }],
          { cancelable: true }
        );
      });
    } catch (error) { }
  };

 function _getSyncResults(syncResult) {
    try {

      if (
        syncResult.customers.customers == 0 &&
        syncResult.products.products == 0 &&
        syncResult.orders.orders == 0 &&
        syncResult.meterReading.meterReading == 0 &&
        syncResult.wastageReport.wastageReport == 0 &&
        syncResult.recieptPayments.recieptPayments == 0 &&
        syncResult.topups.topups == 0 &&
        syncResult.customerReminder.customerReminder == 0
      ) {
        return i18n.t('data-is-up-to-date');
      } else {

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
        let final11 = '';

        if (syncResult.customers.customers > 0) {
          final1 = `${syncResult.customers.successError === 'success' ? `${syncResult.customers.customers} ` + i18n.t('customers-updated') : `${syncResult.customers.successMessage.message} Please Synchronise Before making any changes`}`
        }

        if (syncResult.products.products > 0) {
          final2 = `\n${syncResult.products.successError === 'success' ? `${syncResult.products.products + i18n.t('products-updated')}` : `${syncResult.products.successMessage.message} Please Synchronise Before making any changes`}`

        }

        if (syncResult.wastageReport.wastageReport > 0) {
          final3 = `\n${syncResult.wastageReport.successError === 'success' ? `${syncResult.wastageReport.wastageReport} ` + i18n.t('wastageReport-updated') : `${syncResult.wastageReport.successMessage.message} Please Synchronise Before making any changes`}`

        }


        if (syncResult.orders.orders > 0) {
          final4 = `\n${syncResult.orders.successError === 'success' ? `${syncResult.orders.orders} ` + i18n.t('sales-receipts-updated') : `${syncResult.orders.successMessage.message} Please Synchronise Before making any changes`}`
        }


        if (syncResult.debt.debt > 0) {
          final5 = `\n${syncResult.debt.successError === 'success' ? `${syncResult.debt.debt} ` + i18n.t('debt-updated') : `${syncResult.debt.successMessage.message} Please Synchronise Before making any changes`}`

        }



        if (
          syncResult.meterReading.meterReading > 0
        ) {
          final6 = `\n${syncResult.meterReading.successError === 'success' ? `${syncResult.meterReading.meterReading} ` + i18n.t('meterReading-updated') : `${syncResult.meterReading.successMessage.message} Please Synchronise Before making any changes`}`


        }


        if (
          syncResult.recieptPayments.recieptPayments > 0
        ) {

          final7 = `\n${syncResult.recieptPayments.successError === 'success' ? `${syncResult.recieptPayments.recieptPayments} ` + i18n.t('recieptPayments-updated') : `${syncResult.recieptPayments.successMessage.message} Please Synchronise Before making any changes`}`

        }


        if (
          syncResult.customerReminder.customerReminder > 0
        ) {
          final8 = `\n${syncResult.customerReminder.successError === 'success' ? `${syncResult.customerReminder.customerReminder} ` + i18n.t('customer-reminder-updated') : `${syncResult.customerReminder.successMessage.message} Please Synchronise Before making any changes`}`


        }


        if (
          syncResult.productMrps.productMrps > 0
        ) {
          final9 = `\n${syncResult.productMrps.successError === 'success' ? `${syncResult.productMrps.productMrps} ` + i18n.t('pricing-sheme-updated') : `${syncResult.productMrps.successMessage.message} Please Synchronise Before making any changes`}`


        }


        if (
          syncResult.salesChannels.salesChannels > 0
        ) {
          final10 = `\n${syncResult.salesChannels.successError === 'success' ? `${syncResult.salesChannels.salesChannels} ` + i18n.t('salechannel-updated') : `${syncResult.salesChannels.successMessage.message} Please Synchronise Before making any changes`}`



        }



        if (
          syncResult.topups.topups > 0
        ) {

          final10 = `\n${syncResult.topups.successError === 'success' ? `${syncResult.topups.topups} ` + i18n.t('topups-updated') : `${syncResult.topups.successMessage.message} Please Synchronise Before making any changes`}`


        }

        return final1 + final2 + final3 + final4 + final5 + final6 + final7 + final8 + final9 + final10 + final11
      }

    } catch (error) { }
  }




function DrawerContainer({ route, navigation }) {
	return (
		<Drawer.Navigator
			initialRouteName="ListCustomerStack"
			drawerContent={props => <CustomSidebarMenu {...props} />}
			//drawerContent={(props, navigation) => <CustomDrawerContent {...props} navigation={navigation} />}
			drawerContentOptions={{
				activeTintColor: '#ABC1DE',
				itemStyle: { marginVertical: 5 },
				activeBackgroundColor: {
					light: '#eee',
					dark: 'rgba(40,40,40,1)',
				},
			}}
			drawerType="slide"
			>
			<Drawer.Screen
				name="ListCustomerStack"
				options={{ drawerLabel: 'Customers' }}
				component={ListCustomerStack} />
			<Drawer.Screen
				name="TransactionStack"
				options={{ drawerLabel: 'Transactions' }}
				component={TransactionStack} />
			<Drawer.Screen
				name="SalesReportStack"
				options={{ drawerLabel: 'Sales Report', }}
				component={SalesReportStack} />
			<Drawer.Screen
				name="InventoryStack"
				options={{ drawerLabel: 'Wastage Report' }}
				component={InventoryStack} />
			<Drawer.Screen
				name="ReminderStack"
				options={{ drawerLabel: 'Reminders' }}
				component={ReminderStack} />
		</Drawer.Navigator>
	);
}

function App() {
	//SettingRealm.truncate();
	let settings = SettingRealm.getAllSetting();

	console.log('settings', settings);
	if (settings.site === "" && settings.siteId === 0) {
		//this.props.settingsActions.setSettings({ ...settings, loginSync: true });
		//	this.props.navigation.navigate('Login');
		return (
			<NavigationContainer>
				<LoginStack />
			</NavigationContainer>)
	}

	if (settings.site != "" && settings.siteId > 0) {
		//	this.loadSyncedData();
		if (settings.token.length > 1) {

			//this.props.settingsActions.setSettings({ ...settings, loginSync: false });
			//this.props.navigation.navigate('App');

			return (
				<NavigationContainer>
					<DrawerContainer />
				</NavigationContainer>)
		}

		if (settings.token.length === 0) {
			//this.props.settingsActions.setSettings(settings);
			//this.props.navigation.navigate('Login');
			return (
				<NavigationContainer>
					<LoginStack />
				</NavigationContainer>)
		}
	}

	// NetInfo.isConnected.fetch().then(isConnected => {
	// 	this.props.networkActions.NetworkConnection(isConnected);
	// 	Synchronization.setConnected(isConnected);
	// });
}


export default App;
const styles = StyleSheet.create({
	rowdir: {
		flexDirection: 'row',
	},
	custpicker: {
		marginTop: 12,
		flex: 1
	},
	smropicker: {
		height: 50,
		width: 190,
		color: 'white',
		alignContent: 'flex-end'
	}

});
