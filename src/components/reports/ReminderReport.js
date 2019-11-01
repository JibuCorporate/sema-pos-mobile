import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableHighlight, FlatList} from 'react-native';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as reportActions from "../../actions/ReportActions";
import * as customerActions from '../../actions/CustomerActions';
import * as customerBarActions from "../../actions/CustomerBarActions";
import * as toolBarActions from "../../actions/ToolBarActions";
import * as orderActions from "../../actions/OrderActions";
import * as reminderActions from "../../actions/ReminderActions.js";
import PosStorage from "../../database/PosStorage";
import CustomerBar from "../customers/CustomerBar";
import {ViewSwitcher} from "../../components/PosApp";
import DateFilter from './DateFilter';
import Events from 'react-native-simple-events';

import i18n from '../../app/i18n';

class RemindersReport extends Component {
      constructor(props){
	  super(props);

	    let currentDate = new Date();
		this.startDate = null;
		this.endDate = null;
		this.state ={
			refresh: false
	    };
	 }

	componentDidMount() {
		console.log("has Mounted")
	    this.props.reportActions.getRemindersReport(this.props.dateFilter.startDate);
	    this.onPressItem.bind(this);
	    // this.prepareReminderCustomersData.bind(this);

	}

	componentWillUnmount(){


	}


	getReminders() {
	    this.props.reportActions.getRemindersReport(this.props.dateFilter.currentDate);
	}

	getRemindersData() {
		this.getReminders();
		if( this.props.dateFilter.hasOwnProperty("startDate") && this.props.dateFilter.hasOwnProperty("endDate") ){
			if( this.props.dateFilter.startDate == this.startDate && this.props.dateFilter.endDate == this.endDate){
				return this.props.reminderData;
			}else{
				// Get new data
				this.startDate = this.props.dateFilter.startDate;
				this.endDate = this.props.dateFilter.endDate;
				this.updateReport();
				return this.props.reminderData;
			}
		}else{
			return this.props.reminderData;
		}

	}

	updateReport() {
		this.props.reportActions.getRemindersReport(this.startDate, this.endDate);
	}

    showHeader = () => {

	return (
		<View>
		{/* <CustomerBar /> */}
		<DateFilter />
			<View style={[{flex: 1, flexDirection: 'row', height:50, alignItems:'center'},styles.headerBackground]}>
				<View style={ [{flex: 2}]}>
					<Text style={[styles.headerItem,styles.leftMargin]}>Name</Text>
				</View>
				<View style={[ {flex: 2.5}]}>
					<Text style={[styles.headerItem]}>Phone Number</Text>
				</View>
				<View style={ [ {flex: 2}]}>
					<Text style={[styles.headerItem]}>Address</Text>
				</View>
				<View style={ [{flex: 2.5}]}>
					<Text style={[styles.headerItem]}>Frequency</Text>
				</View>
		</View>
		</View>

		);
	};

	onPressItem = (item) =>{
	    console.log("_onPressReminderItem");
	    this.props.customerActions.CustomerSelected(item);
	    //this.props.customerActions.SearchCustomers(item);
	    //this.props.customerBarActions.ShowHideCustomers(0);
	    this.setState({refresh: !this.state.refresh});
	    //this.props.orderActions.ClearOrder();
	    //this.props.orderActions.SetOrderFlow('products');
	    Events.trigger('onOrder', {customer:item});
	    //this.props.toolbarActions.ShowScreen('orderReminder');
	    this.props.toolbarActions.ShowScreen("main");
	    //

	};

    	// getReceipts(){
	//     receipts = PosStorage.getReceipts();


    	// }
	getRow = (item, index, separators) =>{
		// console.log("getRow -index: " + index)
		let isSelected = false;
		if( this.props.selectedCustomer && this.props.selectedCustomer.customerId === item.customerId){
			console.log("Selected item is " + item.customerId);
			isSelected = true;
		}
		if( true ) {
			return (
				<View style={[this.getRowBackground(index, isSelected), {flex: 1, flexDirection: 'row', height:50, alignItems:'center'}]}>
					<View style={{flex: 2}}>
						<Text style={[styles.baseItem, styles.leftMargin]}>{item.name}</Text>
					</View>
					<View style={{flex: 2.5}}>
						<Text style={[styles.baseItem]}>{item.phoneNumber}</Text>
					</View>
					<View style={{flex: 2}}>
						<Text style={[styles.baseItem]}>{item.address}</Text>
				</View>

				      <View style={{flex: 2.5}}>
						<Text style={[styles.baseItem]}>{item.frequency}</Text>
					</View>
				</View>
			);
		}else{
			return (<View/>);
		}
	};

