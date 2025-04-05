import { fetchFunctionWithAuth } from "@/api/auth";
import { useState, useEffect } from "react";
import { Alert } from "react-native";
import AppleHealthKit from "react-native-health";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const userHealthData = () => {
  const [stepCount, setStepCount] = useState<number>(0);
  const [caloriesBurned, setCaloriesBurned] = useState<number>(0);
  const [avgHeartRate, setAvgHeartRate] = useState<number>(0);
  const [sleepDuration, setSleepDuration] = useState<number>(0);
  const [activeMins, setActiveMins] = useState<number>(0);  
  const [healthKitAvailable, setHealthKitAvailable] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const permissions = {
    permissions: {
      read: [
        AppleHealthKit.Constants.Permissions.StepCount,
        AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
        AppleHealthKit.Constants.Permissions.HeartRate,
        AppleHealthKit.Constants.Permissions.SleepAnalysis,
        AppleHealthKit.Constants.Permissions.AppleExerciseTime,
      ],
      write: [],
    },
  };

  useEffect(() => {
    console.log("Checking if HealthKit is available...");
    AppleHealthKit.isAvailable((err, available) => {
      if (available) {
        console.log("HealthKit is available.");
        setHealthKitAvailable(true);
      } else {
        console.log("HealthKit is NOT available.");
      }
    });
  }, []);

  const requestAuthorization = async () => {
    if (!healthKitAvailable) {
      console.log("HealthKit is not available on this device.");
      return;
    }

    console.log("Requesting HealthKit authorization...");
    AppleHealthKit.initHealthKit(permissions, async (err) => {
      if (err) {
        console.log("Error initializing HealthKit:", err);
        return;
      }
      console.log("HealthKit initialized. Checking authorization...");
      fetchHealthData();
    });
  };

  useEffect(() => {
    console.log("hasConsented updated:", hasConsented);
  }, [hasConsented]);

  const fetchHealthData = async () => {
    console.log("Fetching health data...");
    if (!hasConsented && !healthKitAvailable) return;

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();

    try {
      // Fetch Step Count
      const stepCount = await new Promise<number>((resolve, reject) => {
        AppleHealthKit.getDailyStepCountSamples(
          {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
          (err, results) => {
            if (err) {
              reject("Error fetching step count: " + err);
            } else if (!results || results.length === 0) {
              console.warn("No step count data available.");
              resolve(0); // Default to 0 if no data
            } else {
              const totalSteps = results.reduce(
                (acc, curr) => acc + curr.value,
                0
              );
              resolve(Math.floor(totalSteps));
            }
          }
        );
      });
      setStepCount(stepCount);

      // Fetch Calories Burned
      const caloriesBurned = await new Promise<number>((resolve, reject) => {
        AppleHealthKit.getActiveEnergyBurned(
          {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
          (err, results) => {
            if (err) {
              reject("Error fetching calories burned: " + err);
            } else if (!results || results.length === 0) {
              console.warn("No calorie burn data available.");
              resolve(0); // Default to 0 if no data
            } else {
              const totalCalories = results.reduce(
                (acc, curr) => acc + curr.value,
                0
              );
              resolve(Math.round(totalCalories * 10) / 10); // Round to nearest 10th
            }
          }
        );
      });
      setCaloriesBurned(caloriesBurned);

      // Fetch Heart Rate
      const avgHeartRate = await new Promise<number>((resolve, reject) => {
        AppleHealthKit.getHeartRateSamples(
          {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
          (err, results) => {
            if (err) {
              reject("Error fetching heart rate: " + err);
            } else if (!results.length) {
              console.warn("No heart rate data available.");
              resolve(0); // Default to 0 if no data
            } else {
              const avgRate =
                results.reduce((acc, curr) => acc + curr.value, 0) /
                results.length;
              resolve(Math.round(avgRate));
            }
          }
        );
      });
      setAvgHeartRate(avgHeartRate);

      // Fetch Sleep Duration
      const sleepDuration = await new Promise<number>((resolve, reject) => {
        AppleHealthKit.getSleepSamples(
          {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
          (err, results) => {
            if (err) {
              reject("Error fetching sleep data: " + err);
            } else if (!results.length) {
              console.warn("No sleep data available.");
              resolve(0); // Default to 0 if no data
            } else {
              // Sort sleep data chronologically
              const sortedSleepData = results.sort(
                (a, b) =>
                  new Date(a.startDate).getTime() -
                  new Date(b.startDate).getTime()
              );

              let totalSleepMinutes = 0;
              let lastEndTime = null;

              for (const entry of sortedSleepData) {
                const start = new Date(entry.startDate).getTime();
                const end = new Date(entry.endDate).getTime();

                // Only add non-overlapping sleep durations
                if (!lastEndTime || start >= lastEndTime) {
                  totalSleepMinutes += (end - start) / (1000 * 60);
                } else if (end > lastEndTime) {
                  totalSleepMinutes += (end - lastEndTime) / (1000 * 60);
                }

                lastEndTime = Math.max(lastEndTime || 0, end);
              }

              // Store sleep duration in hours
              resolve(totalSleepMinutes / 60);
            }
          }
        );
      });
      setSleepDuration(sleepDuration);

      // Fetch Active Minutes
      const activeMins = await new Promise<number>((resolve, reject) => {
        AppleHealthKit.getAppleExerciseTime(
          {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
          (err, results) => {
            if (err) {
              reject("Error fetching active minutes: " + err);
            } else if (!results || results.length === 0) {
              console.warn("No active minutes data available.");
              resolve(0); // Default to 0 if no data
            } else {
              // Sort active minutes data chronologically
              const sortedActiveData = results.sort(
                (a, b) =>
                  new Date(a.startDate).getTime() -
                  new Date(b.startDate).getTime()
              );

              let totalActiveMinutes = 0;
              let lastEndTime = null;

              for (const entry of sortedActiveData) {
                const start = new Date(entry.startDate).getTime();
                const end = new Date(entry.endDate).getTime();

                // Convert entry.value from seconds to minutes if needed
                const minutes = entry.value / 60; // Assuming entry.value is in seconds

                // Only add non-overlapping active durations
                if (!lastEndTime || start >= lastEndTime) {
                  totalActiveMinutes += minutes;
                } else if (end > lastEndTime) {
                  totalActiveMinutes += minutes;
                }

                lastEndTime = Math.max(lastEndTime || 0, end);
              }

              resolve(Math.round(totalActiveMinutes)); // Round to the nearest whole minute
            }
          }
        );
      });
      setActiveMins(activeMins);

      // Sending data to backend
      const healthData = {
        steps: stepCount || 0,
        calories_burnt: caloriesBurned || 0,
        avg_heart_rate: avgHeartRate || 0,
        sleep_duration: sleepDuration || 0,
        active_mins: activeMins || 0,
      };

      console.log("Steps:", stepCount);
      console.log("Calories Burnt:", caloriesBurned);
      console.log("Avg Heart Rate:", avgHeartRate);
      console.log("Sleep Duration:", sleepDuration);
      console.log("Active Minutes:", activeMins);

      // Check if all values are 0
      const allValuesZero = Object.values(healthData).every((val) => val === 0);

      if (allValuesZero) {
        console.warn("All health data values are 0. Consent revoked.");
        setHasConsented(false);
        await AsyncStorage.setItem("hasConsented", "false");

        Alert.alert(
          "Permissions Required",
          "Health data permissions are off. Please enable them in Settings.",
          [{ text: "OK" }]
        );

        return; // Do not send data
      }

      console.log("Health data validated, sending to backend:", healthData);
      setHasConsented(true);
      await AsyncStorage.setItem("hasConsented", "true");
      sendHealthDataToBackend(healthData);
    } catch (err) {
      console.error("Error fetching health data:", err);
    }
  };

  const sendHealthDataToBackend = async (healthData: any) => {
    const today = new Date().toISOString().split("T")[0];
    console.log("Checking existing health data for:", today);

    try {
      const response = await fetchFunctionWithAuth(`health_datas/${today}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      console.log("Response object:", response);

      if (response && response.id) {
        await fetchFunctionWithAuth(`health_datas/${response.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(healthData),
        });
        console.log("Updated today's health data.");
      }
    } catch (error) {
      await fetchFunctionWithAuth("health_datas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...healthData, date: today }),
      });
      console.log("Created new health data entry.");
    }
  };

  return {
    stepCount,
    caloriesBurned,
    avgHeartRate,
    sleepDuration,
    activeMins,
    hasConsented,
    setHasConsented,
    healthKitAvailable,
    requestAuthorization,
    fetchHealthData,
  };
};