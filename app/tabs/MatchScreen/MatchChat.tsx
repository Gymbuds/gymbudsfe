import { View, Text, TouchableOpacity, Image, TextInput, FlatList, KeyboardAvoidingView, Platform, } from 'react-native'
import React, { useState, useRef, useEffect} from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { SimpleLineIcons } from '@expo/vector-icons'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AntDesign } from '@expo/vector-icons'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchFunctionWithAuth } from '@/api/auth';


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

type Props = NativeStackScreenProps<RootStackParamList, "MatchChat">;

interface Message {
    chat_id: number
    sender_id: number
    content: string
    timestamp: Date
}
const BASE_URL = process.env.EXPO_PUBLIC_DB_URL;


export default function MatchChat({ navigation, route }: Props) {


    const { id, name, profile_picture } = route.params
    const [messages, setMessages] = useState<Message[]>()
    const [input, setInput] = useState('')
    const listRef = useRef<FlatList>(null)
    const socket =  new WebSocket(`${BASE_URL}/chats/ws`)

    useEffect(() => {
        listRef.current?.scrollToEnd({ animated: true })
      }, [messages])    
      useEffect(()=>{const websocket_func = async()=>{
        const auth_token = await AsyncStorage.getItem("userToken")
        socket.onopen = () => {
            socket.send(JSON.stringify({type:"user_setup",auth_token: auth_token}));
        }
        socket.onmessage = e =>{
            console.log(e.data);
        }
      }
        fetchMessages()
        websocket_func()
      },[])
      useEffect(()=>{
        console.log(messages)  
      },[])
    const fetchMessages = async() => {
        try {
            const res :Message[] =  await fetchFunctionWithAuth("workout_logs", { method: "GET" });
            setMessages(res)
          } catch (error) {
            console.error('Error fetching workout logs:', error);
            throw error;
          }
    }
    
    const sendMessage = () => {
        if (!input.trim()) return
        setMessages(prev => [
            ...prev,
            { id: Date.now().toString(), text: input.trim(), fromMe: true },
            
        ])
        socket.send(JSON.stringify({type:"new_message",other_user_id:id,}))
        setInput('')
    }

    const renderItem = ({ item }: { item: Message }) => (
        <View
            style={tw.style(
                'my-2 px-3 py-2 rounded-2xl max-w-3/4',
                item.sender_id!=id
                    ? 'self-end bg-purple-500'
                    : 'self-start bg-white border border-purple-300'
            )}
        >
            <Text
                style={tw.style(
                    'text-base',
                    item.sender_id!=id? 'text-white' : 'text-purple-700'
                )}
            >
                {item.content}
            </Text>
        </View>
    )    

    return (
        <SafeAreaView style={tw`flex-1 bg-gray-100`} edges={['top']}>
         {/* Header */}
        <View style={tw`flex-row items-center px-4 py-3 bg-white`}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
            <SimpleLineIcons
                name="arrow-left-circle"
                size={28}
                color="black"
            />
            </TouchableOpacity>
            <Image
            source={{ uri: profile_picture }}
            style={tw`w-10 h-10 rounded-full ml-3`}
            />
            <Text style={tw`ml-3 text-xl font-bold`}>{name}</Text>
        </View>

        {/* Messages */}
        <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={renderItem}
            contentContainerStyle={tw`px-4 pt-4`}
            showsVerticalScrollIndicator={false}
        />

        {/* Input Bar */}
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={tw`absolute bottom-0 left-0 right-0`}
        >
        <SafeAreaView edges={['bottom']} style={tw`bg-white`}>
            <View style={tw`flex-row items-center px-4 py-2`}>

            <TouchableOpacity>
                <AntDesign name="pluscircleo" size={30} color="#9669B0" />
            </TouchableOpacity>
            <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Write Something.."
                placeholderTextColor="#9CA3AF"
                style={tw`flex-1 mx-3 px-4 py-2 bg-purple-100 rounded-full`}
            />
            <TouchableOpacity onPress={sendMessage}>
                <View style={tw`w-10 h-10 bg-purple-500 rounded-full items-center justify-center`}>
                <AntDesign name="arrowright" size={20} color="white" />
                </View>
            </TouchableOpacity>
            </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    </SafeAreaView>
    );
}