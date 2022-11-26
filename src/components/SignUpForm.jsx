import { useCallback, useEffect, useReducer, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Alert, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import { signUp } from '../utils/actions/authActions';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducer';
import { Input } from './Input';
import { SubmitButton } from './SubmitButton';

const initialState = {
  inputValues: {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  },
  inputValidities: {
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  },
  formIsValid: false,
};

export const SignUpForm = () => {
  const dispatch = useDispatch();

  const [error, setError] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const inputChangedHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, validationResult: result, inputValue });
    },
    [dispatchFormState],
  );

  useEffect(() => {
    if (error) {
      Alert.alert('An error occurred ', error.message, [{ text: 'Okay' }]);
    }
  }, [error]);

  const authHandler = useCallback(async () => {
    const { firstName, lastName, email, password } = formState.inputValues;
    try {
      setIsLoading(true);
      const action = signUp(firstName, lastName, email, password);
      setError(null);
      await dispatch(action);
    } catch (err) {
      setIsLoading(false);

      setError(err);
    }
  }, [dispatch, formState]);

  return (
    <>
      <Input
        id="firstName"
        label="First Name"
        icon="user"
        iconPack={FontAwesome5}
        onInputChange={inputChangedHandler}
        autoCapitalize="none"
        errorText={formState.inputValidities.firstName}
      />
      <Input
        id="lastName"
        label="Last Name"
        icon="user"
        iconPack={FontAwesome5}
        onInputChange={inputChangedHandler}
        autoCapitalize="none"
        errorText={formState.inputValidities.lastName}
      />
      <Input
        id="email"
        label="Email"
        icon="email"
        iconPack={MaterialIcons}
        onInputChange={inputChangedHandler}
        autoCapitalize="none"
        keyboardType="email-address"
        errorText={formState.inputValidities.email}
      />
      <Input
        id="password"
        label="Password"
        icon="lock"
        iconPack={FontAwesome5}
        onInputChange={inputChangedHandler}
        autoCapitalize="none"
        secureTextEntry
        errorText={formState.inputValidities.password}
      />
      {isLoading ? (
        <ActivityIndicator
          size={'small'}
          color={colors.primary}
          style={styles.loading}
        />
      ) : (
        <SubmitButton
          title="Sign up"
          style={styles.submitButton}
          onPress={authHandler}
          disabled={!formState.formIsValid}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  submitButton: { marginTop: 20 },
  loading: { marginTop: 10 },
});
