import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ScrollView, Keyboard, TouchableWithoutFeedback, Modal, Alert } from "react-native";
import { SimpleLineIcons } from "@expo/vector-icons";
import tw from "twrnc";
import { fetchWorkoutLogs, updateWorkoutLog } from "./WorkoutApiService";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
  Workoutscreen: undefined;
  WorkoutLogPage: undefined;
  // ExistingWorkoutLogPage: { worklogId: number; existingWorkLog: Workout };
  ExistingWorkoutLogPage: { worklogId: number; 
    existingWorkLog: Workout;
    updateWorkouts: (updatedWorkout: Workout) => void; };
};

type Workout = {
  date: string;
  duration_minutes: number;
  exercise_details: Exercises[];
  id: number;
  mood: Mood;
  notes: string;
  title: string;
  type: logMethod;
};

// Define types for the workout log
type Exercises = {
  exercise_name: string;
  reps: number;
  sets: number;
  weight: number;
};

type logMethod = "MANUAL" | "VOICE";
type Mood = "ENERGIZED" | "TIRED" | "MOTIVATED" | "STRESSED" | "NEUTRAL";

type Props = NativeStackScreenProps<RootStackParamList, "ExistingWorkoutLogPage">;

// export default function ExistingWorkoutLogPage({ navigation, route }: Props) {
  export default function ExistingWorkoutLog({ route, navigation }: Props) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<logMethod>("MANUAL");
  const [exerciseDetails, setExerciseDetails] = useState<Exercises[]>([
    { exercise_name: "", reps: 0, sets: 0, weight: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState(0);
  const [mood, setMood] = useState<Mood>("ENERGIZED");
  const [exercises, setExercises] = useState<Exercises[]>([]);
  const isButtonDisabled = !title || !exerciseDetails[0]?.exercise_name;
  const { worklogId, existingWorkLog, updateWorkouts } = route.params; // Now updateWorkouts is part of the params
  const [date, setDate] = useState("");
  // State for modal visibility
  const [modalVisible, setModalVisible] = useState(false);
  const [newExercise, setNewExercise] = useState({ exercise_name: "", reps: 0, sets: 0, weight: 0 });


  // Handle modal open/close
  const handlePress = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };


  const handleAddExercise = () => {
    if (!isButtonDisabled && exerciseDetails[0].exercise_name.trim() !== "") {
      setExercises((prevExercises) => [...prevExercises, exerciseDetails[0]]);
      setExerciseDetails([{ exercise_name: "", reps: 0, sets: 0, weight: 0 }]); // Reset only the input field
    }
  };
  // const handleAddExercise = () => {
  //   if (!isButtonDisabled && newExercise.exercise_name.trim() !== "") {
  //     setExercises((prevExercises) => [...prevExercises, newExercise]);
  //     setNewExercise({ exercise_name: "", reps: 0, sets: 0, weight: 0 }); // Reset input
  //   }
  // };

  useEffect(() => {
    const getExistingWorkoutLog = async () => {
      try {
        // Fetch all workout logs
        const fetchedLogs: Workout[] = await fetchWorkoutLogs();
  
        // Find the log by the specific id
        const existingLog = fetchedLogs.find((log: Workout) => log.id === worklogId);
  
        if (existingLog) {
          // Update the state with the details of the fetched workout log
          setTitle(existingLog.title || "");
          setType(existingLog.type || "MANUAL");
          setExerciseDetails(existingLog.exercise_details || [
            { exercise_name: "", reps: 0, sets: 0, weight: 0 },
          ]);
          setNotes(existingLog.notes || "");
          setDuration(existingLog.duration_minutes || 0);
          setMood(existingLog.mood || "ENERGIZED");
          setExercises(existingLog.exercise_details || []);
        } else {
          console.error('Log not found');
          Alert.alert('Error', 'Workout log not found');
        }
      } catch (error) {
        console.error('Error fetching workout log:', error);
        Alert.alert('Failed to fetch workout log');
      }
    };
  
    // Check if worklogId exists and fetch the log
    if (worklogId) {
      getExistingWorkoutLog();
    }
  }, [worklogId]);

  const editWorkout = async (logId: number) => {
    try {
      // Updated workout log object with the correct fields
      const updatedWorkoutLog: Workout = {
        title,
        type,
        exercise_details: exercises, // Renamed exercises to exercise_details
        notes,
        duration_minutes: duration, // Renamed duration to duration_minutes
        mood,
        id: logId,
        date,
      };

      await updateWorkoutLog(logId, updatedWorkoutLog);

      // Call the updateWorkouts function passed in params
      if (updateWorkouts) {
        updateWorkouts(updatedWorkoutLog);
      }
  
      navigation.goBack();
    } catch (error) {
      alert("Failed to update workout log. Please try again.");
      console.error("Error updating workout log:", error);
    }
  };
  
  useEffect(() => {
    if (existingWorkLog) {
      // console.log("Existing Work Log from Exist.tsx:", existingWorkLog); // Log the existing work log for debugging
      setTitle(existingWorkLog.title || "");
      setType(existingWorkLog.type || "MANUAL");
      setExerciseDetails(existingWorkLog.exercise_details || [
        { exercise_name: "", reps: 0, sets: 0, weight: 0 },
      ]);
      setNotes(existingWorkLog.notes || "");
      setDuration(existingWorkLog.duration_minutes || 0);
      setMood(existingWorkLog.mood || "ENERGIZED");
      setDate(existingWorkLog.date || "");
    }
  }, [existingWorkLog]); // Runs when `existingWorkLog` changes
  
  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={tw`flex-1 p-4 bg-gray-100`}>
            <TouchableOpacity
              style={{
                padding: 10,
                flexDirection: "row",
                alignItems: "center",
              }}
              onPress={handlePress} // Trigger modal on tap
            >
              <SimpleLineIcons
                name="arrow-left-circle"
                size={28}
                color="black"
              />
              <Text style={{ fontWeight: "bold", marginLeft: 8, fontSize: 25 }}>
                Update Workout Log
              </Text>
            </TouchableOpacity>

            {/* Modal */}
            <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={closeModal}
            >
              <View
                style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
              >
                <View style={tw`bg-white p-6 rounded-lg w-80`}>
                  <Text style={tw`text-center text-xl font-semibold mb-4`}>
                    Workout log won't be saved
                  </Text>

                  <TouchableOpacity
                    onPress={closeModal}
                    style={tw`bg-blue-500 p-3 rounded-lg mb-2`}
                  >
                    <Text style={tw`text-white text-center`}>Keep Working</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false);
                      navigation.navigate("Workoutscreen");
                    }}
                    style={tw`bg-red-500 p-3 rounded-lg`}
                  >
                    <Text style={tw`text-white text-center`}>Leave</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Title Input */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-lg font-semibold mb-2`}>Title:</Text>
              <TextInput
                style={tw`border p-3 rounded-lg bg-white`}
                placeholder="Enter workout title..."
                placeholderTextColor="gray"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Log Method */}
            <Text style={tw`mb-2 text-lg font-semibold`}>
              Select Log Method
            </Text>
            <View style={tw`flex-row justify-center mb-2`}>
              {[
                { method: "MANUAL", label: "Manual" },
                { method: "VOICE", label: "Voice" },
              ].map(({ method: logMethod, label }) => (
                <TouchableOpacity
                  key={logMethod}
                  onPress={() => setType(logMethod as "MANUAL" | "VOICE")} // Ensure correct type
                  style={tw`p-3 border rounded-lg mx-1 justify-center items-center ${
                    logMethod === type
                      ? "bg-purple-300"
                      : "bg-gray-100 border-black-300"
                  }`}
                >
                  <Text style={tw`text-xs`}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Exercise Input */}
            <Text style={tw`text-lg font-semibold mb-2`}>Exercises:</Text>
            <TextInput
              style={tw`border p-3 mb-4 rounded-lg bg-white`}
              placeholder="Add exercise..."
              placeholderTextColor="gray"
              // the value should be an empty string to allow input 
              // it shouldn't fetch the existing exrciseDetail
              value={exerciseDetails[0]?.exercise_name||''}
              onChangeText={(text) =>
                setExerciseDetails([
                  { ...exerciseDetails[0], exercise_name: text },
                ])
              }
            />

            {/* Reps, Sets, and Weight Controls */}
            <View style={tw`flex-row justify-between mb-4`}>
              {/* Sets */}
              <View>
                <Text style={tw`text-center font-semibold`}>Sets</Text>
                <View style={tw`flex-row justify-center items-center`}>
                  <TouchableOpacity
                    onPress={() =>
                      exerciseDetails[0]?.sets > 0 &&
                      setExerciseDetails([
                        {
                          ...exerciseDetails[0],
                          sets: exerciseDetails[0].sets - 1,
                        },
                      ])
                    }
                    style={tw`rounded-full justify-center items-center p-2`}
                  >
                    <Text style={tw`text-xl`}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={tw`border p-2 mx-2 rounded-lg bg-white w-14 text-center`}
                    value={String(exerciseDetails[0]?.sets)}
                    onChangeText={(text) =>
                      setExerciseDetails([
                        { ...exerciseDetails[0], sets: parseInt(text) || 0 },
                      ])
                    }
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setExerciseDetails([
                        {
                          ...exerciseDetails[0],
                          sets: exerciseDetails[0].sets + 1,
                        },
                      ])
                    }
                    style={tw`rounded-full justify-center items-center p-2`}
                  >
                    <Text style={tw`text-xl`}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Reps */}
              <View>
                <Text style={tw`text-center font-semibold`}>Reps</Text>
                <View style={tw`flex-row justify-center items-center`}>
                  <TouchableOpacity
                    onPress={() =>
                      exerciseDetails[0]?.reps > 0 &&
                      setExerciseDetails([
                        {
                          ...exerciseDetails[0],
                          reps: exerciseDetails[0].reps - 1,
                        },
                      ])
                    }
                    style={tw`rounded-full justify-center items-center p-2`}
                  >
                    <Text style={tw`text-xl`}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={tw`border p-2 mx-2 rounded-lg bg-white w-14 text-center`}
                    value={String(exerciseDetails[0]?.reps)}
                    onChangeText={(text) =>
                      setExerciseDetails([
                        { ...exerciseDetails[0], reps: parseInt(text) || 0 },
                      ])
                    }
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setExerciseDetails([
                        {
                          ...exerciseDetails[0],
                          reps: exerciseDetails[0].reps + 1,
                        },
                      ])
                    }
                    style={tw`rounded-full justify-center items-center p-2`}
                  >
                    <Text style={tw`text-xl`}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Weight */}
              <View>
                <Text style={tw`text-center font-semibold`}>Weight (lbs)</Text>
                <View style={tw`flex-row justify-center items-center`}>
                  <TouchableOpacity
                    onPress={() =>
                      exerciseDetails[0]?.weight > 0 &&
                      setExerciseDetails([
                        {
                          ...exerciseDetails[0],
                          weight: exerciseDetails[0].weight - 5,
                        },
                      ])
                    }
                    style={tw`rounded-full justify-center items-center p-2`}
                  >
                    <Text style={tw`text-xl`}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={tw`border p-2 mx-2 rounded-lg bg-white w-14 text-center`}
                    value={String(exerciseDetails[0]?.weight)}
                    onChangeText={(text) =>
                      setExerciseDetails([
                        { ...exerciseDetails[0], weight: parseInt(text) || 0 },
                      ])
                    }
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setExerciseDetails([
                        {
                          ...exerciseDetails[0],
                          weight: exerciseDetails[0].weight + 5,
                        },
                      ])
                    }
                    style={tw`rounded-full justify-center items-center p-2`}
                  >
                    <Text style={tw`text-xl`}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Add Exercise Button */}
            <TouchableOpacity
              onPress={handleAddExercise}
              disabled={isButtonDisabled}
              style={tw`p-3 rounded-lg mb-4 ${isButtonDisabled ? "bg-gray-400" : "bg-blue-500"}`}
            >
              <Text style={tw`text-white text-center font-semibold`}>
                Add Exercise
              </Text>
            </TouchableOpacity>

            {/* List of Added Exercises */}
            <Text style={tw`text-lg font-semibold mb-2`}>
              Logged Exercises:
            </Text>
            <View style={tw`mb-4`}>
              {exercises.map((exercise, index) => (
                <View
                  key={index}
                  style={tw`border p-4 mb-2 rounded-lg bg-white`}
                >
                  <Text style={tw`font-semibold`}>
                    {exercise.exercise_name}
                  </Text>
                  <Text>
                    {exercise.sets} sets x {exercise.reps} reps x {exercise.weight} lbs
                  </Text>
                </View>
              ))}
            </View>
            

            {/* Duration Input */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-lg font-semibold mb-2`}>
                Duration (minutes):
              </Text>
              <TextInput
                style={tw`border p-3 rounded-lg bg-white`}
                placeholder="Enter duration..."
                placeholderTextColor="gray"
                value={String(duration)}
                keyboardType="numeric"
                onChangeText={(text) => setDuration(Number(text))}
              />
            </View>

            {/* Notes Input */}
            <View style={tw`mb-4`}>
              <Text style={tw`text-lg font-semibold mb-2`}>Notes:</Text>
              <TextInput
                style={tw`border p-3 rounded-lg bg-white`}
                placeholder="Enter any notes..."
                placeholderTextColor="gray"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Mood Selection */}
            <Text style={tw`mb-2 text-lg font-semibold`}>Add Mood</Text>
            <View style={tw`flex-row justify-center mb-2`}>
              {[
                { mood: "ENERGIZED", emoji: "😁" },
                { mood: "TIRED", emoji: "😓" },
                { mood: "MOTIVATED", emoji: "😃" },
                { mood: "STRESSED", emoji: "😰" },
                { mood: "NEUTRAL", emoji: "😐" },
              ].map(({ mood: newMood, emoji }) => (
                <TouchableOpacity
                  key={newMood}
                  onPress={() => setMood(newMood as Mood)} // Cast to Mood if needed
                  style={tw`p-3 border rounded-lg mx-1 justify-center items-center ${
                    newMood === mood
                      ? "bg-purple-300"
                      : "bg-gray-100 border-gray-300"
                  }`}
                >
                  <Text style={tw`text-xl`}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Update Button */}
            <TouchableOpacity
              onPress={() => editWorkout(worklogId)}
              style={tw`bg-purple-600 p-3 rounded-lg`}
            >
              <Text style={tw`text-white text-center font-semibold`}>
                Update Log
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}