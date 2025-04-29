// app/tabs/MatchScreen/MatchNavigator.tsx
import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import MatchScreen from '../MatchScreen/Matchscreen'
import MatchList from '../MatchScreen/MatchList'
import MatchChat from '../MatchScreen/MatchChat'

type MatchStackParamList = {
  MatchCard: undefined
  MatchList: undefined
  MatchChat: undefined
}

const MatchStack = createNativeStackNavigator<MatchStackParamList>()

export default function MatchNavigator() {
  return (
    <MatchStack.Navigator screenOptions={{ headerShown: false }}>
      <MatchStack.Screen name="MatchCard"   component={MatchScreen} />
      <MatchStack.Screen name="MatchList"   component={MatchList}   />
      <MatchStack.Screen name="MatchChat"   component={MatchChat}   />
    </MatchStack.Navigator>
  )
}
