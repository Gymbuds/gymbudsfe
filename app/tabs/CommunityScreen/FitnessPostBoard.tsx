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
  Alert,
} from "react-native";
import { Ionicons, AntDesign } from "@expo/vector-icons";
import tw from "twrnc";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import Icon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import { fetchFunctionWithAuth } from "@/api/auth";
import {
  createCommunityPost,
  updateCommunityPost,
  deleteCommunityPost,
  getCommunityPosts,
  getUserInfoById,
  likePost,
  unlikePost,
  createComment,
  editComment,
  deleteComment,
} from "@/api/post";
import { fetchUserProfile } from "../ProfileApiService/ProfileApiService";
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

type Member = {
  id: number;
};

export default function FitnessPostBoard({ navigation, route }: Props) {
  const { communityId, name } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [userMap, setUserMap] = useState<{ [key: number]: any }>({});
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [comment, setComment] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedComment, setEditedComment] = useState("");
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const profile = await fetchUserProfile();
      setCurrentUserId(profile.user.id);
    };
    loadCurrentUser();
  }, []);

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

  const getUserOfComment = async () => {
    if (!selectedPost?.comments) return;

    const updatedComments = await Promise.all(
      selectedPost.comments.map(async (comment) => {
        try {
          const user = await getUserInfoById(comment.user_id);
          return { ...comment, user };
        } catch {
          return comment;
        }
      })
    );

    setSelectedPost((prev) =>
      prev ? { ...prev, comments: updatedComments } : prev
    );
  };

  useEffect(() => {
    fetchPosts();
  }, [communityId]);

  useEffect(() => {
    getUserOfComment();
  }, [selectedPost?.id]);

  useEffect(() => {
    if (!communityId) return;

    (async () => {
      try {
        const members: Member[] = await fetchFunctionWithAuth(
          `communities/${communityId}`,
          { method: "GET" }
        );

        const profile = await fetchUserProfile();
        setIsMember(members.some((m) => m.id === profile.user.id));
      } catch (err) {
        console.error("Failed to load community members", err);
      }
    })();
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
    let imageUrl = previewUri || "";

    if (previewUri && !previewUri.startsWith("https://")) {
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

        if (!uploadResponse.ok) throw new Error("Upload failed");
        imageUrl = presignedResponse.file_url;
      } catch (err) {
        console.error("Upload error:", err);
        setIsPosting(false);
        return;
      }
    }

    try {
      if (isEditing && selectedPostId !== null) {
        await updateCommunityPost(selectedPostId, title, content, imageUrl);
      } else {
        await createCommunityPost(communityId, title, content, imageUrl);
      }

      setTitle("");
      setContent("");
      setPreviewUri(null);
      setSelectedPostId(null);
      setIsEditing(false);
      setModalVisible(false);
      fetchPosts();
    } catch (err) {
      console.error("Failed to submit post", err);
    } finally {
      setIsPosting(false);
    }
  };

  const handleEdit = (post) => {
    setIsEditing(true);
    setSelectedPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setPreviewUri(post.image_url || null);
    setModalVisible(true);
  };

  const handleDelete = (postId: number) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setDeletingPostId(postId);
          try {
            await deleteCommunityPost(postId);
            fetchPosts();
          } catch (err) {
            console.error("Delete failed", err);
          } finally {
            setDeletingPostId(null);
          }
        },
      },
    ]);
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

  const toggleLike = async (postId: number) => {
    const isLiked = likedPosts.has(postId);
    try {
      if (isLiked) {
        await unlikePost(postId);
        setLikedPosts((prev) => {
          const updated = new Set(prev);
          updated.delete(postId);
          return updated;
        });
      } else {
        await likePost(postId);
        setLikedPosts((prev) => new Set(prev).add(postId));
      }
      fetchPosts();
    } catch (err) {
      console.log("Error", "Failed to toggle like.");
    }
  };

  const handleAddComment = async () => {
    if (comment.trim() === "") {
      Alert.alert("No comment", "Please add a comment.");
      return;
    }

    try {
      const newComment = await createComment(selectedPost.id, comment.trim());

      const userInfo = await getUserInfoById(newComment.user_id);
      newComment.user = userInfo;

      const updatedComments = [...(selectedPost.comments || []), newComment];
      setSelectedPost({ ...selectedPost, comments: updatedComments });

      fetchPosts();
      setComment("");
    } catch (err) {
      console.error("Error submitting comment:", err);
    }
  };

  const handleDeleteComment = (commentId: number) => {
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteComment(commentId);
              const updatedComments = selectedPost.comments.filter(
                (comment) => comment.id !== commentId
              );
              setSelectedPost({ ...selectedPost, comments: updatedComments });
            } catch (error) {
              console.error("Failed to delete comment", error);
            }
          },
        },
      ]
    );
  };

  const openEditCommentModal = (commentId: number, content: string) => {
    setSelectedCommentId(commentId);
    setEditedComment(content);
    setEditModalVisible(true);
  };

  const handleUpdateComment = async () => {
    if (!editedComment.trim() || selectedCommentId === null) return;

    try {
      await editComment(selectedCommentId, editedComment.trim());

      const updatedComments = selectedPost.comments.map((comment) =>
        comment.id === selectedCommentId
          ? { ...comment, content: editedComment }
          : comment
      );

      setSelectedPost({ ...selectedPost, comments: updatedComments });
      setEditModalVisible(false);
      setEditedComment("");
      setSelectedCommentId(null);
    } catch (error) {
      console.error("Failed to update comment", error);
    }
  };

  const preloadCommentUsers = async (post) => {
    setCommentsLoading(true);
    try {
      const uniqueUserIds = [
        ...new Set(post.comments?.map((c) => c.user_id).filter(Boolean)),
      ];

      const userPromises = uniqueUserIds.map((id) => getUserInfoById(id));
      const userResults = await Promise.all(userPromises);

      const userMap = {};
      uniqueUserIds.forEach((id, index) => {
        userMap[id] = userResults[index];
      });

      // Attach user info to each comment
      const enrichedComments = post.comments.map((c) => ({
        ...c,
        user: userMap[c.user_id] || { name: "User" },
      }));

      setSelectedPost({ ...post, comments: enrichedComments });
      setCommentsVisible(true);
    } catch (err) {
      console.error("Error preloading comment users:", err);
    } finally {
      setCommentsLoading(false);
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
          <TouchableOpacity
            onPress={() => {
              if (!isMember) {
                Alert.alert(
                  "Join Required",
                  "You must join this community before posting.",
                  [
                    {
                      text: "OK",
                      onPress: () => navigation.goBack(),
                    },
                  ]
                );
              } else {
                setModalVisible(true);
              }
            }}
          >
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
                    setIsEditing(false);
                    setSelectedPostId(null);
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

                    <View style={tw`flex-row justify-between items-start`}>
                      <Text style={tw`font-bold text-sm`} numberOfLines={1}>
                        {post.title}
                      </Text>

                      {post.user_id === currentUserId && (
                        <View style={tw`flex-row`}>
                          <TouchableOpacity onPress={() => handleEdit(post)}>
                            <Icon
                              name="pencil"
                              size={18}
                              color="gray"
                              style={tw`ml-2`}
                            />
                          </TouchableOpacity>
                          {deletingPostId === post.id ? (
                            <ActivityIndicator
                              size="small"
                              color="red"
                              style={tw`ml-2`}
                            />
                          ) : (
                            <TouchableOpacity
                              onPress={() => handleDelete(post.id)}
                            >
                              <Icon
                                name="trash"
                                size={18}
                                color="red"
                                style={tw`ml-2`}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      )}
                    </View>

                    <Text style={tw`text-sm text-gray-700 mt-1`}>
                      {post.content}{" "}
                    </Text>

                    <View style={tw`flex-row items-center mt-2`}>
                      <TouchableOpacity
                        style={tw`flex-row items-center mr-4`}
                        onPress={() => toggleLike(post.id)}
                      >
                        <Icon
                          name={
                            post.is_liked_by_current_user ? "heart" : "heart-o"
                          }
                          size={16}
                          color={post.is_liked_by_current_user ? "red" : "gray"}
                        />

                        <Text style={tw`text-sm text-gray-600 ml-1`}>
                          {post.like_count} likes
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => preloadCommentUsers(post)}
                      >
                        <View style={tw`flex-row items-center`}>
                          <Icon name="comment-o" size={16} color="gray" />
                          <Text style={tw`text-sm text-gray-600 ml-1`}>
                            {post.comments?.length} comments
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Comments Modal */}
        {commentsLoading ? (
          <View style={tw`flex-1 justify-center items-center`}>
            <ActivityIndicator size="large" color="purple" />
          </View>
        ) : (
          <Modal
            transparent
            visible={commentsVisible}
            animationType="fade"
            onRequestClose={() => setCommentsVisible(false)}
          >
            <View style={tw`flex-1 justify-center items-center bg-black/50`}>
              <View style={tw`bg-gray-100 p-4 rounded-2xl w-11/12 max-h-[70%]`}>
                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <View style={tw`w-12`} />
                  <Text style={tw`text-lg font-bold`}>Comments</Text>
                  <TouchableOpacity onPress={() => setCommentsVisible(false)}>
                    <Text style={tw`text-purple-600`}>Close</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Message"
                  multiline
                  style={tw`bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm h-10`}
                  value={comment}
                  onChangeText={setComment}
                />

                <TouchableOpacity
                  style={tw`bg-purple-600 rounded-xl px-4 py-2 mt-2 mb-2 items-center self-center`}
                  onPress={handleAddComment}
                >
                  <Text style={tw`text-white font-semibold`}>Add Comment</Text>
                </TouchableOpacity>

                <ScrollView style={tw`mb-2`}>
                  {selectedPost?.comments?.length > 0 ? (
                    selectedPost.comments.map((comment, index) => (
                      <View
                        key={index}
                        style={tw`bg-white p-4 rounded-xl shadow-sm mb-3 flex-row`}
                      >
                        {/* Left column: avatar + name */}
                        <View style={tw`justify-center items-center mr-3 w-16`}>
                          <Text style={tw`font-bold mb-1`} numberOfLines={1}>
                            {comment.user?.name}
                          </Text>
                          {comment.user?.profile_picture ? (
                            <Image
                              source={{ uri: comment.user.profile_picture }}
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
                            {formatDate(comment.created_at)}
                          </Text>
                        </View>

                        {/* Right column: comment content */}
                        <View style={tw`flex-1 justify-center relative`}>
                          {comment.user_id === currentUserId && (
                            <View style={tw`absolute top-0 right-0 flex-row`}>
                              <TouchableOpacity
                                onPress={() =>
                                  openEditCommentModal(
                                    comment.id,
                                    comment.content
                                  )
                                }
                              >
                                <Icon
                                  name="pencil"
                                  size={18}
                                  color="gray"
                                  style={tw`mr-2`}
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => handleDeleteComment(comment.id)}
                              >
                                <Icon name="trash" size={18} color="red" />
                              </TouchableOpacity>
                            </View>
                          )}

                          <Text style={tw`text-sm text-gray-700`}>
                            {comment.content}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={tw`text-gray-500 italic text-center`}>
                      No comments yet
                    </Text>
                  )}
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}

        {/* Edit Comment */}
        <Modal visible={editModalVisible} transparent animationType="fade">
          <View style={tw`flex-1 justify-center items-center bg-black/50`}>
            <View style={tw`bg-gray-100 p-4 rounded-2xl w-11/12`}>
              <Text style={tw`text-lg font-bold mb-2`}>Edit Comment</Text>
              <TextInput
                value={editedComment}
                onChangeText={setEditedComment}
                multiline
                style={tw`border border-gray-300 rounded-xl px-4 py-2 h-10 text-sm`}
              />
              <View style={tw`flex-row justify-end items-center mt-4`}>
                <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                  <Text style={tw`text-purple-500 text-base mr-4`}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleUpdateComment}
                  style={tw`bg-purple-600 px-2 py-1 rounded-full`}
                >
                  <Text style={tw`text-white font-semibold text-base`}>
                    Update
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}
