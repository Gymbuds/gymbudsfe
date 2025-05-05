import React,{useState, useEffect} from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity,Modal,TextInput,StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { FontAwesome5, AntDesign } from '@expo/vector-icons';
import tw from 'twrnc';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchFunctionWithAuth } from '@/api/auth';
import { formatTime } from '@/app/utils/util';

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

interface Candidate {
    id: number
    candidate_user_id: number
    score: number
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  }
  
  interface UserInfo {
    id: number
    name: string
    age: number
    profile_picture: string
    skill_level: string
    gender: string
    weight: number
  }

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
  const [candidates, setCandidates] = useState<Candidate[] | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInfo, setUserInfo]       = useState<UserInfo | null>(null)
  const [loading, setLoading]         = useState(true)
  const [userRanges, setUserRanges]   = useState<{ day_of_week: string; start_time: string; end_time: string }[]>([])
  const [userPref, setUserPref]       = useState<{ name: string; address: string } | null>(null)
  const [userGoals, setUserGoals]     = useState<string[]>([])
  const [showSchedule, setShowSchedule] = useState(false);

  const renderSchedule = () => {
    const daysOfWeek = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
    return daysOfWeek.map(day => {
      const ranges = userRanges.filter(r => r.day_of_week === day);
      return (
        <View key={day} style={tw`mt-1`}>          
          <Text style={tw`text-xs text-gray-500`}>{day.charAt(0) + day.slice(1).toLowerCase()}</Text>
          {ranges.length > 0 ? (
            ranges.map((r, idx) => (
              <Text key={idx} style={tw`ml-2 text-gray-700 text-xs`}>
                {formatTime(r.start_time)} – {formatTime(r.end_time)}
              </Text>
            ))
          ) : (
            <Text style={tw`ml-2 text-red-300 text-xs`}>Not Available</Text>
          )}
        </View>
      );
    });
  };

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
      loadCandidates();
    } catch (error) {
      console.error('Error changing match pref:', error);
      throw error;
    }
  }

  const loadCandidates = async () => {
    setLoading(true);
    try {
      await fetchFunctionWithAuth('match/find-match', { method: 'POST' });
      const allCands: Candidate[] = await fetchFunctionWithAuth('match_cands', { method: 'GET' });
      const pendingCands = allCands.filter(c => c.status === 'PENDING');
      pendingCands.sort((a, b) => b.score - a.score);
      setCandidates(pendingCands);
    } catch (e) {
      Alert.alert('Error', 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    loadCandidates()
  }, []);

  useEffect(() => {
    if (!candidates || candidates.length === 0) return
    const cand = candidates[currentIndex]
    if (!cand) return

    setLoading(true)
    Promise.all([
        fetchFunctionWithAuth(`match/user-info/${cand.candidate_user_id}`, { method: 'GET' }),
        fetchFunctionWithAuth(`match/user-range-info/${cand.candidate_user_id}`, { method: 'GET' }),
        fetchFunctionWithAuth(`match/prefer/${cand.candidate_user_id}`,     { method: 'GET' }),
        fetchFunctionWithAuth(`match/user-goal-info/${cand.candidate_user_id}`, { method: 'GET' }),
    ])
        .then(([info, ranges, pref, goals]) => {
        setUserInfo(info)
        setUserRanges(ranges)
        setUserPref(pref)
        setUserGoals(goals.map((g: any) => g.goal))
        })
        .catch(() => Alert.alert('Error','Failed to load match details'))
        .finally(() => setLoading(false))
  }, [candidates, currentIndex])

  const handleSkip = async () => {
    if (!candidates) return;
    const cand = candidates[currentIndex];
    try {
        await fetchFunctionWithAuth('match_cands/status', {
        method: 'PUT',
        body: JSON.stringify({ match_candidate_id: cand.id, status: 'REJECTED' }),
        headers: { 'Content-Type': 'application/json' },
        });
        setCandidates(prev => prev?.filter(c => c.id !== cand.id) || []);
        setCurrentIndex(0);
    } catch {
        Alert.alert('Error','Could not skip. Try again');
    }
    };

  const handleConnect = async () => {
    if (!candidates) return
    const cand = candidates[currentIndex]
    try {
      await fetchFunctionWithAuth('match_cands/status', {
        method: 'PUT',
        body: JSON.stringify({ match_candidate_id: cand.id, status: 'ACCEPTED' }),
        headers: { 'Content-Type':'application/json' }
        });
        setCandidates(prev => prev?.filter(c => c.id !== cand.id) || []);
        setCurrentIndex(0);
    } catch {
      Alert.alert('Error','Could not connect. Try again')
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="purple" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      {/* Header */}
      <View style={tw`flex-row justify-between items-center px-4 py-3`}>  
        <Text style={tw`text-2xl font-bold text-black`}>Find Gym Buddies</Text>
        <TouchableOpacity onPress={()=>setModalVisible(true)}>
            <AntDesign name="filter" size={20} color="purple" />
        </TouchableOpacity>
      </View>

      {/* Match List Button */}
      <TouchableOpacity
        style={tw`bg-purple-500 rounded-full py-3 mt-2 mb-2 mx-4 items-center`}
        onPress={() => navigation.navigate('MatchList')}
      >
        <Text style={tw`text-white font-semibold`}>Match List</Text>
      </TouchableOpacity>
        
      {(!candidates || candidates.length === 0) ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text>No matches found yet.</Text>
        </View>
      ) : (
      <ScrollView contentContainerStyle={tw`p-4`}>
        <View style={tw`bg-white rounded-2xl shadow p-6`}>
            {/* Action Buttons */}
          <View style={tw`flex-row justify-between`}>            
            <TouchableOpacity
              onPress={handleSkip}
              style={tw`flex-1 border border-purple-500 rounded-xl py-3 mr-2 items-center`}
            >
              <Text style={tw`text-purple-500 font-semibold`}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConnect}
              style={tw`flex-1 bg-purple-500 rounded-xl py-3 ml-2 items-center`}
            >
              <Text style={tw`text-white font-semibold`}>Connect</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Picture */}
          <View style={tw`w-30 h-30 bg-purple-200 rounded-full self-center items-center justify-center relative mt-6`}>
          {userInfo?.profile_picture ? (
              <Image
                source={{ uri: userInfo.profile_picture }}
                style={tw`w-full h-full rounded-full`}
              />
            ) : (
              <Text style={[tw`text-7xl font-bold text-purple-600`, { lineHeight: 0 }]}>U</Text>
            )}
          </View>

          {/* Name & Age */}
          <Text style={tw`text-xl font-bold text-center mt-4`}>
            {userInfo?.name}, {userInfo?.age}
          </Text>

          {/* Tags */}
          <View style={tw`flex-row justify-center mt-2`}>
            {[userInfo?.skill_level, userInfo?.gender, `${userInfo?.weight} lbs`].map(t => (
              <View key={t} style={tw`bg-purple-100 px-4 py-2 rounded-full mr-2`}>
                <Text style={tw`text-purple-500 text-xs font-semibold`}>{t}</Text>
              </View>
            ))}
          </View>

          {/* Preferred Gym */}
          <View style={tw`flex-row items-center mt-6`}>
            <FontAwesome name="map-marker" size={16} color="purple" />
            <Text style={tw`ml-2 text-gray-700`}>
              {userPref?.name ?? 'N/A'}
            </Text>
          </View>

          {/* Toggle schedule */}
          <TouchableOpacity onPress={() => setShowSchedule(prev => !prev)} style={tw`mt-4`}>  
            <Text style={tw`text-purple-500 font-semibold mt--2`}>{showSchedule ? 'Hide Workout Schedule' : 'Show Workout Schedule'}</Text>
          </TouchableOpacity>

          {/* Schedule */}
          {showSchedule && renderSchedule()}

          {/* Fitness Goals */}
          <View style={tw`flex-row items-center mt-3`}>
            <FontAwesome5 name="dumbbell" size={16} color="purple" />
            <View style={tw`flex-row flex-wrap ml-2`}>
              {userGoals.map(goal => (
                <View
                  key={goal}
                  style={tw`bg-gray-100 px-3 py-1 rounded-full mr-2 mb-1`}
                >
                  <Text style={tw`text-xs`}>
                    {goal
                      .toLowerCase()
                      .split('_')
                      .map(w => w[0].toUpperCase() + w.slice(1))
                      .join(' ')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      )}
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
