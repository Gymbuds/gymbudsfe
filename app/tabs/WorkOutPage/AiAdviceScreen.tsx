import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
} from "react-native";
import { SimpleLineIcons, Feather } from "@expo/vector-icons";

import tw from "twrnc";

export default function AiAdviceScreen({ navigation }) {
  const [AiModalOpen, setAiModelOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [selectOpen, setSelectOpen] = useState(false);

  const handlePressGenerate = () => {
    console.log("Generating recommendation for:", selectedValue);
    setAiModelOpen(false);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      {/* Header */}
      <View style={tw`p-4 bg-gray-100`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <View style={tw`flex-row items-center`}>
            <TouchableOpacity
              style={tw`p-2 mr-2`}
              onPress={() => navigation.navigate("Workoutscreen")}
            >
              <SimpleLineIcons
                name="arrow-left-circle"
                size={28}
                color="black"
              />
            </TouchableOpacity>
            <Text style={tw`text-xl font-bold`}>Your AI Recommendations</Text>
          </View>
        </View>
        <View style={tw`border-b border-gray-300 mb-2`} />
      </View>

      {/* Generate Button */}
      <TouchableOpacity
        style={tw`flex-row items-center justify-center bg-purple-500 p-4 mx-4 rounded-3xl mb-4`}
        onPress={() => setAiModelOpen(true)}
      >
        <View style={tw`bg-purple-500 p-1 rounded-full mr-2`}>
          <Feather name="zap" size={16} color="white" />
        </View>
        <Text style={tw`text-white text-center font-regular text-lg`}>
          Generate AI Recommendation
        </Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal 
        visible={AiModalOpen} 
        transparent={false}
        animationType="slide"
        onRequestClose={() => setAiModelOpen(false)}
      >
        <SafeAreaView style={tw`flex-1 bg-white`}>
          <View style={tw`p-4`}>
            {/* Modal Header */}
            <TouchableOpacity 
              style={tw`self-end mb-4`}
              onPress={() => setAiModelOpen(false)}
            >
              <Text style={tw`text-red-500`}>Cancel</Text>
            </TouchableOpacity>
            
            <Text style={tw`text-lg font-bold mb-6`}>
              How would you like AI to assist with your workout data?
            </Text>

            {/* Select Component */}
            <View style={tw`mb-6`}>
              <TouchableOpacity
                style={tw`border border-gray-300 rounded-lg p-3`}
                onPress={() => setSelectOpen(!selectOpen)}
              >
                <View style={tw`flex-row justify-between items-center`}>
                  <Text style={tw`text-gray-700`}>
                    {selectedValue || "Select option"}
                  </Text>
                  <Feather 
                    name={selectOpen ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="gray" 
                  />
                </View>
              </TouchableOpacity>

              {selectOpen && (
                <View style={tw`mt-2 border border-gray-200 rounded-lg bg-white shadow-md`}>
                  {[
                    { label: "Workout Advice", value: "WORKOUT_ADVICE" },
                    { label: "Workout Optimization", value: "WORKOUT_OPTIMIZATION" },
                    { label: "Recovery Analysis", value: "RECOVERY_ANALYSIS" },
                    { label: "Performance Trends", value: "PERFORMANCE_TRENDS" },
                    { label: "Goal Alignment", value: "GOAL_ALIGNMENT" },
                    { label: "Muscle Balance", value: "MUSCLE_BALANCE" },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.value}
                      style={tw`p-3 border-b border-gray-100`}
                      onPress={() => {
                        setSelectedValue(item.value);
                        setSelectOpen(false);
                      }}
                    >
                      <Text>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Health Data Toggle */}
            <View style={tw`mb-8`}>
              <Text style={tw`text-base font-bold mb-4`}>
                Do you want to use synced health data?
              </Text>
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={tw`bg-purple-500 p-4 rounded-lg`}
              onPress={handlePressGenerate}
            >
              <Text style={tw`text-white text-center font-medium`}>
                Generate Recommendation
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}