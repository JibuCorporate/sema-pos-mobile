import 'react-native-gesture-handler';
import React from 'react';
import { enableScreens } from 'react-native-screens';
import JibuRouter from './src/routes/semaRouter';
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
