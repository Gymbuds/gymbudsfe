import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { fetchFunction } from "@/api/auth";
import tw from "twrnc"; // Import twrnc
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define navigation types
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  ForgotPassword: undefined;
  ResetCode: undefined;
  ChangePassword: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "ForgotPassword">;

export default function Loginscreen({ navigation }: Props) {
  const [email, setEmail] = useState('');

  const requestPasswordReset = async () => {
      const response = await fetchFunction('auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.success) {
        navigation.replace("ResetCode");
      }
    };

  return (
    <LinearGradient
      colors={["#F2ECFF", "#E5D4FF"]}
      style={tw`flex-1 justify-center items-center px-8`}
    >
      <Text style={tw`text-4xl font-bold text-purple-500`}>GymBuds</Text>
      <Text style={tw`text-xl font-semibold mt-4`}>Did you forget your password?</Text>
      <Text style={tw`text-gray-600 mb-4 text-center`}>
        Please enter the email associated with your GymBuds account:
      </Text>

      <View
        style={tw`flex-row items-center bg-white rounded-lg px-4 py-3 w-full shadow-md mb-4`}
      >
        <Icon name="envelope" size={20} color="#B5B0B0" />
        <TextInput
          style={tw`flex-1 pl-3 text-base text-black`}
          placeholder="Enter your current email"
          placeholderTextColor="#B5B0B0"
          onChangeText={setEmail}
        />
      </View>

      <TouchableOpacity
        style={tw`bg-purple-500 flex-row items-center justify-center rounded-full w-full py-3 shadow-md mb-4`}
        onPress={requestPasswordReset}
      >
        <Icon name="check" size={20} color="white" />
        <Text style={tw`text-white text-lg font-bold ml-2`}>Confirm email</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={tw`text-gray-700 text-sm`}>
          Don't have an account?
          <Text
            style={tw`text-purple-500`}
            onPress={() => navigation.navigate("Signup")}
          > Sign Up
          </Text>
        </Text>
      </TouchableOpacity>
      <TouchableOpacity>
        <Text style={tw`text-gray-700 text-sm`}>
          Remembered your password?
          <Text 
            style={tw`text-purple-500`} 
            onPress={() => navigation.navigate('Login')}
          > Login
          </Text>
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
