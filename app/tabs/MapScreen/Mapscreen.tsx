import React, { useState, useEffect, useRef } from 'react';
import { View, Text , TextInput , ScrollView , TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { fetchFunction } from "@/api/auth";
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';
import Icon from 'react-native-vector-icons/FontAwesome';

// Types for Places API
type DisplayNameObject = {
  text: string;
  languageCode?: string;
};

type PlaceLocation = {
  latLng?: {
    latitude: number;
    longitude: number;
  };
  latitude?: number;
  longitude?: number;
};

type Place = {
  displayName?: DisplayNameObject;
  formattedAddress?: string;
  location?: PlaceLocation;
};

// Define navigation types
type RootStackParamList = {
  Signup: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  ForgotPassword: undefined;
  ResetCode: undefined;
  ChangePassword: undefined;
  MapScreen: undefined;
  Community: { placeId: string };
  FitnessBoard: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "MapScreen">;

export default function MapScreen({ navigation }: Props) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapkey, setMapKey] = useState(0);
  const apiKey = 'AIzaSyCv0H_JQ1RwiISCjUMq48rmnBs4FMmUG3A';

  // Ref to the MapView
  const mapRef = useRef<MapView | null>(null);
  const markerRefs = useRef<Record<number, any>>({});

  useEffect(() => {
    (async () => {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Initially load gyms near the user
      searchNearbyGyms(currentLocation);
    })();
  }, []);

  /** Extract coordinates from the place object, handling either location.latLng or location.latitude. */
  const getCoordinates = (place: Place) => {
    if (
      place.location?.latLng &&
      typeof place.location.latLng.latitude === 'number' &&
      typeof place.location.latLng.longitude === 'number'
    ) {
      return {
        latitude: place.location.latLng.latitude,
        longitude: place.location.latLng.longitude
      };
    } else if (
      place.location &&
      typeof place.location.latitude === 'number' &&
      typeof place.location.longitude === 'number'
    ) {
      return {
        latitude: place.location.latitude,
        longitude: place.location.longitude
      };
    }
    return null;
  };

  /** Nearby Search (New) - automatically sorted by distance. */
  const searchNearbyGyms = async (userLocation: Location.LocationObject | null) => {
    if (!userLocation) return;
    const fieldMask = 'places.id,places.displayName,places.formattedAddress,places.location';
    const endpoint = 'https://places.googleapis.com/v1/places:searchNearby';
    const { latitude, longitude } = userLocation.coords;
    const radiusMeters = 3000;

    const body = {
      maxResultCount: 20,
      rankPreference: 'DISTANCE',
      includedTypes: ['gym'],
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius: radiusMeters
        }
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fieldMask
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      console.log('Nearby Search (New) response:', data);

      if (data.error) {
        console.error('Places API error:', data.error.message);
        setPlaces([]);
      } else if (data.places) {
        setPlaces(data.places);
      } else {
        setPlaces([]);
      }
    } catch (error) {
      console.error('Error searching nearby gyms:', error);
    }
  };

  /** Text Search (New) - for arbitrary user queries. */
  const searchPlacesNew = async (query: string, loc?: Location.LocationObject) => {
    const userLocation = loc || location;
    if (!userLocation) return;
    const fieldMask = 'places.id,places.displayName,places.formattedAddress,places.location';
    const endpoint = 'https://places.googleapis.com/v1/places:searchText';
    const { latitude, longitude } = userLocation.coords;

    const textQuery = `${query.trim() || 'gym'} near ${latitude},${longitude}`;

    const body = {
      textQuery,
      includedType: 'gym',
      strictTypeFiltering: true,
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fieldMask
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      console.log('Text Search (New) response:', data);

      if (data.error) {
        console.error('Places API error:', data.error.message);
        setPlaces([]);
      } else if (data.places) {
        setPlaces(data.places);
      } else {
        setPlaces([]);
      }
    } catch (error) {
      console.error('Error searching places (New):', error);
    }
  };

  const saveCommunityNav = async (place: Place & { id?: string }) => {
    const name = place.displayName?.text ?? '';
    const address = place.formattedAddress ?? '';
    const { latitude, longitude } = getCoordinates(place)!;
    const places_id = place.id!;

    const saved = await fetchFunction("communities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
         name,
         address,
         latitude,
         longitude,
         places_id,
      }),
    });

    navigation.navigate('Community', { placeId: place.id! });
  };

  /** Fit map to all markers whenever `places` changes. */
  useEffect(() => {
    if (places.length > 0 && mapRef.current) {
      setMapKey(prev => prev + 1);
      setTimeout(() => {
        const coords = places
          .map(getCoordinates)
          .filter((c): c is { latitude: number; longitude: number } => c !== null);

        if (coords.length > 0) {
          mapRef.current!.fitToCoordinates(coords, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true
          });
        }
      }, 500);
    }
  }, [places]);

  if (!location) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text>Loading your location...</Text>
        {errorMsg && <Text style={tw`text-red-500`}>{errorMsg}</Text>}
      </View>
    );
  }

  // Initial region
  const initialRegion = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05
  };

  return (
    <SafeAreaView style={tw`flex-1`}>
      <LinearGradient colors={['#F2ECFF', '#E5D4FF']} style={tw`flex-1`}>

        {/* Search Container */}
        <View style={tw`px-4 pt-4 bg-gray-100`}>
          <Text style={tw`text-base font-bold mb-2`}>Search</Text>
          <TextInput
            style={tw`bg-white rounded-lg px-4 py-2 mb-4`}
            placeholder="Search for gyms..."
            placeholderTextColor="#B5B0B0"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => searchPlacesNew(searchQuery)}
          />
        </View>

        {/* Map Section */}
        <View style={tw`flex-1`}>
          <MapView
            key={mapkey}
            ref={mapRef}
            style={tw`flex-1`}
            initialRegion={initialRegion}
            showsUserLocation
          >
            {places.map((place, idx) => {
              const coords = getCoordinates(place);
              if (!coords) return null;

              const displayNameText = place.displayName?.text ?? 'Unknown Gym';

              return (
                <Marker
                key={idx}
                coordinate={coords}
                ref={ref => {
                  if (ref) markerRefs.current[idx] = ref;
                }}
                >
                  <Callout tooltip
                  onPress={() => saveCommunityNav(place)}>
                    <View style={tw`bg-white p-2 rounded shadow-lg`}>
                      <Text style={tw`font-bold text-base`}>{displayNameText}</Text>
                      {place.formattedAddress && (
                        <Text style={tw`text-xs text-gray-700`}>
                          {place.formattedAddress}
                        </Text>
                      )}
                      <TouchableOpacity
                      style={tw`bg-purple-500 px-3 py-2 rounded-full mt-1`}
                    >
                      <Text style={tw`text-white text-xs text-center`}>Go to Community Page</Text>
                    </TouchableOpacity>
                    </View>
                  </Callout>
                </Marker>
              );
            })}
          </MapView>

          {/* A custom "locate me" button. Tapping it re-centers the map on the user location. */}
          <View style={tw`absolute top-5 right-4 z-10`}>
            <TouchableOpacity
              style={tw`bg-purple-500 p-3 rounded-full`}
              onPress={() => {
                if (location && mapRef.current) {
                  mapRef.current.animateToRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05
                  });
                }
                searchNearbyGyms(location)
              }}
            >
              <Icon name="location-arrow" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* List Section */}
        <View style={tw`bg-white p-4`}>
          <View style={tw`flex-row items-center justify-between mb-2`}>
            <Text style={tw`text-lg font-bold`}>Gyms:</Text>
          </View>
          <ScrollView style={tw`max-h-40`}>
            {places.map((place, idx) => {
              const displayNameText = place.displayName?.text ?? 'Unknown Gym';
              return (
                <TouchableOpacity
                  key={idx}
                  style={tw`p-4 border-b border-gray-300`}
                  onPress={() => {
                    const coords = getCoordinates(place);
                    if (coords && mapRef.current) {
                      mapRef.current.animateToRegion({
                        ...coords,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05
                      });

                      const marker = markerRefs.current[idx];
                      if (marker) marker.showCallout();
                    }
                  }}
                >
                  <Text style={tw`font-bold`}>{displayNameText}</Text>
                  {place.formattedAddress && (
                    <Text style={tw`text-xs text-gray-600`}>
                      {place.formattedAddress}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

      </LinearGradient>
    </SafeAreaView>
  );
}
