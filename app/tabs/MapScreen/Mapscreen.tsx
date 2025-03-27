import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
export default function Mapscreen() {
  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
    <View>
      <Text>Mapscreen</Text>
    </View>
    </SafeAreaView>
  )
}