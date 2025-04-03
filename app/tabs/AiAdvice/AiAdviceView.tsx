import React,{useEffect,useState} from  "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
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
import { SimpleLineIcons, Feather } from "@expo/vector-icons";
import { CheckBox } from "react-native-elements";
import RenderHTML from 'react-native-render-html';
import { marked } from 'marked';
import tw from "twrnc";
import { AIAdvice } from "./AiAdviceScreen";
import { fetchAIadviceFromID } from "./AiAdviceAPI";
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
    AiAdviceView: {
        adviceId: number;
    };
  };

  type Props = NativeStackScreenProps<RootStackParamList, "AiAdviceView">;

export default function AiAdviceViewScreen({navigation,route}: Props){
  const [currentAIAdvice,setCurrentAIAdvice] = useState<AIAdvice>()
  useEffect(()=>{
    (async()=>{
      const res = await fetchAIadviceFromID(route.params.adviceId)
      setCurrentAIAdvice(res)
    
    })();
  },[])
  
  
  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      {currentAIAdvice && (
        <View style={tw`p-4 bg-gray-100`}>
          {/* Header */}
          <View style={tw`flex-row justify-between items-center mb-4`}>
            <View style={tw`flex-row items-center`}>
              <TouchableOpacity
                style={tw`p-2 mr-2`}
                onPress={() => navigation.navigate("AiAdvice")}
              >
                <SimpleLineIcons name="arrow-left-circle" size={28} color="black" />
              </TouchableOpacity>
              <Text style={tw`text-xl font-bold`}>
                {currentAIAdvice.advice_type
                  .toLowerCase()
                  .split("_")
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </Text>
            </View>
          </View>
          <View style={tw`border-b border-gray-300 mb-2`} />
          <Text style={tw`text-lg font-semibold text-gray-700 mb-2`}>AI Response Information</Text>
          {/* AI Response Information*/}
          <View style={tw`bg-white p-4 rounded-lg shadow mb-4`}>
           
            
  
            <Text style={tw`text-gray-600 mb-1`}>
              <Text style={tw`font-semibold`}>Date Created:</Text> {currentAIAdvice.created_at.split("T")[0]}
            </Text>
            
            <View style={tw`flex-row items-center mb-1`}>
              <Text style={tw`font-semibold text-gray-600 mr-2`}>Synced Health Data:</Text>
              <CheckBox
                checked={currentAIAdvice.contains_health_data}
                checkedColor="green"
                uncheckedColor="gray"
                disabled
                containerStyle={tw`p-0 m-0`}
              />
            </View>
  
            <Text style={tw`text-gray-600`}>
              <Text style={tw`font-semibold`}>Date Range for Workouts:</Text> {currentAIAdvice.workout_earliest_date.split("T")[0]} - {currentAIAdvice.workout_latest_date.split("T")[0]}
            </Text>
          </View>
  
          {/* AI Feedback */}
          <ScrollView style={tw`flex-1 bg-white p-4 rounded-lg shadow pb-140`} >
            <RenderHTML
              contentWidth={Dimensions.get("window").width * 0.9}
              source={{ html: marked(currentAIAdvice.ai_feedback) as string }}
            />
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  )
}