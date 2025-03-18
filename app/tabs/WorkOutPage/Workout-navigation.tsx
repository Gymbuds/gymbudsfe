import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Workoutscreen from './Workoutscreen';
import WorkoutLogPage from './WorkoutLogPage';

type Workout = {
    exercise: string;
    reps: number;
    sets: number;
    weight: number;
    mood: string;
    date: string;
  };  

// Define the types for the screens
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
  Workoutscreen: undefined;
  WorkoutLogPage: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function WorkoutNavigator() {
    const [workouts, setWorkouts] = useState<Workout[]>([
        { exercise: "Chest Press", reps: 10, sets: 3, weight: 50, mood: "Excited", date: "Today, 8:30 AM" },
        { exercise: "Squats", reps: 8, sets: 3, weight: 70, mood: "Stressed", date: "Sat, March 27th, 8:00 Am" },
        { exercise: "Deadlift", reps: 5, sets: 4, weight: 100, mood: "Tired", date: "Yesterday, 5:30 PM" },
      ]);
      
      const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
    
      return (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Workoutscreen">
              {props => (
                <Workoutscreen
                  {...props}
                  workouts={workouts}
                  setWorkouts={setWorkouts}
                  setSelectedWorkout={setSelectedWorkout}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="WorkoutLogPage">
              {props => (
                <WorkoutLogPage
                  {...props}
                  workouts={workouts}
                  setWorkouts={setWorkouts}
                  selectedWorkout={selectedWorkout}
                  setSelectedWorkout={setSelectedWorkout}
                />
              )}
            </Stack.Screen>
          </Stack.Navigator>
      );
    }
    