import React, { useState} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Alert,
} from "react-native";
import { SimpleLineIcons } from "@expo/vector-icons";
import {Feather} from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
type RootStackParamList = {
    Signup: undefined;
    Login: undefined;
    Home: undefined;
    Profile: undefined;
    Schedule: undefined;
    Workoutscreen: undefined;
    WorkoutLogPage: undefined;
    AiAdvice: undefined;
  };
import tw from "twrnc";
  type Props = NativeStackScreenProps<RootStackParamList, "AiAdvice">;
export default function AiAdviceScreen({navigation}:Props) {
    return (
        <SafeAreaView style={tw`flex-1 bg-gray-100`}>
            {/* Header */}
            <View style={tw`p-4 bg-gray-100`}>
                <View style={tw`flex-row justify-between items-center mb-2`}>
                <View style={tw`flex-row items-center`}>
                <TouchableOpacity
              style={{
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={()=>{navigation.navigate("Workoutscreen")}} // Trigger modal on tap
            >
              <SimpleLineIcons
                name="arrow-left-circle"
                size={28}
                color="black"
              />
                
                </TouchableOpacity>
                <Text style={tw`text-xl font-bold`}>Your AI Recommendations</Text>
                </View>
                
                </View>
                        {/* Horizontal Line */}
        <View style={tw`border-b border-gray-300 mb-2`} />
            </View>
            {/* AI Recommendations */}
        <TouchableOpacity
          style={tw`flex-row items-center justify-center bg-purple-500 p-2 ml-4 mr-4 rounded-3xl mb-4`}
          onPress={() =>{navigation.navigate("AiAdvice")}}
        >
          <View style={tw`bg-purple-500 p-1 rounded-full mr-2`}>
            <Feather name="zap" size={16} color="white" />
          </View>
          <Text style={tw`text-white text-center font-regular text-lg`}>
            Generate  AI Recommendation
          </Text>
        </TouchableOpacity>
        </SafeAreaView>
    )
}
  