import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import tw from "twrnc";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  createCommunityPost,
  getCommunityPosts,
  getUserInfoById,
} from "@/api/post";
import { format, parseISO, isToday, isYesterday } from "date-fns";

type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
  MapScreen: undefined;
  Community: { placeId: string };
  FitnessBoard: { communityId: number; name: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "FitnessBoard">;
export default function FitnessPostBoard({ navigation, route }: Props) {
  const { communityId, name } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [posts, setPosts] = useState([]);
  const [userMap, setUserMap] = useState<{ [key: number]: any }>({});

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getCommunityPosts(communityId);
        setPosts(data);

        // Fetch user info
        const userIds = [...new Set(data.map((p) => p.user_id))];
        const map: { [key: number]: any } = {};

        await Promise.all(
          userIds.map(async (id) => {
            const user = await getUserInfoById(id);
            map[id] = user;
          })
        );

        setUserMap(map);
      } catch (err) {
        console.log("Error", "Failed to load posts or users.");
      }
    };

    fetchPosts();
  }, [communityId]);

  const handlePost = async () => {
    await createCommunityPost(communityId, title, content, image);
    setModalVisible(false);
    setTitle("");
    setContent("");
    setImage("");
    const updatePosts = await getCommunityPosts(communityId);
    setPosts(updatePosts);
  };

  const formatDate = (isoDate: string) => {
    const date = parseISO(isoDate);

    if (isToday(date)) {
      return `Today, ${format(date, "h:mm a")}`;
    } else if (isYesterday(date)) {
      return `Yesterday, ${format(date, "h:mm a")}`;
    } else {
      return format(date, "MMMM do, h:mm a");
    }
  };

  return (
    <View style={tw`flex-1 bg-gray-100 px-4 pt-12`}>
      <ScrollView style={tw`p-4`}>
        {/* Header */}
        <View
          style={tw`flex-row justify-between items-center border-b border-gray-300 pb-2 mb-4`}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={tw`flex-1 text-xl font-bold ml-6`}>
            {name} Post Board
          </Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <View style={tw`bg-purple-500 rounded-full p-1`}>
              <AntDesign name="plus" size={24} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Create Post */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View
            style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
          >
            <View style={tw`bg-white p-4 rounded-xl shadow-md w-11/12`}>
              <Text style={tw`text-base font-semibold mb-2`}>
                Create a Post
              </Text>

              <TextInput
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                style={tw`border border-gray-300 rounded-full px-4 py-2 mb-3 text-sm`}
              />

              <TextInput
                placeholder="Message"
                multiline
                value={content}
                onChangeText={setContent}
                style={tw`border border-gray-300 rounded-xl px-4 py-2 h-20 text-sm`}
              />

              <View style={tw`flex-row justify-end mt-3`}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={tw`px-4 py-2 rounded-full mr-2`}
                >
                  <Text style={tw`text-purple-500`}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handlePost}
                  style={tw`bg-purple-500 px-4 py-2 rounded-full`}
                >
                  <Text style={tw`text-white font-semibold`}>Post</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Posts List */}
        {posts.length === 0 ? (
          <View style={tw`items-center mt-10`}>
            <Text style={tw`text-gray-500 text-base font-medium italic`}>
              No posts yet, be the first to create one!
            </Text>
          </View>
        ) : (
          <ScrollView>
            {posts.map((post) => {
              const user = userMap[post.user_id];
              return (
                <View
                  key={post.id}
                  style={tw`bg-white p-4 rounded-xl shadow-sm mb-4 flex-row`}
                >
                  {/* Left column: name, avatar, timestamp */}
                  <View style={tw`justify-center items-center mr-3 w-16`}>
                    <Text style={tw`font-bold mb-1`} numberOfLines={1}>
                      {user?.name ?? "Unknown"}
                    </Text>
                    {user?.profile_picture ? (
                      <Image
                        source={{ uri: user.profile_picture }}
                        style={tw`w-10 h-10 rounded-full`}
                      />
                    ) : (
                      <View
                        style={tw`w-10 h-10 bg-purple-300 rounded-full flex items-center justify-center`}
                      >
                        <Text style={tw`text-white`}>U</Text>
                      </View>
                    )}
                    <Text style={tw`text-xs text-gray-400 mt-1`}>
                      {formatDate(post.created_at)}
                    </Text>
                  </View>

                  {/* Right column: content */}
                  <View style={tw`flex-1 justify-center item-center`}>
                    {post.image_url ? (
                      <Image
                        source={{ uri: post.image_url }}
                        style={tw`w-full h-48 rounded-xl mt-3`}
                        resizeMode="cover"
                      />
                    ) : null}

                    <Text style={tw`font-bold text-sm`} numberOfLines={1}>{post.title}</Text>
                    <Text style={tw`text-sm text-gray-700 mt-1`}>
                      {post.content}{" "}
                      <Text style={tw`text-purple-600 font-medium`}>
                        View More
                      </Text>
                    </Text>

                    <View style={tw`flex-row items-center mt-2`}>
                      <View style={tw`flex-row items-center mr-4`}>
                        <Icon name="heart-o" size={16} color="gray" />
                        <Text style={tw`text-sm text-gray-600 ml-1`}>
                          {post.like_count} likes
                        </Text>
                      </View>
                      <View style={tw`flex-row items-center`}>
                        <Icon name="comment-o" size={16} color="gray" />
                        <Text style={tw`text-sm text-gray-600 ml-1`}>
                          {post.comments?.length} comments
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </ScrollView>
    </View>
  );
}
