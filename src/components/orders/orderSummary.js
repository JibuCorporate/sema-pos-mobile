import React from "react";
if (process.env.NODE_ENV === 'development') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
        trackAllPureComponents: true,
    });
}
import { View, Text, Button, TouchableOpacity, ScrollView, FlatList, TextInput, TouchableHighlight, StyleSheet, Alert, InteractionManager } from "react-native";
import orderItemStyles from "./orderItemStyles";
import orderCheckOutStyles from "./orderCheckOutStyles";
import { connect } from "react-redux";
import i18n from "../../app/i18n";
import Modal from 'react-native-modalbox';
import Icon from 'react-native-vector-icons/Ionicons';
import DiscountRealm from '../../database/discount/discount.operations';
import ToggleSwitch from 'toggle-switch-react-native';
import AppContext from '../../context/app-context';
import { bindActionCreators } from "redux";
import * as OrderActions from "../../actions/OrderActions";
import * as DiscountActions from '../../actions/DiscountActions';

import { CheckBox, Card } from 'react-native-elements';
import DateTimePicker from 'react-native-modal-datetime-picker';
import * as CustomerReminderActions from '../../actions/CustomerReminderActions';
import * as CustomerActions from '../../actions/CustomerActions';
import * as PaymentTypesActions from "../../actions/PaymentTypesActions";
import * as receiptActions from '../../actions/ReceiptActions';
import * as TopUpActions from '../../actions/TopUpActions';
import CreditRealm from '../../database/credit/credit.operations';
import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';
import ProductMRPRealm from '../../database/productmrp/productmrp.operations';
import CustomerDebtRealm from '../../database/customer_debt/customer_debt.operations';
import SettingRealm from '../../database/settings/settings.operations';
import PaymentDescription from './order-checkout/payment-description';
import PaymentTypeRealm from '../../database/payment_types/payment_types.operations';
import CustomerRealm from '../../database/customers/customer.operations';
import OrderRealm from '../../database/orders/orders.operations';
import CustomerReminderRealm from '../../database/customer-reminder/customer-reminder.operations';
import ReceiptPaymentTypeRealm from '../../database/reciept_payment_types/reciept_payment_types.operations';

const uuidv1 = require('uuid/v1');
import { withNavigation } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
class OrderSummary extends React.PureComponent {
    constructor(props) {
        super(props);

    }

    getCurrency = () => {
        let settings = SettingRealm.getAllSetting();
        return settings.currency;
    };

    getAmount = () => {
        let propducts = this.props.orderItems;
        if (propducts.length > 0) {
            let totalAmount = 0;
            for (let i of propducts) {
                if (i.product.description === 'discount') {
                    totalAmount = totalAmount + i.finalAmount;
                }
                else if (i.product.description === 'delivery') {
                    totalAmount = totalAmount + i.finalAmount;
                } else {
                    totalAmount = totalAmount + i.finalAmount;
                }
            }
            return totalAmount;

        }
        return 0;
    };

    getTotalOrders = () => {
        return this.props.orderItems.reduce((total, item) => {
            if (item.product.description != 'discount' && item.product.description != 'delivery') {
                return (total + item.quantity);
            } else {
                return (total + 0);
            }
        }, 0);
    };


    render() {
        return (

            <View style={styles.container}>
                <View style={orderItemStyles.rowDirection}>
                    <Text style={[styles.orderSummaryViewTextOne, styles.summaryText]}>{i18n.t('order-summary')}</Text>
                    <Text style={[orderItemStyles.flexOne, styles.summaryText]}>{i18n.t('cart')} ({this.getTotalOrders()})</Text>
                </View>
                <View style={styles.containerTotal}>
                    <Text style={orderItemStyles.flexTwo, styles.totalText}>{i18n.t('order-total')}</Text>
                    <Text style={orderItemStyles.flexThree, styles.totalText}>{this.getCurrency().toUpperCase()} {this.getAmount()}</Text>
                </View> 
            </View>

        )
    }

}


function mapStateToProps(state, props) {
    return {
        orderItems: state.orderReducer.products,
        discounts: state.discountReducer.discounts,
        paymentTypes: state.paymentTypesReducer.paymentTypes,
        delivery: state.paymentTypesReducer.delivery,
        selectedPaymentTypes: state.paymentTypesReducer.selectedPaymentTypes,
        selectedDiscounts: state.orderReducer.discounts,
        channel: state.orderReducer.channel,
        receiptsPaymentTypes: state.paymentTypesReducer.receiptsPaymentTypes,
        receipts: state.receiptReducer.receipts,
        payment: state.orderReducer.payment,
        selectedCustomer: state.customerReducer.selectedCustomer,
        topups: state.topupReducer.topups,
        topupTotal: state.topupReducer.total,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        orderActions: bindActionCreators(OrderActions, dispatch),
        discountActions: bindActionCreators(DiscountActions, dispatch),
        receiptActions: bindActionCreators(receiptActions, dispatch),
        customerActions: bindActionCreators(CustomerActions, dispatch),
        paymentTypesActions: bindActionCreators(PaymentTypesActions, dispatch),
        topUpActions: bindActionCreators(TopUpActions, dispatch),
        customerReminderActions: bindActionCreators(CustomerReminderActions, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderSummary);


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: "white",
        borderColor: '#2858a7',
        borderTopWidth: 5,
        borderRightWidth: 5,

    },
    summaryText: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'black',
        alignSelf: 'center'
    },

    containerTotal: {
        flex: 2,
        backgroundColor: "#e0e0e0",
        flexDirection: 'row',
        borderColor: '#2858a7',
        borderTopWidth: 5,
        borderRightWidth: 5,

    },
    orderSummaryViewTextOne: { flex: 3, marginLeft: 20 },
    totalText: {
        marginTop: 10,
        fontWeight: 'bold',
        fontSize: 18,
        color: 'black',
        alignSelf: 'center'
    },
    leftMargin: {
        left: 10
    },

    iconleftMargin: {
        textAlign: 'center',
        left: 10
    }

});
