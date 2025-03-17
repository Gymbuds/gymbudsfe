import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

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

type Workout = {
  exercise: string;
  reps: number;
  sets: number;
  weight: number;
  mood: string;
  date: string;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Workoutscreen'>;

export default function Workoutscreen({ navigation }: Props) {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [manualModalVisible, setManualModalVisible] = useState(false);

  return (
    <View style={tw`flex-1 p-4 bg-gray-100`}>
      {/* Header */}
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <Text style={tw`text-xl font-bold`}>Your Workout</Text>
        <View style={tw`flex-row gap-4`}>
          <TouchableOpacity>
            <Icon name="filter" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('WorkoutLogPage')}>
            <Icon name="plus" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date */}
      <Text style={tw`text-gray-600 mb-4`}>{new Date().toDateString()}</Text>

      {/* AI Recommendations */}
      <TouchableOpacity style={tw`bg-blue-500 p-3 rounded-lg mb-4`}>
        <Text style={tw`text-white text-center font-bold`}>See your AI Recommendations</Text>
      </TouchableOpacity>

      {/* Filter Buttons */}
      <View style={tw`flex-row justify-around mb-4`}>
        <TouchableOpacity style={tw`bg-gray-300 p-2 rounded-lg`}>
          <Text>ALL</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`bg-gray-300 p-2 rounded-lg`} onPress={() => setManualModalVisible(true)}>
          <Text>Manual</Text>
        </TouchableOpacity>
        <TouchableOpacity style={tw`bg-gray-300 p-2 rounded-lg`}>
          <FontAwesome5 name="microphone" size={16} color="black" />
        </TouchableOpacity>
      </View>

      {/* Workout List */}
      <ScrollView>
        {workouts.map((workout, index) => (
          <TouchableOpacity
            key={index}
            style={tw`bg-white p-4 rounded-lg mb-2 shadow`}
            onPress={() => navigation.navigate('WorkoutLogPage')}
          >
            <View style={tw`flex-row justify-between items-center`}>
              <Text style={tw`text-lg font-semibold text-purple-500`}>{workout.exercise}</Text>
              <FontAwesome5 name="microphone" size={16} color="purple" />
            </View>
            <Text style={tw`text-gray-500`}>{workout.date}</Text>
            <Text style={tw`text-gray-700`}>
              {workout.reps} reps • {workout.sets} sets • {workout.weight}kg
            </Text>
            <Text style={tw`text-gray-700`}>Mood: {workout.mood}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Manual Entry Modal */}
      <Modal visible={manualModalVisible} transparent={true}>
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white p-6 rounded-lg`}>
            <Text>Manual Entry</Text>
            <TouchableOpacity onPress={() => setManualModalVisible(false)}>
              <Text style={tw`text-red-500`}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}