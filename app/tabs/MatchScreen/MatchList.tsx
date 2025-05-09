import { View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import React,{useState, useEffect} from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { SimpleLineIcons } from '@expo/vector-icons'
import { NativeStackScreenProps } from '@react-navigation/native-stack';
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

type Props = NativeStackScreenProps<RootStackParamList, "MatchList">;
export default function MatchList({ navigation }: Props) {
    const [matchedUsers, setMatchedUsers] = useState<
    { id: number; name: string; profile_picture: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const profile = await fetchFunctionWithAuth('users/profile', { method: 'GET' });
        const currentUserId = profile.user?.id ?? profile.id;

        const matches: { id: number; user_id1: number; user_id2: number; matched_at: string }[] =
          await fetchFunctionWithAuth('match', { method: 'GET' });
        
        const otherIds = matches.map(m =>
          m.user_id1 === currentUserId ? m.user_id2 : m.user_id1
        );
        const uniqueIds = Array.from(new Set(otherIds.filter(id => id != null)));

        const users = await Promise.all(
          uniqueIds.map((id: number) =>
            fetchFunctionWithAuth(`match/user-info/${id}`, { method: 'GET' })
          )
        );

        setMatchedUsers(users);
      } catch (err) {
        console.error('Failed to load match list', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="purple" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      {/* Header */}
      <View style={tw`bg-gray-100 flex-row items-center px-4 py-3`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <SimpleLineIcons name="arrow-left-circle" size={28} color="black" />
        </TouchableOpacity>
        <Text style={tw`ml-2 text-2xl font-bold text-black`}>Match List</Text>
      </View>

      {matchedUsers.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text>No matches yet.</Text>
        </View>
      ) : (
        <View style={tw`p-4`}>
          {matchedUsers.map(user => (
            <TouchableOpacity
              key={user.id}
              style={tw`flex-row items-center bg-white p-4 mb-3 rounded-lg`}
              onPress={() =>
                navigation.navigate('MatchChat', {
                    id: user.id,
                    name: user.name,
                    profile_picture: user.profile_picture,
                })
              }
            >
              {user.profile_picture ? (
                <Image
                  source={{ uri: user.profile_picture }}
                  style={tw`w-12 h-12 rounded-full`}
                />
              ) : (
                <View
                  style={tw`w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center`}
                >
                  <Text style={tw`text-xl font-bold text-purple-600`}>U</Text>
                </View>
              )}
              <Text style={tw`ml-4 text-lg font-medium`}>{user.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </SafeAreaView>
    );
}