import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchFunction, fetchFunctionWithAuth } from "@/api/auth";
import { TimeRange } from "@/app/tabs/ProfileApiService/UserSchedule";
import * as ImagePicker from "expo-image-picker"; // For selecting profile picture
import AsyncStorage from "@react-native-async-storage/async-storage";
// Fetch user's profile data
import { fetchUserProfile } from "./ProfileApiService";
import tw from "twrnc";
import { formatTime } from "@/app/utils/util";
// Define navigation types
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  ForgotPassword: undefined;
  ChangePassword: undefined;
  Schedule: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export default function ProfileScreen({ navigation }: Props) {
  // state for username and profilepicture
  const [userName, setUserName] = useState("");
  const [userAge, setUserAge] = useState<string>("");
  const [userSkillLevel, setUserSkillLevel] = useState("");
  const [open, setOpen] = useState(false);

  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // State for Modal and Form Inputs
  const [modalVisible, setModalVisible] = useState(false);
  const [preferredGym, setPreferredGym] = useState("");
  const [fitnessGoals, setFitnessGoals] = useState([]);
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);
  // Fetch user profile data from backend
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userProfile = await fetchUserProfile();

        // Ensure the fetched data updates the state
        if (userProfile && userProfile.user) {
          setUserName(userProfile.user.name || ""); // Ensure there's no undefined value
          setUserAge(
            userProfile.user.age ? userProfile.user.age.toString() : ""
          ); // Convert number to string
          setUserSkillLevel(userProfile.user.skill_level || null);
          setProfilePicture(userProfile.user.profile_picture || null);

          // Separate preferred workout goals by commas and set them
          const preferredWorkoutGoals = userProfile.user.preferred_workout_goals
            ? userProfile.user.preferred_workout_goals
                .split(",")
                .map((goal) => goal.trim()) // Split and trim any extra spaces
            : [];
          setFitnessGoals(preferredWorkoutGoals); // Update state with fetched goals
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    };

    loadUserProfile();
  }, []);
  useFocusEffect(
    useCallback(() => {
      const getUserTimeRanges = async () => {
        try {
          const data = await fetchFunctionWithAuth("avalrange", {
            method: "GET",
          });
          setTimeRanges(data);
        } catch (error) {
          console.error("Failed to fetch user time ranges", error);
        }
      };

      getUserTimeRanges();

      return () => {};
    }, [])
  );
  const handleAgeChange = (text: string) => {
    // Convert the input to a number if needed
    setUserAge(text);
  };

const handleProfilePictureUpdate = async (mode: "gallery" | "camera") => {
  try {
    let result: ImagePicker.ImagePickerResult;

    if (mode === "gallery") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please enable gallery permissions to continue."
        );
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Fixed
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    } else {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please enable camera permissions to continue."
        );
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.front,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    }

    // Ensure assets exist and handle properly
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      setProfilePicture(selectedUri); // Update profile picture UI immediately
      await updateProfilePictureString(selectedUri); // updating the profile picture string in the backend
    }
  } catch (error) {
    console.error("Error uploading profile picture:", error);
  }
};

