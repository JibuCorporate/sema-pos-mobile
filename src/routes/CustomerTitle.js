import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppContext from '../context/app-context';
class CustomerTitle extends React.PureComponent {
    static contextType = AppContext;
    render() {
        return (
            <View
                style={styles.container}>
                {this.context.customerProps.isCustomerSelected && (
                    <Text style={styles.tooltitle}>{this.context.customerProps.customerName}</Text>
                )}
                {!this.context.customerProps.isCustomerSelected && (
                    <Text style={styles.tooltitle}>{this.props.title ? this.props.title : this.context.customerProps.title}</Text>
				)}
            </View>

        );
    }
}



export default CustomerTitle;

const styles = StyleSheet.create({
	tooltitle: {
		color: 'white',
		fontSize: 18
	},

	container: {
		flexDirection: 'row',
		color: 'white',
		fontSize: 18
	}

  });
