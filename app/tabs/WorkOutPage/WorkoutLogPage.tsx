import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Modal,
  Alert,
} from "react-native";
import { SimpleLineIcons, MaterialIcons } from "@expo/vector-icons";
import tw from "twrnc";
import { createWorkoutLog } from "./WorkoutApiService";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { fetchWorkoutLogs } from "./WorkoutApiService";
import { Swipeable } from "react-native-gesture-handler";

// Define the types for the screens
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
  Workoutscreen: undefined;
  WorkoutLogPage: undefined;
  ExistingWorkoutLogPage: undefined;
  AiAdvice: undefined;
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
type Props = NativeStackScreenProps<RootStackParamList, "WorkoutLogPage">;

export default function WorkoutLogPage({ navigation }: Props) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<logMethod>("MANUAL");
  const [exerciseDetails, setExerciseDetails] = useState<Exercises[]>([
    { exercise_name: "", reps: 0, sets: 0, weight: 0 },
  ]);
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState(0);
  const [mood, setMood] = useState<Mood>("ENERGIZED");
  const [exercises, setExercises] = useState<Exercises[]>([]);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<
    number | null
  >(null);
  const isButtonDisabled = !exerciseDetails.every(
    (exercise) =>
      exercise.exercise_name &&
      exercise.reps > 0 &&
      exercise.sets > 0 &&
      exercise.weight > 0
  );

  // State for modal visibility
  const [modalVisible, setModalVisible] = useState(false);
  // Handle modal open/close
  const handlePress = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleAddExercise = () => {
    if (!isButtonDisabled) {
      setExercises((prevExercises) => [
        ...prevExercises,
        { ...exerciseDetails[0] },
      ]);
      setExerciseDetails([{ exercise_name: "", reps: 0, sets: 0, weight: 0 }]);
    }
  };

  const logWorkout = async () => {
    try {
      const workoutData = {
        title,
        type,
        exercise_details: exercises,
        notes,
        duration_minutes: duration,
        mood,
      };
      await createWorkoutLog(workoutData);

      // Optionally reset the form after submission
      setTitle("");
      setType("MANUAL");
      setExerciseDetails([{ exercise_name: "", reps: 0, sets: 0, weight: 0 }]);
      setNotes("");
      setDuration(0);
      setMood("ENERGIZED");
    } catch (error) {
      console.error("Error logging workout:", error);
    }
    await fetchWorkoutLogs();
    navigation.navigate("Workoutscreen");
  };

  const handleDeleteExercise = (index: number) => {
    Alert.alert(
      "Delete Exercise",
      "Are you sure you want to delete this exercise?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setExercises((prevExercises) =>
              prevExercises.filter((_, i) => i !== index)
            );
          },
        },
      ]
    );
  };

  const renderRightActions = (index: number) => (
    <TouchableOpacity
      onPress={() => handleDeleteExercise(index)}
      style={tw`bg-red-500 justify-center items-center h-17 w-15 rounded-lg`}
    >
      <MaterialIcons name="delete" size={24} color="white" />
    </TouchableOpacity>
  );

  const handleEditExercise = (index: number) => {
    setSelectedExerciseIndex(index);
    setExerciseDetails([{ ...exercises[index] }]); // Load exercise into input fields
  };

  const handleSaveExercise = () => {
    if (!isButtonDisabled && selectedExerciseIndex !== null) {
      setExercises((prevExercises) =>
        prevExercises.map((exercise, index) =>
          index === selectedExerciseIndex ? { ...exerciseDetails[0] } : exercise
        )
      );
      setSelectedExerciseIndex(null); // Reset selection
      setExerciseDetails([{ exercise_name: "", reps: 0, sets: 0, weight: 0 }]);
    }
  };

  const handleCancelEdit = () => {
    setSelectedExerciseIndex(null);
    setExerciseDetails([{ exercise_name: "", reps: 0, sets: 0, weight: 0 }]);
  };

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
                Workout Log
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
              value={exerciseDetails[0]?.exercise_name}
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

            {/* Add/Save Exercise Button */}
            <TouchableOpacity
              onPress={
                selectedExerciseIndex !== null
                  ? handleSaveExercise
                  : handleAddExercise
              }
              disabled={isButtonDisabled}
              style={tw`p-3 rounded-lg mb-4 ${
                isButtonDisabled ? "bg-gray-400" : "bg-blue-500"
              }`}
            >
              <Text style={tw`text-white text-center font-semibold`}>
                {selectedExerciseIndex !== null
                  ? "Save Changes"
                  : "Add Exercise"}
              </Text>
            </TouchableOpacity>

            {/* Cancel Exercise Button*/}
            {selectedExerciseIndex !== null && (
              <TouchableOpacity
                onPress={handleCancelEdit}
                style={tw`p-3 rounded-lg mb-4 bg-red-500`}
              >
                <Text style={tw`text-white text-center font-semibold`}>
                  Cancel
                </Text>
              </TouchableOpacity>
            )}

            {/* List of Added Exercises */}
            <Text style={tw`text-lg font-semibold mb-2`}>
              Logged Exercises:
            </Text>
            <View style={tw`mb-4`}>
              {exercises.map((exercise, index) => (
                <Swipeable
                  key={index}
                  renderRightActions={() => renderRightActions(index)} // No progress or dragX needed here
                >
                  <TouchableOpacity onPress={() => handleEditExercise(index)}>
                    <View
                      key={index}
                      style={tw`border p-4 mb-2 rounded-lg bg-white`}
                    >
                      <Text style={tw`font-semibold`}>
                        {exercise.exercise_name}
                      </Text>
                      <Text>
                        {exercise.sets} sets x {exercise.reps} reps x{" "}
                        {exercise.weight} lbs
                      </Text>
                      <View>
                        <Text
                          style={tw`absolute right-2 bottom-2 text-purple-500`}
                        >
                          Edit
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Swipeable>
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

            {/* Submit Button */}
            <TouchableOpacity
              onPress={logWorkout}
              style={tw`bg-purple-600 p-3 rounded-lg`}
            >
              <Text style={tw`text-white text-center font-semibold`}>
                Submit Log
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
