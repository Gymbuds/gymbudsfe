
import { LogBox } from 'react-native';

import React from 'react';
import AppNavigation from './navigation';
import { GestureHandlerRootView } from "react-native-gesture-handler";
LogBox.ignoreLogs([
  /Support for defaultProps will be removed/,
]);
export default function Index() {
  return (<GestureHandlerRootView style={{ flex: 1 }}><AppNavigation /></GestureHandlerRootView>);
}