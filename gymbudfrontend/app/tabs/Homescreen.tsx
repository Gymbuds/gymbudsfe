import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

const Tab = createBottomTabNavigator();
const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={tw`flex-1 bg-white`}>
      <ScrollView style={tw`p-4`}>
        {/* Header */}
        <View style={tw`flex-row justify-between items-center`}>
          <Text style={tw`text-3xl font-bold text-purple-500`}>GymBuds</Text>
          <View style={tw`flex-row items-center`}>
            <Icon name="bell" size={20} color="gray" style={tw`mr-3`} />
            <View style={tw`bg-purple-300 w-8 h-8 rounded-full flex items-center justify-center`}>
              <Text style={tw`text-white font-bold`}>U</Text>
            </View>
          </View>
        </View>

        {/* Today's Progress */}
        <View style={tw`flex-row justify-between items-center mt-6`}>
          <Text style={tw`text-lg font-bold`}>Today's Progress</Text>
          <TouchableOpacity>
            <Text style={tw`text-purple-500 text-sm`}>View All &gt;</Text>
          </TouchableOpacity>
        </View>
        <View style={tw`flex-row justify-between mt-2`}>
          <View style={tw`w-24 h-20 bg-purple-100 rounded-lg flex items-center justify-center`}>
            <Icon name="check" size={18} color="purple" />
            <Text style={tw`text-sm font-bold text-purple-500`}>Workout</Text>
            <Text style={tw`text-xs text-gray-500`}>Completed</Text>
          </View>
          <View style={tw`w-24 h-20 bg-orange-100 rounded-lg flex items-center justify-center`}>
            <Icon name="fire" size={18} color="orange" />
            <Text style={tw`text-sm font-bold text-orange-500`}>Calories</Text>
            <Text style={tw`text-xs text-gray-500`}>1250</Text>
          </View>
          <View style={tw`w-24 h-20 bg-green-100 rounded-lg flex items-center justify-center`}>
            <Icon name="bolt" size={18} color="green" />
            <Text style={tw`text-sm font-bold text-green-500`}>Streak</Text>
            <Text style={tw`text-xs text-gray-500`}>8 days</Text>
          </View>
        </View>

        {/* Recent Workouts */}
        <View style={tw`flex-row justify-between items-center mt-6`}>
          <Text style={tw`text-lg font-bold`}>Recent Workouts</Text>
          <TouchableOpacity>
            <Text style={tw`text-purple-500 text-sm`}>View All &gt;</Text>
          </TouchableOpacity>
        </View>
        <View style={tw`bg-gray-100 p-4 rounded-lg mt-2`}>
          <Text style={tw`text-sm font-bold`}>Chest Day</Text>
          <View style={tw`flex-row items-center mt-1`}>
            <Icon name="calendar" size={12} color="gray" />
            <Text style={tw`text-xs text-gray-500 ml-1`}>Today, 8:30 AM</Text>
          </View>
          <View style={tw`flex-row justify-between items-center mt-2`}>
            <View style={tw`flex-row`}> 
              <TouchableOpacity style={tw`bg-gray-300 p-2 rounded-lg mr-2`}>
                <Text style={tw`text-xs`}>Voice</Text>
              </TouchableOpacity>
              <TouchableOpacity style={tw`bg-gray-300 p-2 rounded-lg`}>
                <Text style={tw`text-xs`}>Excited</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Text style={tw`text-purple-500 text-xs`}>Edit &gt;</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Nearby Communities */}
        <View style={tw`flex-row justify-between items-center mt-6`}>
          <Text style={tw`text-lg font-bold`}>Nearby Communities</Text>
          <TouchableOpacity>
            <Text style={tw`text-purple-500 text-sm`}>View Map &gt;</Text>
          </TouchableOpacity>
        </View>
        <View style={tw`bg-white rounded-lg shadow-lg mt-2`}>
          <Image source={{ uri: 'https://source.unsplash.com/featured/?gym' }} style={tw`h-40 w-full rounded-t-lg`} />
          <View style={tw`p-4`}>
            <Text style={tw`text-lg font-bold`}>Fitness Hub</Text>
            <View style={tw`flex-row items-center mt-1`}>
              <Icon name="map-marker" size={12} color="gray" />
              <Text style={tw`text-xs text-gray-500 ml-1`}>123 Main St, Los Angeles, CA</Text>
            </View>
            <View style={tw`flex-row items-center mt-2`}>
              <Icon name="star" size={14} color="gold" />
              <Text style={tw`text-xs ml-1`}>4.8 (124 reviews)</Text>
              <Text style={tw`text-xs text-gray-500 ml-auto`}>235 members</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// const HomeScreen = () => {
