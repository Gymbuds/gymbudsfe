import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput,Alert, Touchable} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchFunctionWithAuth } from '@/api/auth';
import {ChevronLeft} from 'lucide-react-native';
import { formatTime, validateTime,convertTo24Hour,padTime} from '@/app/utils/util';
import tw from 'twrnc';

// Define navigation types
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
};
export interface TimeRange {
  id: number;
  user_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
}
type Props = NativeStackScreenProps<RootStackParamList, 'Schedule'>;

export default function ScheduleScreen({ navigation }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState('MONDAY');
  const [startTimeAdd, setStartTimeAdd] = useState('');
  const [startOpen, setStartOpen] = useState(false);
  const [endTimeAdd, setEndTimeAdd] = useState('');
  const [endOpen, setEndOpen] = useState(false);
  const [startTimePeriod, setStartTimePeriod] = useState('AM');
  const [startValue, setStartValue] = useState(null);
  const [endTimePeriod, setEndTimePeriod] = useState('AM');
  const [endValue, setEndValue] = useState(null);
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);

  const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const timePeriod = ['AM','PM']
  const postUserTimeRange = async (day:string,start_hour:number,start_minutes:number,end_hour:number,end_minutes:number) => {
    const start_time = padTime(start_hour, start_minutes);
    const end_time = padTime(end_hour, end_minutes);
    
    try {
      const data = await fetchFunctionWithAuth('avalrange/create', {
        method: 'POST',
        body: JSON.stringify({ day_of_week:day,start_time,end_time}),
      });
      setModalVisible(false)
      getUserTimeRanges()
    } catch (error) {
      console.error('Failed to create user time range', error);
    }
  };

  const getUserTimeRanges = async () => {
    try {
      const data = await fetchFunctionWithAuth('avalrange', {
        method: 'GET',
      });
      setTimeRanges(data);
    } catch (error) {
      console.error('Failed to fetch user time ranges', error);
    }
  };
  const deleteUserTimeRange = async (aval_range_id) => {
    try {
      const data = await fetchFunctionWithAuth('avalrange',{
        method: 'DELETE',
        body: JSON.stringify({id:aval_range_id})
      });
    } catch (error) {
      console.error('Failed to  delete time ranges', error);
    }
  };
  useEffect(() => {
    getUserTimeRanges();
  }, []);

  // useEffect(() => {
  //   console.log(timeRanges);
  // }, [timeRanges]);
  const wrongTimeAlert = () =>{
    Alert.alert('Invalid Time', 'Please choose a proper Time', [
      {
        text: 'Ok',
        onPress: () => console.log('Okay Pressed'),
        style: 'default',
      }
      
    ])
  }
  const handleDeleteTimeRange = async (range_id : number) =>{
    await deleteUserTimeRange(range_id);
    getUserTimeRanges(); 
  }
  const handleAddTimeRange = ({ day, start, end }) => {
    if (!(validateTime(start) && validateTime(end))) {
      return wrongTimeAlert();
    }
    let startTime = convertTo24Hour(start);
  let endTime = convertTo24Hour(end);

  if (
    (startTime.period === endTime.period && 
     (startTime.hour < endTime.hour || (startTime.hour === endTime.hour && startTime.minute < endTime.minute))) ||
    (startTime.period === "AM" && endTime.period === "PM") ||
    (startTime.period === "PM" && endTime.period === "AM")
  ) {
    return postUserTimeRange(day, startTime.hour, startTime.minute, endTime.hour, endTime.minute);
  }

  return wrongTimeAlert(); // if no conditon met show the error 
};

  const handleStartOpen = (open) => {
    if (open) {
      setEndOpen(false);
    }
    setStartOpen(open);
  };

  const handleEndOpen = (open) => {
    if (open) {
      setStartOpen(false);
    }
    setEndOpen(open);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <ScrollView style={tw`p-4`} >
        {/* Header Section */}
        <View style={tw`mb-3 flex-1`}>
        <TouchableOpacity style={tw`mb-3 flex-row items-center`} onPress={() => navigation.navigate("Profile")}>
        <ChevronLeft size={24} color="#1447e6" /> 
        <Text style={tw` text-lg text-blue-700`}>Profile</Text> 
        </TouchableOpacity>
        
        </View>
        <View style={tw`flex-row justify-between items-center mb-6`}>
          <Text style={tw`text-xl font-bold`}>Edit Schedule</Text>
        </View>

        {/* Days of the Week */}
        <View style={tw`flex-row justify-between mb-6`}>
          {daysOfWeek.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={tw`p-2 ${selectedDay === day ? 'bg-purple-500' : 'bg-gray-200'} rounded-full`}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={tw`text-sm ${selectedDay === day ? 'text-white' : 'text-gray-700'}`}>
                {day.substring(0, 1) + day.substring(1,3).toLowerCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected Day and Time Ranges */}
        <Text style={tw`text-lg font-bold mb-4`}>{selectedDay}</Text>
        {timeRanges
          .filter((range) => range.day_of_week === selectedDay)
          .map((range) => (
            <View key={range.id} style={tw`bg-white p-4 rounded-lg shadow mb-4`}>
              <View style={tw`flex-row justify-between items-center`}>
                <Text style={tw`text-sm text-gray-700`}>
                  {formatTime(range.start_time)} - {formatTime(range.end_time)}
                </Text>
                <TouchableOpacity onPress={() => handleDeleteTimeRange(range.id)}>
                  <Icon name="times" size={16} color="gray" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

        {/* Time Range Button */}
        <TouchableOpacity style={tw`bg-purple-500 p-4 rounded-lg items-center`} onPress={() => setModalVisible(true)}>
          <Text style={tw`text-white font-bold`}>Add Time Range</Text>
        </TouchableOpacity>

        {/* Time Range Modal */}
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
            <View style={tw`bg-white p-6 rounded-lg w-80`}>
              <Text style={tw`text-lg font-bold mb-4`}>Add Time Range</Text>

              <Text style={tw`text-s text-gray-500 mb-2`}>Start Time</Text>
            <View style={tw`flex-row items-center mb-4`}>
              <TextInput
                style={tw`border p-2 rounded flex-1 mr-2 text-base h-10`} 
                placeholder="7:00"
                placeholderTextColor="#B5B0B0"
                value={startTimeAdd}
                onChangeText={setStartTimeAdd}
              />
              {!startOpen && (
              <View style={tw`flex-row justify-center`}>
              {[
                { timeType: "AM", label: "AM" },
                { timeType: "PM", label: "PM" },
              ].map(({ timeType: timePeriod, label }) => (
                <TouchableOpacity
                  key={timePeriod}
                  onPress={() => setStartTimePeriod(timePeriod as "AM" | "PM")} 
                  style={tw`p-3 border rounded-lg mx-1 justify-center items-center ${
                    timePeriod === startTimePeriod
                      ? "bg-purple-300"
                      : "bg-gray-100 border-black-300"
                  }`}
                >
                  <Text style={tw`text-xs`}>{label}</Text>
                </TouchableOpacity>
              ))}
              </View>
            )}
            </View>

          <Text style={tw`text-s text-gray-500 mb-2`}>End Time</Text>
          <View style={tw`flex-row items-center mb-4`}>
            <TextInput
              style={tw`border p-2 rounded flex-1 mr-2 text-base h-10`} 
              placeholder="9:00"
              placeholderTextColor="#B5B0B0"
              value={endTimeAdd}
              onChangeText={setEndTimeAdd}
            />
            {!startOpen && (
              <View style={tw`flex-row justify-center`}>
              {[
                { timeType: "AM", label: "AM" },
                { timeType: "PM", label: "PM" },
              ].map(({ timeType: timePeriod, label }) => (
                <TouchableOpacity
                  key={timePeriod}
                  onPress={() => setEndTimePeriod(timePeriod as "AM" | "PM")} 
                  style={tw`p-3 border rounded-lg mx-1 justify-center items-center ${
                    timePeriod === endTimePeriod
                      ? "bg-purple-300"
                      : "bg-gray-100 border-black-300"
                  }`}
                >
                  <Text style={tw`text-xs`}>{label}</Text>
                </TouchableOpacity>
              ))}
              </View>
            )}
          </View>

          <View style={tw`flex-row justify-between`}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={tw`text-red-500`}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                {handleAddTimeRange({
                  day: selectedDay,
                  start: `${startTimeAdd} ${startTimePeriod}`,
                  end: `${endTimeAdd} ${endTimePeriod}`,
                })}
              }
            >
                  <Text style={tw`text-green-500 font-bold`}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}