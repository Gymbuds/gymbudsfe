import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, SafeAreaView } from "react-native";
import { AntDesign, Feather, FontAwesome5, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import tw from "twrnc";

// Define Workout type
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

type Props = NativeStackScreenProps<RootStackParamList, "Workoutscreen"> & {
  workouts: Workout[];
  setWorkouts: React.Dispatch<React.SetStateAction<Workout[]>>;
  setSelectedWorkout: React.Dispatch<React.SetStateAction<Workout | null>>;
};


export default function Workoutscreen({ navigation, workouts, setWorkouts, setSelectedWorkout }: Props) {
  const [selectedOption, setSelectedOption] = useState<"all" | "manual" | "voice">("all");
  const [date, setDate] = useState(new Date());
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>(workouts);


  const changeMonth = (direction: "prev" | "next") => {
    setDate((prevDate) => {
      const newDate = new Date(prevDate);
      newDate.setMonth(prevDate.getMonth() + (direction === "next" ? 1 : -1));
  
      // Filter workouts for the new month based on the newDate
      const filtered = workouts.filter((workout) => {
        const workoutDate = new Date(workout.date);
        return workoutDate.getMonth() === newDate.getMonth() && workoutDate.getFullYear() === newDate.getFullYear();
      });
      setFilteredWorkouts(filtered);
  
      return newDate;
    });
  };
  

  //Function to sort workouts alphabetically
  const sortWorkouts = () => {
    const sorted = [...workouts].sort((a, b) => a.exercise.localeCompare(b.exercise));
    setWorkouts(sorted); // Update state with the sorted array
  };
  
  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <View style={tw`flex-1 p-4 bg-gray-100`}>
        {/* Header */}
        <View style={tw`flex-row justify-between items-center mb-4`}>
          <Text style={tw`text-xl font-bold`}>Your Workouts</Text>
          <View style={tw`flex-row gap-4`}>
            {/* Filter Button */}
            <TouchableOpacity onPress={sortWorkouts}>
              <AntDesign name="filter" size={24} />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("WorkoutLogPage")}>
              <View style={{ backgroundColor: "purple", borderRadius: 50, padding: 3 }}>
                <AntDesign name="plus" size={24} color="white" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        {/* Horizontal Line */}
        <View style={tw`border-b border-gray-300 mb-4`} />

        {/* Date */}
        <View style={tw`relative flex-row items-center justify-center mb-2`}>
          {/* Previous Month Button - Left Edge */}
          <TouchableOpacity onPress={() => changeMonth("prev")} style={tw`absolute left-4 p-2`}>
            <FontAwesome5 name="chevron-left" size={15} color="black" />
          </TouchableOpacity>

          {/* Display Current Month & Year */}
          <Text style={tw`text-gray-600 text-center text-lg font-semibold`}>
            {date.toLocaleString("default", { month: "long" })} {date.getFullYear()}
          </Text>

          {/* Next Month Button - Right Edge */}
          <TouchableOpacity onPress={() => changeMonth("next")} style={tw`absolute right-4 p-2`}>
            <FontAwesome5 name="chevron-right" size={15} color="black" />
          </TouchableOpacity>
        </View>
        <View style={tw` border-gray-300 mb-4`} />
        
        {/* AI Recommendations */}
        <TouchableOpacity style={tw`flex-row items-center justify-center bg-purple-500 p-2 rounded-3xl mb-4`}>
          <View style={tw`bg-purple-500 p-1 rounded-full mr-2`}>
            <Feather name="zap" size={16} color="white" />
          </View>
          <Text style={tw`text-white text-center font-regular`}>
            See your AI Recommendations
          </Text>
        </TouchableOpacity>

      {/* Filter Buttons */}
      <View style={tw`flex-row justify-around mb-4`}>
        <TouchableOpacity
          style={tw`flex-row items-center bg-gray-300 rounded-3xl w-28 justify-center ${
            selectedOption === "all" ? "bg-purple-500" : "bg-gray-300"
          }`}
          onPress={() => setSelectedOption("all")}
        >
          <FontAwesome5
            name="list"
            size={18}
            color={selectedOption === "all" ? "white" : "black"}
            style={tw`mr-2`}
          />
          <Text
            style={tw`${
              selectedOption === "all" ? "text-white" : "text-black"
            }`}
          >
            All
          </Text>
        </TouchableOpacity>
        {/* Manual Button with Keyboard Icon */}
        <TouchableOpacity
          style={tw`flex-row items-center bg-gray-300 p-3 rounded-3xl w-28 justify-center ${
            selectedOption === "manual" ? "bg-purple-500" : "bg-gray-300"
          }`}
          onPress={() => setSelectedOption("manual")}
          // onPress={() => setManualModalVisible(true)}
        >
          <MaterialIcons
            name="keyboard"
            size={18}
            color={selectedOption === "manual" ? "white" : "black"}
            style={tw`mr-2`}
          />
          <Text
            style={tw`${
              selectedOption === "manual" ? "text-white" : "text-black"
            }`}
          >
            Manual
          </Text>
        </TouchableOpacity>

        {/* Voice Button with Multi-Audio Icon */}
        <TouchableOpacity
          style={tw`flex-row items-center px-6 py-3 rounded-3xl ${
            selectedOption === "voice" ? "bg-purple-500" : "bg-gray-300"
          }`}
          onPress={() => setSelectedOption("voice")}
        >
          <MaterialIcons
            name="multitrack-audio"
            size={18}
            color={selectedOption === "voice" ? "white" : "black"}
            style={tw`mr-2`}
          />
          <Text
            style={tw`${
              selectedOption === "voice" ? "text-white" : "text-black"
            }`}
          >
            Voice
          </Text>
        </TouchableOpacity>
      </View>

        {/* Workout List */}
        <Text style={tw`text-gray-600  text-lg font-semibold`}>All Workouts</Text>
        <ScrollView>
          {/* Map through sorted workouts */}
          {filteredWorkouts.map((workout, index) => (
          <View key={index} style={tw`bg-white p-4 mb-4 rounded-lg shadow-lg`}>
            <View style={tw`flex-row items-center justify-between mb-2`}>
              <Text style={tw`text-xl font-bold text-black-600`}>{workout.exercise}</Text>
              <View style={tw`flex-row items-center px-3 py-1 rounded-lg bg-purple-200`}>
                <MaterialIcons name="multitrack-audio" size={24} color="purple" />
              </View>
            </View>

            <View style={tw`flex-row items-center mb-8`}>
              <MaterialCommunityIcons name="calendar-clock-outline" size={24} color="gray" />
              <Text style={tw`text-sm text-gray-500 ml-2`}>{workout.date}</Text>
            </View>

            <View style={tw`flex-row mb-2`}>
            <View style={tw`flex-row items-center bg-gray-300 p-3 rounded-3xl w-25 mr-2`}>
                <Text style={tw`text-gray-600 font-semibold`}>Voice</Text>
              </View>
              <View style={tw`flex-row items-center bg-gray-300 p-3 rounded-3xl w-25 mr-2`}>
                <Text style={tw`text-gray-600 font-semibold`}>{workout.mood}</Text>
              </View>

              {/* Edit Button */}
              <TouchableOpacity
                style={tw`absolute top-4 right-4 flex-row items-center`}
                onPress={() => {
                  setSelectedWorkout(workout);
                  navigation.navigate("WorkoutLogPage");
                }}
              >
                <Text style={tw`text-purple-600 font-semibold ml-1`}>Edit</Text>
                <MaterialIcons name="chevron-right" size={24} color="purple" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
