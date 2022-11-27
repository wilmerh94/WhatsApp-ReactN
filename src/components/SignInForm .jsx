import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useCallback, useReducer, useState } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch } from 'react-redux';
import colors from '../constants/colors';
import { signIn } from '../utils/actions/authActions';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducer';
import { Input } from './Input';
import { SubmitButton } from './SubmitButton';

/* HACK */
const isTestMode = true;

const initialState = {
  inputValues: {
    email: isTestMode ? 'test1@test.com' : '',
    password: isTestMode ? '123456' : '',
  },
  inputValidities: {
    email: isTestMode,
    password: isTestMode,
  },
  formIsValid: isTestMode,
};

export const SignInForm = () => {
  const dispatch = useDispatch();

  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const inputChangedHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, validationResult: result, inputValue });
    },
    [dispatchFormState],
  );

  const authHandler = useCallback(async () => {
    const { email, password } = formState.inputValues;

    try {
      setIsLoading(true);
      const action = signIn(email, password);
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
        id="email"
        label="Email"
        icon="email"
        iconPack={MaterialIcons}
        autoCapitalize="none"
        keyboardType="email-address"
        onInputChange={inputChangedHandler}
        initialValue={formState.inputValues.email}
        errorText={formState.inputValidities.email}
      />
      <Input
        id="password"
        label="Password"
        icon="lock"
        iconPack={FontAwesome5}
        autoCapitalize="none"
        secureTextEntry
        onInputChange={inputChangedHandler}
        initialValue={formState.inputValues.password}
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
          title="Sign in"
          onPress={authHandler}
          disabled={!formState.formIsValid}
          style={styles.submitButton}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  submitButton: { marginTop: 20 },
});
