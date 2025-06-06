import React, { useState, useEffect, useRef } from "react";
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
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SimpleLineIcons, MaterialIcons } from "@expo/vector-icons";
import tw from "twrnc";
import { updateWorkoutLog } from "./WorkoutApiService";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Swipeable } from "react-native-gesture-handler";

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

type Workout = {
  // date: string;
  duration_minutes: number;
  exercise_details: Exercises[];
  delete_exercises: number[];
  // id: number;
  mood: Mood;
  notes: string;
  title: string;
  type: logMethod;
};

// Define types for the workout log
type Exercises = {
  exercise_id?: number;
  exercise_name: string;
  reps: number;
  sets: number;
  weight: number;
};

type logMethod = "MANUAL" | "VOICE";
type Mood = "ENERGIZED" | "TIRED" | "MOTIVATED" | "STRESSED" | "NEUTRAL";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "ExistingWorkoutLogPage"
>;

export default function ExistingWorkoutLog({ route, navigation }: Props) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<logMethod>("MANUAL");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState(0);
  const [mood, setMood] = useState<Mood>("ENERGIZED");
  const [exerciseDetails, setExerciseDetails] = useState<Exercises[]>([]);
  const [exerciseName, setExerciseName] = useState("");
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(0);
  const [weight, setWeight] = useState(0);
  const [deletedExercises, setDeletedExercises] = useState<number[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(
    null
  );
  const swipeableRefs = useRef<Map<number, Swipeable>>(new Map());
  const updatedWorkoutLog: Workout = {
    title,
    type,
    exercise_details: exerciseDetails,
    delete_exercises: deletedExercises,
    notes,
    duration_minutes: duration,
    mood,
  };

  const isButtonDisabled =
    !exerciseName || reps === 0 || sets === 0 || weight === 0;
  const { worklogId, updateWorkouts } = route.params;
  // State for modal visibility
  const [modalVisible, setModalVisible] = useState(false);

  // Handle modal open/close
  const handlePress = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  useEffect(() => {
    if (route.params.existingWorkLog) {
      setTitle(route.params.existingWorkLog.title);
      setType(route.params.existingWorkLog.type);
      setExerciseDetails(route.params.existingWorkLog.exercise_details);
      setNotes(route.params.existingWorkLog.notes);
      setDuration(route.params.existingWorkLog.duration_minutes);
      setMood(route.params.existingWorkLog.mood);
      // setDate(route.params.existingWorkLog.date);
    }
  }, [route.params.existingWorkLog]);

  // Function to populate the form when an exercise is clicked
  const handleSelectExercise = (exercise: any) => {
    setSelectedExerciseId(exercise.exercise_id);
    setExerciseName(exercise.exercise_name);
    setReps(exercise.reps);
    setSets(exercise.sets);
    setWeight(exercise.weight);
  };

  const handleAddNewExercise = () => {
    if (!isButtonDisabled) {
      setExerciseDetails((prevExercises) => [
        ...prevExercises,
        {
          exercise_name: exerciseName,
          reps,
          sets,
          weight,
          exercise_id: 0,
        },
      ]);

      // Reset form after adding
      resetExerciseForm();
    }
  };

  const handleEditExercise = (exerciseId: number) => {
    // Find the exercise to edit
    const exerciseToEdit = exerciseDetails.find(
      (ex) => ex.exercise_id === exerciseId
    );

    if (exerciseToEdit) {
      setSelectedExerciseId(exerciseId);
      setExerciseName(exerciseToEdit.exercise_name);
      setReps(exerciseToEdit.reps);
      setSets(exerciseToEdit.sets);
      setWeight(exerciseToEdit.weight);
    }
  };

  const handleSaveEditedExercise = () => {
    if (!isButtonDisabled && selectedExerciseId !== null) {
      setExerciseDetails((prevExercises) =>
        prevExercises.map((exercise) =>
          exercise.exercise_id === selectedExerciseId
            ? { ...exercise, exercise_name: exerciseName, reps, sets, weight }
            : exercise
        )
      );

      resetExerciseForm();
    }
  };

  const resetExerciseForm = () => {
    setExerciseName("");
    setReps(0);
    setSets(0);
    setWeight(0);
    setSelectedExerciseId(null); // Reset so it switches back to "Add Exercise" mode
  };

  const editWorkout = async () => {
    try {
      console.log(
        "Sending workout update:",
        JSON.stringify(updatedWorkoutLog, null, 2)
      );

      // Call the updateWorkoutLog API with the worklogId in the URL
      await updateWorkoutLog(worklogId, updatedWorkoutLog);

      // Update workouts state in parent component
      updateWorkouts && updateWorkouts(updatedWorkoutLog);

      // Navigate back
      navigation.goBack();
    } catch (error) {
      console.error("Error updating workout log:", error);
      alert("Failed to update workout log. Please try again.");
    }
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
            const deletedExercise = exerciseDetails[index];
            const exerciseId = deletedExercise?.exercise_id;

            if (exerciseId !== undefined) {
              // Close swipeable row if open
              const swipeable = swipeableRefs.current.get(exerciseId);
              swipeable?.close();

              // Add to deleted exercises list
              setDeletedExercises((prev) =>
                [...prev, exerciseId].filter(
                  (id): id is number => id !== undefined
                )
              );

              // Remove from exerciseDetails
              setExerciseDetails((prev) => prev.filter((_, i) => i !== index));

              // Clean up ref
              swipeableRefs.current.delete(exerciseId);
            }
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

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          enableOnAndroid={true}
          extraScrollHeight={20}
          keyboardShouldPersistTaps="handled"
        >
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
                      navigation.navigate("Workoutscreen", {
                        updatedWorkoutLog,
                      });
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
            {/* <Text style={tw`mb-2 text-lg font-semibold`}>
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
            </View> */}
            {/* Exercise Input */}
            <Text style={tw`text-lg font-semibold mb-2`}>Exercises:</Text>
            <TextInput
              style={tw`border p-3 mb-4 rounded-lg bg-white`}
              placeholder="Enter exercise name..."
              placeholderTextColor="gray"
              value={exerciseName}
              onChangeText={setExerciseName}
            />
            {/* Reps, Sets, and Weight Controls */}
            <View style={tw`flex-row justify-between mb-4`}>
              {/* Sets */}
              <View>
                <Text style={tw`text-center font-semibold`}>Sets</Text>
                <View style={tw`flex-row justify-center items-center`}>
                  <TouchableOpacity
                    onPress={() => setSets(Math.max(0, sets - 1))} // Decrease sets
                    style={tw`rounded-full justify-center items-center p-2`}
                  >
                    <Text style={tw`text-xl`}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={tw`border p-2 mx-2 rounded-lg bg-white w-14 text-center`}
                    value={String(sets)}
                    onChangeText={(text) => setSets(parseInt(text) || 0)} // Update sets dynamically
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    onPress={() => setSets(sets + 1)} // Increase sets
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
                    onPress={() => setReps(Math.max(0, reps - 1))} // Decrease reps
                    style={tw`rounded-full justify-center items-center p-2`}
                  >
                    <Text style={tw`text-xl`}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={tw`border p-2 mx-2 rounded-lg bg-white w-14 text-center`}
                    value={String(reps)}
                    onChangeText={(text) => setReps(parseInt(text) || 0)} // Update reps dynamically
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    onPress={() => setReps(reps + 1)} // Increase reps
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
                    onPress={() => setWeight(Math.max(0, weight - 5))} // Decrease weight
                    style={tw`rounded-full justify-center items-center p-2`}
                  >
                    <Text style={tw`text-xl`}>-</Text>
                  </TouchableOpacity>
                  <TextInput
                    style={tw`border p-2 mx-2 rounded-lg bg-white w-14 text-center`}
                    value={String(weight)}
                    onChangeText={(text) => setWeight(parseInt(text) || 0)} // Update weight dynamically
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    onPress={() => setWeight(weight + 5)} // Increase weight
                    style={tw`rounded-full justify-center items-center p-2`}
                  >
                    <Text style={tw`text-xl`}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            {/* Add Exercise Button */}
            <TouchableOpacity
              onPress={
                selectedExerciseId !== null
                  ? handleSaveEditedExercise
                  : handleAddNewExercise
              }
              disabled={isButtonDisabled}
              style={tw`p-3 rounded-lg mb-4 ${
                isButtonDisabled ? "bg-gray-400" : "bg-blue-500"
              }`}
            >
              <Text style={tw`text-white text-center font-semibold`}>
                {selectedExerciseId !== null
                  ? "Update Exercise"
                  : "Add Exercise"}
              </Text>
            </TouchableOpacity>
            {/* Cancel Update Button*/}
            {selectedExerciseId !== null && (
              <TouchableOpacity
                onPress={resetExerciseForm}
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
              {exerciseDetails.map((exercise, index) => (
                <Swipeable
                  key={exercise.exercise_id}
                  ref={(ref) => {
                    const id = exercise.exercise_id;
                    if (id === undefined) return; // Skip if undefined

                    if (ref) {
                      swipeableRefs.current.set(id, ref);
                    } else {
                      swipeableRefs.current.delete(id);
                    }
                  }}
                  renderRightActions={() => renderRightActions(index)}
                >
                  <TouchableOpacity
                    onPress={() => handleSelectExercise(exercise)}
                  >
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

                      {/* Edit button positioned in the bottom right */}
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
            {/* Update Button */}
            <TouchableOpacity
              onPress={editWorkout}
              style={tw`bg-purple-600 p-3 rounded-lg`}
            >
              <Text style={tw`text-white text-center font-semibold`}>
                Update Log
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
