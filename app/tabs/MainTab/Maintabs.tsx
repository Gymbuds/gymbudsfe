// MainTabs.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/FontAwesome";
import HomeScreen from "../Homescreen/Homescreen";
import ProfileNavigator from "../ProfileApiService/profile-navigation";
import WorkoutNavigator from "../WorkOutPage/Workout-navigation";
import Mapscreen from "../MapScreen/Mapscreen";
// import Matchscreen from "../MatchScreen/Matchscreen";

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ tabBarShowLabel: false, headerShown: false }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="home" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Workouts"
        component={WorkoutNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="calendar" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={Mapscreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="map-marker" size={24} color={color} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="Match"
        component={Matchscreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="users" size={24} color={color} />
          ),
        }}
      /> */}
      <Tab.Screen
        name="ProfileNavigator"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon name="user" size={24} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
