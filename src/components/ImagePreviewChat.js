import { AntDesign } from '@expo/vector-icons';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import colors from '../constants/colors';

export const ImagePreviewChat = props => {
  const { onCancel, onConfirmPressed } = props;
  return (
    <View style={styles.container}>
      <View>
        <Image
          source={{ uri: props.tempImageUri }}
          style={styles.imagePreview}
        />
      </View>
      <TouchableOpacity onPress={onCancel}>
        <AntDesign name="closecircleo" size={24} color={colors.blue} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.extraLightGrey,
    padding: 8,
    borderLeftColor: colors.blue,
    borderLeftWidth: 4,
  },
  textContainer: {
    flex: 1,
    marginRight: 5,
  },
  imagePreview: {
    width: 200,
    height: 200,
  },
});
