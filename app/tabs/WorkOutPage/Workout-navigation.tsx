import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Workoutscreen from './Workoutscreen';
import WorkoutLogPage from './WorkoutLogPage';

// Define the types for the screens
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
  Workoutscreen: undefined;
  WorkoutLogPage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function WorkoutNavigator() {
  return (
    <Stack.Navigator initialRouteName={'Workoutscreen'} screenOptions={{ headerShown: false }}>
      <Stack.Screen name='Workoutscreen' component={Workoutscreen} />
      <Stack.Screen name="WorkoutLogPage" component={WorkoutLogPage} />
      
    </Stack.Navigator>
  );
}