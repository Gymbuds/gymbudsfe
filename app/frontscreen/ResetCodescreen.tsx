// frontscreen/EnterResetCodeScreen.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { fetchFunction } from "@/api/auth";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type RootStackParamList = {
  ForgotPassword: undefined;
  EnterResetCode: undefined;
  ChangePassword: { token: string };
};

type EnterResetCodeNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "EnterResetCode"
>;

export default function EnterResetCodeScreen() {
  const navigation = useNavigation<EnterResetCodeNavProp>();
  const [code, setCode] = useState("");

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert("Please enter the reset code");
      return;
    }
    try {
      const response = await fetchFunction("auth/verify-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (response.token) {
        navigation.navigate("ChangePassword", { token: response.token });
      }
    } catch {
      Alert.alert("Try Again", "Invalid or expired reset code");
    }
  };

  return (
    <LinearGradient
      colors={["#F2ECFF", "#E5D4FF"]}
      style={tw`flex-1 justify-center items-center px-8`}
    >
      <Text style={tw`text-4xl font-bold text-purple-500`}>GymBuds</Text>
      <Text style={tw`text-xl font-semibold mt-4`}>Enter Reset Code</Text>
      <Text style={tw`text-gray-600 mb-4`}>
        Please enter the reset code sent to your email:
      </Text>

      <View style={tw`bg-white rounded-lg px-4 py-3 w-full shadow-md mb-4`}>
        <TextInput
          style={tw`text-base text-black`}
          placeholder="Enter reset code"
          placeholderTextColor="#B5B0B0"
          onChangeText={setCode}
          value={code}
        />
      </View>

      <TouchableOpacity
        style={tw`bg-purple-500 flex-row items-center justify-center rounded-full w-full py-3 shadow-md mb-4`}
        onPress={handleVerifyCode}
      >
        <Icon name="check" size={20} color="white" />
        <Text style={tw`text-white text-lg font-bold ml-2`}>Verify Code</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
