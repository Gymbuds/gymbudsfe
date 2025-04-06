import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import tw from "twrnc";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { fetchFunction } from "@/api/auth";

type RootStackParamList = {
  ChangePassword: { token: string };
  Login: undefined;
};

type ChangePasswordRouteProp = RouteProp<RootStackParamList, "ChangePassword">;
type ChangePasswordNavProp = NativeStackNavigationProp<
  RootStackParamList,
  "ChangePassword"
>;

export default function ChangePasswordscreen() {
  const route = useRoute<ChangePasswordRouteProp>();
  const navigation = useNavigation<ChangePasswordNavProp>();
  const token = route.params.token; // Get token passed via navigation

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secureText, setSecureText] = useState(true);

  const handlePasswordReset = async () => {
    if (!token) {
      Alert.alert("Invalid or missing reset token.");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Try Again",
        "New password does not match confirmed password."
      );
      return;
    }
    try {
      const response = await fetchFunction("auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reset_token: token, new_password: newPassword }),
      });

      if (response.success) {
        Alert.alert(
          "Password successfully reset. You can now log in with your new password."
        );
        navigation.replace("Login");
      }
    } catch {
      Alert.alert(
        "Invalid Password",
        "Passwords must have at least 8 digits, 1 uppercase and lowercase letter, 1 digit, and 1 special character."
      );
    }
  };

  return (
    <LinearGradient
      colors={["#F2ECFF", "#E5D4FF"]}
      style={tw`flex-1 justify-center items-center px-8`}
    >
      <Text style={tw`text-4xl font-bold text-purple-500`}>GymBuds</Text>
      <Text style={tw`text-xl font-semibold mt-4`}>Create a New Password</Text>
      <Text style={tw`text-gray-600 mb-4`}>
        Set a new password for your GymBuds account:
      </Text>

      <View
        style={tw`flex-row items-center bg-white rounded-lg px-4 py-3 w-full shadow-md mb-4`}
      >
        <Icon name="lock" size={20} color="#B5B0B0" />
        <TextInput
          style={tw`flex-1 pl-3 text-base text-black`}
          placeholder="Enter your new password"
          placeholderTextColor="#B5B0B0"
          secureTextEntry={secureText}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <Icon
            name={secureText ? "eye-slash" : "eye"}
            size={20}
            color="#B5B0B0"
          />
        </TouchableOpacity>
      </View>

      <View
        style={tw`flex-row items-center bg-white rounded-lg px-4 py-3 w-full shadow-md mb-4`}
      >
        <Icon name="lock" size={20} color="#B5B0B0" />
        <TextInput
          style={tw`flex-1 pl-3 text-base text-black`}
          placeholder="Confirm your new password"
          placeholderTextColor="#B5B0B0"
          secureTextEntry={secureText}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <Icon
            name={secureText ? "eye-slash" : "eye"}
            size={20}
            color="#B5B0B0"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={tw`bg-purple-500 flex-row items-center justify-center rounded-full w-full py-3 shadow-md mb-4`}
        onPress={handlePasswordReset}
      >
        <Icon name="check" size={20} color="white" />
        <Text style={tw`text-white text-lg font-bold ml-2`}>
          Change Password
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={tw`text-gray-700 text-sm`}>
          Remembered your password?
          <Text style={tw`text-purple-500`}> Login</Text>
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
