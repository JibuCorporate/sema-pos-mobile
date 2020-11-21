import React from 'react';
if (process.env.NODE_ENV === 'development') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
        trackAllPureComponents: true,
    });
}
import {
    View,
    Text,
    StyleSheet,
    Alert,
    Dimensions,
    TouchableWithoutFeedback,
    TouchableHighlight
} from 'react-native';
import { FloatingAction } from "react-native-floating-action";
import * as CustomerActions from '../actions/CustomerActions';
import AppContext from '../context/app-context';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Modal from 'react-native-modalbox';

import CustomerRealm from '../database/customers/customer.operations';
import CustomerTypeRealm from '../database/customer-types/customer-types.operations';
import i18n from '../app/i18n';

import PaymentTypeRealm from '../database/payment_types/payment_types.operations';
import * as PaymentTypesActions from "../actions/PaymentTypesActions";

import Icons from 'react-native-vector-icons/FontAwesome';

import PaymentModal from './paymentModal';
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
import StickyContainer from 'recyclerlistview/sticky';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

class CustomerList extends React.Component {
    static contextType = AppContext;
    constructor(props) {
        super(props);
        let { width } = Dimensions.get("window");

        this.state = {
            refresh: false,
            searchString: '',
            debtcustomers: false,
            walletcustomers: false,
            customerTypeFilter: '',
            customerTypeValue: '',
            hasScrolled: false,
            isPaymentModal: true,
            dataProvider: new DataProvider((r1, r2) => {
                return r1 !== r2;
            }),
        };

        this.layoutProvider = new LayoutProvider((i) => {
            return this.state.dataProvider ? this.state.dataProvider.getDataForIndex(i).type : [];
        }, (type, dim) => {
            switch (type) {
                case 'NORMAL':
                    dim.width = width;
                    dim.height = 50;
                    break;
                default:
                    dim.width = 0;
                    dim.height = 0;
                    break;
            };
        });

        this.rowRenderer = this.rowRenderer.bind(this);
    }

    static whyDidYouRender = true;


    componentDidMount() {
        this.prepareData();

        this.props.navigation.setParams({
            isCustomerSelected: false,
            customerTypeValue: 'all',
            customerName: '',
            searchCustomer: this.searchCustomer,
            checkCustomerTypefilter: this.checkCustomerTypefilter,
            onDelete: this.onDelete,
            clearLoan: this.clearLoan,
        });

        this.context.setSelectedCustomer({});

        this.context.setCustomerEditStatus(false);

    }

    searchCustomer = (searchText) => {
        this.prepareData(searchText, '');
    };


    checkCustomerTypefilter = (searchText) => {
        this.context.SearchCustomerTypes(searchText);
        this.prepareData('', searchText);
    };

    modalOnClose() {
        PaymentTypeRealm.resetSelected();
        this.props.paymentTypesActions.resetSelectedDebt();
        this.props.paymentTypesActions.setPaymentTypes(
            PaymentTypeRealm.getPaymentTypes());
        this.props.paymentTypesActions.resetSelectedPayment();
        this.prepareData();
    }

    closePaymentModal = () => {
        PaymentTypeRealm.resetSelected();
        this.props.paymentTypesActions.resetSelectedDebt();
        this.props.paymentTypesActions.resetSelectedPayment();
        this.props.paymentTypesActions.setPaymentTypes(
            PaymentTypeRealm.getPaymentTypes());
        this.prepareData();
        this.refs.modal6.close();
    };

    clearLoan = () => {
        this.refs.modal6.open();
    }

