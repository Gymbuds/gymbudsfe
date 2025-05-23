import React, { useState, useEffect, useCallback, useRef } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Alert,
} from "react-native";
import {
  AntDesign,
  Feather,
  FontAwesome5,
  MaterialIcons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { fetchWorkoutLogs, deleteWorkoutLog } from "./WorkoutApiService";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { Swipeable } from "react-native-gesture-handler";
import tw from "twrnc";

type logMethod = "MANUAL" | "VOICE";
type Mood = "ENERGIZED" | "TIRED" | "MOTIVATED" | "STRESSED" | "NEUTRAL";
// Define types for the workout log
type Exercises = {
  exercise_name: string;
  reps: number;
  sets: number;
  weight: number;
};
// Define Workout type
type Workout = {
  date: string;
  duration_minutes: number;
  exercise_details: Exercises[];
  id: number;
  mood: Mood;
  notes: string;
  title: string;
  type: logMethod;
  user_id: number;
};

type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
  Workoutscreen: { updatedWorkoutLog: Workout };
  WorkoutLogPage: undefined;
  ExistingWorkoutLogPage: {
    worklogId: number;
    existingWorkLog: Workout;
    updateWorkouts: (updatedWorkout: Workout) => void;
  };
  AiAdvice: undefined;
};

// type Props = NativeStackScreenProps<RootStackParamList, "Workoutscreen">;
type Props = NativeStackScreenProps<RootStackParamList, "Workoutscreen"> & {
  route: {
    params: {
      updatedWorkoutLog?: Workout;
    };
  };
};

