import React from 'react';
import {  View, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { createDrawerNavigator } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import CustomerList from '../screens/CustomerList';
import CustomerEdit from '../screens/CustomerEdit';
import CustomerDetails from '../screens/CustomerDetails';
import CreditHistory from '../screens/CreditHistory';
import Login from '../screens/Login';
import AuthLoadingScreen from '../screens/AuthLoadingScreen';
import Transactions from '../components/reports/Transactions';

import OrderView from '../components/orders/OrderView';

import InventoryReport from '../components/reports/InventoryReport';
import RemindersReport from '../components/reports/ReminderReport';
import SalesReport from '../components/reports/SalesReport';

import CustomSidebarMenu from './CustomSidebarMenu';
import CustomerListHeader from './CustomerListHeader';
import CustomerTitle from './CustomerTitle';
import Icon from 'react-native-vector-icons/Ionicons';
// import NavigationDrawerStructure from './NavigationDrawerStructure';

import { enableScreens } from 'react-native-screens';
enableScreens();

class NavigationDrawerStructure extends React.PureComponent {
    toggleDrawer = () => {
        this.props.navigationProps.toggleDrawer();
    };

    render() {
        return (
            <View style={styles.cont}>
                <TouchableOpacity onPress={this.toggleDrawer.bind(this)}>
                    <Icon
                        name='md-menu'
                        size={30}
                        color="white"
                        style={styles.drawerIcon}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

const CreditHistoryStack = createStackNavigator({
    CreditHistory: {
        screen: CreditHistory,
        navigationOptions: {
            title: 'Customer Wallet',
        }
    }
},
    {
        headerMode: 'none',
        initialRouteName: 'CreditHistory'

    });

const CustomerTransactionStack = createStackNavigator({
    Transaction: {
        screen: CustomerDetails
    },
},
    {
        headerMode: 'none',
        initialRouteName: 'Transaction'
    });

const TabNavigator = createBottomTabNavigator({
    Transaction: CustomerTransactionStack,
    CustomerWallet: {
        screen: CreditHistoryStack,
        navigationOptions: () => ({
            title: `Customer Wallet`,
        }),
    },

},
    {
        initialRouteName: 'Transaction',
        headerMode: 'none',
        swipeEnabled: true,
        animationEnabled: true,
        tabBarOptions: {
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
        }
	});

const CustomerListHeaderComponent = ({ navigation }) => {
		return <CustomerListHeader navigation={navigation} />;
}

const ListCustomerStack = createStackNavigator({
    CustomerList: {
        screen: CustomerList,
        navigationOptions: ({ navigation }) => ({
            headerTitle: () => <CustomerTitle navigation={navigation} title={`Customers`} />,
            headerLeft: () => <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: '#00549C'
            },
            headerTintColor: '#fff',
            headerRight: () => <CustomerListHeaderComponent />
        }),
	},

	OrderView: {
		screen: OrderView,
		navigationOptions: ({ navigation }) => ({
			headerTitle: () => <CustomerTitle navigation={navigation} />,
			headerStyle: {
				backgroundColor: '#00549C',
			},
			headerTintColor: '#fff',
		})
	},

	EditCustomer: {
		screen: CustomerEdit,
		navigationOptions: ({ navigation }) => ({
			title: navigation.getParam('isEdit') ? 'Edit Customer' : 'New Customer',
			headerStyle: {
				backgroundColor: '#00549C',
			},
			headerTintColor: '#fff',
		})
	},
	CustomerDetails: {
		screen: TabNavigator,
		navigationOptions: () => ({
			title: 'Customer Details',
			headerStyle: {
				backgroundColor: '#00549C'
			},
			headerTintColor: '#fff',
		})
	},

},

    {
        initialRouteName: 'CustomerList',
        headerMode: 'float'
    }
);

const TransactionStack = createStackNavigator({
    Transactions: {
        screen: Transactions,
        navigationOptions: ({navigation}) => ({
            title: 'Transactions',
            headerLeft: () => <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: '#00549C',
            },
            headerTintColor: '#fff',
            // headerRight: () => (
            //     <View
            //         style={styles.rowdir}>
            //         <View
            //             style={styles.custpicker}>
            //             <Picker
            //                 mode="dropdown"
            //                 selectedValue={navigation.getParam('paymentTypeValue')}
            //                 style={styles.smropicker}
            //                 onValueChange={navigation.getParam('checkPaymentTypefilter')}>
            //                 <Picker.Item label="All Payment Types" value="all" />
            //                 <Picker.Item label="Cash" value="cash" />
            //                 <Picker.Item label="Mobile" value="mobile" />
            //                 <Picker.Item label="Loan" value="loan" />
            //                 <Picker.Item label="Cheque" value="cheque" />
            //                 <Picker.Item label="Bank" value="bank" />
            //                 <Picker.Item label="Wallet" value="credit" />
            //             </Picker>
            //         </View>
            //     </View>
            // ),
        }),
    },
});


const SalesReportStack = createStackNavigator({
    SalesReport: {
        screen: SalesReport,
        navigationOptions: ({ navigation }) => ({
            title: 'Sales Report',
            headerLeft: () => <NavigationDrawerStructure  navigationProps={navigation}/>,
            headerStyle: {
                backgroundColor: '#00549C',
            },
            headerTintColor: '#fff',
        }),
    },
});

const InventoryStack = createStackNavigator({
    Inventory: {
        screen: InventoryReport,
        navigationOptions: ({ navigation }) => ({
            title: 'Wastage Report',
            headerLeft: () => <NavigationDrawerStructure navigationProps={navigation}/>,
            headerStyle: {
                backgroundColor: '#00549C',
            },
            headerTintColor: '#fff',
        }),
    },
});

const ReminderStack = createStackNavigator({
    Reminders: {
        screen: RemindersReport,
        navigationOptions: ({ navigation }) => ({
            title: 'Reminders',
            headerLeft: () => <NavigationDrawerStructure navigationProps={navigation} />,
            headerStyle: {
                backgroundColor: '#00549C',
            },
            headerTintColor: '#fff',
        }),
    },
});


const LoginStack = createStackNavigator({
    Login: {
        screen: Login
    },
},
    {
        initialRouteName: 'Login',
        headerMode: 'none',
	});

 const SidebarComponent = () => {
		// Don't pass all the props so we don't trigger re-render
		// Only pass required props
		return <CustomSidebarMenu />
}


const JibuDrawerNavigation = createDrawerNavigator({
    ListCustomers: {
        screen: ListCustomerStack,
        navigationOptions: {
            drawerLabel: 'Customers',
        },
    },
    Transactions: {
        screen: TransactionStack,
        navigationOptions: {
            drawerLabel: 'Transactions',
        },
    },
    SalesReport: {
        screen: SalesReportStack,
        navigationOptions: {
            drawerLabel: 'Sales Reports',
        },
    },

    Inventory: {
        screen: InventoryStack,
        navigationOptions: {
            drawerLabel: 'Wastage Report',
        },
    },
    Reminders: {
        screen: ReminderStack,
        navigationOptions: {
            drawerLabel: 'Reminders',
        },
    },
},
    {
        contentOptions: {
            activeTintColor: '#ABC1DE',
        },
        initialRouteName: 'ListCustomers',
        contentComponent: SidebarComponent,
        drawerBackgroundColor: {
            light: '#eee',
            dark: 'rgba(40,40,40,1)',
        },
        drawerType: 'slide',
        drawerWidth: Dimensions.get('window').width * .3,
    });

const JibuRouter = createSwitchNavigator(
    {
        AuthLoading: AuthLoadingScreen,
        App: JibuDrawerNavigation,
        Login: LoginStack,
    },
    {
        initialRouteName: 'AuthLoading',
    }
);

export default createAppContainer(JibuRouter);

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
	}, cont: {
		flexDirection: 'row'
	},
	drawerIcon: {
		width: 50, height: 30, marginLeft: 10, paddingRight:20
	}

});
