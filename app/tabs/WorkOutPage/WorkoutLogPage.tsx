import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

type Workout = {
    exercise: string;
    reps: number;
    sets: number;
    weight: number;
    mood: string;
    date: string;
  };

// Define navigation types
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
  Workoutscreen: undefined;
  WorkoutLogPage: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'WorkoutLogPage'>;

export default function WorkoutLogPage({ navigation }: Props) {
    const [exercise, setExercise] = useState('');
  const [reps, setReps] = useState(0);
  const [sets, setSets] = useState(0);
  const [weight, setWeight] = useState(0);
  const [mood, setMood] = useState('Excited');
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  const logWorkout = () => {
    const newWorkout: Workout = {
      exercise,
      reps,
      sets,
      weight,
      mood,
      date: new Date().toDateString(),
    };
    setWorkouts([...workouts, newWorkout]);
    setExercise('');
    setReps(0);
    setSets(0);
    setWeight(0);
    setMood('Excited');
    navigation.navigate('Workoutscreen');
  };

  return (
    <View style={tw`flex-1 p-4 bg-gray-100`}>
      <Text style={tw`text-xl font-bold mb-4`}>Log Your Workout</Text>

      {/* Exercise Input */}
      <TextInput
        style={tw`border p-2 mb-4 rounded-lg bg-white`}
        placeholder="Enter exercise"
        value={exercise}
        onChangeText={setExercise}
      />

      {/* Reps, Sets, Weight */}
      <View style={tw`flex-row justify-between mb-4`}>
        <TextInput style={tw`border p-2 w-1/3 rounded-lg bg-white`} placeholder="Reps" keyboardType="numeric" value={reps.toString()} onChangeText={(text) => setReps(Number(text))} />
        <TextInput style={tw`border p-2 w-1/3 rounded-lg bg-white`} placeholder="Sets" keyboardType="numeric" value={sets.toString()} onChangeText={(text) => setSets(Number(text))} />
        <TextInput style={tw`border p-2 w-1/3 rounded-lg bg-white`} placeholder="Weight (kg)" keyboardType="numeric" value={weight.toString()} onChangeText={(text) => setWeight(Number(text))} />
      </View>

      {/* Mood Selection */}
      <View style={tw`flex-row justify-between mb-4`}>
        {['Excited', 'Stressed', 'Tired'].map((m) => (
          <TouchableOpacity key={m} onPress={() => setMood(m)} style={tw`p-2 border rounded-lg ${m === mood ? 'bg-blue-300' : 'bg-white'}`}>
            <Text>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Log Workout Button */}
      <TouchableOpacity style={tw`bg-green-500 p-3 rounded-lg mb-4`} onPress={logWorkout}>
        <Text style={tw`text-white text-center font-bold`}>Log Workout</Text>
      </TouchableOpacity>

      {/* Workout History */}
      <ScrollView>
        {workouts.map((workout, index) => (
          <View key={index} style={tw`bg-white p-4 rounded-lg mb-2 shadow`}>
            <Text style={tw`text-lg font-semibold`}>{workout.exercise}</Text>
            <Text>{workout.reps} reps • {workout.sets} sets • {workout.weight}kg</Text>
            <Text>Mood: {workout.mood}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}