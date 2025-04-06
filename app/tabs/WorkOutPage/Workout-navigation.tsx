import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Workoutscreen from "./Workoutscreen";
import WorkoutLogPage from "./WorkoutLogPage";
import ExistingWorkoutLogPage from "./ExistingWorkoutLogPage";
import AiAdviceScreen from "../AiAdvice/AiAdviceScreen";
import AiAdviceViewScreen from "../AiAdvice/AiAdviceView";
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
  AiAdvice: undefined;
  ExistingWorkoutLogPage: {
    worklogId: number;
    existingWorkLog: Workout;
    updateWorkouts: (updatedWorkout: Workout) => void;
  };
  AiAdviceView: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function WorkoutNavigator() {
  const [workouts, setWorkouts] = useState<Workout[]>();
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [adviceId, setAdviceId] = useState(0);
  return (
    <Stack.Navigator initialRouteName={"Workoutscreen"} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Workoutscreen">
        {(props) => <Workoutscreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="WorkoutLogPage">
        {(props) => <WorkoutLogPage {...props} />}
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
      <Stack.Screen name="AiAdvice" component={AiAdviceScreen} />
      <Stack.Screen name="AiAdviceView">
        {(props) => <AiAdviceViewScreen {...props} adviceId={adviceId} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
