import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useCallback, useReducer, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from '../components/Input';
import { PageContainer } from '../components/PageContainer';
import { PageTitle } from '../components/PageTitle';
import { ProfileImage } from '../components/ProfileImage';
import { SubmitButton } from '../components/SubmitButton';
import colors from '../constants/colors';
import {
  updateLoggedInUserData,
  updateSignInUserData,
} from '../store/authSlice';
import {
  updateSignedInUserData,
  userLogout,
} from '../utils/actions/authActions';
import { validateInput } from '../utils/actions/formActions';
import { reducer } from '../utils/reducers/formReducer';

export const SettingsScreen = () => {
  const dispatch = useDispatch();
  const userData = useSelector(state => state.auth.userData);

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const firstName = userData.firstName || '';
  const lastName = userData.lastName || '';
  const email = userData.email || '';
  const about = userData.about || '';

  const initialState = {
    inputValues: {
      firstName,
      lastName,
      email,
      about,
    },
    inputValidities: {
      firstName: undefined,
      lastName: undefined,
      email: undefined,
      about: undefined,
    },
    formIsValid: false,
  };

  const [formState, dispatchFormState] = useReducer(reducer, initialState);

  const inputChangedHandler = useCallback(
    (inputId, inputValue) => {
      const result = validateInput(inputId, inputValue);
      dispatchFormState({ inputId, validationResult: result, inputValue });
    },
    [dispatchFormState],
  );

  const saveHandler = useCallback(async () => {
    const updatedValues = formState.inputValues;

    try {
      setIsLoading(true);
      await updateSignedInUserData(userData.userId, updatedValues);
      dispatch(updateLoggedInUserData({ newData: updatedValues }));
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState, dispatch]);

  const hasChanges = () => {
    const currentValues = formState.inputValues;
    return (
      currentValues.firstName !== firstName ||
      currentValues.lastName !== lastName ||
      currentValues.email !== email ||
      currentValues.about !== about
    );
  };

  return (
    <PageContainer style={styles.container}>
      <PageTitle text="Settings" />
      <ScrollView contentContainerStyle={styles.formContainer}>
        <ProfileImage
          size={80}
          userId={userData.userId}
          uri={userData.profilePicture}
          showEditButton={true}
        />
        <Input
          id="firstName"
          label="First Name"
          icon="user"
          iconPack={FontAwesome5}
          onInputChange={inputChangedHandler}
          autoCapitalize="none"
          errorText={formState.inputValidities.firstName}
          initialValue={userData.firstName}
        />
        <Input
          id="lastName"
          label="Last Name"
          icon="user"
          iconPack={FontAwesome5}
          onInputChange={inputChangedHandler}
          autoCapitalize="none"
          errorText={formState.inputValidities.lastName}
          initialValue={userData.lastName}
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
          initialValue={userData.email}
        />
        <Input
          id="about"
          label="About"
          icon="user"
          iconPack={FontAwesome5}
          onInputChange={inputChangedHandler}
          autoCapitalize="none"
          errorText={formState.inputValidities.about}
          initialValue={userData.about}
        />
        <View style={{ marginTop: 20 }}>
          {showSuccessMessage && <Text>Saved!</Text>}
          {isLoading ? (
            <ActivityIndicator
              size={'small'}
              color={colors.primary}
              style={styles.loading}
            />
          ) : (
            hasChanges() && (
              <SubmitButton
                title="Save"
                onPress={saveHandler}
                disabled={!formState.formIsValid}
                style={styles.submitButton}
              />
            )
          )}
        </View>
        <SubmitButton
          title="Logout"
          onPress={() => dispatch(userLogout())}
          color={colors.red}
          style={styles.submitButton}
        />
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  submitButton: { marginTop: 20 },
  formContainer: {
    // justifyContent: 'center',
    alignItems: 'center',
  },
});