const updateProfile = async (profilePictureUrl: string) => {
  try {
    const userUpdate = { profile_picture: profilePictureUrl };

    const response = await fetchFunctionWithAuth("users/profile/update", {
      method: "PATCH",
      body: JSON.stringify(userUpdate),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.success) {
      console.log("✅ Profile updated successfully:", response.user);

      // Check if the profile picture was successfully updated
      if (response.user?.profile_picture === profilePictureUrl) {
      } else {
        console.log("❌ Profile picture update: false");
      }
    } else {
      console.error("❌ Failed to update profile:", response);
    }
  } catch (error) {
    console.error("❌ Error updating profile:", error);
  }
};



const updateProfilePictureString = async (uri: string) => {
  try {
    await updateProfile(uri); // Directly update the profile with the new image URL
    setProfilePicture(uri);  // Set the updated profile picture in the UI
  } catch (error) {
    console.error("Error updating profile picture URL:", error);
  }
};


  const renderSchedule = () => {
    const daysOfWeek = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
    return daysOfWeek.map((day, index) => {
      const dayRanges = timeRanges.filter((range) => range.day_of_week === day);
      return (
        <View key={index} style={tw`mt-1`}>
          <Text style={tw`text-xs text-gray-500`}>{day.substring(0,1)+day.substring(1,day.length).toLowerCase()}</Text>
          {dayRanges.length > 0 ? (
            dayRanges.map((range, idx) => (
              <Text key={idx} style={tw`ml-2 text-xs text-gray-700`}>
                {formatTime(range.start_time)} - {formatTime(range.end_time)}
              </Text>
            ))
          ) : (
            <Text style={tw`ml-1 text-xs text-red-300`}>Not Available</Text>
          )}
        </View>
      );
    });
  };
  const handleClickSchedule = () => {
    setModalVisible(false);
    navigation.navigate("Schedule");
  };

  const logoutUser = async () => {
    const userToken = await AsyncStorage.getItem("userToken");
    const response = await fetchFunction("auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userToken}`,
      },
    });

    console.log("Logout response:", response);
    if (response.message === "Logged out successfully") {
      await AsyncStorage.removeItem("userToken");
      navigation.replace("Login");
    } else {
      alert("Error logging out. Please try again.");
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <ScrollView style={tw`p-4`}>
        {/* Header Section */}
        <View style={tw`flex-row justify-end items-center`}>
          <TouchableOpacity>
            <Icon name="sign-out" size={22} color="red" onPress={logoutUser} />
          </TouchableOpacity>
        </View>

        {/* User Profile */}
        <View style={tw`items-center mt-4`}>
          <View
            style={tw`w-30 h-30 bg-purple-200 rounded-full flex items-center justify-center relative`}
          >
            {profilePicture ? (
              <Image
                source={{ uri: profilePicture }}
                style={tw`w-full h-full rounded-full`}
              />
            ) : (
              <Text style={tw`text-3xl font-bold text-purple-600`}>U</Text>
            )}
            <TouchableOpacity
              style={tw`absolute bottom-0 right-0 bg-white p-1 rounded-full shadow`}
              onPress={() => handleProfilePictureUpdate("gallery")} // Open gallery by default
            >
              <Icon name="pencil" size={14} color="gray" />
            </TouchableOpacity>
          </View>

          <Text style={tw`text-xl font-bold mt-2`}>
            {userName}, {userAge}
          </Text>
          <Text
            style={tw`text-purple-500 bg-purple-100 px-3 py-1 rounded-full mt-1`}
          >
            {userSkillLevel}
          </Text>
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
            <Text style={tw`text-xs text-black-500`}>Preferred Gym</Text>
            <View style={tw`flex-row items-center mt-1`}>
              <Icon name="map-marker" size={16} color="purple" />
              <Text style={tw`ml-2 text-sm text-gray-700`}>{preferredGym}</Text>
            </View>
          </View>

            <View style={tw`mt-3`}>
              <Text style={tw`text-xs text-black-500`}>Workout Schedule</Text>
              {renderSchedule()}
            </View> 
          <View style={tw`mt-3`}>
            <Text style={tw`text-xs text-black-500`}>Fitness Goals</Text>
            <View style={tw`flex-row items-center mt-1`}>
              <FontAwesome5 name="dumbbell" size={16} color="purple" />
              <View style={tw`ml-2 flex-row flex-wrap`}>
                {fitnessGoals.map((goal, index) => (
                  <Text
                    key={index}
                    style={tw`bg-gray-200 px-2 py-1 rounded-full text-xs mr-2`}
                  >
                    {goal}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={tw`bg-white p-4 mt-6 rounded-lg shadow`}>
          <Text style={tw`text-lg font-bold`}>Achievements</Text>
          <View style={tw`mt-2`}>
            <View
              style={tw`flex-row items-center bg-gray-100 p-3 rounded-lg mb-2`}
            >
              <FontAwesome5 name="dumbbell" size={16} color="purple" />
              <View style={tw`ml-3`}>
                <Text style={tw`font-bold`}>First Workout</Text>
                <Text style={tw`text-xs text-gray-500`}>Jan 1, 2025</Text>
              </View>
            </View>
            <View
              style={tw`flex-row items-center bg-gray-100 p-3 rounded-lg mb-2`}
            >
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
          <View
            style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
          >
            <View style={tw`bg-white p-6 rounded-lg w-80`}>
              <Text style={tw`text-lg font-bold mb-4`}>
                Edit Workout Preferences
              </Text>

              <View style={tw`gap-y-4`}>
                {/* Name */}
                <View>
                  <Text style={tw`text-xs text-gray-500 mb-1`}>Name</Text>
                  <TextInput
                    style={tw`border p-2 rounded w-full`}
                    placeholder="Enter your name"
                    value={userName}
                    onChangeText={setUserName}
                  />
                </View>

                {/* Age */}
                <View>
                  <Text style={tw`text-xs text-gray-500 mb-1`}>Age</Text>
                  <TextInput
                    style={tw`border p-2 rounded w-full`}
                    keyboardType="numeric"
                    placeholder="Enter your age"
                    value={userAge}
                    onChangeText={handleAgeChange}
                  />
                </View>

                {/* Skill Level */}
                <View>
                  <Text style={tw`text-xs text-gray-500 mb-1`}>Skill Level</Text>
                  <TextInput
                    style={tw`border p-2 rounded w-full`}
                    placeholder="Enter your skill level"
                    value={userSkillLevel}
                    onChangeText={setUserSkillLevel}
                  />
                </View>

                

                {/* Preferred Gym */}
                <View>
                  <Text style={tw`text-xs text-gray-500 mb-1`}>
                    Preferred Gym
                  </Text>
                  <TextInput
                    style={tw`border p-2 rounded w-full`}
                    value={preferredGym}
                    onChangeText={setPreferredGym}
                  />
                </View>

                {/* Fitness Goals */}
                <View>
                  <Text style={tw`text-xs text-gray-500 mb-1`}>
                    Fitness Goals (Comma Separated)
                  </Text>
                  <TextInput
                    style={tw`border p-2 rounded w-full`}
                    value={fitnessGoals.join(", ")}
                    onChangeText={(text) =>
                      setFitnessGoals(
                        text.split(", ").map((goal) => goal.trim())
                      )
                    }
                  />
                </View>

                {/* Edit Workout Schedule Button */}
                <TouchableOpacity
                  style={tw`bg-purple-500 p-4 rounded-lg items-center`}
                  onPress={() => handleClickSchedule()}
                >
                  <Text style={tw`text-white font-bold`}>
                    Edit Workout Schedule
                  </Text>
                </TouchableOpacity>

                {/* Action Buttons */}
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
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}