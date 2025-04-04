
import { LogBox } from 'react-native';

import React, { useEffect } from 'react';
import AppNavigation from './navigation';
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function Index() {
  useEffect(() => {
    LogBox.ignoreLogs([
      /Support for defaultProps will be removed/,
    ]);
  }, []);
  return (<GestureHandlerRootView style={{ flex: 1 }}><AppNavigation /></GestureHandlerRootView>);
}