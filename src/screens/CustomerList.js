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
    FlatList,
    TouchableWithoutFeedback,
    TouchableHighlight,
    InteractionManager
} from 'react-native';
import { FloatingAction } from "react-native-floating-action";
import * as CustomerActions from '../actions/CustomerActions';

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

import slowlog from 'react-native-slowlog';

class CustomerItem extends React.PureComponent {
    constructor(props) {
        super(props);
        this.handleOnPress = this.handleOnPress.bind(this);
        this.onLongPressItem = this.onLongPressItem.bind(this);
    }

    static whyDidYouRender = true;

    onLongPressItem = () => {
        this.props.customerActions.CustomerSelected(this.props.item);
        this.props.customerActions.SetCustomerProp({
            isCustomerSelected: true,
            isDueAmount: this.props.item.dueAmount,
            customerName: this.props.item.name,
            'title': this.props.item.name
        }
        );

        this.props.customerActions.setCustomerEditStatus(true);
    }

    handleOnPress = () => {
        // InteractionManager.runAfterInteractions(() => {
        this.props.customerActions.CustomerSelected(this.props.item);
        this.props.customerActions.SetCustomerProp({
            isDueAmount: this.props.item.dueAmount,
            isCustomerSelected: false,
            customerName: '',
            'title': this.props.item.name + "'s Order"
        }
        );
        this.props.navigation.navigate('ListCustomerStack', { screen: 'OrderView' });
        // this.props.navigation.navigate('OrderView');
        // });

    }

    getRowBackground() {
        let isSelected = false;
        if (isSelected) {
            return styles.selectedBackground;
        } else {
            return this.props.index % 2 === 0
                ? styles.lightBackground
                : styles.darkBackground;
        }
    }

    getCustomerTypes() {
        const customerTypeIts = CustomerTypeRealm.getCustomerTypes();
        try {
            for (let i = 0; i < customerTypeIts.length; i++) {
                if (customerTypeIts[i].id === this.props.item.customerTypeId) {
                    return customerTypeIts[i].name;
                }
            }
        } catch (error) {
            return 'Walk-up';
        }
    }

    render() {
        return (
            <TouchableHighlight
                onLongPress={this.onLongPressItem}
                onPress={this.handleOnPress}
                onShowUnderlay={this.props.separators.highlight}
                onHideUnderlay={this.props.separators.unhighlight}>
                <View
                    style={[
                        this.getRowBackground(), styles.listStyles
                    ]}>
                    <View style={styles.OneHalf}>
                        <Text style={[styles.baseItem, styles.leftMargin]}>
                            {this.props.item.name}
                        </Text>
                    </View>
                    <View style={styles.flexOne}>
                        <Text style={styles.baseItem}>
                            {this.props.item.phoneNumber}
                        </Text>
                    </View>

                    <View style={styles.OneHalf}>
                        <Text style={[styles.baseItem]}>{this.props.item.address}</Text>
                    </View>
                    <View style={styles.flexOne}>
                        <Text style={styles.baseItem}>
                            {this.getCustomerTypes()}
                        </Text>
                    </View>
                    <View style={styles.flexOne}>
                        <Text style={styles.baseItem}>
                            {this.props.item.dueAmount ? this.props.item.dueAmount.toFixed(2) : 0}
                        </Text>
                    </View>
                    <View style={styles.flexOne}>
                        <Text style={styles.baseItem}>
                            {this.props.item.walletBalance.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </TouchableHighlight>

        );
    }
}


class CustomerList extends React.Component {
    constructor(props) {
        super(props);
        slowlog(this, /.*/);

        this.state = {
            refresh: false,
            searchString: '',
            debtcustomers: false,
            walletcustomers: false,
            customerTypeFilter: '',
            customerTypeValue: '',
            hasScrolled: false,
            isPaymentModal: true,
        };

    }

    static whyDidYouRender = true;

