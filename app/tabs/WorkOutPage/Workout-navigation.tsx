import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Workoutscreen from "./Workoutscreen";
import WorkoutLogPage from "./WorkoutLogPage";
import ExistingWorkoutLogPage from "./ExistingWorkoutLogPage";

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
  ExistingWorkoutLogPage: {
    worklogId: number;
    existingWorkLog: Workout;
    updateWorkouts: (updatedWorkout: Workout) => void;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function WorkoutNavigator() {
  const [workouts, setWorkouts] = useState<Workout[]>();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Workoutscreen">
        {(props) => (
          <Workoutscreen
            {...props}

          />
        )}
      </Stack.Screen>
      <Stack.Screen name="WorkoutLogPage">
        {(props) => (
          <WorkoutLogPage
            {...props}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="ExistingWorkoutLogPage">
        {(props) => (
          <ExistingWorkoutLogPage
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
