import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import tw from "twrnc";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import { fetchFunctionWithAuth } from "@/api/auth";
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
  const [posts, setPosts] = useState([]);
  const [userMap, setUserMap] = useState<{ [key: number]: any }>({});
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const fetchPosts = async () => {
    try {
      const data = await getCommunityPosts(communityId);
      const sorted = data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setPosts(sorted);

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

  useEffect(() => {
    fetchPosts();
  }, [communityId]);

  const handleImageSelect = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setPreviewUri(result.assets[0].uri); // local preview only
    }
  };

  const handlePost = async () => {
    setIsPosting(true);
    let imageUrl = "";

    if (previewUri) {
      try {
        const fileType = previewUri.split(".").pop()?.toLowerCase() || "jpeg";

        const presignedResponse = await fetchFunctionWithAuth(
          `community_posts/generate-upload-url/?file_extension=${fileType}`,
          { method: "GET" }
        );

        const blob = await (await fetch(previewUri)).blob();

        const uploadResponse = await fetch(presignedResponse.upload_url, {
          method: "PUT",
          headers: { "Content-Type": `image/${fileType}` },
          body: blob,
        });

        if (uploadResponse.ok) {
          console.log("Successfully uploaded image to S3");
        }

        imageUrl = presignedResponse.file_url;
      } catch (err) {
        console.error("Upload error:", err);
        return;
      } finally {
        setIsPosting(false);
      }
    }

    await createCommunityPost(communityId, title, content, imageUrl);
    setTitle("");
    setContent("");
    setPreviewUri(null);
    setModalVisible(false);
    fetchPosts();
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
          onRequestClose={() => {
            setModalVisible(false), setPreviewUri(null);
          }}
        >
          <View
            style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
          >
            <View style={tw`bg-white p-4 rounded-xl shadow-md w-11/12`}>
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <Text style={tw`text-base font-semibold`}>Create a Post</Text>
                <TouchableOpacity onPress={handleImageSelect}>
                  <Ionicons name="image-outline" size={24} color="#a855f7" />
                </TouchableOpacity>
              </View>

              {previewUri && (
                <View style={tw`mb-3 relative`}>
                  <Image
                    source={{ uri: previewUri }}
                    style={tw`w-full h-48 rounded-xl`}
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setPreviewUri(null);
                    }}
                    style={tw`absolute top-2 right-2 bg-black/60 p-1 rounded-full`}
                  >
                    <Ionicons name="close" size={16} color="white" />
                  </TouchableOpacity>
                </View>
              )}

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
                  onPress={() => {
                    setModalVisible(false),
                      setPreviewUri(null),
                      setTitle(""),
                      setContent("");
                  }}
                  style={tw`px-4 py-2 rounded-full mr-2`}
                >
                  <Text style={tw`text-purple-500`}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={isPosting}
                  onPress={handlePost}
                  style={tw`bg-purple-600 px-4 py-2 rounded-full flex-row items-center justify-center`}
                >
                  {isPosting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={tw`text-white font-semibold`}>Post</Text>
                  )}
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
                      {user?.name}
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
                  <View style={tw`flex-1 justify-center`}>
                    {post.image_url ? (
                      <Image
                        source={{ uri: post.image_url }}
                        style={tw`w-full h-48 rounded-xl mb-1`}
                        resizeMode="cover"
                      />
                    ) : null}

                    <Text style={tw`font-bold text-sm`} numberOfLines={1}>
                      {post.title}
                    </Text>
                    <Text style={tw`text-sm text-gray-700 mt-1`}>
                      {post.content}{" "}
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
