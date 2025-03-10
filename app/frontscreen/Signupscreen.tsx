import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchFunction } from '@/api/auth';
import tw from 'twrnc'; // Import twrnc
import AsyncStorage from '@react-native-async-storage/async-storage';


// Define navigation types
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState('Test User');
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [secureText, setSecureText] = useState(true);

  // const registerUser = async () => {
  //   const response = await fetchFunction('users/register', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ name, email, password }),
  //   });
  
  //   if (response.success) {
  //     await AsyncStorage.setItem('userToken', response.token); // Store token
  //     navigation.replace('Home'); // Replace stack to prevent going back
  //   }
  // };
  // dummy sign up function
  const registerUser = async () => {
    // Simulate successful sign-up and save token
    await AsyncStorage.setItem('userToken', 'dummy_token'); 
    navigation.replace('Home'); // Navigate to Home
  };


  return (
    <LinearGradient colors={["#F2ECFF", "#E5D4FF"]} style={tw`flex-1 justify-center items-center px-8`}>
      <Text style={tw`text-4xl font-bold text-purple-500`}>Gym<Text style={tw`text-gray-700`}>Buds</Text></Text>
      <Text style={tw`text-xl font-semibold mt-4`}>Create an Account</Text>
      <Text style={tw`text-gray-600 mb-4`}>Join us to start your fitness journey</Text>
      
      <View style={tw`flex-row items-center bg-white rounded-lg px-4 py-3 w-full shadow-md mb-4`}>
        <Icon name="user" size={20} color="#B5B0B0" />
        <TextInput 
          style={tw`flex-1 pl-3 text-base text-black`} 
          placeholder="Enter your name" 
          placeholderTextColor="#B5B0B0" 
          onChangeText={setName} 
        />
      </View>
      
      <View style={tw`flex-row items-center bg-white rounded-lg px-4 py-3 w-full shadow-md mb-4`}>
        <Icon name="envelope" size={20} color="#B5B0B0" />
        <TextInput 
          style={tw`flex-1 pl-3 text-base text-black`} 
          placeholder="Enter your email" 
          placeholderTextColor="#B5B0B0" 
          onChangeText={setEmail} 
        />
      </View>
      
      <View style={tw`flex-row items-center bg-white rounded-lg px-4 py-3 w-full shadow-md mb-4`}>
        <Icon name="lock" size={20} color="#B5B0B0" />
        <TextInput 
          style={tw`flex-1 pl-3 text-base text-black`} 
          placeholder="Enter your password" 
          placeholderTextColor="#B5B0B0" 
          secureTextEntry={secureText} 
          onChangeText={setPassword} 
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <Icon name={secureText ? "eye-slash" : "eye"} size={20} color="#B5B0B0" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={tw`bg-purple-500 flex-row items-center justify-center rounded-full w-full py-3 shadow-md mb-4`} 
        onPress={registerUser}
      >
        <Icon name="check" size={20} color="white" />
        <Text style={tw`text-white text-lg font-bold ml-2`}>Sign Up</Text>
      </TouchableOpacity>
      
      <TouchableOpacity>
        <Text style={tw`text-gray-700 text-sm`}>
          Already have an account?<Text 
            style={tw`text-purple-500`} 
            onPress={() => navigation.navigate('Login')}
          > Login
          </Text>
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}
