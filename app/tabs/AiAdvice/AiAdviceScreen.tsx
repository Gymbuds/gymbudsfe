import React, { useState ,useEffect} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Switch,
  ScrollView,
  Dimensions, 
  ActivityIndicator,
} from "react-native";
import {MaterialIcons} from "@expo/vector-icons";
import { SimpleLineIcons, Feather } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {createAIAdvice,fetchAIAdvices} from "./AiAdviceAPI"
import tw from "twrnc";
import RenderHTML from 'react-native-render-html';
import { marked } from 'marked';
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
  Workoutscreen: undefined;
  WorkoutLogPage: undefined;
  ExistingWorkoutLogPage: undefined;
  AiAdvice: undefined;
  AiAdviceView:{
    adviceId:number
  };
};
type AIAdviceType = "WORKOUT_ADVICE" |"WORKOUT_OPTIMIZATION"|"RECOVERY_ANALYSIS"|"PERFORMANCE_TRENDS"|"MUSCLE_BALANCE"|"GOAL_ALIGNMENT";

export type AIAdvice = {
  id:number;
  advice_type:AIAdviceType;
  ai_feedback:string;
  user_id: number;
  created_at: string;
}
type Props = NativeStackScreenProps<RootStackParamList, "AiAdvice">;

export default function AiAdviceScreen({navigation}: Props) {
  const [AiModalOpen, setAiModelOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [selectOpen, setSelectOpen] = useState(false);
  const [isLightSwitchOn,setIsLightSwitchOn] = useState(false);
  const [label,setLabel] = useState('');
  const [AIAdvices,setAIAdvices] = useState<AIAdvice[]>([]);
  const [isLoading,setIsLoading] = useState(false);
  const handlePressGenerate = async() => {
    console.log("Generating recommendation for:", selectedValue,isLightSwitchOn);
    try{
      setIsLoading(true)
      setAiModelOpen(false)
      await createAIAdvice(selectedValue,isLightSwitchOn)
    }
    catch(error){
      console.error("Error with request")
    }
    finally{
      setIsLoading(false)
    }
    await getAIADvices()
    
    
  };
  const toggleSwitch = () =>{
    setIsLightSwitchOn(!isLightSwitchOn)

  }
  const getAIADvices = async() =>{
    const res = await fetchAIAdvices()
    setAIAdvices(res)
  }
  const handleTapViewMore = async(id:number) =>{
    navigation.navigate("AiAdviceView",{
      adviceId:id,
    })
  }
  useEffect(()=>{
    getAIADvices()
  },[])
  

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
      <ScrollView>
          {isLoading&&(
            <ActivityIndicator size="small" color="#0000ff" ></ActivityIndicator>
          )}
          {/* Map through sorted workouts */}
          {AIAdvices.map((advice: AIAdvice, index) => (
              <View
                key={index}
                style={tw`bg-white p-5 ml-2 mr-2 mb-4 rounded-lg shadow-lg`}
              >
                <View style={tw`flex-row items-center justify-between mb-2`}>
                <Text style={tw`text-xl font-bold text-black-600`}>
                  {advice.advice_type
                    .toLowerCase()
                    .split("_")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                  </Text>
                  <TouchableOpacity
                    style={tw`absolute top-1 right-4 flex-row items-center`}
                    onPress={() => handleTapViewMore(advice.id)}
                  >
                  <Text style={tw`text-purple-600 font-semibold ml-1`}>
                      View More
                    </Text>
                    <MaterialIcons
                      name="chevron-right"
                      size={24}
                      color="purple"
                    />
                  </TouchableOpacity>
                  <View
                    style={tw`flex-row items-center px-3 py-1 rounded-lg `}
                  >
                    
                  </View>
                </View>

                <View style={tw`flex-row mb-2`}>
                  <View
                    style={tw`flex-row items-center bg-gray-300 p-3 rounded-3xl  mr-2`}
                  >
                    <RenderHTML 
                    contentWidth={Dimensions.get('window').width * 0.4}
                    source={{ html: marked(advice.ai_feedback.substring(0, 200)) as string }}
                    />
                    
    
                  </View>
                 

                  
                </View>
              </View>
          ))}
        </ScrollView>
      {/* Modal */}
      <Modal 
        visible={AiModalOpen} 
        transparent={true}
        onRequestClose={() => setAiModelOpen(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white p-6 rounded-lg w-80`}>

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
                    {label || "Select option"}
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
                      disabled={false}
                      style={tw`p-3 border-b border-gray-100`}
                      onPress={() => {
                        setSelectedValue(item.value);
                        setSelectOpen(false);
                        setLabel(item.label)
                      }}
                    >
                      <Text style={tw`` }>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Health Data Toggle */}
            <View style={tw`mb-8 flex flex-row justify-between items-center`}>
              <Text style={tw`text-base font-bold mb-4 w-50`}>
                Do you want to use synced health data?
              </Text>
              <Switch 
              onValueChange={toggleSwitch} 
              value ={isLightSwitchOn} 
              
              trackColor={{false: '#767577', true: '#ad46ff'}
              }>

              </Switch>
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
        </View>
      </Modal>
    </SafeAreaView>
  );
}