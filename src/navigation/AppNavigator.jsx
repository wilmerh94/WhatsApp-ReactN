import { NavigationContainer } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { AuthScreen } from '../screens/AuthScreen';
import { StartUpScreen } from '../screens/StartUpScreen';

import { MainNavigator } from './MainNavigator';

export const AppNavigator = props => {
  const isAuth = useSelector(
    state => state.auth.token !== null && state.auth.token !== '',
  );

  const didTryAutoLogin = useSelector(state => state.auth.didTryAutoLogin);

  return (
    <NavigationContainer>
      {/* {isAuth ? <MainNavigator /> : <AuthScreen />} */}
      {isAuth && <MainNavigator />}
      {!isAuth && didTryAutoLogin && <AuthScreen />}
      {!isAuth && !didTryAutoLogin && <StartUpScreen />}
      {/* {isSignedIn && <MainNavigator />}
      {!isSignedIn && <SignInNavigator />} */}
    </NavigationContainer>
  );
};
