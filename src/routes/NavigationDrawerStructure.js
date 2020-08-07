import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

class NavigationDrawerStructure extends React.PureComponent {
    toggleDrawer = () => {
        this.props.navigationProps.toggleDrawer();
    };

    render() {
        return (
            <View style={styles.cont}>
                <TouchableOpacity onPress={this.toggleDrawer.bind(this)}>
                    <Icon
                        name='md-menu'
                        size={30}
                        color="white"
                        style={styles.drawerIcon}
                    />
                </TouchableOpacity>
            </View>
        );
    }
}

export default NavigationDrawerStructure;

const styles = StyleSheet.create({
	cont: {
		flexDirection: 'row'
	},
	drawerIcon: {
		width: 50,
		height: 30,
		marginLeft: 10,
		paddingRight:20
	}
})