    componentDidMount() {
        this.props.navigation.setParams({
            isCustomerSelected: false,
            customerTypeValue: 'all',
            customerName: '',
            searchCustomer: this.searchCustomer,
            checkCustomerTypefilter: this.checkCustomerTypefilter,
            onDelete: this.onDelete,
            clearLoan: this.clearLoan,
        });

        this.props.customerActions.CustomerSelected({});
        this.props.customerActions.setCustomerEditStatus(false);
    }

    getCustomerTypes = (item) => {
        const customerTypeIts = CustomerTypeRealm.getCustomerTypes();
        try {
            for (let i = 0; i < customerTypeIts.length; i++) {
                if (customerTypeIts[i].id === item.customerTypeId) {
                    return customerTypeIts[i].name;
                }
            }
        } catch (error) {
            return 'Walk-up';
        }
    }


    filterItems = data => {
        let filter = {
            searchString: this.props.searchString.length > 0 ? this.props.searchString : "",
            customerType: this.props.customerTypeFilter.length > 0 ? this.props.customerTypeFilter === 'all' ? "" : this.props.customerTypeFilter : "",
        };
        data = data.map(item => {
            return {
                ...item,
                walletBalance: item.walletBalance ? item.walletBalance : 0,
                searchString: item.name + ' ' + item.phoneNumber + ' ' + item.address,
                customerType: this.getCustomerTypes(item) !== undefined ? this.getCustomerTypes(item).toLowerCase() : "",
            }
        });
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
                    item[key].toString() === undefined ||
                    item[key].toString().toLowerCase().includes(filter[key].toString().toLowerCase()) !=
                    filter[key].toString().toLowerCase().includes(filter[key].toString().toLowerCase())
                )
                    return false;
            }
            return true;
        });
        return filteredItems;
    };

    prepareData = () => {
        let data = [];
        if (this.props.customers.length > 0) {
            data = this.filterItems(this.props.customers);
        }
        return data;
    };

    getItemLayout = (data, index) => ({
        length: 50,
        offset: 50 * index,
        index
    });

    searchCustomer = (searchText) => {
        this.props.customerActions.SearchCustomers(searchText);
    };


    checkCustomerTypefilter = (searchText) => {
        this.props.customerActions.SearchCustomerTypes(searchText);
    };


    modalOnClose() {
        PaymentTypeRealm.resetSelected();
        this.props.paymentTypesActions.resetSelectedDebt();
        this.props.paymentTypesActions.resetSelectedPayment();
        this.props.paymentTypesActions.setPaymentTypes(
            PaymentTypeRealm.getPaymentTypes());
    }

    closePaymentModal = () => {
        PaymentTypeRealm.resetSelected();
        this.props.paymentTypesActions.resetSelectedPayment();
        this.props.paymentTypesActions.resetSelectedDebt();
        this.props.paymentTypesActions.setPaymentTypes(
            PaymentTypeRealm.getPaymentTypes());
        this.setState({ isPaymentModal: false });
        this.refs.modal6.close();
    };


    clearLoan = () => {
        this.setState({ isPaymentModal: true });
        this.refs.modal6.open();
    }

    onDelete = () => {
        if (
            this.props.selectedCustomer.hasOwnProperty('name')
            // && !this._isAnonymousCustomer(this.props.selectedCustomer)
        ) {
            let alertMessage =
                'Delete  customer ' + this.props.selectedCustomer.name;
            if (this.props.selectedCustomer.dueAmount === 0) {
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
                                    this.props.selectedCustomer
                                ); // Delete from storage
                                this.props.customerActions.CustomerSelected({}); // Clear selected customer

                                this.props.customerActions.SetCustomerProp(
                                    {
                                        isDueAmount: 0,
                                        isCustomerSelected: false,
                                        customerName: '',
                                        'title': ""
                                    }
                                );


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
                    "Customer '" +
                    this.props.selectedCustomer.name +
                    "' has an outstanding credit and cannot be deleted",
                    '',
                    [{
                        text: 'OK', onPress: () => {
                            this.props.customerActions.CustomerSelected({}); // Clear selected customer

                            this.props.customerActions.SetCustomerProp(
                                {
                                    isDueAmount: 0,
                                    isCustomerSelected: false,
                                    customerName: '',
                                    'title': ""
                                }
                            );
                        }
                    }],
                    { cancelable: true }
                );
            }
        }
    };


    showHeader = () => {
        return (
            <View
                style={styles.headerBackground}>
                <View style={[styles.OneHalf]}>
                    <Text style={[styles.headerItem, styles.leftMargin]}>
                        {i18n.t('account-name')}
                    </Text>
                </View>
                <View style={styles.flexOne}>
                    <Text style={styles.headerItem}>
                        {i18n.t('telephone-number')}
                    </Text>
                </View>
                <View style={[styles.OneHalf]}>
                    <Text style={[styles.headerItem]}>{i18n.t('address')}</Text>
                </View>
                <View style={[styles.flexOne]}>
                    <Text style={[styles.headerItem]}>{i18n.t('customer-type')}</Text>
                </View>
                <View style={[styles.balance]}>
                    <TouchableWithoutFeedback onPress={() => {
                        this.setState({ debtcustomers: !this.state.debtcustomers });
                        this.setState({ refresh: !this.state.refresh });
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
                        this.setState({ refresh: !this.state.refresh });
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
    };

    renderItem = ({ item, index, separators }) => {
        return (
            <CustomerItem
                item={item}
                index={index}
                separators={separators}
                customerActions={this.props.customerActions}
                navigation={this.props.navigation}
            />
        )
    };

    render() {
        return (
            <View style={styles.list}>
                <FlatList
                    ref={ref => {
                        this.flatListRef = ref;
                    }}
                    getItemLayout={this.getItemLayout}
                    data={this.prepareData()}
                    ListHeaderComponent={this.showHeader}
                    stickyHeaderIndices={[0]}
                    extraData={this.state.refresh}
                    renderItem={this.renderItem}
                    keyExtractor={(item, idx) => item.customerId + idx}
                    legacyImplementation={true}
                    maxToRenderPerBatch={1}
                    initialNumToRender={0}
                />
                <FloatingAction
                    onOpen={name => {
                        requestAnimationFrame(() => {
                            this.props.customerActions.CustomerSelected({});
                            this.props.customerActions.setCustomerEditStatus(false);
                            this.props.customerActions.SetCustomerProp(
                                {
                                    isCustomerSelected: false,
                                    isDueAmount: 0,
                                    customerName: '',
                                    'title': '',
                                }
                            );
                            this.props.navigation.navigate('ListCustomerStack', { screen: 'EditCustomer' });


                        });
                    }}
                />

                <View style={styles.modalPayment}>
                    <Modal
                        style={styles.modal3}
                        coverScreen={true}
                        position={"center"}
                        ref={"modal6"}
                        onClosed={() => this.modalOnClose()}
                        isDisabled={this.state.isDisabled}>

                        {this.openModal()}


                    </Modal>
                </View>
                <SearchWatcher parent={this}>
                    {this.props.searchString}
                </SearchWatcher>
            </View>
        );
    };

    openModal() {
        if (this.state.isPaymentModal) {
            return (<PaymentModal
                modalOnClose={this.modalOnClose}
                closePaymentModal={this.closePaymentModal} />)
        } else {
            return null;
        }
    }


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
                that.props.parent.props.searchString !==
                that.props.parent.state.searchString
            ) {
                that.props.parent.state.searchString =
                    that.props.parent.props.searchString;
                that.props.parent.setState({
                    refresh: !that.props.parent.state.refresh
                });
            }
        }, 50);
        return null;
    }
}


function mapStateToProps(state) {
    return {
        selectedCustomer: state.customerReducer.selectedCustomer,
        customers: state.customerReducer.customers,
        isUpdate: state.customerReducer.isUpdate,
        products: state.productReducer.products,
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
        justifyContent: 'center',
        width: '70%',
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
    }
});
