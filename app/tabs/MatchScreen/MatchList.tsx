import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { SimpleLineIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchFunctionWithAuth } from '@/api/auth';
import { format, parseISO, isToday, isYesterday } from "date-fns";

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
    id: number;
    name: string;
    profile_picture: string;
  };
};

type Props = NativeStackScreenProps<RootStackParamList, 'MatchList'>;

export default function MatchList({ navigation }: Props) {
  const [matchedUsers, setMatchedUsers] = useState<
    {
      chat_id: number;
      last_message_time: string | null;
      last_message_id: number | null;
      last_message_content?: string | null;
      other_user: {
        id: number;
        name: string;
        profile_picture: string | null;
      };
    }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
  
      const loadMatches = async () => {
        try {
          const profile = await fetchFunctionWithAuth('users/profile', { method: 'GET' });
          const currentUserId = profile.user?.id ?? profile.id;
  
          const sortedMatches = await fetchFunctionWithAuth(`chats/sorted/${currentUserId}`, { method: 'GET' });
  
          const matchesWithContent = await Promise.all(
            sortedMatches.map(async (match) => {
              let content = null;
              if (match.last_message_id) {
                try {
                  const msg = await fetchFunctionWithAuth(`messages/id/${match.last_message_id}`, { method: 'GET' });
                  content = msg?.content || '[Image]';
                } catch (err) {
                  console.warn(`Failed to fetch message ${match.last_message_id}`, err);
                }
              }
              return { ...match, last_message_content: content };
            })
          );
  
          if (isActive) {
            const deduped = Array.from(
              new Map(matchesWithContent.map((m) => [m.chat_id, m])).values()
            );
            setMatchedUsers(deduped);
          }          
        } catch (err) {
          console.error('Failed to load match list', err);
        } finally {
          if (isActive) setLoading(false);
        }
      };
  
      loadMatches();
  
      return () => {
        isActive = false;
      };
    }, [])
  );  

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="purple" />
      </SafeAreaView>
    );
  }

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
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      {/* Header */}
      <View style={tw`px-4`}>
        <View style={tw`bg-gray-100 flex-row items-center px-4 py-3`}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <SimpleLineIcons name="arrow-left-circle" size={28} color="black" />
          </TouchableOpacity>
          <Text style={tw`ml-2 text-2xl font-bold text-black`}>Match List</Text>
        </View>
        <View style={tw`border-b border-gray-300`} />
      </View>

      {matchedUsers.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text>No matches yet.</Text>
        </View>
      ) : (
        <View style={tw`p-4`}>
          {matchedUsers.map((user) => (
            <TouchableOpacity
              key={user.chat_id}
              style={tw`flex-row items-center bg-white p-4 mb-3 rounded-lg`}
              onPress={() =>
                navigation.navigate('MatchChat', {
                  id: user.other_user.id,
                  name: user.other_user.name,
                  profile_picture: user.other_user.profile_picture,
                })
              }
            >
              {user.other_user.profile_picture ? (
                <Image
                  source={{ uri: user.other_user.profile_picture }}
                  style={tw`w-12 h-12 rounded-full`}
                />
              ) : (
                <View
                  style={tw`w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center`}
                >
                  <Text style={tw`text-xl font-bold text-white`}>U</Text>
                </View>
              )}
              <View style={tw`ml-4 flex-1 flex-row justify-between items-center`}>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-lg font-medium`}>{user.other_user.name}</Text>
                  <Text
                    style={tw.style(
                      'text-sm text-gray-500',
                      !user.last_message_content && 'italic'
                    )}
                    numberOfLines={1}
                  >
                    {user.last_message_content ?? "Start the conversation"}
                  </Text>
                </View>
                
                {/* Time aligned to right */}
                {user.last_message_time && (
                  <Text style={tw`text-xs text-gray-400 ml-2`}>
                    {formatDate(user.last_message_time)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}