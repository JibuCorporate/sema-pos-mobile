import 'react-native-gesture-handler';
import React from 'react';
import JibuRouter from './src/routes/semaRouter';
import { enableScreens } from 'react-native-screens';
import GlobalState from './src/context/GlobalState';
enableScreens();

class App extends React.PureComponent {
    render() {
        return (
            <GlobalState>
			   <JibuRouter />
            </GlobalState>
        );
    }
}

export default App;
