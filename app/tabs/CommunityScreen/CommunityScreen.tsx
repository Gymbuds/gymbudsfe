import React, { useState, useEffect } from 'react'
import { View, Image, Text, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { SimpleLineIcons, FontAwesome5, Feather, Ionicons } from '@expo/vector-icons'
import { fetchFunctionWithAuth } from '@/api/auth'
import { fetchUserProfile } from '@/app/tabs/ProfileApiService/ProfileApiService'
import tw from 'twrnc'

type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
  MapScreen: undefined;
  Community: { placeId: string };
  FitnessBoard: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Community'>

interface PlacePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
}

interface PlaceDetails {
  displayName: { text: string }
  photos?: PlacePhoto[];
  formattedAddress: string
  location: { latitude: number; longitude: number }
  nationalPhoneNumber?: string
  websiteUri?: string
  rating?: number
  userRatingCount?: number
  regularOpeningHours?: {
    openNow?: boolean
    periods?: Array<{
      open: { day: number; time: string }
      close?: { day: number; time: string }
    }>
    weekdayDescriptions?: string[]
  }
}

interface Member {
  id: number
  name: string
  profile_picture?: string | null
}

export default function CommunityScreen({ navigation, route }: Props) {
  const { placeId } = route.params
  const [details, setDetails] = useState<PlaceDetails | null>(null)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [communityId, setCommunityId] = useState<number|null>(null);
  const [members, setMembers] = useState<Member[]>([])
  const [isMember, setIsMember] = useState(false)
  const [preferredCommunityId, setPreferredCommunityId] = useState<number | null>(null);
  const MAX_MEMBERS_DISPLAY = 8;
  const apiKey = 'AIzaSyCv0H_JQ1RwiISCjUMq48rmnBs4FMmUG3A'

  useEffect(() => {
    if (!placeId) return
    const fields = [
      'displayName',
      'photos',
      'formattedAddress',
      'location',
      'nationalPhoneNumber',
      'websiteUri',
      'rating',
      'userRatingCount',
      'regularOpeningHours',
    ].join(',')

    fetch(
      `https://places.googleapis.com/v1/places/${placeId}` +
      `?fields=${fields}&key=${apiKey}`
    )
      .then(r => {
        if (!r.ok) throw new Error(`Places API ${r.status}`)
        return r.json()
      })
      .then((json: PlaceDetails) => setDetails(json))
      .catch(console.error)
  }, [placeId])

  useEffect(() => {
    if (!details) return;
    (async () => {
      try {
        const payload = {
          name: details.displayName.text,
          address: details.formattedAddress,
          latitude: details.location.latitude,
          longitude: details.location.longitude,
          places_id: placeId,
        };
        const res: { id: number } = await fetchFunctionWithAuth(
          'communities',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
        setCommunityId(res.id);
      } catch (err) {
        console.error('failed to register community', err);
      }
    })();
  }, [details, placeId]);

  useEffect(() => {
    if (!communityId) return;
    (async () => {
      try {
        const list: Member[] = await fetchFunctionWithAuth(
          `communities/${communityId}`, { method: 'GET' }
        );
        setMembers(list);
        const profile = await fetchUserProfile();
        setIsMember(list.some((m) => m.id === profile.user.id));
        const preferredRes = await fetchFunctionWithAuth('users/prefer', { method: 'GET' });
        setPreferredCommunityId(preferredRes.id); 
      } catch (err) {
        console.error('failed loading members', err);
      }
    })();
  }, [communityId]);

  if (!details) {
    return (
      <SafeAreaView style={tw`flex-1 justify-center items-center`}>
        <Text>Loading…</Text>
      </SafeAreaView>
    )
  }

  const photos = details.photos || []
  const hasPhotos = photos.length > 0

  const toggleMembership = async () => {
    if (!communityId) return;
    try {
      await fetchFunctionWithAuth(
        `communities/${communityId}`, { method: isMember ? 'DELETE' : 'POST' }
      );
      setIsMember(!isMember);
      const list: Member[] = await fetchFunctionWithAuth(
        `communities/${communityId}`, { method: 'GET' }
      );
      setMembers(list);
      Alert.alert(isMember ? 'Left community' : 'Joined community');
    } catch (e) {
      console.error(e);
      Alert.alert('Something went wrong');
    }
  };

  const setPreferredGym = async () => {
    if (!communityId) return;
    try {
      await fetchFunctionWithAuth(`communities/${communityId}/prefer`, { method:'PATCH' });
      const preferredRes = await fetchFunctionWithAuth('users/prefer', { method: 'GET' });
      setPreferredCommunityId(preferredRes.id);
      Alert.alert('Preferred gym set!') 
    } catch (e) {
      Alert.alert('Please join the community first.')
    }
  }

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      {/* Header */}
      <View style={tw`bg-gray-100 flex-row items-center px-4 py-3`}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <SimpleLineIcons name="arrow-left-circle" size={28} color="black" />
        </TouchableOpacity>
        <Text style={tw`ml-2 text-2xl font-bold text-black`}>
          {details.displayName.text}
        </Text>
      </View>

      <ScrollView style={tw`flex-1 bg-white`}>

        {/* Photo Carousel */}
        {hasPhotos && (() => {
          const photoResourceName = photos[photoIndex].name
          const uri =
            `https://places.googleapis.com/v1/${photoResourceName}/media` +
            `?maxWidthPx=800&key=${apiKey}`

          return (
            <View style={tw`relative w-full h-48`}>
              <Image
                source={{ uri }}
                style={tw`w-full h-full`}
                resizeMode="cover"
              />

              {/* Back Arrow */}
              {photoIndex > 0 && (
                <TouchableOpacity
                  onPress={() => setPhotoIndex(photoIndex - 1)}
                  style={tw`absolute left-2 top-1/2`}
                >
                  <Ionicons
                    name="chevron-back-circle"
                    size={32}
                    color="rgba(255, 255, 255, 1)"
                  />
                </TouchableOpacity>
              )}

              {/* Forward Arrow */}
              {photoIndex < photos.length - 1 && (
                <TouchableOpacity
                  onPress={() => setPhotoIndex(photoIndex + 1)}
                  style={tw`absolute right-2 top-1/2`}
                >
                  <Ionicons
                    name="chevron-forward-circle"
                    size={32}
                    color="rgba(255, 255, 255, 1)"
                  />
                </TouchableOpacity>
              )}
            </View>
          )
        })()}

        {/* Info Card */}
        <View style={tw`p-4 mx-3 mt-4 rounded-xl shadow bg-white`}>
          {/* Address */}
          <View style={tw`flex-row items-center`}>
            <FontAwesome5 name="map-marker-alt" size={20} color="purple" />
            <Text style={tw`ml-2 text-gray-700`}>
              {details.formattedAddress}
            </Text>
          </View>

          {/* Phone */}
          <View style={tw`mt-3 flex-row items-center`}>
            <FontAwesome5 name="phone" size={20} color="purple" />
            {details.nationalPhoneNumber ? (
              <TouchableOpacity
                style={tw`ml-2`}
                onPress={() => Linking.openURL(`tel:${details.nationalPhoneNumber}`)}
              >
                <Text style={tw`text-purple-700`}>
                  {details.nationalPhoneNumber}
                </Text>
              </TouchableOpacity>
            ) : (<Text style={tw`ml-2 text-gray-500`}>N/A</Text>)}
          </View>

          {/* Website */}
          <View style={tw`mt-2 flex-row items-center`}>
            <FontAwesome5 name="globe" size={20} color="purple" />
            {details.websiteUri ? (
              <TouchableOpacity
                style={tw`ml-2`}
                onPress={() => Linking.openURL(details.websiteUri!)}
              >
                <Text style={tw`text-purple-700`}>Website</Text>
              </TouchableOpacity>
            ) : (<Text style={tw`ml-2 text-gray-500`}>N/A</Text>)}
          </View>

          {/* Rating & Number of Reviews */}
          <View style={tw`flex-row items-center mt-4`}>
            <Text style={tw`text-yellow-500 font-semibold`}>
              ⭐ {details.rating != null ? details.rating.toFixed(1) : 'N/A'}
            </Text>
            <Text style={tw`ml-2 ${
              details.userRatingCount != null ? 'text-gray-500' : 'text-gray-500'
            }`}>
              {details.userRatingCount != null
                ? `(${details.userRatingCount} reviews)`
                : '(N/A)'}
            </Text>
          </View>

          {/* Buttons */}
          <View style={tw`flex-row mt-4`}>
          {preferredCommunityId === communityId ? (
              <View
                style={tw`flex-1 border border-purple-400 bg-purple-100 rounded-2xl py-2 mr-2 items-center`}
              >
                <Text style={tw`text-purple-500 font-semibold`}>
                  <FontAwesome5 name="check" size={18} color="purple" />{' '}
                  Preferred Gym
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={tw`flex-1 border border-purple-400 rounded-2xl py-2 mr-2 items-center`}
                onPress={setPreferredGym}
              >
                <Text style={tw`text-purple-500 font-semibold`}>
                  <FontAwesome5 name="map-marker-alt" size={18} color="purple" />{' '}
                  Set Preferred Gym
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={tw`flex-1 border bg-purple-500 rounded-2xl py-2 mr-2 items-center`}
              onPress={toggleMembership}
            >
              <Text style={tw`text-white font-semibold`}>
                {isMember ? 'Leave' : 'Join'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Hours */}
        <View style={tw`bg-white mx-3 mt-4 p-4 rounded-xl shadow`}>
          <Text style={tw`text-lg font-bold mb-2`}>
            <Ionicons name="time-outline" size={24} color="purple" /> Hours
          </Text>
          {details.regularOpeningHours?.weekdayDescriptions?.length ? (
            details.regularOpeningHours.weekdayDescriptions.map((line, i) => (
              <Text key={i} style={tw`text-gray-700`}>
                {line}
              </Text>
            ))
          ) : (<Text style={tw`text-gray-500 italic`}>N/A</Text>)}
        </View>

        {/* Community Post Board */}
        <View style={tw`bg-white mx-2 mt-5 p-4 rounded-xl shadow`}>
          <View style={tw`flex-row justify-between items-center mb-2`}>
            <Text style={tw`text-lg font-semibold`}>
              <Feather
                name="message-square"
                size={24}
                color="purple"
              />{' '}
              Community Post Board
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('FitnessBoard', {
                  communityId,
                  name: details.displayName.text,
                })
              }
            >
              <Text style={tw`text-purple-500 text-sm`}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={tw`border border-gray-300 rounded-2xl p-2 mx-3`}>
            <Text style={tw`text-gray-600`}>
              No posts yet • Be the first to post!
            </Text>
          </View>
        </View>

        {/* ——— Members List ——— */}
        <View style={tw`bg-white mx-3 mt-5 p-4 rounded-xl shadow`}>
          <Text style={tw`text-lg font-bold mb-2`}>Members</Text>
          {members.length > 0 
            ? (
            members.slice(0, MAX_MEMBERS_DISPLAY).map((m) => (
              <View
                key={m.id}
                style={tw`flex-row items-center mb-2`}
              >
                {m.profile_picture ? (
                  <Image
                    source={{ uri: m.profile_picture }}
                    style={tw`w-10 h-10 rounded-full mr-2`}
                  />
                ) : (
                  <View
                    style={tw`w-10 h-10 bg-purple-300 rounded-full mr-2 flex items-center justify-center`}
                  >
                    <Text style={tw`text-white text-base`}>U</Text>
                  </View>
                )}
                <Text style={tw`text-gray-700 text-base`}>{m.name}</Text>
              </View>
            ))
          ) : (
            <Text style={tw`text-gray-500 italic`}>No members yet</Text>
          )}
          {members.length > MAX_MEMBERS_DISPLAY && (
            <Text style={tw`text-gray-500 italic mt-2`}>
              and {members.length - MAX_MEMBERS_DISPLAY} more…
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
