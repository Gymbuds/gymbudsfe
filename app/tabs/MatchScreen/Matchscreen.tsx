import React,{useState,useEffect} from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity,Modal,TextInput,StyleSheet} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { FontAwesome5, AntDesign } from '@expo/vector-icons';
import tw from 'twrnc';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchFunctionWithAuth } from '@/api/auth';

import RangeSlider from "react-native-sticky-range-slider";
import {Slider} from '@miblanchard/react-native-slider';


type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
  MapScreen: undefined;
  Community: { placeId: string };
  FitnessBoard: undefined;
  MatchScreen: undefined;
};

const MIN_WEIGHT = 50;
const MAX_WEIGHT= 500;

interface MatchPreference {
  gender : string
  start_weight: number
  end_weight: number
  max_location_distance_miles: number
  start_age: number
  end_age: number

}
type Props = NativeStackScreenProps<RootStackParamList, "MatchScreen">;
export default function MatchScreen({ navigation }: Props) {
  const [modalVisible,setModalVisible] = useState(false)
  const [gender,setGender] = useState("BOTH")
  const [startWeight,setStartWeight] = useState(MIN_WEIGHT)
  const [endWeight,setEndWeight] = useState(MAX_WEIGHT)
  const [distance,setDistance] = useState(10)
  const [startAge,setStartAge] = useState(18)
  const [endAge,setEndAge] = useState(100)
  const [matchPreferences,setMatchPreferences] = useState<MatchPreference | null>(null);
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetchMatchPreference();
        console.log("Fetched Match Preferences:", res);
        setMatchPreferences(res);
      } catch (error) {
        console.error("Failed to fetch match preferences:", error);
      }
    }
  
    fetchData();
  }, []);
  useEffect(()=>{
    if(matchPreferences){
      setGender(matchPreferences.gender)
      setStartAge(matchPreferences.start_age)
      setEndAge(matchPreferences.end_age)
      setStartWeight(matchPreferences.start_weight)
      setEndWeight(matchPreferences.end_weight)
      setDistance(matchPreferences.max_location_distance_miles)
    }
  },[matchPreferences])
  const fetchMatchPreference = async() => {
    const res = await fetchFunctionWithAuth("match_pref",{method:"GET"})
    return await res
  }
  const handleValueChange = (newLow: number, newHigh: number) => {
    setStartWeight(newLow)
    setEndWeight(newHigh)
  }
  
  const handleAgeChange = (newLow: number, newHigh: number) => {
    setStartAge(newLow)
    setEndAge(newHigh)
  }
  const handleUpdate = async()=>{
    try {
      const matchPrefUpdate = {
        gender: gender,
        start_weight:startWeight,
        end_weight:endWeight,
        max_location_distance_miles:distance,
        start_age: startAge,
        end_age: endAge,
      }
      console.log(matchPrefUpdate)
      const res = fetchFunctionWithAuth("match_pref", { method: "PATCH" ,body: JSON.stringify(matchPrefUpdate),headers: {
        "Content-Type": "application/json",
      },})
      setModalVisible(false)
    } catch (error) {
      console.error('Error changing match pref:', error);
      throw error;
    }
    
  }
  const user = {
    name: 'Melissa',
    age: 28,
    profilePicture: '',
    tags: ['INTERMEDIATE', 'FEMALE', '120 lbs'],
    preferredGym: 'Fitness Hub, Downtown LA',
    schedule: [
      { day: 'Monday', times: ['6:00 PM - 8:00 PM'] },
      { day: 'Wednesday', times: ['6:00 PM - 8:00 PM'] },
      { day: 'Friday', times: ['6:00 PM - 8:00 PM'] },
    ],
    fitnessGoals: ['Weight Training', 'Calisthenics'],
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      {/* Header */}
      <View style={tw`flex-row justify-between items-center px-4 py-3`}>  
        <Text style={tw`text-2xl font-bold text-black`}>Find Gym Buddies</Text>
        <TouchableOpacity onPress={()=>setModalVisible(true)}>
            <AntDesign name="filter" size={20} color="purple" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={tw`p-4`}>
        {/* Card */}
        <View style={tw`bg-white rounded-2xl shadow p-6`}>          
          {/* Profile Picture */}
          <Image
            source={{ uri: user.profilePicture }}
            style={tw`w-32 h-32 rounded-full self-center`}
          />

          {/* Name & Age */}
          <Text style={tw`text-xl font-bold text-center mt-4`}>          
            {user.name}, {user.age}
          </Text>

          {/* Tags */}
          <View style={tw`flex-row justify-center mt-2`}>            
            {user.tags.map(tag => (
              <View
                key={tag}
                style={tw`bg-purple-100 px-4 py-2 rounded-full mr-2`}
              >
                <Text style={tw`text-purple-500 text-xs font-semibold`}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* Preferred Gym */}
          <View style={tw`flex-row items-center mt-6`}>
            <FontAwesome name="map-marker" size={16} color="purple" />
            <Text style={tw`ml-2 text-gray-700`}>{user.preferredGym}</Text>
          </View>

          {/* Schedule */}
          {user.schedule.map(({ day, times }) => (
            <View key={day} style={tw`mt-1`}>
              <Text style={tw`text-xs text-gray-500`}>{day}</Text>
              {times.map((t, i) => (
                <Text key={i} style={tw`ml-2 text-gray-700 text-xs`}>{t}</Text>
              ))}
            </View>
          ))}

          {/* Fitness Goals */}
          <View style={tw`flex-row items-center mt-3`}>            
            <FontAwesome5 name="dumbbell" size={16} color="purple" />
            <View style={tw`flex-row flex-wrap ml-2`}>
              {user.fitnessGoals.map(goal => (
                <View
                  key={goal}
                  style={tw`bg-gray-200 px-3 py-1 rounded-full mr-2`}
                >
                  <Text style={tw`text-xs`}>{goal}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={tw`flex-row justify-between mt-6`}>            
            <TouchableOpacity
              style={tw`flex-1 border border-purple-500 rounded-xl py-3 mr-2 items-center`}
            >
              <Text style={tw`text-purple-500 font-semibold`}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={tw`flex-1 bg-purple-500 rounded-xl py-3 ml-2 items-center`}
            >
              <Text style={tw`text-white font-semibold`}>Connect</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Match List Button */}
        <TouchableOpacity
          style={tw`bg-purple-500 rounded-full py-3 mt-6 mx-4 items-center`}
          onPress={() => navigation.navigate('MatchList')}
        >
          <Text style={tw`text-white font-semibold`}>Match List</Text>
        </TouchableOpacity>
      </ScrollView>
       {/* Edit Workout Preferences Modal */}
       
       <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View
            style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
          >
            <View style={tw`bg-white p-6 rounded-lg w-80 `}>
              <Text style={tw`text-lg font-bold mb-4 `}>Match Preferences</Text>

              {matchPreferences ? (
                <View style={tw`gap-y-4`}>
                  {/* Gender */}
                  <View >
                    <Text style={tw`text-s text-gray-500 mb-1 text-center mb-2`}>Gender</Text>
                    <View style={tw`flex-row justify-center mb-1`}>
                      {[
                        { selected_gender: "MALE", label: "MALE" },
                        { selected_gender: "FEMALE", label: "FEMALE" },
                        {selected_gender:"BOTH",label: "BOTH"},
                      ].map(({ selected_gender, label }) => (
                        <TouchableOpacity
                          key={selected_gender}
                          onPress={() => setGender(selected_gender)}
                          style={tw`p-1.5 border rounded-lg mx-1 justify-center items-center ${
                            selected_gender === gender
                              ? "bg-purple-300"
                              : "bg-gray-100 border-black-300"
                          }`}
                        >
                          <Text style={tw`text-xs`}>{label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Age */}
                  <View>
                  <Text style={tw`text-s text-gray-500 mb-1 text-center`}>Age </Text>
                  <Text style={tw`text-s text-gray-500 mb-1 text-center`}>{startAge} - {endAge}</Text>
                    <Slider
                      value={[startAge,endAge]}
                      animateTransitions
                      maximumTrackTintColor="#d3d3d3"
                      thumbStyle={tw`bg-purple-500`}
                      onValueChange={value=>handleAgeChange(value[0],value[1])}
                      maximumValue={100}
                      minimumTrackTintColor="#9669B0"
                      minimumValue={18}
                      step={2}
                      thumbTintColor="##9669B0"
                  />
                  </View>

                  {/* Weight */}
                  <View>
                    <Text style={tw`text-s text-gray-500 mb-1 text-center`}>Weight (LBS)</Text>
                    <Text style={tw`text-s text-gray-500 mb-1 text-center`}>{startWeight} -  {endWeight}</Text>
                    <Slider
                      value={[startWeight,endWeight]}
                      animateTransitions
                      maximumTrackTintColor="#d3d3d3"
                      thumbStyle={tw`bg-purple-500`}
                      onValueChange={value=>handleValueChange(value[0],value[1])}
                      maximumValue={500}
                      minimumTrackTintColor="#9669B0"
                      minimumValue={50}
                      step={2}
                      thumbTintColor="##9669B0"
                  />
                  </View>
                  {/* Distance */}
                  <View>
                    <Text style={tw`text-s text-gray-500 mb-1 text-center`}>Max Distance (Miles)</Text>
                    <Text style={tw`text-s text-gray-500 mb-5 text-center`}>{distance} miles</Text>
                    <View style={tw`flex-1 ml-2.5 mr-2.5 items-stretch justify-center`}>

                        <Slider
                          value={distance}
                          minimumValue={5}
                          maximumValue={1000}
                          step={10}
                          minimumTrackTintColor="#9669B0"
                          thumbStyle= {tw`bg-purple-500`}
                          onValueChange={value => setDistance(value[0])}
                      />

                    </View>

                  </View>
                  {/* Action Buttons */}
                  <View style={tw`flex-row justify-between`}>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Text style={tw`text-red-500`}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        handleUpdate();
                      }}
                    >
                      <Text style={tw`text-green-500 font-bold`}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
               ) : ( 
                 <View style={tw`items-center`}>
                  <Text style={tw`mb-4 text-gray-600`}>Loading Preferences...</Text>
                  <AntDesign name="loading1" size={24} color="purple" />
                </View>
              )} 
            </View>
          </View>
        </Modal>
    </SafeAreaView>
  );
}
