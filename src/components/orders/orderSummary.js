import React from "react";
if (process.env.NODE_ENV === 'development') {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
        trackAllPureComponents: true,
    });
}
import { View, Text, StyleSheet, Alert, InteractionManager } from "react-native";
import orderItemStyles from "./orderItemStyles";
import { connect } from "react-redux";
import i18n from "../../app/i18n";
import SettingRealm from '../../database/settings/settings.operations';
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
        orderItems: state.orderReducer.products
    };
}

export default connect(mapStateToProps)(OrderSummary);
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
