import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Mapscreen from "../MapScreen/Mapscreen";
import CommunityScreen from "../CommunityScreen/CommunityScreen";
import FitnessPostBoard from "../CommunityScreen/FitnessPostBoard";

type MapStackParamList = {
  Map: undefined;
  Community: undefined;
  FitnessBoard: undefined;
};

const MapStack = createNativeStackNavigator<MapStackParamList>();

export default function MapNavigator() {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
      <MapStack.Screen name="Map" component={Mapscreen} />
      <MapStack.Screen name="Community" component={CommunityScreen} />
      <MapStack.Screen name="FitnessBoard" component={FitnessPostBoard} />
    </MapStack.Navigator>
  );
}
