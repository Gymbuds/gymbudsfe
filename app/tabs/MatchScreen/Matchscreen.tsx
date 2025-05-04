import React,{useState} from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity,Modal,TextInput,StyleSheet} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { FontAwesome5, AntDesign } from '@expo/vector-icons';
import tw from 'twrnc';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchFunctionWithAuth } from '@/api/auth';

import RangeSlider from "react-native-sticky-range-slider";
import Slider from '@react-native-community/slider';


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
const Thumb = (type: "high" | "low") => (
  <View
    style={[styles.thumb, { backgroundColor: type === "high" ? "lime" : "purple" }]}
  />
);
const MIN_WEIGHT = 50;
const MAX_WEIGHT= 500;
const Rail = () => <View style={styles.rail} />;
const RailSelected = () => <View style={styles.railSelected} />;
const THUMB_RADIUS = 10;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  slider: {
    marginVertical: 20,
  },
  valueText: {
    color: "black",
  },
  thumb: {
    width: THUMB_RADIUS * 2,
    height: THUMB_RADIUS * 2,
    borderRadius: THUMB_RADIUS,
    borderWidth: 3,
    borderColor: "black",
    backgroundColor: "red",
  },
  rail: {
    flex: 1,
    height: 3,
    borderRadius: 3,
    backgroundColor: "grey",
  },
  railSelected: {
    height: 3,
    backgroundColor: "red",
  },
});
type Props = NativeStackScreenProps<RootStackParamList, "MatchScreen">;
export default function MatchScreen({ navigation }: Props) {
  const [modalVisible,setModalVisible] = useState(false)
  const [gender,setGender] = useState("BOTH")
  const [startWeight,setStartWeight] = useState(MIN_WEIGHT)
  const [endWeight,setEndWeight] = useState(MAX_WEIGHT)
  const [distance,setDistance] = useState(10)
  const handleValueChange = (newLow: number, newHigh: number) => {
    setStartWeight(newLow)
    setEndWeight(newHigh)
  }
  const handleUpdate = async()=>{
    try {
      const matchPrefUpdate = {
        gender: gender,
        start_weight:startWeight,
        endWeight:endWeight,
        max_location_distance_miles:distance,
      }
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
            <View style={tw`bg-white p-6 rounded-lg w-80`}>
              <Text style={tw`text-lg font-bold mb-4`}>Match Preferences</Text>

              <View style={tw`gap-y-4`}>

                {/* Gender */}
                <View>
                  <Text style={tw`text-s text-gray-500 mb-1`}>Gender</Text>
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

                {/* Age
                <View>
                  <Text style={tw`text-s text-gray-500 mb-1`}>Age</Text>
                  <TextInput
                    style={tw`border p-2 rounded w-full`}
                    keyboardType="numeric"
                    placeholder="Enter your age"
                    placeholderTextColor="#B5B0B0"
                    value={userAge}
                    onChangeText={setUserAge}
                  />
                </View> */}

                {/* Weight */}
                <View>
                  <Text style={tw`text-s text-gray-500 mb-1`}>Weight (LBS)</Text>
                  <RangeSlider
                    style={styles.slider}
                    min={MIN_WEIGHT}
                    max={MAX_WEIGHT}
                    step={1}
                    // minRange={5}
                    low={startWeight}
                    high={endWeight}
                    onValueChanged={handleValueChange}
                    renderLowValue={(value) => <Text style={styles.valueText}>{value}</Text>}
                    renderHighValue={(value) => (
                      <Text style={styles.valueText}>{value === MAX_WEIGHT ? `+${value}` : value}</Text>
                    )}
                    renderThumb={Thumb}
                    renderRail={Rail}
                    renderRailSelected={RailSelected}/>
                </View>
                {/* Distance */}
                <View>
                  <Text style={tw`text-s text-gray-500 mb-1`}>Max Distance (Miles)</Text>
                  {/* <Slider
                    style={{width: 200, height: 40}}
                    minimumValue={0}
                    maximumValue={5000}
                    minimumTrackTintColor="#FFFFFF"
                    maximumTrackTintColor="#000000"
                  /> */}
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
            </View>
          </View>
        </Modal>
    </SafeAreaView>
  );
}
