import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { FontAwesome5, AntDesign } from '@expo/vector-icons';
import tw from 'twrnc';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

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

type Props = NativeStackScreenProps<RootStackParamList, "MatchScreen">;
export default function MatchScreen({ navigation }: Props) {
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
        <TouchableOpacity>
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
    </SafeAreaView>
  );
}
