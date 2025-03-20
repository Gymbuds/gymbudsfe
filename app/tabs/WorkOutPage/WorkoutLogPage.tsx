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

type WorkoutLog = {
  exercise_name: string; // ✅ Ensure correct property name
  reps: number;
  sets: number;
  weight: number;
  date: string;
  exercise_id: number;
};

type WorkoutGroup = {
  title: string;
  type: string; // ✅ Ensure "type" is always included
  mood: string;
  logs: WorkoutLog[];
  workout_id: number;
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
  workouts: WorkoutGroup[];
  setWorkouts: React.Dispatch<React.SetStateAction<WorkoutGroup[]>>;
};

export default function WorkoutLogPage({
  navigation,
  workouts,
  setWorkouts,
}: Props) {
  const [title, setTitle] = useState("");
  const [exercise, setExercise] = useState("");
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(0);
  const [weight, setWeight] = useState(0);
  const [mood, setMood] = useState("Excited");
  const [selectedMood, setSelectedMood] = useState<string>("Excited");

  const logWorkout = () => {
    if (!title || !exercise) return;

    const newLog: WorkoutLog = {
      exercise_name: exercise, // Corrected property name
      reps,
      sets,
      weight,
      date: new Date().toDateString(),
      exercise_id: Date.now(), // Generating unique ID
    };

    setWorkouts((prevWorkouts) => {
      const existingWorkout = prevWorkouts.find((w) => w.title === title);
    
      if (existingWorkout) {
        return prevWorkouts.map((w) =>
          w.title === title ? { ...w, logs: [...w.logs, newLog] } : w
        );
      } else {
        return [
          ...prevWorkouts,
          { title, type: "Strength", mood, logs: [newLog], workout_id: 0 }, // logs is initialized as an empty array
        ];
      }
    });
    

    // Reset fields
    setExercise("");
    setReps(0);
    setSets(0);
    setWeight(0);
  };


  const deleteWorkout = (titleIndex: number, logIndex: number) => {
    setWorkouts((prevWorkouts) => {
      const updatedWorkouts = [...prevWorkouts];
  
      // Ensure 'logs' is defined and an array before accessing length
      if (updatedWorkouts[titleIndex] && Array.isArray(updatedWorkouts[titleIndex].logs)) {
        updatedWorkouts[titleIndex].logs = updatedWorkouts[titleIndex].logs.filter((_, i) => i !== logIndex);
      }
  
      // Remove the workout if it has no logs
      return updatedWorkouts.filter((w) => w.logs && w.logs.length > 0);
    });
  };
  

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <View style={tw`flex-1 p-4 bg-gray-100`}>
        <TouchableOpacity
          style={{ padding: 10, flexDirection: "row", alignItems: "center" }}
          onPress={() => navigation.navigate("Workoutscreen")}
        >
          <SimpleLineIcons name="arrow-left-circle" size={28} color="black" />
          <Text style={{ fontWeight: "bold", marginLeft: 8, fontSize: 25 }}>
            Workout Log
          </Text>
        </TouchableOpacity>

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

        {/* Mood Selection */}
        <Text style={tw`mb-2 text-lg font-semibold`}>Add Mood</Text>
        <View style={tw`flex-row justify-center mb-2 w-100`}>
          {[
            { mood: "Excited", emoji: "😁" },
            { mood: "Stressed", emoji: "😓" },
            { mood: "Tired", emoji: "😰" },
          ].map(({ mood, emoji }) => (
            <TouchableOpacity
              key={mood}
              onPress={() => {
                setSelectedMood(mood);
                setMood(mood);
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

        <Text style={tw`text font-bold mb-4 mt-2`}>Log your Workouts</Text>
        {/* Exercise Input */}
        <TextInput
          style={tw`border p-3 mb-4 rounded-lg bg-white`}
          placeholder="Add exercise..."
          placeholderTextColor="gray"
          value={exercise} // ✅ Updated state reference
          onChangeText={setExercise}
        />

        <View style={tw`flex-row justify-between mb-4`}>
          {/* Reps */}
          <View>
            <Text style={tw`text-center font-semibold`}>Reps</Text>
            <View style={tw`flex-row justify-center items-center`}>
              <TouchableOpacity
                onPress={() => reps > 0 && setReps(reps - 1)}
                style={tw`rounded-full justify-center items-center p-2`}
              >
                <Text style={tw`text-xl`}>-</Text>
              </TouchableOpacity>

              <View
                style={tw`flex-row justify-center items-center border p-2 mx-2 rounded-lg bg-white w-14`}
              >
                <Text>{reps}</Text>
              </View>
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
            <Text style={tw`text-center font-semibold`}>Sets</Text>
            <View style={tw`flex-row justify-center items-center`}>
              <TouchableOpacity
                onPress={() => sets > 0 && setSets(sets - 1)}
                style={tw`rounded-full justify-center items-center p-2`}
              >
                <Text style={tw`text-xl`}>-</Text>
              </TouchableOpacity>
              <View
                style={tw`flex-row justify-center items-center border p-2 mx-2 rounded-lg bg-white w-14`}
              >
                <Text>{sets}</Text>
              </View>
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
            <Text style={tw`text-center font-semibold`}>Weight</Text>
            <View style={tw`flex-row justify-center items-center`}>
              <TouchableOpacity
                onPress={() => weight > 0 && setWeight(weight - 1)}
                style={tw`rounded-full justify-center items-center p-2`}
              >
                <Text style={tw`text-xl`}>-</Text>
              </TouchableOpacity>
              <View
                style={tw`flex-row justify-center items-center border p-2 mx-2 rounded-lg bg-white w-14`}
              >
                <Text>{weight}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setWeight(weight + 1)}
                style={tw`rounded-full justify-center items-center p-2`}
              >
                <Text style={tw`text-xl`}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Log Workout Button */}
        <TouchableOpacity
          style={[
            tw`p-3 rounded-lg mb-4`,
            exercise ? tw`bg-purple-500` : tw`bg-gray-300`,
          ]}
          onPress={logWorkout}
          disabled={!exercise}
        >
          <Text style={tw`text-white text-center font-bold`}>
            {exercise ? "Log Workout" : "Enter Exercise to Log"}
          </Text>
        </TouchableOpacity>

        {/* Workout List */}
        <View style={[tw`border p-4 rounded-lg`, { height: 300 }]}>
          <ScrollView>
            {workouts.map((workoutGroup, index) => (
              <View key={index} style={tw`mb-4 p-4 bg-gray-200 rounded-lg`}>
                <Text style={tw`text-xl font-bold mb-2`}>
                  {workoutGroup.title}
                </Text>
                {workoutGroup.logs?.length > 0 ? (
                  workoutGroup.logs.map((log, logIndex) => (
                    <View
                      key={logIndex}
                      style={tw`flex-row justify-between items-center p-2 bg-gray-100 rounded-lg mb-2`}
                    >
                      <View>
                        <Text style={tw`font-semibold`}>
                          {log.exercise_name}
                        </Text>
                        <Text>
                          {log.sets} sets x {log.reps} reps{" "}
                          {log.weight > 0 ? `x ${log.weight} kg` : ""}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => deleteWorkout(index, logIndex)}
                      >
                        <AntDesign name="close" size={20} color="red" />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text>No workouts logged yet.</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
