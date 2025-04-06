import React, { useState, useCallback } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import tw from "twrnc";
import { format } from "date-fns";
import { fetchWorkoutLogs } from "../WorkOutPage/WorkoutApiService";
import { MaterialIcons } from "@expo/vector-icons";
import { fetchUserProfile } from "../ProfileApiService/ProfileApiService";

type logMethod = "MANUAL" | "VOICE";
type Mood = "ENERGIZED" | "TIRED" | "MOTIVATED" | "STRESSED" | "NEUTRAL";
// Define types for the workout log
type Workout = {
  title: string;
  date: string;
  type: logMethod;
  mood: Mood;
  id: number;
};

type RootStackParamList = {
  Home: undefined;
  ProfileNavigator: undefined;
  WorkoutNavigator: undefined;
};

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  useFocusEffect(
    useCallback(() => {
      fetchWorkoutLogs()
        .then((data) => {
          // Sort workouts by created_at field in descending order
          const sortedWorkouts = data.sort(
            (a: Workout, b: Workout) => b.id - a.id
          );

          setWorkouts(sortedWorkouts);
        })
        .catch((error) => {
          console.error("Error fetching workouts:", error);
        });

      // Fetch user profile data
      const loadUserProfile = async () => {
        try {
          const userProfile = await fetchUserProfile();
          if (userProfile && userProfile.user) {
            setProfilePicture(userProfile.user.profile_picture || null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      };

      loadUserProfile();
    }, [])
  );

  const recentWorkout = workouts.length > 0 ? workouts[0] : null;
  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView style={tw`p-4`}>
        <View style={tw`flex-row justify-between items-center`}>
          <Text style={tw`text-3xl font-bold text-purple-500`}>GymBuds</Text>
          <View style={tw`flex-row items-center`}>
            <Icon name="bell" size={20} color="gray" style={tw`mr-3`} />
            <TouchableOpacity
              onPress={() => navigation.navigate("ProfileNavigator")}
            >
              {profilePicture ? (
                <Image
                  source={{ uri: profilePicture }}
                  style={tw`w-8 h-8 rounded-full`}
                />
              ) : (
                <View
                  style={tw`bg-purple-300 w-8 h-8 rounded-full flex items-center justify-center`}
                >
                  <Text style={tw`text-white font-bold`}>U</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
        <View style={tw`flex-row justify-between items-center mt-6`}>
          <Text style={tw`text-lg font-bold`}>Today's Progress</Text>
          <TouchableOpacity>
            <Text style={tw`text-purple-500 text-sm`}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={tw`flex-row justify-between mt-2`}>
          <View
            style={tw`w-24 h-20 bg-purple-100 rounded-lg flex items-center justify-center`}
          >
            <Icon name="check" size={18} color="purple" />
            <Text style={tw`text-sm font-bold text-purple-500`}>Workout</Text>
            <Text style={tw`text-xs text-gray-500`}>Completed</Text>
          </View>
          <View
            style={tw`w-24 h-20 bg-orange-100 rounded-lg flex items-center justify-center`}
          >
            <Icon name="fire" size={18} color="orange" />
            <Text style={tw`text-sm font-bold text-orange-500`}>Calories</Text>
            <Text style={tw`text-xs text-gray-500`}>1250</Text>
          </View>
          <View
            style={tw`w-24 h-20 bg-green-100 rounded-lg flex items-center justify-center`}
          >
            <Icon name="bolt" size={18} color="green" />
            <Text style={tw`text-sm font-bold text-green-500`}>Streak</Text>
            <Text style={tw`text-xs text-gray-500`}>8 days</Text>
          </View>
        </View>

        {/* Recent Workouts */}
        <View style={tw`flex-row justify-between items-center mt-6`}>
          <Text style={tw`text-lg font-bold`}>Recent Workouts</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("WorkoutNavigator")}
          >
            <Text style={tw`text-purple-500 text-sm`}>View All </Text>
          </TouchableOpacity>
        </View>
        {recentWorkout ? (
          <View style={tw`bg-gray-100 p-4 rounded-lg mt-2`}>
            <View style={tw`flex-row items-center justify-between mb-2`}>
              <Text style={tw`text-xl font-bold text-black-600`}>
                {recentWorkout?.title}
              </Text>
              <View
                style={tw`flex-row items-center px-3 py-1 rounded-lg bg-purple-200`}
              >
                <MaterialIcons
                  name={
                    recentWorkout?.type === "MANUAL"
                      ? "keyboard"
                      : "multitrack-audio"
                  }
                  size={24}
                  color="purple"
                />
              </View>
            </View>
            <View style={tw`flex-row items-center mt-2`}>
              <Icon name="calendar" size={12} color="gray" />
              <Text style={tw`text-xs text-gray-500 ml-1 mt-2`}>
                {recentWorkout?.date
                  ? format(new Date(recentWorkout.date), "EEE, MMM d, h:mm a")
                  : "Unknown Date"}
              </Text>
            </View>
            <View style={tw`flex-row justify-between items-center mt-3`}>
              <View style={tw`flex-row`}>
                <View style={tw`bg-gray-300 p-2 rounded-lg mr-2`}>
                  <Text style={tw`text-xs`}>{recentWorkout?.type}</Text>
                </View>
                <View style={tw`bg-gray-300 p-2 rounded-lg`}>
                  <Text style={tw`text-xs`}>{recentWorkout?.mood}</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <Text style={tw`text-gray-500 mt-2`}>No recent workouts found.</Text>
        )}

        {/* Nearby Communities */}
        <View style={tw`flex-row justify-between items-center mt-6`}>
          <Text style={tw`text-lg font-bold`}>Nearby Communities</Text>
          <TouchableOpacity>
            <Text style={tw`text-purple-500 text-sm`}>View Map</Text>
          </TouchableOpacity>
        </View>
        <View style={tw`bg-white rounded-lg shadow-lg mt-2`}>
          <Image
            source={{ uri: "https://source.unsplash.com/featured/?gym" }}
            style={tw`h-40 w-full rounded-t-lg`}
          />
          <View style={tw`p-4`}>
            <Text style={tw`text-lg font-bold`}>Fitness Hub</Text>
            <View style={tw`flex-row items-center mt-1`}>
              <Icon name="map-marker" size={12} color="gray" />
              <Text style={tw`text-xs text-gray-500 ml-1`}>
                123 Main St, Los Angeles, CA
              </Text>
            </View>
            <View style={tw`flex-row items-center mt-2`}>
              <Icon name="star" size={14} color="gold" />
              <Text style={tw`text-xs ml-1`}>4.8 (124 reviews)</Text>
              <Text style={tw`text-xs text-gray-500 ml-auto`}>235 members</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
