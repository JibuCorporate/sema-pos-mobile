import React from 'react';
import {
  Text, View, TouchableHighlight, StyleSheet,
} from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import * as reportActions from '../../actions/ReportActions';

const dayInMilliseconds = 24 * 60 * 60 * 1000;

class DateFilter extends React.PureComponent {
  constructor(props) {
    super(props);
    const currentDate = new Date();
    this.state = { currentDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) };
    this.maxDate = new Date(this.state.currentDate.getTime() + 30 * dayInMilliseconds);
    this.minDate = new Date(this.state.currentDate.getTime() - 2 * dayInMilliseconds);
  }

  componentDidMount() {
    this.props.reportActions.setReportFilter(
      this.state.currentDate,
      new Date(this.state.currentDate.getTime() + dayInMilliseconds),
    );
  }

  render() {
    return (
      <View style={styles.filterContainer}>
        <View style={styles.filterItemContainer}>
          {this.getPreviousButton()}
        </View>
        <View style={styles.filterItemContainer}>
          <Text style={styles.fontdate}>{this.state.currentDate.toDateString()}</Text>
        </View>
        <View style={styles.filterItemContainer}>
          {this.getNextButton()}
        </View>
      </View>
    );
  }

  getPreviousButton() {
    const prevDate = new Date(this.state.currentDate.getTime() - dayInMilliseconds);
    if (prevDate > this.minDate) {
      return (
        <TouchableHighlight onPress={() => this.onPreviousDay()}>
          <Icon
            name="arrow-back"
            size={40}
            color="black"
          />
        </TouchableHighlight>
      );
    }
    return (
      <Icon
        name="arrow-back"
        size={40}
        color="black"
        style={styles.opacity4}
      />

    );
  }

  getNextButton() {
    const nextDate = new Date(this.state.currentDate.getTime() + dayInMilliseconds);
    if (nextDate < this.maxDate) {
      return (
        <TouchableHighlight onPress={() => this.onNextDay()}>
          <Icon
            name="arrow-forward"
            size={40}
            color="black"
          />
        </TouchableHighlight>
      );
    }
    return (
      <Icon
        name="arrow-forward"
        size={40}
        color="black"
        style={styles.opacity4}
      />
    );
  }

  onPreviousDay() {
    this.setState({ currentDate: new Date(this.state.currentDate.getTime() - dayInMilliseconds) }, () => this.update());
  }

  onNextDay() {
    this.setState({ currentDate: new Date(this.state.currentDate.getTime() + dayInMilliseconds) }, () => this.update());
  }

  update() {
    const beginDate = this.state.currentDate;
    const previousDate = new Date(beginDate.getTime() + dayInMilliseconds);
    this.props.reportActions.setReportFilter(beginDate, previousDate);
  }
}

function mapStateToProps(state, props) {
  return { dateFilter: state.reportReducer.dateFilter };
}

function mapDispatchToProps(dispatch) {
  return { reportActions: bindActionCreators(reportActions, dispatch) };
}

// Connect everything
export default connect(mapStateToProps, mapDispatchToProps)(DateFilter);

const styles = StyleSheet.create({
  fontdate: {
    fontSize: 20,
  },

  filterContainer: {
    flex: 0.3,
    backgroundColor: 'white',
    marginLeft: 10,
    marginTop: 20,
    flexDirection: 'row',
  },
  filterItemContainer: {
    justifyContent: 'center',
    paddingLeft: 10,
  },

  opacity4: {
    opacity: 0.4,
  },

});
