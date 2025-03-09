import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Loginscreen from './screen/Loginscreen';
import Signupscreen from './screen/Signupscreen';

// Define the types for the screens
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigation() {
  return (
    <Stack.Navigator initialRouteName="Signup" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Signup" component={Signupscreen} />
      <Stack.Screen name="Login" component={Loginscreen} />
    </Stack.Navigator>
  );
}
