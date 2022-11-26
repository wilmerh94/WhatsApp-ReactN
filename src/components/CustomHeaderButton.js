import { Ionicons } from '@expo/vector-icons';
import { HeaderButton } from 'react-navigation-header-buttons';
import colors from '../constants/colors';

export const CustomHeaderButton = props => {
  return (
    <HeaderButton
      {...props}
      IconComponent={Ionicons}
      iconSize={23}
      color={props.colors ?? colors.blue} // if props.colors is empty or null it will use colors.blue
    />
  );
};
