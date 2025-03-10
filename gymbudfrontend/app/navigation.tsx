import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loginscreen from './frontscreen/Loginscreen';
import Signupscreen from './frontscreen/Signupscreen';
import Homescreen from './tabs/Homescreen';
import Profilescreen from './tabs/ProfileApiService/Profilescreen';

// Define the types for the screens
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigation() {
  const [initialRoute, setInitialRoute] = useState<'Signup' | 'Home'>('Signup');

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        setInitialRoute('Home'); // If token exists, go to Home
      }
    };
    checkLoginStatus();
  }, []);

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Signup" component={Signupscreen} />
      <Stack.Screen name="Login" component={Loginscreen} />
      <Stack.Screen name="Home" component={Homescreen} />
      <Stack.Screen name="Profile" component={Profilescreen} />
    </Stack.Navigator>
  );
}

