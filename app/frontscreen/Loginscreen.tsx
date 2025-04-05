import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
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
  ChangePassword: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function Loginscreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secureText, setSecureText] = useState(true);

  const loginUser = async () => {
    try {
      const response = await fetchFunction("auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("Login Response:", response);

      if (response.access_token) {
        // Adjust based on your API response
        await AsyncStorage.setItem("userToken", response.access_token);
        await AsyncStorage.setItem("refreshToken", response.refresh_token);
        navigation.replace("Home"); // Redirect to home page
      }
    } catch {
      Alert.alert("Login Failed", "Invalid email or password.");
    }
  };

  return (
    <LinearGradient
      colors={["#F2ECFF", "#E5D4FF"]}
      style={tw`flex-1 justify-center items-center px-8`}
    >
      <Text style={tw`text-4xl font-bold text-purple-500`}>GymBuds</Text>
      <Text style={tw`text-xl font-semibold mt-4`}>Welcome Back</Text>
      <Text style={tw`text-gray-600 mb-4`}>
        Login to continue your fitness journey
      </Text>

      <View
        style={tw`flex-row items-center bg-white rounded-lg px-4 py-3 w-full shadow-md mb-4`}
      >
        <Icon name="envelope" size={20} color="#B5B0B0" />
        <TextInput
          style={tw`flex-1 pl-3 text-base text-black`}
          placeholder="Enter your email"
          placeholderTextColor="#B5B0B0"
          onChangeText={setEmail}
        />
      </View>

      <View
        style={tw`flex-row items-center bg-white rounded-lg px-4 py-3 w-full shadow-md mb-4`}
      >
        <Icon name="lock" size={20} color="#B5B0B0" />
        <TextInput
          style={tw`flex-1 pl-3 text-base text-black`}
          placeholder="Enter your password"
          placeholderTextColor="#B5B0B0"
          secureTextEntry={secureText}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <Icon
            name={secureText ? "eye-slash" : "eye"}
            size={20}
            color="#B5B0B0"
          />
        </TouchableOpacity>
      </View>
      <View style={tw`w-full items-end mt-[-10]`}>
        <TouchableOpacity>
          <Text
            style={tw`text-purple-500`}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            Forgot password?
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={tw`bg-purple-500 flex-row items-center justify-center rounded-full w-full py-3 shadow-md mb-4 mt-[20]`}
        onPress={loginUser}
      >
        <Icon name="check" size={20} color="white" />
        <Text style={tw`text-white text-lg font-bold ml-2`}>Log in</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={tw`text-gray-700 text-sm`}>
          Don't have an account?{" "}
          <Text
            style={tw`text-purple-500`}
            onPress={() => navigation.navigate("Signup")}
          >
            Sign Up
          </Text>
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
