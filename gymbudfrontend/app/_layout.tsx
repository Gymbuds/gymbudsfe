import { Stack } from "expo-router";
import { TailwindProvider } from 'tailwind-rn';


export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }}/>;
}
