import React from 'react';
import AppNavigation from './navigation';
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Index() {
  return (<GestureHandlerRootView style={{ flex: 1 }}><AppNavigation /></GestureHandlerRootView>);
}