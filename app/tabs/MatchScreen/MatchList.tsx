import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
  MapScreen: undefined;
  Community: { placeId: string };
  FitnessBoard: undefined;
  MatchList: undefined;
  MatchChat: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "MatchList">;
export default function MatchList({ navigation }: Props) {
    return (
        <SafeAreaView style={tw`flex-1 bg-gray-100`}>
        {/* Header */}
        <View style={tw`flex-row justify-between items-center px-4 py-3`}>  
        <Text style={tw`text-2xl font-bold text-black`}>Match List</Text>
        </View>
    </SafeAreaView>
    );
}