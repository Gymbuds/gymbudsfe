import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import tw from "twrnc";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
const posts = [
  {
    id: 1,
    name: "George",
    time: "14 hours ago",
    title: "Great New Gym Equipment!",
    message:
      "I love the new hack squat machine that was added a few days ago! It’s been a few months since I’ve felt...",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    id: 2,
    name: "David",
    time: "1 day ago",
    title: "Looking For a Partner at the Gym",
    message:
      "I’ve been thinking of lifting heavier weights for less reps recently so I'd appreciate it if someone...",
    avatar: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    id: 3,
    name: "Lia",
    time: "1 day ago",
    title: "Locker Room Needs Cleaning",
    message:
      "Lately it looks like the ladies’ locker room has gotten dirtier in some parts, can the gym please take...",
    avatar: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    id: 4,
    name: "Candice",
    time: "2 days ago",
    title: "Yoga Section Needs More Free Weights",
    message:
      "The yoga section definitely needs a few more small free weights because there is only a handful available...",
    avatar: "https://randomuser.me/api/portraits/women/4.jpg",
  },
];

type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
  Community: undefined;
  FitnessBoard: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "FitnessBoard">;
export default function FitnessPostBoard({ navigation }: Props) {
  return (
    <View style={tw`flex-1 bg-white px-4 pt-12`}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between mb-4`}>
        <TouchableOpacity onPress={() => navigation.navigate("Community")}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={tw`text-lg font-bold`}>Fitness Hub Post Board</Text>
        <TouchableOpacity>
          <Feather name="filter" size={22} color="black" />
        </TouchableOpacity>
      </View>

      {/* Create Post */}
      <View style={tw`bg-white p-4 rounded-xl shadow-md mb-6`}>
        <Text style={tw`text-base font-semibold mb-2`}>Create a Post</Text>
        <TextInput
          placeholder="Type the subject of this post here"
          style={tw`border border-gray-300 rounded-full px-4 py-2 mb-3 text-sm`}
        />
        <TextInput
          placeholder="Type the message of this post here"
          multiline
          style={tw`border border-gray-300 rounded-xl px-4 py-2 h-20 text-sm`}
        />
        <View style={tw`flex-row justify-end mt-3`}>
          <TouchableOpacity style={tw`px-4 py-2 rounded-full mr-2`}>
            <Text style={tw`text-purple-600`}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={tw`bg-purple-600 px-4 py-2 rounded-full`}>
            <Text style={tw`text-white font-semibold`}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Posts List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {posts.map((post) => (
          <View
            key={post.id}
            style={tw`bg-white p-4 rounded-xl shadow-sm mb-4 flex-row`}
          >
            <Image
              source={{ uri: post.avatar }}
              style={tw`w-10 h-10 rounded-full mr-3`}
            />
            <View style={tw`flex-1`}>
              <Text style={tw`font-bold`}>{post.name}</Text>
              <Text style={tw`font-semibold text-sm mt-1`}>{post.title}</Text>
              <Text style={tw`text-sm text-gray-700 mt-1`}>
                {post.message}{" "}
                <Text style={tw`text-purple-600 font-medium`}>View More</Text>
              </Text>
              <Text style={tw`text-xs text-gray-400 mt-1`}>{post.time}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
