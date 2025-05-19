import React, { useState, useCallback } from "react";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import tw from "twrnc";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { fetchWorkoutLogs } from "../WorkOutPage/WorkoutApiService";
import { MaterialIcons } from "@expo/vector-icons";
import { fetchUserProfile } from "../ProfileApiService/ProfileApiService";
import { fetchFunctionWithAuth } from "@/api/auth";


type logMethod = "MANUAL" | "VOICE";
type Mood = "ENERGIZED" | "TIRED" | "MOTIVATED" | "STRESSED" | "NEUTRAL";
// Define types for the workout log
type Workout = {
  title: string;
  date: string;
  type: logMethod;
  mood: Mood;
  duration_minutes: number;
  id: number;
};

type RootStackParamList = {
  Home: undefined;
  ProfileNavigator: undefined;
  Workouts: undefined;
  MapNav: undefined;
};

interface CommunityList {
  id: number;
  name: string;
  address: string;
  places_id: string;
}

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const rootNav = navigation.getParent<StackNavigationProp<RootStackParamList>>();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [joinedCommunities, setJoinedCommunities] = useState<CommunityList[]>([]);
  const [showAllCommunities, setShowAllCommunities] = useState(false);
  const [preferredCommunityId, setPreferredCommunityId] = useState<number | null>(null);
  const sortedCommunities = [...joinedCommunities].sort((a, b) => {
    if (a.id === preferredCommunityId) return -1;
    if (b.id === preferredCommunityId) return 1;
    return 0;
  });

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

      // Fetch joined communities
      const loadJoined = async () => {
        try {
          const list: CommunityList[] = await fetchFunctionWithAuth(
            "users/gyms",
            { method: "GET" }
          );
          setJoinedCommunities(list);
        } catch (err) {
          console.error("Failed to load joined communities:", err);
        }
      };
      loadJoined();

      const loadPreferred = async () => {
        try {
          const preferredRes = await fetchFunctionWithAuth("users/prefer", {
            method: "GET",
          });
          setPreferredCommunityId(preferredRes.id);
        } catch (err) {
          console.error("Failed to load preferred gym:", err);
        }
      };

      loadPreferred();
    }, [])
  );

  const formatWorkoutDate = (isoDate: string) => {
    const date = parseISO(isoDate);

    if (isToday(date)) {
      return `Today, ${format(date, "h:mm a")}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMMM do, h:mm a");
    }
  };

  const recentWorkout = workouts.length > 0 ? workouts[0] : null;
  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <ScrollView style={tw`p-4`}>
        <View
          style={tw`flex-row justify-between items-center border-b border-gray-300 pb-2`}
        >
          <Text style={tw`text-3xl font-bold text-purple-500`}>GymBuds</Text>
          <View style={tw`flex-row items-center`}>
            {/* <Icon name="bell" size={20} color="gray" style={tw`mr-3`} /> */}
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
        {/* <View style={tw`flex-row justify-between items-center mt-6`}>
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
        </View> */}

        {/* Recent Workouts */}
        <View style={tw`flex-row justify-between items-center mt-6`}>
          <Text style={tw`text-lg font-bold`}>Recent Workouts</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Workouts")}>
            <Text style={tw`text-purple-500 text-sm`}>View All </Text>
          </TouchableOpacity>
        </View>
        {recentWorkout ? (
          <View style={tw`bg-white p-4 rounded-lg mt-2`}>
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
              <Text style={tw`text-xs text-gray-500 ml-1`}>
                {formatWorkoutDate(recentWorkout?.date)}
              </Text>
            </View>
            <View style={tw`flex-row justify-between items-center mt-3`}>
              <View style={tw`flex-row`}>
                <View style={tw`bg-gray-200 p-2 rounded-xl mr-2`}>
                  <Text style={tw`text-xs text-gray-600 font-semibold`}>{recentWorkout?.duration_minutes} MINS</Text>
                </View>
                <View style={tw`bg-gray-200 p-2 rounded-xl`}>
                  <Text style={tw`text-xs text-gray-600 font-semibold`}>{recentWorkout?.mood}</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <Text style={tw`text-gray-500 mt-2`}>No recent workouts found.</Text>
        )}

        {/*** Joined Communities ***/}
        <View style={tw`flex-row justify-between items-center mt-6`}>
          <Text style={tw`text-lg font-bold`}>Joined Communities</Text>
          {joinedCommunities.length > 3 && (
            <TouchableOpacity onPress={() => setShowAllCommunities(!showAllCommunities)}>
              <Text style={tw`text-purple-500 text-sm`}>
                {showAllCommunities ? "View Less" : "View All"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {sortedCommunities.length > 0 ? (
          (showAllCommunities ? sortedCommunities : sortedCommunities.slice(0, 3)).map((c) => (
            <TouchableOpacity
              key={c.id}
              style={tw`bg-white p-4 rounded-lg mt-2`}
              onPress={() => {
                rootNav?.navigate("MapNav", {
                  screen: "Community",
                  params: { placeId: c.places_id }
                });
              }}
            >
              <View style={tw`flex-row justify-between items-center`}>
                <View>
                  <View style={tw`flex-row flex-wrap items-center`}>
                    <Text style={tw`font-bold text-black`}>{c.name}</Text>
                    {preferredCommunityId === c.id && (
                      <View
                        style={tw`ml-2 bg-purple-100 px-2 py-0.5 rounded-full flex-row items-center`}
                      >
                        <Icon name="check" size={10} color="purple" />
                        <Text
                          style={tw`text-purple-500 text-xs font-semibold ml-1`}
                        >
                          Preferred
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text style={tw`text-gray-500 text-sm`}>{c.address}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={tw`text-gray-500 italic mt-2`}>
            You haven’t joined any communities yet.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
