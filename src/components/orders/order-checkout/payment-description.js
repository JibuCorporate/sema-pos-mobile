import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

class PaymentDescription extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.paydectitle}>
        <View style={styles.flex3}>
          <Text style={styles.totalTitle}>{this.props.title}</Text>
        </View>
        <View style={styles.flex2}>
          <Text style={styles.totalValue}>
            {this.props.currency}
            {' '}
            {this.props.total}
          </Text>
        </View>
      </View>
    );
  }
}

export default PaymentDescription;

const styles = StyleSheet.create({

  paydectitle: { flex: 1, flexDirection: 'row', marginTop: '1%' },

  flex2: {
    flex: 2,
  },

  flex3: {
    flex: 3,
  },
  totalText: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 16,
    color: 'black',
    alignSelf: 'center',
  },

  totalTitle: {
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },

  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },

});
