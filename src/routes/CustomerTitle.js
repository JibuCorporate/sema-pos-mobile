
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { connect } from 'react-redux';

class CustomerTitle extends React.PureComponent {

    render() {
        return (
            <View
                style={styles.container}>
                {this.props.customerProps.isCustomerSelected && (
                    <Text style={styles.tooltitle}>{this.props.customerProps.customerName}</Text>
                )}
                {!this.props.customerProps.isCustomerSelected && (
                    <Text style={styles.tooltitle}>{this.props.title ? this.props.title : this.props.customerProps.title}</Text>
				)}
            </View>

        );
    }
}

function mapStateToProps(state) {
    return {
        customerProps: state.customerReducer.customerProps,
    };
}


export default connect(
    mapStateToProps,
)(CustomerTitle);

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
