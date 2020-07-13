import React from 'react';

import { View, Text, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { Card, Button, Input } from 'react-native-elements';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Events from 'react-native-simple-events';

import Ionicons from 'react-native-vector-icons/Ionicons';
import RNPickerSelect from 'react-native-picker-select';

import CustomerRealm from '../database/customers/customer.operations';
import CustomerTypeRealm from '../database/customer-types/customer-types.operations';
import SalesChannelRealm from '../database/sales-channels/sales-channels.operations';
import * as CustomerActions from '../actions/CustomerActions';
import AppContext from '../context/app-context';
import i18n from '../app/i18n';

class CustomerEdit extends React.PureComponent {
	static contextType = AppContext;

	constructor(props) {
		super(props);

		this.state = {
			isEditInProgress: false,
			isCreateInProgress: false,
			isLoading: true,
			salescid: 0,
			language: ''
		};

		this.saleschannelid = 0;
		this.phone = React.createRef();
		this.secondPhoneNumber = React.createRef();
		this.name = React.createRef();
		this.address = React.createRef();
		this.customerType = React.createRef();

		this.customerTypes = CustomerTypeRealm.getCustomerTypesForDisplay(this.saleschannelid);
		this.customerTypeOptions = this.customerTypes.map((customerType) => {
			return customerType.displayName;
		});

		this.customerTypesOptions = this.customerTypes.map((customerType) => {
			const rObj = {};
			rObj.label = customerType.displayName;
			rObj.value = customerType.id;
			rObj.key = customerType.salesChannelId;
			return rObj;
		});

		this.customerTypesIndicies = this.customerTypes.map((customerType) => {
			return customerType.id;
		});
	}

	componentDidMount() {
		console.log('this.context.edit', this.context);
		if (this.context.isEdit) {
			this.props.navigation.setParams({ isEdit: true });

			this.setState({
				name: this.context.selectedCustomer.name ? this.context.selectedCustomer.name : '',
				phoneNumber: this.context.selectedCustomer.phoneNumber
					? this.context.selectedCustomer.phoneNumber
					: '',
				secondPhoneNumber: this.context.selectedCustomer.secondPhoneNumber
					? this.context.selectedCustomer.secondPhoneNumber
					: '',
				address: this.context.selectedCustomer.address
					? this.context.selectedCustomer.address
					: '',
				reference: '7',
				customerType: this.context.selectedCustomer.customerTypeId
					? this.context.selectedCustomer.customerTypeId
					: 0,
				customerChannel: this.context.selectedCustomer.salesChannelId
					? this.context.selectedCustomer.salesChannelId
					: 0
			});
		} else {
			this.props.navigation.setParams({ isEdit: false });
		}
	}

	componentWillUnmount() {
		this.props.customerActions.CustomerSelected({});
		this.props.customerActions.setCustomerEditStatus(false);
		this.props.navigation.setParams({ isCustomerSelected: false });
		this.props.navigation.setParams({ customerName: '' });
	}

	onEdit() {
		console.log('this.context.isEdit', this.context.isEdit);
		this.props.customerActions.setIsLoading(true);
		try {
			const salesChannelId = this.state.customerChannel > 0 ? this.state.customerChannel : -1;
			const customerTypeId = this.state.customerType > 0 ? this.state.customerType : -1;
			if (this.context.isEdit) {
				CustomerRealm.updateCustomer(
					this.context.selectedCustomer,
					this.state.phoneNumber,
					this.state.name,
					this.state.address,
					salesChannelId,
					customerTypeId,
					this.state.reference,
					this.state.secondPhoneNumber
				).then((e) => {
					this.props.customerActions.setCustomers(CustomerRealm.getAllCustomer());
					this.props.customerActions.CustomerSelected({});
					this.setState({ isEditInProgress: true });
				});
			} else {
				if (
					this._textIsEmpty(this.state.phoneNumber) ||
					this._textIsEmpty(this.state.name) ||
					this._textIsEmpty(this.state.address)
				) {
					Alert.alert(
						'Empty Fields',
						'A customer cannot be created without name, phone number and address!',
						[
							{
								text: 'Cancel',
								onPress: () => {},
								style: 'cancel'
							},
							{
								text: 'OK',
								onPress: () => {}
							}
						],
						{ cancelable: false }
					);
					return;
				}

				CustomerRealm.createCustomer(
					this.state.phoneNumber,
					this.state.name,
					this.state.address,
					this.props.settings.siteId,
					salesChannelId,
					customerTypeId,
					this.state.reference,
					this.state.secondPhoneNumber
				);
				this.props.customerActions.setCustomers(CustomerRealm.getAllCustomer());
				this.props.customerActions.CustomerSelected({});
				this.setState({ isCreateInProgress: true });
			}
			this.props.navigation.goBack();
		} catch (error) {}
	}

	render() {
		return (
			<View style={styles.custeditcont}>
				<ScrollView style={styles.flex1}>
					<View style={styles.flexCenter}>
						<Card containerStyle={styles.contCard}>
							<Input
								placeholder={i18n.t('account-name')}
								onChangeText={this.onChangeName}
								// label={i18n.t('account-name')}
								underlineColorAndroid="transparent"
								keyboardType="default"
								value={this.state.name}
								inputContainerStyle={styles.inputText}
								leftIcon={<Ionicons name="md-person" size={24} color="black" />}
							/>
							<View style={styles.flexanddirection}>
								<Input
									placeholder={i18n.t('telephone-number')}
									onChangeText={this.onChangeTeleOne.bind(this)}
									value={this.state.phoneNumber}
									keyboardType="phone-pad"
									// label={i18n.t('telephone-number')}
									inputContainerStyle={styles.inputText}
									containerStyle={styles.flexpt5}
									leftIcon={
										<Ionicons name="md-contact" size={24} color="black" />
									}
								/>

								<Input
									placeholder={i18n.t('second-phone-number')}
									value={this.state.secondPhoneNumber}
									keyboardType="phone-pad"
									onChangeText={this.onChangeTeleTwo.bind(this)}
									// label={i18n.t('second-phone-number')}
									inputContainerStyle={styles.inputText}
									containerStyle={styles.flexpt5}
									leftIcon={
										<Ionicons name="md-contact" size={24} color="black" />
									}
								/>
							</View>
							<Input
								placeholder={i18n.t('address')}
								keyboardType="default"
								value={this.state.address}
								onChangeText={this.onChangeAddress.bind(this)}
								// label={i18n.t('address')}
								inputContainerStyle={styles.inputText}
								leftIcon={<Ionicons name="md-map" size={24} color="black" />}
							/>

							<RNPickerSelect
								placeholder={{
									label: 'Select a customer type',
									value: null,
									key: 0
								}}
								items={this.customerTypesOptions}
								onValueChange={(value, itemKey) => {
									this.setState({ customerType: value });
									this.setState({
										customerChannel: this.customerTypesOptions[itemKey - 1].key
									});
								}}
								value={this.state.customerType}
								useNativeAndroidPickerStyle={false}
								style={{
									...pickerSelectStyles,
									iconContainer: {
										top: 20,
										left: 30,
										color: 'black',
										marginRight: 10
									},

									placeholder: {
										color: '#333',
										fontSize: 18,
										fontWeight: 'bold'
									}
								}}
								Icon={() => {
									return <Ionicons name="md-ribbon" size={24} />;
								}}
							/>

							<Button
								onPress={this.onEdit.bind(this)}
								buttonStyle={styles.subbtn}
								containerStyle={styles.contBtnStyle}
								title={this.getSubmitText()}
							/>
						</Card>

						<Modal
							visible={this.state.isEditInProgress}
							backdropColor="red"
							transparent
							onRequestClose={this.closeHandler}>
							{this.showEditInProgress()}
						</Modal>
						<Modal
							visible={this.state.isCreateInProgress}
							backdropColor="red"
							transparent
							onRequestClose={this.closeHandler}>
							{this.showCreateInProgress()}
						</Modal>
					</View>
				</ScrollView>
			</View>
		);
	}

	onChangeName = (text) => {
		this.setState({
			name: text
		});
	};

	checkEdit() {
		if (this.context.isEdit) {
			this.setState({ name: this.context.selectedCustomer.name });
			this.setState({ phoneNumber: this.context.selectedCustomer.phoneNumber });
			this.setState({ secondPhoneNumber: this.context.selectedCustomer.secondPhoneNumber });
			this.setState({ address: this.context.selectedCustomer.address });
			this.setState({ reference: this.context.selectedCustomer.frequency });
			this.setState({ customerType: this.context.selectedCustomer.customerTypeId });
			this.setState({ customerChannel: this.context.selectedCustomer.salesChannelId });
		}
	}

	getName(me) {
		if (me.props.isEdit) {
			return me.props.selectedCustomer.name;
		}
		return 'wee';
	}

	onChangeTeleOne = (text) => {
		this.setState({
			phoneNumber: text
		});
	};

	onChangeTeleTwo = (text) => {
		this.setState({
			secondPhoneNumber: text
		});
	};

	onChangeAddress = (text) => {
		this.setState({
			address: text
		});
	};

	onChangeReference = (text) => {
		if (text) {
			if (/^\d+$/.test(text)) {
				this.setState({
					reference: text
				});
			} else {
				alert('Digits only please');
			}
		} else {
			this.setState({
				reference: ''
			});
		}
	};

	getTelephoneNumber(me) {
		if (me.props.isEdit) {
			return me.props.selectedCustomer.phoneNumber;
		}
		return '';
	}

	getSecondTelephoneNumber(me) {
		try {
			if (me.props.isEdit) {
				return me.props.selectedCustomer.secondPhoneNumber;
			}
			return '';
		} catch (error) {}
	}

	getAddress(me) {
		if (me.props.isEdit) {
			return me.props.selectedCustomer.address;
		}
		return '';
	}

	getDefaultChannelValue() {
		if (this.context.isEdit) {
			for (let i = 0; i < this.salesChannels.length; i++) {
				if (this.salesChannels[i].id == this.context.selectedCustomer.salesChannelId) {
					return this.salesChannels[i].displayName;
				}
			}
		}
		return i18n.t('sales-channel');
	}

	getDefaultTypeValue() {
		if (this.context.isEdit) {
			for (let i = 0; i < this.customerTypes.length; i++) {
				if (this.customerTypes[i].id == this.context.selectedCustomer.customerTypeId) {
					return this.customerTypes[i].displayName;
				}
			}
		}
		return i18n.t('customer-type');
	}

	getDefaultChannelIndex() {
		if (this.context.isEdit) {
			const salesChannels = SalesChannelRealm.getSalesChannels();
			for (let i = 0; i < salesChannels.length; i++) {
				if (salesChannels[i].id == this.context.selectedCustomer.salesChannelId) {
					return i;
				}
			}
		}
		return -1;
	}

	getDefaultTypeIndex() {
		if (this.context.isEdit) {
			for (let i = 0; i < this.customerTypesIndicies.length; i++) {
				if (this.customerTypesIndicies[i] == this.context.selectedCustomer.customerTypeId) {
					return i;
				}
			}
		}
		return -1;
	}

	getHeaderText() {
		return this.context.isEdit ? i18n.t('edit-customer') : i18n.t('new-customer');
	}

	getSubmitText() {
		return this.context.isEdit ? i18n.t('update-customer') : i18n.t('create-customer');
	}

	onCancelEdit() {
		this.props.navigation.navigate('ListCustomers');
		const that = this;
		setTimeout(() => {
			Events.trigger('ScrollCustomerTo', {
				customer: that.props.selectedCustomer
			});
		}, 10);
	}

	closeHandler() {
		this.setState({ isEditInProgress: false });
		this.setState({ isCreateInProgress: false });
		this.onCancelEdit();
	}

	isNumeric(text) {
		return /^\d+$/.test(text);
	}

	isValidPhoneNumber(text) {
		const test = /^\d{8,14}$/.test(text);
		if (!test) {
			alert('Phone number should be atleast 8 digits long. Example 0752XXXYYY');
		}
		return test;
	}

	_textIsEmpty(txt) {
		if (txt === null || txt.length === 0) {
			return true;
		}
		return false;
	}

	showEditInProgress() {
		const that = this;
		if (this.state.isEditInProgress) {
			setTimeout(() => {
				that.closeHandler();
			}, 1000);
		}
		return (
			<View style={styles.createLoader}>
				<View style={styles.updating}>
					<Text style={styles.loadertext}>{i18n.t('updating')}</Text>
				</View>
			</View>
		);
	}

	showCreateInProgress() {
		const that = this;
		if (this.state.isCreateInProgress) {
			setTimeout(() => {
				that.closeHandler();
			}, 1000);
		}
		return (
			<View style={styles.createLoader}>
				<View style={styles.updating}>
					<Text style={styles.loadertext}>Creating</Text>
				</View>
			</View>
		);
	}
}

function mapStateToProps(state, props) {
	return {
		selectedCustomer: state.customerReducer.selectedCustomer,
		isEdit: state.customerReducer.isEdit,
		isLoading: state.customerReducer.isLoading,
		settings: state.settingsReducer.settings
	};
}
function mapDispatchToProps(dispatch) {
	return {
		customerActions: bindActionCreators(CustomerActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(CustomerEdit);

const pickerSelectStyles = StyleSheet.create({
	inputAndroid: {
		alignItems: 'center',
		backgroundColor: '#f1f1f1',
		borderColor: '#f1f1f1',
		borderRadius: 8,
		borderWidth: 2,
		color: 'black',
		fontSize: 18,
		marginBottom: 10,
		marginLeft: 20,
		marginRight: 20,
		marginTop: 5,
		paddingLeft: 30,
		paddingRight: 30 // to ensure the text is never behind the icon
	}
});

const styles = StyleSheet.create({
	buttonText: {
		color: 'white',
		fontSize: 28,
		fontWeight: 'bold',
		textAlign: 'center',
		width: 300
	},

	contBtnStyle: {
		borderRadius: 0,
		bottom: 0,
		flex: 1,
		marginBottom: 0,
		marginLeft: 0,
		marginRight: 0,
		marginTop: 10
	},

	contCard: {
		borderRadius: 8,
		marginTop: 30,
		padding: 0,
		width: '56%'
	},

	createLoader: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	},

	custeditcont: {
		backgroundColor: '#f1f1f1',
		flex: 1,
		justifyContent: 'center'
	},

	dropdownText: {
		fontSize: 24
	},

	flex1: {
		flex: 1
	},
	flexCenter: {
		alignItems: 'center',
		flex: 1
	},
	flexanddirection: {
		flex: 1,
		flexDirection: 'row'
	},
	flexpt5: { flex: 0.5 },
	headerText: {
		color: 'black',
		fontSize: 24,
		marginLeft: 100
	},
	iconContainer: {
		color: 'black',
		left: 30,
		marginRight: 10,
		top: 20
	},
	inputContainer: {
		backgroundColor: '#CCC',
		borderColor: '#CCC',
		borderRadius: 10,
		borderWidth: 2
	},

	inputText: {
		alignSelf: 'center',
		backgroundColor: '#f1f1f1',
		borderColor: '#f1f1f1',
		borderRadius: 8,
		borderWidth: 2,
		margin: 5
	},

	loadertext: {
		fontSize: 24,
		fontWeight: 'bold'
	},

	phoneInputText: {
		backgroundColor: 'white',
		margin: 5,
		paddingRight: 5
	},

	subbtn: {
		padding: 20
	},

	submit: {
		backgroundColor: '#2858a7',
		borderRadius: 20,
		marginTop: '1%',
		padding: 10
	},

	updating: {
		alignItems: 'center',
		backgroundColor: '#ABC1DE',
		borderColor: '#2858a7',
		borderRadius: 10,
		borderWidth: 5,
		height: 100,
		justifyContent: 'center',
		width: 500
	}
});
