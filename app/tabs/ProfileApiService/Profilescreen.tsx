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
import { fetchFunctionWithAuth } from "@/api/auth";
import { TimeRange } from "@/app/tabs/ProfileApiService/UserSchedule";
import * as ImagePicker from "expo-image-picker"; // For selecting profile picture
import AsyncStorage from "@react-native-async-storage/async-storage";
// Fetch user's profile data
import { fetchUserProfile } from "./ProfileApiService";
import tw from "twrnc";
import { formatTime } from "@/app/utils/util";
import { userHealthData } from "@/app/tabs/ProfileApiService/HealthData";
import { NullStyle } from "twrnc/dist/esm/types";
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
  const [userWeight, setUserWeight] = useState<number|null>(null);
  const [userSkillLevel, setUserSkillLevel] = useState("");

  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // State for Modal and Form Inputs
  const [modalVisible, setModalVisible] = useState(false);
  const [preferredGym, setPreferredGym] = useState("");
  const [fitnessGoals, setFitnessGoals] = useState<string[]>([]); // Explicitly declare the type as an array of strings
  const [fitnessGoalsInput, setFitnessGoalsInput] = useState("");
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);
  //Health data
  const {
    stepCount,
    caloriesBurned,
    avgHeartRate,
    sleepDuration,
    activeMins,
    hasConsented,
    setHasConsented,
    healthKitAvailable,
    requestAuthorization,
    fetchHealthData,
  } = userHealthData();

  useFocusEffect(
    useCallback(() => {
      // Load user profile data
      loadUserProfile();

      // Fetch user time ranges
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

      // Checked stored consent status
      const checkConsentStatus = async () => {
          const consent = await AsyncStorage.getItem("hasConsented");
          console.log("ASYC STATUS:", consent);
          const hasUserConsented = consent === "true"
          setHasConsented(hasUserConsented);
          if (hasConsented && healthKitAvailable) {
            fetchHealthData();
          }
      };
      
      checkConsentStatus();
    }, [hasConsented])
  );

  // Fetch user profile data from backend
  const loadUserProfile = async () => {
    try {
      const userProfile = await fetchUserProfile();

      if (userProfile && userProfile.user) {
        setUserName(userProfile.user.name || "");
        setUserAge(userProfile.user.age ? userProfile.user.age.toString() : "");
        setUserWeight(
          userProfile.user.weight ? userProfile.user.weight.toString() : ""
        );
        setUserSkillLevel(userProfile.user.skill_level || null);
        setProfilePicture(userProfile.user.profile_picture || null);

        const preferredWorkoutGoals = userProfile.user.preferred_workout_goals
          ? userProfile.user.preferred_workout_goals
              .split(",")
              .map((goal: string) => goal.trim())
          : [];
        setFitnessGoals(preferredWorkoutGoals);
        setFitnessGoalsInput(preferredWorkoutGoals.join(", ")); // Update input field
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const handleProfilePictureUpdate = async (mode: "gallery" | "camera") => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (mode === "gallery") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
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
        await updateProfileString(selectedUri);
      }
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const updateProfile = async (profilePictureUrl: string | null) => {
    try {
      const userUpdate = {
        profile_picture: profilePictureUrl,
      };

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
          console.log("�� Profile picture update: true");
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

  const handleFitnessGoalsChange = (text: string) => {
    setFitnessGoalsInput(text); // Preserve raw input while typing
  };

  const handleFitnessGoalsSubmit = () => {
    setFitnessGoals(
      fitnessGoalsInput
        .split(",")
        .map((goal) => goal.trim())
        .filter((goal) => goal !== "")
    );
  };

  const updateUserInfo = async () => {
    try {
      const userUpdate = {
        name: userName,
        age: userAge,
        weight: userWeight,
        preferred_workout_goals: fitnessGoals.join(","),
        skill_level: userSkillLevel, // Ensure this is included
      };
      // console.log(userUpdate)
      // Send the PATCH request
      const response = await fetchFunctionWithAuth("users/profile/update", {
        method: "PATCH",
        body: JSON.stringify(userUpdate),
        headers: {
          "Content-Type": "application/json",
        },
      });

      await loadUserProfile();
    } catch (error) {
      console.error("❌ Error updating info:", error);
    }
  };

  // Wrapper function to update both profile picture
  const updateProfileString = async (profilePictureUrl: string | null) => {
    try {
      // Update profile picture first
      await updateProfile(profilePictureUrl);
    } catch (error) {
      console.error("❌ Error updating profile:", error);
    }
  };

  const renderSchedule = () => {
    const daysOfWeek = [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
      "SUNDAY",
    ];
    return daysOfWeek.map((day, index) => {
      const dayRanges = timeRanges.filter((range) => range.day_of_week === day);
      return (
        <View key={index} style={tw`mt-1`}>
          <Text style={tw`text-xs text-gray-500`}>
            {day.substring(0, 1) + day.substring(1, day.length).toLowerCase()}
          </Text>
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
    const response = await fetchFunctionWithAuth("auth/logout", {
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
          <View style={tw`bg-purple-100 px-3 py-1 rounded-full mt-1`}>
            <Text style={tw`text-purple-500`}>{userSkillLevel}</Text>
          </View>

          {/* <View style={tw`flex-row mt-3`}>
            <View style={tw`items-center mx-4`}>
              <Text style={tw`text-lg font-bold`}>0</Text>
              <Text style={tw`text-xs text-gray-500`}>Day Streak</Text>
            </View>
            <View style={tw`items-center mx-4`}>
              <Text style={tw`text-lg font-bold`}>0</Text>
              <Text style={tw`text-xs text-gray-500`}>Workouts</Text>
            </View>
            <View style={tw`items-center mx-4`}>
              <Text style={tw`text-lg font-bold`}>0</Text>
              <Text style={tw`text-xs text-gray-500`}>Buddies</Text>
            </View>
          </View> */}
        </View>

        {/* Workout Preferences */}
        <View style={tw`bg-white p-4 mt-6 rounded-lg shadow`}>
          <View style={tw`flex-row justify-between items-center`}>
            <Text style={tw`text-lg font-bold`}>Workout Preferences</Text>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <Text style={tw`text-purple-500 text-sm`}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* <View style={tw`mt-3`}>
            <Text style={tw`text-xs text-black-500`}>Preferred Gym</Text>
            <View style={tw`flex-row items-center mt-1`}>
              <Icon name="map-marker" size={16} color="purple" />
              <Text style={tw`ml-2 text-sm text-gray-700`}>{preferredGym}</Text>
            </View>
          </View> */}

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
                  <View
                    key={index}
                    style={tw`bg-gray-200 px-2 py-1 rounded-full mr-2`}
                  >
                    <Text style={tw`text-xs`}>{goal}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Health Data */}
        <View style={tw`bg-white p-4 mt-6 rounded-lg shadow`}>
          <Text style={tw`text-lg font-bold`}>Your Health Data Today</Text>

          {hasConsented && healthKitAvailable ? (
            <>
              <Text style={tw`text-sm text-gray-600`}>
                Steps: {stepCount ?? "N/A"}
              </Text>
              <Text style={tw`text-sm text-gray-600`}>
                Calories Burned: {caloriesBurned ?? "N/A"}
              </Text>
              <Text style={tw`text-sm text-gray-600`}>
                Avg Heart Rate: {avgHeartRate ?? "N/A"}
              </Text>
              <Text style={tw`text-sm text-gray-600`}>
                Sleep Duration:
                {sleepDuration !== null
                  ? ` ${Math.floor(sleepDuration)}h ${Math.round(
                      (sleepDuration % 1) * 60
                    )}m`
                  : "N/A"}
              </Text>
              <Text style={tw`text-sm text-gray-600`}>
                Active Minutes:
                {activeMins !== null
                  ? ` ${Math.floor(activeMins / 60)}h ${activeMins % 60}m`
                  : "N/A"}
              </Text>
            </>
          ) : (
            <View>
              <Text style={tw`text-sm text-gray-500 mt-2`}>
                Health data is unavailable. Please check your permissions.
              </Text>
              <Text style={tw`text-sm text-gray-500 mt-2`}>
                To allow access, go to Settings {" > "} Apps {" > "} Health{" "}
                {" > "} Data Access & Devices {" > "} GymBudFrontend.
              </Text>
              <Text style={tw`text-sm text-gray-500 mt-2`}>
                Then, tap "Grant Permission" to enable health data.
              </Text>
              <Text style={tw`text-sm text-gray-500 mt-2`}>
                Note: You will only be prompted for permissions once. To change
                them later, update your settings manually.
              </Text>

              <TouchableOpacity
                style={tw`bg-blue-500 p-2 mt-2 rounded-lg`}
                onPress={requestAuthorization}
              >
                <Text style={tw`text-white text-center`}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          )}
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
                    placeholderTextColor="#B5B0B0"
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
                    placeholderTextColor="#B5B0B0"
                    value={userAge}
                    onChangeText={setUserAge}
                  />
                </View>

                {/* Weight */}
                <View>
                  <Text style={tw`text-xs text-gray-500 mb-1`}>Weight</Text>
                  <TextInput
                    style={tw`border p-2 rounded w-full`}
                    keyboardType="numeric"
                    placeholder="Enter your weight"
                    placeholderTextColor="#B5B0B0"
                    value={userWeight !== null ? String(userWeight) : ""}
                    onChangeText={(text) => {
                      const parsed = parseFloat(text);
                      setUserWeight(isNaN(parsed) ? null : parsed);
                    }}
                  />
                </View>

                {/* Skill Level */}
                <View>
                  <Text style={tw`text-xs text-gray-500 mb-1`}>
                    Skill Level
                  </Text>
                  <View style={tw`flex-row justify-center mb-1`}>
                    {[
                      { level: "BEGINNER", label: "BEGINNER" },
                      { level: "INTERMEDIATE", label: "INTERMEDIATE" },
                      { level: "ADVANCED", label: "ADVANCED" },
                    ].map(({ level, label }) => (
                      <TouchableOpacity
                        key={level}
                        onPress={() => setUserSkillLevel(level)}
                        style={tw`p-1.5 border rounded-lg mx-1 justify-center items-center ${
                          level === userSkillLevel
                            ? "bg-purple-300"
                            : "bg-gray-100 border-black-300"
                        }`}
                      >
                        <Text style={tw`text-xs`}>{label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Fitness Goals */}
                <View>
                  <Text style={tw`text-xs text-gray-500 mb-1`}>
                    Fitness Goals (Comma Separated)
                  </Text>
                  <TextInput
                    style={tw`border p-2 rounded w-full`}
                    placeholder="Enter your fitness goals (Separate by commas)"
                    placeholderTextColor="#B5B0B0"
                    value={fitnessGoalsInput}
                    onChangeText={handleFitnessGoalsChange} // Preserve spaces
                    onBlur={handleFitnessGoalsSubmit}
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
                  <TouchableOpacity
                    onPress={() => {
                      updateUserInfo();
                      setModalVisible(false);
                    }}
                  >
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