    onDelete = () => {
        if (
            this.context.selectedCustomer.hasOwnProperty('name')
            // && !this._isAnonymousCustomer(this.context.selectedCustomer)
        ) {
            let alertMessage =
                'Delete  customer ' + this.context.selectedCustomer.name;
            if (this.context.selectedCustomer.dueAmount === 0) {
                Alert.alert(
                    alertMessage,
                    'Are you sure you want to delete this customer?',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => { },
                            style: 'cancel'
                        },
                        {
                            text: 'OK',
                            onPress: () => {
                                CustomerRealm.softDeleteCustomer(
                                    this.context.selectedCustomer
                                ); // Delete from storage


                                this.context.setSelectedCustomer({});
                                this.context.setCustomerProps(
                                    {
                                        isCustomerSelected: false,
                                        isDueAmount: 0,
                                        customerName: '',
                                        'title': '',
                                    }
                                );

                                this.prepareData();


                            }
                        }
                    ],
                    { cancelable: false }
                );
            } else {
                Alert.alert(
                    "Customer '" +
                    this.context.selectedCustomer.name +
                    "' has an outstanding credit and cannot be deleted",
                    '',
                    [{
                        text: 'OK', onPress: () => {


                            this.context.setSelectedCustomer({});
                            this.context.setCustomerProps(
                                {
                                    isCustomerSelected: false,
                                    isDueAmount: 0,
                                    customerName: '',
                                    'title': '',
                                }
                            );

                        }
                    }],
                    { cancelable: true }
                );
            }
        }
    };

    handleOnPress(item) {
        this.context.setSelectedCustomer(item);
        this.context.setCustomerProps(
            {
                isDueAmount: item.dueAmount,
                isCustomerSelected: false,
                customerName: '',
                'title': item.name + "'s Order"
            }
        );
        this.props.navigation.navigate('OrderView');
    };

    onLongPressItem(item) {
        this.context.setSelectedCustomer(item);
        this.context.setCustomerProps(
            {
                isCustomerSelected: true,
                isDueAmount: item.dueAmount,
                customerName: item.name,
                'title': item.name
            }
        );

        this.context.setCustomerEditStatus(true);

    };

    rowRenderer = (type, data, index) => {
        let isSelected = false;
        if (this.context.selectedCustomer && this.context.selectedCustomer.customerId === data.item.customerId) {
            isSelected = true;
		}

        if (type == 'NORMAL' && data.item.id != null) {
            return (
                <TouchableHighlight
                    onLongPress={() => this.onLongPressItem(data.item)}
                    onPress={() => this.handleOnPress(data.item)}>
                    <View
                        style={[
                            this.getRowBackground(index, isSelected),
                            styles.listrowcont
                        ]}>
                        <View style={styles.OneHalf}>
                            <Text style={[styles.baseItem, styles.leftMargin]}>
                                {data.item.name}
                            </Text>
                        </View>
                        <View style={styles.flexOne}>
                            <Text style={styles.baseItem}>
                                {data.item.phoneNumber}
                            </Text>
                        </View>

                        <View style={styles.OneHalf}>
                            <Text style={styles.baseItem}>{data.item.address}</Text>
                        </View>
                        <View style={styles.flexOne}>
                            <Text style={styles.baseItem}>
                                {data.item.customerType}
                            </Text>
                        </View>
                        <View style={styles.flexOne}>
                            <Text style={styles.baseItem}>
                                {data.item.dueAmount.toFixed(2)}
                            </Text>
                        </View>
                        <View style={styles.flexOne}>
                            <Text style={styles.baseItem}>
                                {data.item.walletBalance.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </TouchableHighlight>
            );
        } else {
            return <View />;
        }
    }

    _overrideRowRenderer = (type, data, index) => {
        const view = this.rowRenderer(type, data, index);
        switch (index) {
            case 0:
                return (
                    <View
                        style={styles.headerBackground}>
                        <View style={styles.OneHalf}>
                            <Text style={[styles.headerItem, styles.leftMargin]}>
                                {i18n.t('account-name')}
                            </Text>
                        </View>
                        <View style={styles.flexOne}>
                            <Text style={styles.headerItem}>
                                {i18n.t('telephone-number')}
                            </Text>
                        </View>
                        <View style={styles.OneHalf}>
                            <Text style={styles.headerItem}>{i18n.t('address')}</Text>
                        </View>
                        <View style={styles.flexOne}>
                            <Text style={[styles.headerItem]}>{i18n.t('customer-type')}</Text>
                        </View>
                        <View style={styles.balance}>
                            <TouchableWithoutFeedback onPress={() => {
                                this.setState({ debtcustomers: !this.state.debtcustomers });
                                this.prepareData();
                            }}>
                                <Text style={styles.headerItem}>{i18n.t('balance')}
                                    <Icons
                                        name='sort'
                                        size={18}
                                        color="white"
                                        style={styles.iconStyle}
                                    />
                                </Text>

                            </TouchableWithoutFeedback>
                        </View>
                        <View style={styles.flexOne}>
                            <TouchableWithoutFeedback onPress={() => {
                                this.setState({ walletcustomers: !this.state.walletcustomers });
                                this.prepareData();
                            }}>
                                <Text style={[styles.headerItem]}>Wallet
                            <Icons
                                        name='sort'
                                        size={18}
                                        color="white"
                                        style={styles.iconStyle}
                                    />
                                </Text>
                            </TouchableWithoutFeedback>
                        </View>

                    </View>
                );
				break;
				default:
					return (
						<View />
					)
				break;
        }
        return view;
    };

    render() {
        return (
            <View style={styles.custcontainer}>
                <StickyContainer
                    stickyHeaderIndices={[0]}
                    overrideRowRenderer={this._overrideRowRenderer}>
                    <RecyclerListView
                        style={styles.flexOne}
                        rowRenderer={this.rowRenderer}
                        dataProvider={this.state.dataProvider}
                        layoutProvider={this.layoutProvider}
                    />
                </StickyContainer>

                <FloatingAction
                    onOpen={name => {

                        this.context.setSelectedCustomer({});
                        this.context.setCustomerProps(
                            {
                                isCustomerSelected: false,
                                isDueAmount: 0,
                                customerName: '',
                                'title': '',
                            }
                        );

                        this.context.setCustomerEditStatus(false);
                        this.props.navigation.navigate('EditCustomer');
                    }}
                />

                <View style={styles.modalPayment}>
                    <Modal
                        style={styles.modal3}
                        coverScreen={true}
                        position={"center"} ref={"modal6"}
                        onClosed={() => this.modalOnClose()}
                        isDisabled={this.state.isDisabled}>
                        <PaymentModal
                            modalOnClose={this.modalOnClose}
                            closePaymentModal={this.closePaymentModal} />
                    </Modal>
                </View>
                <SearchWatcher parent={this}>
                    {this.props.searchString}
                </SearchWatcher>
            </View>
        );
    };

    getItemLayout = (data, index) => ({
        length: 50,
        offset: 50 * index,
        index
    });

    filterItems = (data, customerSearch="", customerTypeFilter="") => {

        let filter = {
            searchString: customerSearch ? customerSearch : "",
            customerType: customerTypeFilter ? customerTypeFilter === 'all' ? "" : customerTypeFilter : "",
        };
        // data = data.map(item => {
        //     return {
        //         ...item,
        //         walletBalance: item.walletBalance ? item.walletBalance : 0,
        //         searchString: item.name.toLowerCase() + ' ' + item.phoneNumber.toLowerCase() + ' ' + item.address.toLowerCase(),
        //         customerType: item.customerType !== undefined ? item.customerType.toLowerCase() : "",
        //     }
		// });

		if(customerSearch !== "") {
			data = data.map(item => {
				return {
					...item,
					searchString: item.name.toLowerCase() + ' ' + item.phoneNumber.toLowerCase() + ' ' + item.address.toLowerCase(),
				}
			});
		} else if (customerTypeFilter !== "") {
			data = data.map(item => {
				return {
					...item,
					customerType: item.customerType !== undefined ? item.customerType.toLowerCase() : "",
				}
			});
		}

        data.sort((a, b) => {
            return a.name.toLowerCase() > b.name.toLowerCase();
        });

        if (this.state.debtcustomers) {
            data.sort((a, b) => {
                return Number(b.dueAmount) - Number(a.dueAmount);
            });
        }

        if (this.state.walletcustomers) {
            data.sort((a, b) => {
                return Number(b.walletBalance) - Number(a.walletBalance);
            });
		}

        let filteredItems = data.filter(function (item) {
            for (var key in filter) {
                if (
                    item[key] === undefined ||
                    item[key].toString().toLowerCase().includes(filter[key].toString().toLowerCase()) !=
                    filter[key].toString().toLowerCase().includes(filter[key].toString().toLowerCase())
                )
                    return false;
            }
            return true;
        });
        return filteredItems;
    };

    prepareData = (customerSearch, customerTypeFilter) => {
        let data = [];
        if (CustomerRealm.getAllCustomer().length > 0) {
            data = this.filterItems(CustomerRealm.getAllCustomer(), customerSearch, customerTypeFilter);
        }

		const customerData = [];
		customerData.push({
			type: 'NORMAL',
			item: {}
		})

        for (let i in data) {
            customerData.push({
                type: 'NORMAL',
                item: data[i],
            });
		}

        this.setState({
            dataProvider: this.state.dataProvider.cloneWithRows(customerData)
        });
    };

    _isAnonymousCustomer(customer) {
        return CustomerTypeRealm.getCustomerTypeByName('anonymous').id ==
            customer.customerTypeId
            ? true
            : false;
    }

    deleteCustomer() {
        let alertMessage = i18n.t('delete-specific-customer', {
            customerName: this.context.selectedCustomer.name
        });
        if (this.context.selectedCustomer.dueAmount === 0) {
            Alert.alert(
                alertMessage,
                i18n.t('are-you-sure', {
                    doThat: i18n.t('delete-this-customer')
                }),
                [
                    {
                        text: i18n.t('cancel'),
                        onPress: () => { },
                        style: 'cancel'
                    },
                    {
                        text: i18n.t('ok'),
                        onPress: () => {
                            CustomerRealm.softDeleteCustomer(
                                this.context.selectedCustomer
                            ); // Delete from storage
                            // Clear selected customer
                            this.context.setSelectedCustomer({});
                            this.props.customerActions.setCustomers(
                                CustomerRealm.getAllCustomer()
                            );
                        }
                    }
                ],
                { cancelable: false }
            );
        } else {
            Alert.alert(
                i18n.t('credit-customer-no-delete', {
                    customerName: this.context.selectedCustomer.name
                }),
                '',
                [
                    {
                        text: i18n.t('ok'),
                        onPress: () => { }
                    }
                ],
                { cancelable: true }
            );
        }
    }

    getRowBackground = (index, isSelected) => {
        if (isSelected) {
            return styles.selectedBackground;
        } else {
            return index % 2 === 0
                ? styles.lightBackground
                : styles.darkBackground;
        }
    };
}

