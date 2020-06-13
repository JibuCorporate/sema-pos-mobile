import React from 'react';
import { View, Dimensions, Picker, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Communications from '../services/Communications';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
				onPress={() => alert('Link to help')} />
			<DrawerItem label="LogOut"
				icon={({ focused, color, size }) => <Icon size={25} color={"#808080"} name={'md-log-out'} />}
				onPress={() => onLogout()} />
		</DrawerContentScrollView>
	);
}



function DrawerContainer({ route, navigation }) {
	return (
		<Drawer.Navigator
			initialRouteName="ListCustomerStack"
			//drawerContent={props => <CustomSidebarMenu {...props} />}
			drawerContent={(props, navigation) => <CustomDrawerContent {...props} navigation={navigation} />}
			drawerContentOptions={{
				activeTintColor: '#e91e63',
				itemStyle: { marginVertical: 5 },
			}}>
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
