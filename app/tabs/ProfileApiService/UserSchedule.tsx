import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchFunctionWithAuth } from '@/api/auth';
import { formatTime } from '@/app/utils/util';
import tw from 'twrnc';

// Define navigation types
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
};
interface TimeRange {
  id: number;
  user_id: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
}
type Props = NativeStackScreenProps<RootStackParamList, 'Schedule'>;

export default function ScheduleScreen({ navigation }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [startTimeAdd, setStartTimeAdd] = useState('');
  const [startOpen, setStartOpen] = useState(false);
  const [endTimeAdd, setEndTimeAdd] = useState('');
  const [endOpen, setEndOpen] = useState(false);
  const [items, setItems] = useState([
    { label: 'AM', value: 'AM' },
    { label: 'PM', value: 'PM' }
  ]);
  const [startTimePeriod, setStartTimePeriod] = useState('AM');
  const [startValue, setStartValue] = useState(null);
  const [endTimePeriod, setEndTimePeriod] = useState('AM');
  const [endValue, setEndValue] = useState(null);
  const [timeRanges, setTimeRanges] = useState<TimeRange[]>([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const postUserTimeRange = async () => {
    // console.log(startTimeAdd, startTimePeriod, endTimeAdd, endTimePeriod);
    // try {
    //   const data = await fetchFunctionWithAuth('avalrange', {
    //     method: 'GET',
    //   });
    //   setTimeRanges(data);
    // } catch (error) {
    //   console.error('Failed to fetch user time ranges', error);
    // }
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

  useEffect(() => {
    getUserTimeRanges();
  }, []);

  useEffect(() => {
    console.log(timeRanges);
  }, [timeRanges]);

  const handleAddTimeRange = ({ day, start, end }) => {
    console.log('hi')
    console.log(day,start,end)
    postUserTimeRange();
    // Add logic to handle adding time range
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
                {day === 'Sunday' || day === 'Saturday' ? day.substring(0, 2) : day.substring(0, 1)}
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
                <TouchableOpacity onPress={() => setTimeRanges(timeRanges.filter((r) => r.id !== range.id))}>
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

              <Text style={tw`text-xs text-gray-500 mb-2`}>Start Time</Text>
              <View style={tw`flex-row items-center mb-4`}>
                <TextInput
                  style={tw`border p-2 rounded flex-1 mr-2`}  // Added flex-1 and margin-right
                  placeholder="7:00"
                  value={startTimeAdd}
                  onChangeText={setStartTimeAdd}
                />
                <DropDownPicker
                  placeholder='AM/PM'
                  open={startOpen}
                  setOpen={handleStartOpen}
                  containerStyle={tw`h-10 flex-1`}
                  style={tw`border p-2 rounded bg-white text-black`}
                  items={items}
                  setItems={setItems}
                  value={startValue}
                  setValue={setStartValue}
                  onChangeValue={setStartTimePeriod}
                />
              </View>

              <Text style={tw`text-xs text-gray-500 mb-2`}>End Time</Text>
              <View style={tw`flex-row items-center mb-4`}>
                <TextInput
                  style={tw`border p-2 rounded flex-1 mr-2`}  // Added flex-1 and margin-right
                  placeholder="9:00"
                  value={endTimeAdd}
                  onChangeText={setEndTimeAdd}
                />
                {!startOpen && (<DropDownPicker
                  placeholder='AM/PM'
                  open={endOpen}
                  setOpen={handleEndOpen}
                  containerStyle={tw`h-15 flex-1`}
                  style={tw`border p-2 rounded bg-white text-black`}
                  items={items}
                  setItems={setItems}
                  value={endValue}
                  setValue={setEndValue}
                  onChangeValue={setEndTimePeriod}
                />)}
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