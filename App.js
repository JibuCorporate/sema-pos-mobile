import 'react-native-gesture-handler';
import React from 'react';
// import JibuRouter from './src/routes/semaRouter';
import JibuRouter from './src/routes/newSemaRouter';

// Before rendering any navigation stack
import { enableScreens } from 'react-native-screens';
enableScreens();

class App extends React.PureComponent {
    render() {
        return (
			   <JibuRouter />
        );
    }
}

export default App;
