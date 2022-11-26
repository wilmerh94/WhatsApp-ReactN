import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageContainer } from '../components/PageContainer';
import { SignInForm } from '../components/SignInForm ';
import { SignUpForm } from '../components/SignUpForm';
import colors from '../constants/colors';
import logo from '../../assets/images/logo.jpg';

export const AuthScreen = () => {
  /* false for sign in screen and true for sign up screen  */
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <KeyboardAvoidingView
          style={styles.KeyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'height' : undefined}
          keyboardVerticalOffset={100}>
          <PageContainer>
            <View style={styles.imageContainer}>
              <Image source={logo} style={styles.image} />
            </View>
            {isSignUp ? <SignUpForm /> : <SignInForm />}
            <TouchableOpacity
              onPress={() => setIsSignUp(prevState => !prevState)}
              style={styles.linkContainer}>
              <Text style={styles.link}>{`Switch to ${
                isSignUp ? 'Sign in' : 'Sign Up'
              }`}</Text>
            </TouchableOpacity>
          </PageContainer>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  linkContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 15,
  },
  link: {
    color: colors.blue,
    fontFamily: 'medium',
    letterSpacing: 0.3,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    // height: 0,
    resizeMode: 'contain',
  },
  KeyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
});
