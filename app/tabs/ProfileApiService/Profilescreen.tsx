import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as ImagePicker from 'expo-image-picker';  // For selecting profile picture
// Fetch user's profile data
import { fetchUserProfile, uploadProfilePicture } from './ProfileApiService';
import tw from 'twrnc';

// Define navigation types
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  // state for username and profilepicture
  const [userName, setUserName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

  // State for Modal and Form Inputs
  const [modalVisible, setModalVisible] = useState(false);
  const [preferredGym, setPreferredGym] = useState("Fitness Hub, Downtown");
  const [preferredTime, setPreferredTime] = useState("6:00 PM - 8:00 PM");
  const [preferredDays, setPreferredDays] = useState("Mon, Wed, Fri");
  const [fitnessGoals, setFitnessGoals] = useState(["Build Muscle", "Improve Strength", "Better Endurance"]);

  // Fetch user profile data from backend
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const data = await fetchUserProfile();
        setUserName(data.name);
        setProfilePicture(data.profilePicture); // URL for profile picture
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    loadUserProfile();
  }, []);

  // Select and upload profile picture
  const handleProfilePictureUpdate = async () => {
    // Request permission for accessing the user's photo library
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access camera roll is required!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];  // Get the selected image

      try {
        const uploadResponse = await uploadProfilePicture({
          uri: selectedImage.uri,
          name: selectedImage.fileName || 'profile.jpg',
          type: selectedImage.type || 'image/jpeg',
        });

        setProfilePicture(uploadResponse.profilePicture);  // Update profile picture URL
      } catch (error) {
        console.error('Error uploading profile picture:', error);
      }
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <ScrollView style={tw`p-4`}>
        {/* Header Section */}
        <View style={tw`flex-row justify-end items-center`}>
          <TouchableOpacity>
            <Icon name="sign-out" size={22} color="red" onPress={() => navigation.navigate('Login')} />
          </TouchableOpacity>
        </View>

        {/* User Profile */}
        <View style={tw`items-center mt-4`}>
          <View style={tw`w-24 h-24 bg-purple-200 rounded-full flex items-center justify-center relative`}>
            <Text style={tw`text-3xl font-bold text-purple-600`}>U</Text>
            <TouchableOpacity style={tw`absolute bottom-0 right-0 bg-white p-1 rounded-full shadow`}>
              <Icon name="pencil" size={14} color="gray" />
            </TouchableOpacity>
          </View>
          <Text style={tw`text-xl font-bold mt-2`}>User Example, 21</Text>
          <Text style={tw`text-purple-500 bg-purple-100 px-3 py-1 rounded-full mt-1`}>Intermediate</Text>
          <View style={tw`flex-row mt-3`}>
            <View style={tw`items-center mx-4`}>
              <Text style={tw`text-lg font-bold`}>8</Text>
              <Text style={tw`text-xs text-gray-500`}>Day Streak</Text>
            </View>
            <View style={tw`items-center mx-4`}>
              <Text style={tw`text-lg font-bold`}>47</Text>
              <Text style={tw`text-xs text-gray-500`}>Workouts</Text>
            </View>
            <View style={tw`items-center mx-4`}>
              <Text style={tw`text-lg font-bold`}>12</Text>
              <Text style={tw`text-xs text-gray-500`}>Buddies</Text>
            </View>
          </View>
        </View>

        {/* Workout Preferences */}
        <View style={tw`bg-white p-4 mt-6 rounded-lg shadow`}>
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`text-lg font-bold`}>Workout Preferences</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={tw`text-purple-500 text-sm`}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`mt-3`}>
            <Text style={tw`text-xs text-gray-500`}>Preferred Gym</Text>
            <View style={tw`flex-row items-center mt-1`}>
              <Icon name="map-marker" size={16} color="purple" />
              <Text style={tw`ml-2 text-sm text-gray-700`}>{preferredGym}</Text>
            </View>
          </View>

          <View style={tw`mt-3`}>
            <Text style={tw`text-xs text-gray-500`}>Preferred Time</Text>
            <View style={tw`flex-row items-center mt-1`}>
              <Icon name="clock-o" size={16} color="purple" />
              <Text style={tw`ml-2 text-sm text-gray-700`}>{preferredTime}</Text>
            </View>
          </View>

          <View style={tw`mt-3`}>
            <Text style={tw`text-xs text-gray-500`}>Preferred Days</Text>
            <View style={tw`flex-row items-center mt-1`}>
              <Icon name="calendar" size={16} color="purple" />
              <Text style={tw`ml-2 text-sm text-gray-700`}>{preferredDays}</Text>
            </View>
          </View>

          <View style={tw`mt-3`}>
            <Text style={tw`text-xs text-gray-500`}>Fitness Goals</Text>
            <View style={tw`flex-row items-center mt-1`}>
              <FontAwesome5 name="dumbbell" size={16} color="purple" />
              <View style={tw`ml-2 flex-row flex-wrap`}>
                {fitnessGoals.map((goal, index) => (
                  <Text key={index} style={tw`bg-gray-200 px-2 py-1 rounded-full text-xs mr-2`}>
                    {goal}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
              <Text style={tw`text-purple-500 text-sm`}>Schedule</Text>
            </TouchableOpacity>
        {/* Achievements */}
        <View style={tw`bg-white p-4 mt-6 rounded-lg shadow`}>
          <Text style={tw`text-lg font-bold`}>Achievements</Text>
          <View style={tw`mt-2`}>
            <View style={tw`flex-row items-center bg-gray-100 p-3 rounded-lg mb-2`}>
            <FontAwesome5 name="dumbbell" size={16} color="purple" />
              <View style={tw`ml-3`}>
                <Text style={tw`font-bold`}>First Workout</Text>
                <Text style={tw`text-xs text-gray-500`}>Jan 1, 2025</Text>
              </View>
            </View>
            <View style={tw`flex-row items-center bg-gray-100 p-3 rounded-lg mb-2`}>
              <FontAwesome5 name="fire" size={20} color="orange" />
              <View style={tw`ml-3`}>
                <Text style={tw`font-bold`}>Week Streak</Text>
                <Text style={tw`text-xs text-gray-500`}>Jan 8, 2025</Text>
              </View>
            </View>
            <View style={tw`flex-row items-center bg-gray-100 p-3 rounded-lg`}>
              <FontAwesome5 name="user-friends" size={20} color="blue" />
              <View style={tw`ml-3`}>
                <Text style={tw`font-bold`}>Matched With a Buddy</Text>
                <Text style={tw`text-xs text-gray-500`}>Jan 9, 2025</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Edit Workout Preferences Modal */}
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
            <View style={tw`bg-white p-6 rounded-lg w-80`}>
              <Text style={tw`text-lg font-bold mb-4`}>Edit Workout Preferences</Text>

              <Text style={tw`text-xs text-gray-500`}>Preferred Gym</Text>
              <TextInput
                style={tw`border p-2 rounded mb-2`}
                value={preferredGym}
                onChangeText={setPreferredGym}
              />

              <Text style={tw`text-xs text-gray-500`}>Preferred Time</Text>
              <TextInput
                style={tw`border p-2 rounded mb-2`}
                value={preferredTime}
                onChangeText={setPreferredTime}
              />

              <Text style={tw`text-xs text-gray-500`}>Preferred Days</Text>
              <TextInput
                style={tw`border p-2 rounded mb-2`}
                value={preferredDays}
                onChangeText={setPreferredDays}
              />

              <Text style={tw`text-xs text-gray-500`}>Fitness Goals (Comma Separated)</Text>
              <TextInput
                style={tw`border p-2 rounded mb-4`}
                value={fitnessGoals.join(', ')}
                onChangeText={(text) => setFitnessGoals(text.split(', ').map(goal => goal.trim()))}
              />

              <View style={tw`flex-row justify-between`}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={tw`text-red-500`}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={tw`text-green-500 font-bold`}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
