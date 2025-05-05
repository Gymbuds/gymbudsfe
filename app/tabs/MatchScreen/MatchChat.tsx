import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { SimpleLineIcons } from '@expo/vector-icons'
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

type Props = NativeStackScreenProps<RootStackParamList, "MatchChat">;
export default function MatchChat({ navigation }: Props) {
    return (
        <SafeAreaView style={tw`flex-1 bg-gray-100`}>
        {/* Header */}
        <View style={tw`bg-gray-100 flex-row items-center px-4 py-3`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <SimpleLineIcons name="arrow-left-circle" size={28} color="black" />
        </TouchableOpacity>
        <Text style={tw`ml-2 text-2xl font-bold text-black`}>Match Chat</Text>
      </View>
    </SafeAreaView>
    );
}