class SearchWatcher extends React.PureComponent {
    render() {
        return this.searchEvent();
    }

    // TODO: Use states instead of setTimeout
    searchEvent() {

        let that = this;

        setTimeout(() => {
            if (
                that.props.parent.props.searchString !== that.props.parent.state.searchString
            ) {
                that.props.parent.state.searchString = that.props.parent.props.searchString;
                that.props.parent.setState({
                    refresh: !that.props.parent.state.refresh
                });
            }
        }, 50);
        return null;
    }
}

function mapStateToProps(state, props) {
    return {
        selectedCustomer: state.customerReducer.selectedCustomer,
        customers: state.customerReducer.customers,
        searchString: state.customerReducer.searchString,
        customerTypeFilter: state.customerReducer.customerTypeFilter,
        paymentTypes: state.paymentTypesReducer.paymentTypes,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        customerActions: bindActionCreators(CustomerActions, dispatch),
        paymentTypesActions: bindActionCreators(PaymentTypesActions, dispatch),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CustomerList);

const styles = StyleSheet.create({
	custcontainer: { backgroundColor: '#fff', flex: 1 },
    baseItem: {
        fontSize: 17
    },
    flexOne: { flex: 1 },
    leftMargin: {
        left: 10
    },
    balance: { flex: 1, flexDirection: 'row' },
    headerItem: {
        fontWeight: 'bold',
        fontSize: 18
    },
    OneHalf: { flex: 1.5 },
    headerBackground: {
        flex: 1,
        flexDirection: 'row',
        height: 50,
        alignItems: 'center',
        backgroundColor: '#ABC1DE'
    },
    list: { backgroundColor: '#fff', flex: 1 },
    modalPayment: {
        backgroundColor: 'white',
	},

    modal3: {
        // justifyContent: 'center',
        width: wp('70%'),
        height: 500,
    },
    modal: {
        justifyContent: 'center',
    },
    lightBackground: {
        backgroundColor: 'white'
    },
    darkBackground: {
        backgroundColor: '#F0F8FF'
    },
    selectedBackground: {
        backgroundColor: '#9AADC8'
    },
    listSty: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 15,
        paddingBottom: 15,
        alignItems: 'center'
    },
    iconStyle: {
        marginLeft: 10, marginRight: 5
    },
    listStyles: {
        flex: 1,
        flexDirection: 'row',
        paddingTop: 15,
        paddingBottom: 15,
        alignItems: 'center'
	},
	listrowcont: {
		flex: 1,
		flexDirection: 'row',
		paddingTop: 25,
		paddingBottom: 25,
		alignItems: 'center'
	},
	OneHalf: { flex: 1.5 },
});