export default function Workoutscreen({ navigation, route }: Props) {
  const { updatedWorkoutLog } = route.params ?? {};
  const [selectedOption, setSelectedOption] = useState<
    "all" | "manual" | "voice"
  >("all");
  const [date, setDate] = useState(new Date());
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [fetchWorkout, setFetchWorkout] = useState<Workout[]>([]);
  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());

  const changeMonth = (direction: "prev" | "next") => {
    setDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + (direction === "next" ? 1 : -1));
      // Filter the workouts based on the new month and year
      if (fetchWorkout) {
        const filtered = fetchWorkout.filter((workout) => {
          const workoutDate = new Date(workout.date);
          return (
            workoutDate.getMonth() === newDate.getMonth() &&
            workoutDate.getFullYear() === newDate.getFullYear()
          );
        });
        // Set the filtered workouts (either empty or with filtered results)
        setFilteredWorkouts(filtered.length === 0 ? [] : filtered);
      }

      return newDate;
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchWorkoutLogs()
        .then((data) => {
          setFetchWorkout(data);
        })
        .catch((error) => {
          console.error("Error fetching workouts:", error);
        });
    }, [])
  );

  useEffect(() => {
    const filteredByMonth = fetchWorkout
      .filter((workout) => {
        const workoutDate = new Date(workout.date);
        return (
          workoutDate.getMonth() === date.getMonth() &&
          workoutDate.getFullYear() === date.getFullYear()
        );
      })
      .filter(
        (workout) =>
          selectedOption === "all" ||
          workout.type.toLowerCase() === selectedOption
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // sort by most recent
  
    setFilteredWorkouts(filteredByMonth);
  }, [fetchWorkout, selectedOption, date]);  

  useEffect(() => {
    if (updatedWorkoutLog) {
      setFetchWorkout((prevWorkouts) =>
        prevWorkouts.map((workout) =>
          workout.id === updatedWorkoutLog.id
            ? { ...workout, ...updatedWorkoutLog }
            : workout
        )
      );
    }
  }, [updatedWorkoutLog]);

  // Function to sort workouts alphabetically
  const sortWorkouts = () => {
    if (fetchWorkout) {
      const sorted = [...fetchWorkout].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
      setFetchWorkout(sorted);
    }
  };

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

  // Function to handle deletion
  const handleDelete = (index: number, logId: number) => {
    Alert.alert(
      "Delete Workout",
      "Are you sure you want to delete this workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              const swipeable = swipeableRefs.current.get(logId);
              swipeable?.close();
              swipeableRefs.current.delete(logId);

              await deleteWorkoutLog(logId); // Delete from backend
              const data = await fetchWorkoutLogs(); // Re-fetch fresh data
              setFetchWorkout(data); // Update state
            } catch (error) {
              console.error("Failed to delete workout log:", error);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Render right swipe action
  const renderRightActions = (index: number, logId: number) => (
    <TouchableOpacity
      onPress={() => handleDelete(index, logId)}
      style={tw`bg-red-500 justify-center items-center h-38 w-15 rounded-lg`}
    >
      <MaterialIcons name="delete" size={24} color="white" />
    </TouchableOpacity>
  );

  const handleNavigate = (worklogId: number, fetchWorkout: Workout[]) => {
    const selectedWorkout = fetchWorkout.find(
      (workout) => workout.id === worklogId
    );

    if (selectedWorkout) {
      navigation.navigate("ExistingWorkoutLogPage", {
        worklogId: worklogId,
        existingWorkLog: selectedWorkout, // Pass selected workout to edit page
        updateWorkouts: (updatedWorkout: Workout) => {
          // Update the frontend with the modified workout list
          const updatedWorkouts = fetchWorkout.map((workout) =>
            workout.id === updatedWorkout.id ? updatedWorkout : workout
          );
          setFetchWorkout(updatedWorkouts); // Reflect the changes in the frontend
        },
      });
    }
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <View style={tw`flex-1 p-4 bg-gray-100`}>
        {/* Header */}
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-2xl font-bold`}>Your Workouts</Text>
          <View style={tw`flex-row gap-4`}>
            {/* Filter Button */}
            {/* <TouchableOpacity onPress={sortWorkouts}>
              <AntDesign name="filter" size={24} />
            </TouchableOpacity> */}

            <TouchableOpacity
              onPress={() => navigation.navigate("WorkoutLogPage")}
            >
            <View style={tw`bg-purple-500 rounded-full p-1`}>
              <AntDesign name="plus" size={24} color="white" />
            </View>
            </TouchableOpacity>
          </View>
        </View>
        {/* Horizontal Line */}
        <View style={tw`border-b border-gray-300 mb-4`} />

        {/* AI Recommendations */}
        <TouchableOpacity
          style={tw`flex-row items-center justify-center bg-purple-500 p-2 rounded-3xl mb-4`}
          onPress={() => {
            navigation.navigate("AiAdvice");
          }}
        >
          <View style={tw`bg-purple-500 p-1 rounded-full mr-2`}>
            <Feather name="zap" size={16} color="white" />
          </View>
          <Text style={tw`text-white text-center font-regular`}>
            See your AI Recommendations
          </Text>
        </TouchableOpacity>

        {/* Date */}
        <View style={tw`relative flex-row items-center justify-center mb-2`}>
          {/* Previous Month Button - Left Edge */}
          <TouchableOpacity
            onPress={() => changeMonth("prev")}
            style={tw`absolute left-4 p-2`}
          >
            <FontAwesome5 name="chevron-left" size={15} color="black" />
          </TouchableOpacity>

          {/* Display Current Month & Year */}
          <Text style={tw`text-gray-600 text-center text-lg font-semibold`}>
            {date.toLocaleString("default", { month: "long" })}{" "}
            {date.getFullYear()}
          </Text>

          {/* Next Month Button - Right Edge */}
          <TouchableOpacity
            onPress={() => changeMonth("next")}
            style={tw`absolute right-4 p-2`}
          >
            <FontAwesome5 name="chevron-right" size={15} color="black" />
          </TouchableOpacity>
        </View>
        <View style={tw` border-gray-300`} />

        {/* Filter Buttons */}
        {/* <View style={tw`flex-row justify-around mb-4`}>
          <TouchableOpacity
            style={tw`flex-row items-center bg-gray-300 rounded-3xl w-28 justify-center ${
              selectedOption === "all" ? "bg-purple-500" : "bg-gray-300"
            }`}
            onPress={() => setSelectedOption("all")}
          >
            <FontAwesome5
              name="list"
              size={18}
              color={selectedOption === "all" ? "white" : "black"}
              style={tw`mr-2`}
            />
            <Text
              style={tw`${
                selectedOption === "all" ? "text-white" : "text-black"
              }`}
            >
              All
            </Text>
          </TouchableOpacity> */}
          {/* Manual Button with Keyboard Icon */}
          {/* <TouchableOpacity
            style={tw`flex-row items-center bg-gray-300 p-3 rounded-3xl w-28 justify-center ${
              selectedOption === "manual" ? "bg-purple-500" : "bg-gray-300"
            }`}
            onPress={() => setSelectedOption("manual")}
            // onPress={() => setManualModalVisible(true)}
          >
            <MaterialIcons
              name="keyboard"
              size={18}
              color={selectedOption === "manual" ? "white" : "black"}
              style={tw`mr-2`}
            />
            <Text
              style={tw`${
                selectedOption === "manual" ? "text-white" : "text-black"
              }`}
            >
              Manual
            </Text>
          </TouchableOpacity> */}

          {/* Voice Button with Multi-Audio Icon */}
          {/* <TouchableOpacity
            style={tw`flex-row items-center px-6 py-3 rounded-3xl ${
              selectedOption === "voice" ? "bg-purple-500" : "bg-gray-300"
            }`}
            onPress={() => setSelectedOption("voice")}
          >
            <MaterialIcons
              name="multitrack-audio"
              size={18}
              color={selectedOption === "voice" ? "white" : "black"}
              style={tw`mr-2`}
            />
            <Text
              style={tw`${
                selectedOption === "voice" ? "text-white" : "text-black"
              }`}
            >
              Voice
            </Text>
          </TouchableOpacity>
        </View> */}

        {/* Workout List */}
        <Text style={tw`text-gray-600 text-lg font-semibold`}>
          {selectedOption === "all"
            ? "All Workouts"
            : `${
                selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)
              } Workouts`}
        </Text>
        <ScrollView>
          {/* Map through sorted workouts */}
          {filteredWorkouts.map((workout: Workout, index) => (
            <Swipeable
              ref={(ref) => {
                if (ref) swipeableRefs.current.set(workout.id, ref);
                else swipeableRefs.current.delete(workout.id); // cleanup
              }}
              key={workout.id}
              renderRightActions={() => renderRightActions(index, workout.id)}
            >
              <View style={tw`bg-white p-4 mb-4 rounded-lg shadow-lg`}>
                <View style={tw`flex-row items-center justify-between mb-2`}>
                  <Text style={tw`text-xl font-bold text-black-600`}>
                    {workout.title}
                  </Text>
                  <View
                    style={tw`flex-row items-center px-3 py-1 rounded-lg bg-purple-200`}
                  >
                    <MaterialIcons
                      name={
                        workout.type === "MANUAL"
                          ? "keyboard"
                          : "multitrack-audio"
                      }
                      size={24}
                      color="purple"
                    />
                  </View>
                </View>

                <View style={tw`flex-row items-center mb-4`}>
                  <MaterialCommunityIcons
                    name="calendar-clock-outline"
                    size={24}
                    color="gray"
                  />
                  <Text style={tw`text-sm text-gray-500 ml-2`}>
                    {formatWorkoutDate(workout.date)}
                  </Text>
                </View>

                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <View style={tw`flex-row flex-wrap gap-2`}>
                    <View style={tw`bg-gray-200 px-4 py-2 rounded-2xl`}>
                      <Text style={tw`text-gray-600 font-semibold text-center`}>
                        {workout.duration_minutes} MINS
                      </Text>
                    </View>
                    <View style={tw`bg-gray-200 px-4 py-2 rounded-2xl`}>
                      <Text style={tw`text-gray-600 font-semibold text-center`}>
                        {workout.mood}
                      </Text>
                    </View>
                  </View>

                  {/* Edit Button */}
                  <TouchableOpacity
                    onPress={() => handleNavigate(workout.id, fetchWorkout)}
                  >
                    <View style={tw`flex-row items-center`}>
                      <Text style={tw`text-purple-600 font-semibold`}>Edit</Text>
                      <MaterialIcons name="chevron-right" size={24} color="purple" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </Swipeable>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}