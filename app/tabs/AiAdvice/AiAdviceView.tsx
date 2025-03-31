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
      console.log("hi")
      const res = await fetchAIadviceFromID(route.params.adviceId)
      setCurrentAIAdvice(res)
    
    })();
  },[])
  useEffect(()=>{
    console.log(currentAIAdvice)
  },[currentAIAdvice])
  
  return(
        <SafeAreaView style={tw`flex-1 bg-gray-100`}>
          {currentAIAdvice && (
            <View style={tw`p-4 bg-gray-100`}>
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <View style={tw`flex-row items-center`}>
                  <TouchableOpacity
                  style={tw`p-2 mr-2`}
                  onPress={() => navigation.navigate("AiAdvice")}
                  >
                    <SimpleLineIcons
                      name="arrow-left-circle"
                      size={28}
                      color="black"
                    />
                  </TouchableOpacity>
                  <Text style={tw`text-xl font-bold`}>{currentAIAdvice.advice_type
                    .toLowerCase()
                    .split("_")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                  </Text>
                </View>
              </View>
              <View style={tw`border-b border-gray-300 mb-2`} />
            </View>
          )

          }
        </SafeAreaView>
    )
}