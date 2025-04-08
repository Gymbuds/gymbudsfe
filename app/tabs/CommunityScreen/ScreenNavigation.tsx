import React from 'react'
import { View, Text } from 'react-native'
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import CommunityScreen from './Communityscreen';
import FitnessPostBoard from './FitnessPostBoard';

type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
  Community: undefined;
  FitnessBoard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
export default function ScreenNavigation() {
  return (
    <Stack.Navigator initialRouteName={"Community"} screenOptions={{ headerShown: false }}>
      <Stack.Screen name = "Community">
      {}
      </Stack.Screen>
      <Stack.Screen name = "FitnessBoard">
      
      </Stack.Screen>
    </Stack.Navigator>
  )
}