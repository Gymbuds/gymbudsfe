import { View, Text, TouchableOpacity, Image, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { SimpleLineIcons } from '@expo/vector-icons'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AntDesign } from '@expo/vector-icons'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchFunctionWithAuth } from '@/api/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
  MapScreen: undefined;
  Community: { placeId: string };
  FitnessBoard: undefined;
  MatchList: undefined;
  MatchChat: {
    id: number
    name: string
    profile_picture: string
  };
};
const socket = useRef<WebSocket | null>(null);

type Props = NativeStackScreenProps<RootStackParamList, "MatchChat">;
type MatchChatParams = {
  id: number;
  name: string;
  profile_picture: string;
};
interface Message {
  chat_id: number;
  sender_id: number;
  content: string;
  timestamp: Date;
}
const BASE_URL = process.env.EXPO_PUBLIC_DB_URL;

export default function MatchChat({ navigation, route }: Props) {
  const { id, name, profile_picture } = route.params as MatchChatParams;
  const [messages, setMessages] = useState<Message[]>();
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets()
  const INPUT_BAR_HEIGHT = 60
  const footerHeight = INPUT_BAR_HEIGHT + insets.bottom


  useEffect(() => {
    const websocket_func = async () => {
      const auth_token = await AsyncStorage.getItem("userToken");
      socket.current = new WebSocket(`${BASE_URL}/chats/ws`);

      socket.current.onopen = () => {
        socket.current?.send(JSON.stringify({ type: "user_setup", auth_token: auth_token }));
      };

      socket.current.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "new_message" && data.message) {
            setMessages(prev => [...(prev ?? []), data.message]);
          }
        } catch (err) {
          console.error("Invalid WebSocket message:", e.data);
        }
      };
    };

    fetchMessages();
    websocket_func();

    return () => {
      if (socket.current) {
        socket.current.close();
      }
    };
  }, []);

  const fetchMessages = async () => {
    try {
      const res: Message[] = await fetchFunctionWithAuth(`messages/${id}`, { method: "GET" });
      setMessages(res);
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const messageToSend = {
      type: "new_message",
      other_user_id: id,
      content: input.trim(),
    };

    console.log(messageToSend);
    socket.current?.send(JSON.stringify(messageToSend));

    setInput('');
  };

  const renderItem = ({ item }: { item: Message }) => (
    <View
      style={tw.style(
        'my-2 px-3 py-2 rounded-2xl max-w-3/4',
        item.sender_id !== id
          ? 'self-end bg-purple-500'
          : 'self-start bg-white border border-purple-300'
      )}
    >
      <Text
        style={tw.style(
          'text-base',
          item.sender_id !== id ? 'text-white' : 'text-purple-700'
        )}
      >
        {item.content}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`} edges={['top']}>
      {/* Header */}
      <View style={tw`flex-row items-center px-4 py-3 bg-white`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <SimpleLineIcons name="arrow-left-circle" size={28} color="black" />
        </TouchableOpacity>
        {profile_picture ? (
            <Image
                source={{ uri: profile_picture }}
                style={tw`w-10 h-10 rounded-full ml-3`}
            />
            ) : (
            <View
                style={tw`bg-purple-200 w-10 h-10 rounded-full flex items-center justify-center ml-3`}
            >
                <Text style={tw`text-purple-600 text-base font-bold`}>U</Text>
            </View>
        )}
        <Text style={tw`ml-3 text-xl font-bold`}>{name}</Text>
      </View>
      <KeyboardAvoidingView
        style={tw`flex-1`}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(_, idx) => idx.toString()}
        renderItem={renderItem}
        contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
        ListFooterComponent={
            <View style={{ height: footerHeight + 8 }} />
        }        
        onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ bottom: footerHeight }}
      />

      {/* Input Bar */}
      <View
          style={{
            height: INPUT_BAR_HEIGHT,
            borderTopWidth: 1,
            borderColor: '#ddd',
            backgroundColor: 'white',
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
          }}
        >
          <TouchableOpacity>
            <AntDesign name="pluscircleo" size={30} color="#9669B0" />
          </TouchableOpacity>
          <TextInput
            style={{ flex: 1, marginHorizontal: 8, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F3E8FF', borderRadius: 25 }}
            placeholder="Write Something…"
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity onPress={sendMessage}>
            <View style={tw`w-10 h-10 bg-purple-500 rounded-full items-center justify-center`}>
              <AntDesign name="arrowright" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
