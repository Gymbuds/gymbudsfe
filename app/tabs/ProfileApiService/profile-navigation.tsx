import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Profilescreen from "./Profilescreen";
import UserSchedule from "./UserSchedule";

// Define the types for the screens
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function ProfileNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={"Profile"}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Profile" component={Profilescreen} />
      <Stack.Screen name="Schedule" component={UserSchedule} />
    </Stack.Navigator>
  );
}
