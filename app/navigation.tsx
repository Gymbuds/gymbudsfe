import React, { useState, useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Loginscreen from "./frontscreen/Loginscreen";
import Signupscreen from "./frontscreen/Signupscreen";
import ForgotPasswordscreen from "./frontscreen/ForgotPasswordscreen";
import ResetCodescreen from "./frontscreen/ResetCodescreen";
import ChangePasswordscreen from "./frontscreen/ChangePasswordscreen";
import Homescreen from "./tabs/Homescreen/Homescreen";
import ProfileNavigator from "./tabs/ProfileApiService/profile-navigation";
import WorkoutNavigator from "./tabs/WorkOutPage/Workout-navigation";

// Define the types for the screens
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  ForgotPassword: undefined;
  ResetCode: undefined;
  ChangePassword: { token: string };
  ProfileNavigator: undefined;
  WorkoutNavigator: undefined;
};

type Workout = {
  title: string;
  date: string;
  type: logMethod;
  mood: Mood;
  id: number;
};
type logMethod = "MANUAL" | "VOICE";
type Mood = "ENERGIZED" | "TIRED" | "MOTIVATED" | "STRESSED" | "NEUTRAL";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigation() {
  const [initialRoute, setInitialRoute] = useState<"Signup" | "Home">("Signup");

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userToken = await AsyncStorage.getItem("userToken");
      if (userToken) {
        setInitialRoute("Home"); // If token exists, go to Home
      }
    };
    checkLoginStatus();
  }, []);

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Signup" component={Signupscreen} />
      <Stack.Screen name="Login" component={Loginscreen} />
      <Stack.Screen name="Home" component={Homescreen} />
      <Stack.Screen name="ProfileNavigator" component={ProfileNavigator} />
      <Stack.Screen name="WorkoutNavigator" component={WorkoutNavigator} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordscreen} />
      <Stack.Screen name="ResetCode" component={ResetCodescreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordscreen} />
    </Stack.Navigator>
  );
}
