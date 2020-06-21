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
	Dimensions,
	TouchableWithoutFeedback,
	TouchableHighlight
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
import { RecyclerListView, DataProvider, LayoutProvider } from "recyclerlistview";
import StickyContainer from 'recyclerlistview/sticky';

class CustomerList extends React.Component {
    constructor(props) {
        super(props);
		// slowlog(this, /.*/);
		let { width } = Dimensions.get("window");

		const customerData = [];

		let mydata = this.prepareData();

		  for(let i in mydata) {
			  customerData.push({
				  type: 'NORMAL',
				  item: mydata[i],
			  });
		  }

		this.state = {
            refresh: false,
            searchString: '',
            debtcustomers: false,
            walletcustomers: false,
            customerTypeFilter: '',
            customerTypeValue: '',
            hasScrolled: false,
			isPaymentModal: true,
			list: new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(customerData)
		  };

		this.layoutProvider = new LayoutProvider((i) => {
		return this.state.list.getDataForIndex(i).type;
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

	componentDidMount(){
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

    searchCustomer = (searchText) => {
        this.props.customerActions.SearchCustomers(searchText);
    };


    checkCustomerTypefilter = (searchText) => {
        this.props.customerActions.SearchCustomerTypes(searchText);
    };

    modalOnClose() {
        PaymentTypeRealm.resetSelected();
        this.props.paymentTypesActions.resetSelectedDebt();
        this.props.paymentTypesActions.setPaymentTypes(
            PaymentTypeRealm.getPaymentTypes());
    }

    closePaymentModal = () => {
        this.refs.modal6.close();
    };

    clearLoan = () => {
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

    handleOnPress(item) {
		// requestAnimationFrame(() => {
			this.props.customerActions.CustomerSelected(item);
			this.props.customerActions.SetCustomerProp(
			    {
			        isDueAmount: item.dueAmount,
			        isCustomerSelected: false,
					customerName: '',
					'title': item.name + "'s Order"
			    }
			);

			// alert("Kimi Raikonnen" + JSON.stringify(item));
			this.props.navigation.navigate('OrderView');
		// });

    };

    onLongPressItem(item) {

			this.props.customerActions.CustomerSelected(item);

			this.props.customerActions.SetCustomerProp(
				{
					isCustomerSelected: true,
					isDueAmount: item.dueAmount,
					customerName: item.name,
					'title': item.name
				}
			);

			this.props.customerActions.setCustomerEditStatus(true);

	};

	rowRenderer = (type, data, index) => {
		let isSelected = false;
        // if (
        //     this.props.selectedCustomer &&
        //     this.props.selectedCustomer.customerId === data.item.customerId
        // ) {
        //     isSelected = true;
        // }
        if (type == 'NORMAL') {
            return (
				<TouchableHighlight
                            onLongPress={() => this.onLongPressItem(data.item)}
                            onPress={() => this.handleOnPress(data.item)}>
                <View
					style={[
						this.getRowBackground(1, isSelected),
						{
							flex: 1,
							flexDirection: 'row',
							paddingTop: 15,
							paddingBottom: 15,
							alignItems: 'center'
						}
					]}>
                    <View style={{ flex: 1.5 }}>
                        <Text style={[styles.baseItem, styles.leftMargin]}>
                            {data.item.name}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.baseItem}>
                            {data.item.phoneNumber}
                        </Text>
                    </View>

                    <View style={{ flex: 1.5 }}>
                        <Text style={[styles.baseItem]}>{data.item.address}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.baseItem}>
                            {data.item.customerType}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.baseItem}>
                            {data.item.dueAmount.toFixed(2)}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
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
        switch(index) {
            case 0: // Only overriding sticky index 7, sticky indices 3 and 10 will remain as they are.
                return (
                    <View
						style={[
							{
								flex: 1,
								flexDirection: 'row',
								height: 50,
								alignItems: 'center'
							},
							styles.headerBackground
						]}>
						<View style={[{ flex: 1.5 }]}>
							<Text style={[styles.headerItem, styles.leftMargin]}>
								{i18n.t('account-name')}
							</Text>
						</View>
						<View style={[{ flex: 1 }]}>
							<Text style={[styles.headerItem]}>
								{i18n.t('telephone-number')}
							</Text>
						</View>
						<View style={[{ flex: 1.5 }]}>
							<Text style={[styles.headerItem]}>{i18n.t('address')}</Text>
						</View>
						<View style={[{ flex: 1 }]}>
							<Text style={[styles.headerItem]}>{i18n.t('customer-type')}</Text>
						</View>
						<View style={[{ flex: 1, flexDirection: 'row' }]}>
							<TouchableWithoutFeedback onPress={() => {
								// this.setState({ debtcustomers: !this.state.debtcustomers });
								// this.setState({ refresh: !this.state.refresh });
							}}>
								<Text style={[styles.headerItem]}>{i18n.t('balance')}
									<Icons
										name='sort'
										size={18}
										color="white"
										style={{
											marginLeft: 10,
											marginRight: 5,
										}}
									/>
								</Text>

							</TouchableWithoutFeedback>
						</View>
						<View style={[{ flex: 1 }]}>
							<Text style={[styles.headerItem]}>Wallet</Text>
						</View>

					</View>
				);

                break;
        }
        return view;
    };

    render() {
        return (
            <View style={{ backgroundColor: '#fff', flex: 1 }}>

			<StickyContainer stickyHeaderIndices={[0]}
                             overrideRowRenderer={this._overrideRowRenderer}>
               <RecyclerListView
					style={{flex: 1}}
					rowRenderer={this.rowRenderer}
					dataProvider={this.state.list}
					layoutProvider={this.layoutProvider}
					/>
		 </StickyContainer>

                <FloatingAction
                    onOpen={name => {
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
                        this.props.navigation.navigate('EditCustomer');
                    }}
                />

                <View style={styles.modalPayment}>
                    <Modal
                        style={[styles.modal, styles.modal3]}
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
                customerType: item.customerType !== undefined ? item.customerType.toLowerCase() : "",
            }
        });
        data.sort((a, b) => {
            return a.name.toLowerCase() > b.name.toLowerCase();
        });

        // if (this.state.debtcustomers) {
        //     data.sort((a, b) => {
        //         return Number(b.dueAmount) - Number(a.dueAmount);
        //     });
        // }

        // if (this.state.walletcustomers) {
        //     data.sort((a, b) => {
        //         return Number(b.walletBalance) - Number(a.walletBalance);
        //     });
        // }

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
        if (CustomerRealm.getAllCustomer().length > 0) {
			// data = this.filterItems(this.props.customers);
			data = this.filterItems(CustomerRealm.getAllCustomer());
        }
        return data;
    };

    getCustomerTypes(item) {
        try {
            for (let i = 0; i < this.customerTypes.length; i++) {
                if (this.customerTypes[i].id === item.customerTypeId) {
                    return this.customerTypes[i].name;
                }
            }
        } catch (error) {
            return 'Walk-up';
        }
    }

    _isAnonymousCustomer(customer) {
        return CustomerTypeRealm.getCustomerTypeByName('anonymous').id ==
            customer.customerTypeId
            ? true
            : false;
    }

    deleteCustomer() {
        let alertMessage = i18n.t('delete-specific-customer', {
            customerName: this.props.selectedCustomer.name
        });
        if (this.props.selectedCustomer.dueAmount === 0) {
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
                                this.props.selectedCustomer
                            ); // Delete from storage
                            this.props.customerActions.CustomerSelected({}); // Clear selected customer
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
                    customerName: this.props.selectedCustomer.name
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

    showHeader = () => {
        return (
            <View
                style={[
                    {
                        flex: 1,
                        flexDirection: 'row',
                        height: 50,
                        alignItems: 'center'
                    },
                    styles.headerBackground
                ]}>
                <View style={[{ flex: 1.5 }]}>
                    <Text style={[styles.headerItem, styles.leftMargin]}>
                        {i18n.t('account-name')}
                    </Text>
                </View>
                <View style={[{ flex: 1 }]}>
                    <Text style={[styles.headerItem]}>
                        {i18n.t('telephone-number')}
                    </Text>
                </View>
                <View style={[{ flex: 1.5 }]}>
                    <Text style={[styles.headerItem]}>{i18n.t('address')}</Text>
                </View>
                <View style={[{ flex: 1 }]}>
                    <Text style={[styles.headerItem]}>{i18n.t('customer-type')}</Text>
                </View>
                <View style={[{ flex: 1, flexDirection: 'row' }]}>
                    <TouchableWithoutFeedback onPress={() => {
                        this.setState({ debtcustomers: !this.state.debtcustomers });
                        this.setState({ refresh: !this.state.refresh });
                    }}>
                        <Text style={[styles.headerItem]}>{i18n.t('balance')}
                            <Icons
                                name='sort'
                                size={18}
                                color="white"
                                style={{
                                    marginLeft: 10,
                                    marginRight: 5,
                                }}
                            />
                        </Text>

                    </TouchableWithoutFeedback>
                </View>
                <View style={[{ flex: 1 }]}>
                    <Text style={[styles.headerItem]}>Wallet</Text>
                </View>

            </View>
        );
    };

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
    baseItem: {
        fontSize: 17
    },
    leftMargin: {
        left: 10
    },
    headerItem: {
        fontWeight: 'bold',
        fontSize: 18
    },
    headerBackground: {
        backgroundColor: '#ABC1DE'
    },
    modalPayment: {
        backgroundColor: 'white',
    },
    modal3: {
        width: '70%',
        height: 400,
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
	listSty:  {
		flex: 1,
		flexDirection: 'row',
		paddingTop: 15,
		paddingBottom: 15,
		alignItems: 'center'
	}
});