//   const navigation = useNavigation();

//   return (
//     <SafeAreaView style={tw`flex-1 bg-white`}>
//       <ScrollView style={tw`p-4`}>
//         {/* Header */}
//         <View style={tw`flex-row justify-between items-center`}>
//           <Text style={tw`text-3xl font-bold text-purple-500`}>GymBuds</Text>
//           <View style={tw`flex-row items-center`}>
//             <Icon name="bell" size={20} color="gray" style={tw`mr-3`} />
//             <View style={tw`bg-purple-300 w-8 h-8 rounded-full flex items-center justify-center`}>
//               <Text style={tw`text-white font-bold`}>U</Text>
//             </View>
//           </View>
//         </View>

//         {/* Today's Progress */}
//         <Text style={tw`text-lg font-bold mt-6`}>Today's Progress</Text>
//         <View style={tw`flex-row justify-between mt-2`}>
//           <View style={tw`w-24 h-20 bg-purple-100 rounded-lg flex items-center justify-center`}>
//             <Text style={tw`text-sm font-bold text-purple-500`}>Workout</Text>
//             <Text style={tw`text-xs text-gray-500`}>Completed</Text>
//           </View>
//           <View style={tw`w-24 h-20 bg-orange-100 rounded-lg flex items-center justify-center`}>
//             <Text style={tw`text-sm font-bold text-orange-500`}>Calories</Text>
//             <Text style={tw`text-xs text-gray-500`}>1250</Text>
//           </View>
//           <View style={tw`w-24 h-20 bg-green-100 rounded-lg flex items-center justify-center`}>
//             <Text style={tw`text-sm font-bold text-green-500`}>Streak</Text>
//             <Text style={tw`text-xs text-gray-500`}>8 days</Text>
//           </View>
//         </View>

//         {/* Recent Workouts */}
//         <Text style={tw`text-lg font-bold mt-6`}>Recent Workouts</Text>
//         <View style={tw`bg-gray-100 p-4 rounded-lg mt-2`}>
//           <Text style={tw`text-sm font-bold`}>Chest Day</Text>
//           <Text style={tw`text-xs text-gray-500`}>Today, 8:30 AM</Text>
//           <View style={tw`flex-row mt-2`}>
//             <TouchableOpacity style={tw`bg-gray-300 p-2 rounded-lg mr-2`}>
//               <Text style={tw`text-xs`}>Voice</Text>
//             </TouchableOpacity>
//             <TouchableOpacity style={tw`bg-gray-300 p-2 rounded-lg`}>
//               <Text style={tw`text-xs`}>Excited</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Nearby Communities */}
//         <Text style={tw`text-lg font-bold mt-6`}>Nearby Communities</Text>
//         <View style={tw`bg-white rounded-lg shadow-lg mt-2`}>
//           <Image source={{ uri: 'https://source.unsplash.com/featured/?gym' }} style={tw`h-40 w-full rounded-t-lg`} />
//           <View style={tw`p-4`}>
//             <Text style={tw`text-lg font-bold`}>Fitness Hub</Text>
//             <Text style={tw`text-xs text-gray-500`}>123 Main St, Los Angeles, CA</Text>
//             <View style={tw`flex-row items-center mt-2`}>
//               <Icon name="star" size={14} color="gold" />
//               <Text style={tw`text-xs ml-1`}>4.8 (124 reviews)</Text>
//               <Text style={tw`text-xs text-gray-500 ml-auto`}>235 members</Text>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// Tabs Navigation
export default function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ tabBarShowLabel: false, headerShown: false }}>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} /> }} 
      />
      <Tab.Screen 
        name="Workouts" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color }) => <Icon name="dumbbell" size={24} color={color} /> }} 
      />
      <Tab.Screen 
        name="Map" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color }) => <Icon name="map-marker" size={24} color={color} /> }} 
      />
      <Tab.Screen 
        name="Match" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color }) => <Icon name="users" size={24} color={color} /> }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color }) => <Icon name="user" size={24} color={color} /> }} 
      />
    </Tab.Navigator>
  );
}