	getRowBackground = (index, isSelected) =>{
		if( isSelected ){
			return styles.selectedBackground;
		}else {
			return ((index % 2) === 0) ? styles.lightBackground : styles.darkBackground;
		}
	};


	displayReminders() {
		if (!this.props.reminderData || this.props.reminderData.length == 0 ) {
		    return (<Text style={styles.titleText}>No Reminders Available</Text>);
		} else {
		    // console.log("I AM IN THE REPORTS=>" + Object.values(this.props.reminderData));
			return (
				<FlatList
			    ListHeaderComponent = {this.showHeader}
			    extraData={this.state.refresh}
					data={this.props.reminderData}
					renderItem={({item, index, separators}) => (
						<TouchableHighlight
							onPress={() => this.onPressItem(item)}
							onShowUnderlay={separators.highlight}
							onHideUnderlay={separators.unhighlight}>
							{this.getRow(item, index, separators)}
						</TouchableHighlight>
					)}
					keyExtractor={item => `${item.customerId}${item.receipt}`}
				/>
			)
		}
	}


    render() {
        if (this.props.reportType === "reminders") {
            return (
                <View style={{ flex: 1 }}>
                    <View style={{ flex: .7, backgroundColor: 'white', marginLeft: 10, marginRight: 10, marginTop: 10, }}>
						<View style = {styles.titleText}>
							<View style = {styles.leftHeader}>
								<Text style = {styles.titleItem}>Reminders</Text>
							</View>
		    </View>

						{ this.displayReminders() }
					</View>
                </View>
            );
        } else {
            return null;
        }

    }
}

function mapStateToProps(state, props) {
	return {
		reportType: state.reportReducer.reportType,
		reminderData: state.reportReducer.reminderData,
		selectedCustomer: state.customerReducer.selectedCustomer,
		orderProducts : state.orderReducer.products,
		showView: state.customerBarReducer.showView,
		products : state.productReducer.products,
		dateFilter: state.reportReducer.dateFilter

	};
}

function mapDispatchToProps(dispatch) {
	return {
		reportActions:bindActionCreators(reportActions, dispatch),
		customerActions:bindActionCreators(customerActions, dispatch),
		toolbarActions:bindActionCreators(toolBarActions, dispatch),
		customerBarActions:bindActionCreators(customerBarActions, dispatch),
		reminderActions: bindActionCreators(reminderActions, dispatch),
		orderActions:bindActionCreators(orderActions, dispatch)
		};
}

export default connect(mapStateToProps, mapDispatchToProps)(RemindersReport);


const styles = StyleSheet.create({
	baseItem:{
		fontSize:18
	},
	headerItem:{
		fontWeight:"bold",
		fontSize:18,
	},
	headerItemCenter:{
		fontWeight:"bold",
		fontSize:18,
		textAlign:'center'
	},
	rowItem:{
		fontSize:16,
		paddingLeft:10,
		borderLeftWidth:1,
		borderColor:'black',
		borderTopWidth:1,
		borderBottomWidth:1,
		borderRightWidth:1
	},
	rowItemCenter:{
		fontSize:16,
		paddingLeft:10,
		borderLeftWidth:1,
		borderColor:'black',
		borderTopWidth:1,
		borderBottomWidth:1,
		borderRightWidth:1,
		textAlign:'center'
	},

	rowBackground:{
		backgroundColor:'white'
	},

	headerBackground:{
		backgroundColor:'white'
	},
	totalItem:{
		fontWeight:"bold",
		fontSize:18,
		paddingLeft:10,
	},
	titleItem:{
		fontWeight:"bold",
		fontSize:20
	},
	titleText: {
		backgroundColor: 'white',
		height: 36,
		flexDirection:'row',
	},

	leftHeader: {
		flexDirection:'row',
		flex:1,
		alignItems:'center'

	},
	lightBackground:{
		backgroundColor:'white'
	},
	darkBackground:{
		backgroundColor:'#F0F8FF'
	},
	selectedBackground:{
		backgroundColor:'#9AADC8'
	}
});

