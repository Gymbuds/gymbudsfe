import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import tw from "twrnc";
import { fetchFunctionWithAuth } from "@/api/auth";
import Icon from "react-native-vector-icons/FontAwesome";
import { validateTime, convertTo24Hour, padTime } from "@/app/utils/util";
import { getCoordinatesFromZip } from "@/api/map";

type RootStackParamList = {
  Signup: undefined;
  Survey: undefined;
  Home: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Survey">;

export default function SurveyScreen({ navigation }: Props) {
  const [userAge, setUserAge] = useState<string>("");
  const [userWeight, setUserWeight] = useState<number | null>(null);
  const [userSkillLevel, setUserSkillLevel] = useState("");
  const [userGender, setUserGender] = useState("");
  const [userZip, setUserZip] = useState<number | null>(null);
  const [userFitnessGoals, setUserFitnessGoals] = useState<string[]>([]);

  const [selectedDay, setSelectedDay] = useState("MONDAY");
  const [timeRanges, setTimeRanges] = useState<
    { day: string; start: string; end: string }[]
  >([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [startTimePeriod, setStartTimePeriod] = useState<"AM" | "PM">("AM");
  const [endTimePeriod, setEndTimePeriod] = useState<"AM" | "PM">("AM");

  const updateUserInfo = async () => {
    const coords = await getCoordinatesFromZip(String(userZip));
    if (!coords) throw new Error("Failed to fetch coordinates");
    const userUpdate = {
      gender: userGender,
      age: userAge,
      weight: userWeight,
      skill_level: userSkillLevel,
      zip_code: userZip,
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    const response = await fetchFunctionWithAuth("users/profile/update", {
      method: "PATCH",
      body: JSON.stringify(userUpdate),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const postUserTimeRange = async (
    day: string,
    start_hour: number,
    start_minutes: number,
    end_hour: number,
    end_minutes: number
  ) => {
    const start_time = padTime(start_hour, start_minutes);
    const end_time = padTime(end_hour, end_minutes);

    try {
      const data = await fetchFunctionWithAuth("avalrange/create", {
        method: "POST",
        body: JSON.stringify({ day_of_week: day, start_time, end_time }),
      });
      setModalVisible(false);
    } catch (error) {
      console.error("Failed to create user time range", error);
    }
  };

  const postUserGoals = async (goals: string[]) => {
    try {
      await fetchFunctionWithAuth("user_goal/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goals }),
      });
    } catch (error) {
      console.error("Failed to submit fitness goals:", error);
    }
  };

  const handleDeleteTimeRange = (index: number) => {
    setTimeRanges((prev) => prev.filter((_, i) => i !== index));
  };

  const wrongTimeAlert = () => {
    Alert.alert("Invalid Time", "Please choose a proper Time", [
      {
        text: "Ok",
        style: "default",
      },
    ]);
  };

  const formatGoalText = (goal: string) => {
    return goal
      .toLowerCase()
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const toggleFitnessGoal = (goal: string) => {
    if (userFitnessGoals.includes(goal)) {
      setUserFitnessGoals((prevGoals) => prevGoals.filter((g) => g !== goal));
    } else {
      setUserFitnessGoals((prevGoals) => [...prevGoals, goal]);
    }
  };

  return (
    <LinearGradient colors={["#F2ECFF", "#E5D4FF"]} style={tw`flex-1`}>
      <ScrollView
        contentContainerStyle={tw`flex-grow justify-center items-center px-8 py-12`}
      >
        <Text style={tw`text-3xl font-bold text-center mt-10`}>Welcome to</Text>
        <Text style={tw`text-3xl font-bold text-center text-purple-500 mb-2`}>
          GymBuds
        </Text>
        <Text style={tw`text-lg font-semibold text-center text-gray-700 mb-6`}>
          Let's get to know you better.
        </Text>

        {/* AGE */}
        <View style={tw`w-full mb-8`}>
          <Text style={tw`text-base mb-2`}>What is your age?</Text>
          <TextInput
            style={tw`border bg-gray-100 p-3 rounded w-full`}
            keyboardType="numeric"
            placeholder="Enter your age"
            placeholderTextColor="#B5B0B0"
            value={userAge}
            onChangeText={setUserAge}
          />
        </View>

        {/* GENDER */}
        <View style={tw`w-full mb-8`}>
          <Text style={tw`text-base mb-2`}>What is your gender?</Text>
          <View style={tw`flex-row justify-center`}>
            {["MALE", "FEMALE"].map((gender) => (
              <TouchableOpacity
                key={gender}
                onPress={() => setUserGender(gender)}
                style={tw`px-6 py-2 border rounded-lg mx-2 ${
                  gender === userGender ? "bg-purple-300" : "bg-gray-100"
                }`}
              >
                <Text style={tw`text-sm`}>{gender}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* WEIGHT */}
        <View style={tw`w-full mb-8`}>
          <Text style={tw`text-base mb-2`}>What is your weight?</Text>
          <TextInput
            style={tw`border bg-gray-100 p-3 rounded w-full`}
            keyboardType="numeric"
            placeholder="Enter your weight"
            placeholderTextColor="#B5B0B0"
            value={userWeight !== null ? String(userWeight) : ""}
            onChangeText={(text) => {
              const parsed = parseFloat(text);
              setUserWeight(isNaN(parsed) ? null : parsed);
            }}
          />
        </View>

        {/* ZIPCODE */}
        <View style={tw`w-full mb-8`}>
          <Text style={tw`text-base mb-2`}>What is your zipcode?</Text>
          <TextInput
            style={tw`border bg-gray-100 p-3 rounded w-full`}
            keyboardType="numeric"
            placeholder="Enter your zipcode"
            placeholderTextColor="#B5B0B0"
            value={userZip !== null ? String(userZip) : ""}
            onChangeText={(text) => {
              const parsed = parseFloat(text);
              setUserZip(isNaN(parsed) ? null : parsed);
            }}
          />
        </View>

        {/* SCHEDULE */}
        <View style={tw`w-full mb-4`}>
          <Text style={tw`text-base mb-2`}>Which days are you available?</Text>
          <View style={tw`flex-row flex-wrap justify-center`}>
            {[
              "MONDAY",
              "TUESDAY",
              "WEDNESDAY",
              "THURSDAY",
              "FRIDAY",
              "SATURDAY",
              "SUNDAY",
            ].map((day) => (
              <TouchableOpacity
                key={day}
                style={tw`px-2 py-2 m-1 rounded-full ${
                  selectedDay === day ? "bg-purple-500" : "bg-gray-100"
                }`}
                onPress={() => setSelectedDay(day)}
              >
                <Text
                  style={tw`text-xs ${
                    selectedDay === day ? "text-white" : "text-gray-700"
                  }`}
                >
                  {day.substring(0, 1) + day.substring(1, 3).toLowerCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {timeRanges
          .filter((range) => range.day === selectedDay)
          .map((range, idx) => (
            <View key={idx} style={tw`bg-gray-100 p-3 rounded-lg mb-3 w-full`}>
              <View style={tw`flex-row justify-between items-center`}>
                <Text style={tw`text-sm`}>
                  {range.start} - {range.end}
                </Text>
                <TouchableOpacity onPress={() => handleDeleteTimeRange(idx)}>
                  <Icon name="times" size={16} color="gray" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        <TouchableOpacity
          style={tw`bg-purple-500 py-3 px-8 rounded-full mb-6`}
          onPress={() => setModalVisible(true)}
        >
          <Text style={tw`text-white text-center font-bold`}>
            Add Time Range
          </Text>
        </TouchableOpacity>
        <Modal visible={modalVisible} transparent={true} animationType="slide">
          <View
            style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}
          >
            <View style={tw`bg-white p-6 rounded-lg w-80`}>
              <Text style={tw`text-lg font-bold mb-4`}>Add Time Range</Text>

              <Text style={tw`text-s text-gray-500 mb-2`}>Start Time</Text>
              <View style={tw`flex-row items-center mb-4`}>
                <TextInput
                  style={tw`border p-2 rounded flex-1 mr-2`}
                  placeholder="7:00"
                  placeholderTextColor="#B5B0B0"
                  value={startTime}
                  onChangeText={setStartTime}
                />
                {["AM", "PM"].map((period) => (
                  <TouchableOpacity
                    key={period}
                    onPress={() => setStartTimePeriod(period as "AM" | "PM")}
                    style={tw`border px-3 py-2 rounded-lg mx-1 ${
                      startTimePeriod === period
                        ? "bg-purple-300"
                        : "bg-gray-200"
                    }`}
                  >
                    <Text>{period}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={tw`text-s text-gray-500 mb-2`}>End Time</Text>
              <View style={tw`flex-row items-center mb-6`}>
                <TextInput
                  style={tw`border p-2 rounded flex-1 mr-2`}
                  placeholder="9:00"
                  placeholderTextColor="#B5B0B0"
                  value={endTime}
                  onChangeText={setEndTime}
                />
                {["AM", "PM"].map((period) => (
                  <TouchableOpacity
                    key={period}
                    onPress={() => setEndTimePeriod(period as "AM" | "PM")}
                    style={tw`border px-3 py-2 rounded-lg mx-1 ${
                      endTimePeriod === period ? "bg-purple-300" : "bg-gray-200"
                    }`}
                  >
                    <Text>{period}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Buttons */}
              <View style={tw`flex-row justify-between`}>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={tw`text-red-500`}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const fullStartTime = `${startTime} ${startTimePeriod}`;
                    const fullEndTime = `${endTime} ${endTimePeriod}`;

                    if (
                      !(
                        validateTime(fullStartTime) && validateTime(fullEndTime)
                      )
                    ) {
                      return wrongTimeAlert();
                    }

                    const start = convertTo24Hour(fullStartTime);
                    const end = convertTo24Hour(fullEndTime);

                    if (
                      (start.period === end.period &&
                        (start.hour < end.hour ||
                          (start.hour === end.hour &&
                            start.minute < end.minute))) ||
                      (start.period === "AM" && end.period === "PM")
                    ) {
                      setTimeRanges((prev) => [
                        ...prev,
                        {
                          day: selectedDay,
                          start: fullStartTime,
                          end: fullEndTime,
                        },
                      ]);
                      setModalVisible(false);
                      setStartTime("");
                      setEndTime("");
                    } else {
                      return wrongTimeAlert();
                    }
                  }}
                >
                  <Text style={tw`text-green-500 font-bold`}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* SKILL LEVEL */}
        <View style={tw`w-full mb-8`}>
          <Text style={tw`text-base mb-2`}>
            What is your skill level at the gym?
          </Text>
          <View style={tw`flex-row justify-center`}>
            {["BEGINNER", "INTERMEDIATE", "ADVANCED"].map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setUserSkillLevel(level)}
                style={tw`px-4 py-2 border rounded-lg mx-2 ${
                  level === userSkillLevel ? "bg-purple-300" : "bg-gray-100"
                }`}
              >
                <Text style={tw`text-xs`}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FITNESS GOALS */}
        <View style={tw`w-full mb-8`}>
          <Text style={tw`text-base mb-2`}>
            What are your fitness goals? (Select All That Apply)
          </Text>
          <View style={tw`flex-row flex-wrap justify-center`}>
            {[
              "BUILD_MUSCLE",
              "LOSE_WEIGHT",
              "GAIN_STRENGTH",
              "IMPROVE_ENDURANCE",
              "IMPROVE_OVERALL_HEALTH",
              "IMPROVE_ATHLETIC_PERFORMANCE",
            ].map((goal) => (
              <TouchableOpacity
                key={goal}
                onPress={() => toggleFitnessGoal(goal)}
                style={tw`px-7 py-2 border rounded-lg mx-1 my-1 ${
                  userFitnessGoals.includes(goal)
                    ? "bg-purple-300"
                    : "bg-gray-100"
                }`}
              >
                <Text style={tw`text-xs`}>{formatGoalText(goal)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* START BUTTON */}
        <TouchableOpacity
          style={tw`bg-purple-500 py-4 px-10 rounded-full mb-8`}
          onPress={async () => {
            try {
              for (const range of timeRanges) {
                const startParts = range.start.split(":");
                const endParts = range.end.split(":");

                const startHour = parseInt(startParts[0]);
                const startMinutes = parseInt(startParts[1]);
                const endHour = parseInt(endParts[0]);
                const endMinutes = parseInt(endParts[1]);

                await postUserTimeRange(
                  range.day,
                  startHour,
                  startMinutes,
                  endHour,
                  endMinutes
                );
              }
              updateUserInfo();
              postUserGoals(userFitnessGoals);
              navigation.replace("Home");
            } catch (error) {
              console.error("Failed to submit availability:", error);
            }
          }}
        >
          <Text style={tw`text-white text-lg font-bold`}>Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}
