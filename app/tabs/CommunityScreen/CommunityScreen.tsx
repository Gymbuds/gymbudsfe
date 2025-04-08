import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
    Feather,
    FontAwesome,
    FontAwesome5,
    Ionicons,
    Octicons,
  } from "@expo/vector-icons";
import React from "react";
import tw from "twrnc";

type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
  Community: undefined;
  FitnessBoard: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Profile">;

export default function CommunityScreen({ navigation }: Props) {
  return (
    <ScrollView style={tw`bg-white`}>
      {/* Header Image */}
      {/* <Image
        source={{ uri: 'https://images.app.goo.gl/hZLkn6ovpxecvcFF9' }} // Replace with actual image
        style={tw`w-full h-52`}
      /> */}
      <View
        style={tw`w-full h-60 bg-purple-100 justify-center items-center flex-row px-4`}
      >
        {/* Left Arrow */}
        <TouchableOpacity style={tw`absolute left-4`}>
          <Text style={tw`text-2xl text-purple-600`}>{"<"}</Text>
        </TouchableOpacity>

        {/* Center Text */}
        <Text style={tw`text-2xl font-bold text-purple-600 text-center`}>
          Welcome to Fitness Hub
        </Text>

        {/* Right Arrow */}
        <TouchableOpacity style={tw`absolute right-4`}>
          <Text style={tw`text-2xl text-purple-600`}>{">"}</Text>
        </TouchableOpacity>
      </View>

      {/* Gym Info */}
      <View style={tw`p-4 bg-white mx-3 mt-[-50] rounded-xl shadow`}>
        <Text style={tw`text-xl font-bold`}>Fitness Hub</Text>
        <Text style={tw`text-gray-600 mt-1`}>
          <FontAwesome5 name="map-marker-alt" size={20} color="purple" />
          123 Main St, Los Angeles, CA 90012
        </Text>
        <View style={tw`flex-row items-center mt-6`}>
          <Text style={tw`text-yellow-500 font-semibold`}>⭐ 4.8</Text>
          <Text style={tw`text-gray-500 ml-1`}>(124 reviews)</Text>
          <Text style={tw`text-gray-500 ml-20`}>
            <Octicons name="people" size={24} color="purple" /> 235 members
          </Text>
        </View>
        <View style={tw`flex-row mt-4`}>
          <TouchableOpacity
            style={tw`flex-1 border border-purple-400 rounded-2xl py-2 mr-2 items-center`}
            onPress={() => navigation.navigate("MapScreen")}
          >
            <Text style={tw`text-purple-500 font-semibold`}>
              <FontAwesome name="map-marker" size={20} color="purple" />{" "}
              Directions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={tw`flex-1 bg-purple-500 rounded-2xl py-2 items-center`}
          >
            <Text style={tw`text-white font-semibold`}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* About */}
      <View style={tw`bg-white mx-3 mt-4 p-4 rounded-xl shadow`}>
        <Text style={tw`text-lg font-bold mb-2`}>About</Text>
        <Text style={tw`text-gray-600`}>
          A modern fitness center with state-of-the-art equipment and a
          supportive community of fitness enthusiasts. Our gym offers a wide
          range of classes and personal training options.
        </Text>
      </View>

      {/* Hours */}
      <View style={tw`bg-white mx-3 mt-4 p-4 rounded-xl shadow`}>
        <Text style={tw`text-lg font-bold mb-2`}>
          <Ionicons name="time-outline" size={24} color="purple" /> Hours
        </Text>
        <Text style={tw`text mb-2`}>Monday - Friday: 5:00 AM - 11:00 PM</Text>
        <Text style={tw`text mb-2`}>Saturday - Sunday: 7:00 AM - 9:00 PM</Text>
      </View>

      {/* Amenities */}
      <View style={tw`bg-white mx-3 mt-4 p-4 rounded-xl shadow`}>
        <Text style={tw`text-lg font-bold mb-3`}>Amenities</Text>
        <View style={tw`flex-row flex-wrap`}>
          {[
            "Free Weights",
            "Cardio Equipment",
            "Group Classes",
            "Personal Training",
            "Locker Rooms",
            "Sauna",
          ].map((item) => (
            <Text
              key={item}
              style={tw`bg-gray-100 px-3 py-1 rounded-full text-gray-700 text-sm mr-2 mb-2`}
            >
              {item}
            </Text>
          ))}
        </View>
      </View>

      {/* Upcoming Events */}
      <View style={tw`bg-white mx-2 mt-5 p-4 rounded-xl shadow`}>
        <View style={tw`flex-row justify-between items-center  mt-1  p-1`}>
          <Text style={tw`text-lg font-semibold mb-3`}>
            <Feather name="calendar" size={24} color="purple" /> Upcoming Events
          </Text>
          <TouchableOpacity>
            <Text style={tw`text-purple-500 text-sm`}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={tw`border border-gray-300 rounded-2xl p-2 mx-3`}>
          <Text style={tw`text-base font-semibold`}>HIIT Bootcamp</Text>
          <Text style={tw`text-gray-600`}>Tomorrow, 6:30 PM • 12 going</Text>
        </View>
        <View style={tw`border border-gray-300 rounded-2xl mt-5 p-2 mx-3`}>
          <Text style={tw`text-base font-semibold`}>Yoga for Strength</Text>
          <Text style={tw`text-gray-600`}>
            Sat, March 8, 10:00 AM • 8 going
          </Text>
        </View>
      </View>

      <View style={tw`bg-white mx-2 mt-5 p-4 rounded-xl shadow`}>
        <View style={tw`flex-row justify-between items-center  mt-1  p-1`}>
          <Text style={tw`text-lg font-semibold mb-2`}>
            <Feather name="message-square" size={24} color="purple" /> Community
            Post Board
          </Text>
          <TouchableOpacity>
            <Text style={tw`text-purple-500 text-sm`}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Bordered Text Box */}
        <View style={tw`border border-gray-300 rounded-2xl p-2 mx-3`}>
          <Text style={tw`text-gray-600`}>
            1 new post from George • 13 unread
          </Text>
        </View>
      </View>

      {/* Active Members */}
      {/* <View style={tw`bg-white mx-3 mt-4 mb-6 p-1 rounded-xl shadow`}> */}
      <View style={tw`bg-white mx-2 mt-5 p-4 rounded-xl shadow`}>
        <View style={tw`flex-row justify-between items-center  mt-1  p-1`}>
          <Text style={tw`text-lg font-semibold mb-3`}>
            <Octicons name="people" size={24} color="purple" /> Active Members
          </Text>
          <TouchableOpacity>
            <Text style={tw`text-purple-500 text-sm`}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={tw`flex-row flex-wrap`}>
          {[
            "David",
            "Tom",
            "Henry",
            "Lia",
            "Kelly",
            "Candice",
            "George",
            "Jessie",
          ].map((name, index) => (
            <View key={index} style={tw`items-center mr-4 mb-4`}>
              <Image
                source={{
                  uri: `https://randomuser.me/api/portraits/thumb/men/${
                    index + 1
                  }.jpg`,
                }}
                style={tw`w-12 h-12 rounded-full`}
              />
              <Text style={tw`text-xs mt-1`}>{name}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
