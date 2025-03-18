import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { AntDesign, SimpleLineIcons } from "@expo/vector-icons";
import tw from "twrnc";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type Workout = {
  exercise: string;
  reps: number;
  sets: number;
  weight: number;
  mood: string;
  date: string;
};

type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
  Workoutscreen: undefined;
  WorkoutLogPage: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "WorkoutLogPage"> & {
  workouts: Workout[];
  setWorkouts: React.Dispatch<React.SetStateAction<Workout[]>>;
  selectedWorkout: Workout | null;
  setSelectedWorkout: React.Dispatch<React.SetStateAction<Workout | null>>;
};

export default function WorkoutLogPage({
  navigation,
  workouts,
  setWorkouts,
  selectedWorkout,
  setSelectedWorkout,
}: Props) {
  const [exercise, setExercise] = useState("");
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(0);
  const [weight, setWeight] = useState(0);
  const [mood, setMood] = useState("Excited");
  const [selectedMood, setSelectedMood] = useState<string>("Excited");

  const logWorkout = () => {
    const newWorkout: Workout = {
      exercise,
      reps,
      sets,
      weight,
      mood,
      date: new Date().toDateString(),
    };

    if (selectedWorkout) {
      // Update existing workout
      const updatedWorkouts = workouts.map((w) =>
        w.exercise === selectedWorkout.exercise ? newWorkout : w
      );
      setWorkouts(updatedWorkouts);
      setSelectedWorkout(null);
    } else {
      // Add new workout at the top (stack behavior)
      setWorkouts([newWorkout, ...workouts]); // Adding new workout at the beginning
    }

    // Reset form
    setExercise("");
    setReps(0);
    setSets(0);
    setWeight(0);
    setMood("Excited");
    setSelectedMood("Excited");
  };

  const deleteWorkout = (index: number) => {
    const updatedWorkouts = workouts.filter((_, i) => i !== index);
    setWorkouts(updatedWorkouts);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <View style={tw`flex-1 p-4 bg-gray-100`}>
        {/* Back Button */}
        <TouchableOpacity
          style={{ padding: 10, flexDirection: "row", alignItems: "center" }}
          onPress={() => navigation.navigate("Workoutscreen")}
        >
          <SimpleLineIcons name="arrow-left-circle" size={28} color="black" />
          <Text style={{ fontWeight: "bold", marginLeft: 8, fontSize: 25 }}>
            Workout Log
          </Text>
        </TouchableOpacity>

        <Text style={tw`text font-bold mb-4 mt-2`}>Log your Workouts</Text>
        {/* Exercise Input */}
        <TextInput
          style={tw`border p-3 mb-4 rounded-lg bg-white`}
          placeholder="Add exercise..."
          placeholderTextColor="gray"
          value={exercise}
          onChangeText={setExercise}
        />

        {/* Reps, Sets, Weight */}
        <View style={tw`flex-row justify-between mb-4`}>
          {/* Reps */}
          <View>
            <Text style={tw`text-center`}>Reps</Text>
            <View style={tw`flex-row justify-center items-center`}>
              {/* Decrement Button */}
              <TouchableOpacity
                onPress={() => reps > 0 && setReps(reps - 1)}
                style={tw`rounded-full justify-center items-center p-2`}
              >
                <Text style={tw`text-xl`}>-</Text>
              </TouchableOpacity>

              {/* Display Rep Count */}
              <View
                style={tw`flex-row justify-center items-center border p-2 mx-2 rounded-lg bg-white w-14`}
              >
                <Text>{reps}</Text>
              </View>

              {/* Increment Button */}
              <TouchableOpacity
                onPress={() => setReps(reps + 1)}
                style={tw`rounded-full justify-center items-center p-2`}
              >
                <Text style={tw`text-xl`}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sets */}
          <View>
            <Text style={tw`text-center`}>Sets</Text>
            <View style={tw`flex-row justify-center items-center`}>
              {/* Decrement Button */}
              <TouchableOpacity
                onPress={() => sets > 0 && setSets(sets - 1)}
                style={tw`rounded-full justify-center items-center p-2`}
              >
                <Text style={tw`text-xl`}>-</Text>
              </TouchableOpacity>

              {/* Display Set Count */}
              <View
                style={tw`flex-row justify-center items-center border p-2 mx-2 rounded-lg bg-white w-14`}
              >
                <Text>{sets}</Text>
              </View>

              {/* Increment Button */}
              <TouchableOpacity
                onPress={() => setSets(sets + 1)}
                style={tw`rounded-full justify-center items-center p-2`}
              >
                <Text style={tw`text-xl`}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Weight */}
          <View>
            <Text style={tw`text-center`}>Weight</Text>
            <View style={tw`flex-row justify-center items-center`}>
              {/* Decrement Button */}
              <TouchableOpacity
                onPress={() => weight > 0 && setWeight(weight - 1)}
                style={tw`rounded-full justify-center items-center p-2`}
              >
                <Text style={tw`text-xl`}>-</Text>
              </TouchableOpacity>

              {/* Display Weight */}
              <View
                style={tw`flex-row justify-center items-center border p-2 mx-2 rounded-lg bg-white w-14`}
              >
                <Text>{weight}</Text>
              </View>

              {/* Increment Button */}
              <TouchableOpacity
                onPress={() => setWeight(weight + 1)}
                style={tw`rounded-full justify-center items-center p-2`}
              >
                <Text style={tw`text-xl`}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Mood Selection */}
        <Text style={tw`mb-2 text-lg font-semibold`}>Add Mood</Text>
        <View style={tw`flex-row justify-center mb-7 w-55`}>
          {[
            { mood: "Excited", emoji: "😁" },
            { mood: "Stressed", emoji: "😓" },
            { mood: "Tired", emoji: "😰" },
          ].map(({ mood, emoji }) => (
            <TouchableOpacity
              key={mood}
              onPress={() => {
                setSelectedMood(mood); // Set the selected mood
                setMood(mood); // Set the mood state
              }}
              style={tw`p-3 border rounded-lg mx-1 justify-center items-center ${
                mood === selectedMood
                  ? "bg-purple-300"
                  : "bg-gray-100 border-gray-300"
              }`}
            >
              <Text style={tw`text-xl w-10`}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

          
          <TouchableOpacity
            style={[
              tw`p-3 rounded-lg mb-4`,
              exercise ? tw`bg-purple-500` : tw`bg-gray-300`, // Button color changes based on exercise input
            ]}
            onPress={logWorkout}
            disabled={!exercise} // Disable button if no exercise entered
          >
            <Text style={tw`text-white text-center font-bold`}>
              {exercise ? "Log Workout" : "Enter Exercise to Log"}
            </Text>
          </TouchableOpacity>


        <View style={[tw`border p-4 rounded-lg`, { height: 300 }]}>
          <ScrollView>
            {workouts
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              ) // Sort by date ascending
              .map((workout, index) => (
                <View
                  key={index}
                  style={[
                    tw`flex-row justify-between items-start p-2 mb-2 bg-gray-100 rounded-lg`,
                    { borderBottomWidth: 1, borderBottomColor: "#ccc" }, // Adding horizontal line
                  ]}
                >
                  <View style={tw`flex-1`}>
                    <Text style={[tw`font-bold`, { fontSize: 20 }]}>
                      {workout.exercise}
                    </Text>
                    <Text style={tw`text-sm`}>
                      {workout.sets} sets x {workout.reps} reps
                      {workout.weight > 0 && ` x ${workout.weight} kg`}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => deleteWorkout(index)}>
                    <AntDesign
                      name="close"
                      size={24}
                      color="red"
                      style={tw`font-bold`}
                    />
                  </TouchableOpacity>
                </View>
              ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}