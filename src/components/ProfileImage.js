import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import userImage from '../../assets/images/userImage.jpeg';
import colors from '../constants/colors';
import { updateLoggedInUserData } from '../store/authSlice';
import { updateSignedInUserData } from '../utils/actions/authActions';
import {
  launchImagePicker,
  uploadImageAsync,
} from '../utils/imagePickerHelper';

export const ProfileImage = props => {
  const dispatch = useDispatch();
  const source = props.uri ? { uri: props.uri } : userImage;

  const [image, setImage] = useState(source);
  const [isLoading, setIsLoading] = useState(false);
  const showEditButton = props.showEditButton && props.showEditButton === true;
  const showRemoveButton =
    props.showRemoveButton && props.showRemoveButton === true;
  const userId = props.userId;

  const pickImage = async () => {
    try {
      const tempUri = await launchImagePicker();
      if (!tempUri) return;

      //Upload the image
      setIsLoading(true);
      const uploadUri = await uploadImageAsync(tempUri);
      setIsLoading(false);

      if (!uploadUri) {
        throw new Error("Couldn't upload image");
      }
      const newData = { profilePicture: uploadUri };

      await updateSignedInUserData(userId, newData);
      dispatch(updateLoggedInUserData({ newData }));
      // Set the image
      setImage({ uri: tempUri });
    } catch (err) {
      console.log(
        '🚀 --------------------------------------------------------------🚀',
        '🚀 ~~ file: ProfileImage.js ~~ line 17 ~~ pickImage ~~ err',
        '🚀 --------------------------------------------------------------🚀',
        err,
      );
      setIsLoading(false);
    }
  };
  const Container = props.onPress || showEditButton ? TouchableOpacity : View;
  return (
    <Container onPress={props.onPress || pickImage} style={props.style}>
      {isLoading ? (
        <View
          height={props.size}
          width={props.size}
          style={styles.loadingContainer}>
          <ActivityIndicator size={'small'} color={colors.primary} />
        </View>
      ) : (
        <Image
          source={image}
          style={{
            ...styles.image,
            ...{ width: props.size, height: props.size },
          }}
        />
      )}
      {showEditButton && !isLoading && (
        <View style={styles.editIconContainer}>
          <FontAwesome name="pencil" size={15} color="black" />
        </View>
      )}
      {showRemoveButton && !isLoading && (
        <View style={styles.removeIconContainer}>
          <FontAwesome name="close" size={15} color="black" />
        </View>
      )}
    </Container>
  );
};
const styles = StyleSheet.create({
  image: {
    borderRadius: 50,
    borderColor: colors.grey,
    borderWidth: 1,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.lightGrey,
    borderRadius: 20,
    padding: 8,
  },
  removeIconContainer: {
    position: 'absolute',
    bottom: -3,
    right: -3,
    backgroundColor: colors.lightGrey,
    borderRadius: 20,
    padding: 3,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
