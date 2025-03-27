import { fetchFunctionWithAuth } from "@/api/auth";
import { useState, useEffect } from "react";
import AppleHealthKit from "react-native-health";

export const userHealthData = () => {
  const [stepCount, setStepCount] = useState<number | null>(null);
  const [caloriesBurned, setCaloriesBurned] = useState<number | null>(null);
  const [avgHeartRate, setAvgHeartRate] = useState<number | null>(null);
  const [sleepDuration, setSleepDuration] = useState<number | null>(null);
  const [activeMins, setActiveMins] = useState<number | null>(null);
  const [healthKitAvailable, setHealthKitAvailable] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    AppleHealthKit.isAvailable((err, available) => {
      if (available) {
        setHealthKitAvailable(true);
      }
    });
  }, []);

  const requestAuthorization = () => {
    if (!healthKitAvailable) {
      console.log("HealthKit is not available on this device.");
      return;
    }

    const options = {
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

    AppleHealthKit.initHealthKit(options, (err) => {
      if (err) {
        console.log("Error initializing HealthKit: ", err);
        return;
      }

      setHasConsented(true);

      fetchHealthData();
    });
  };

  const fetchHealthData = async () => {
    // if (!hasConsented || !healthKitAvailable) return;

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
              resolve(totalSteps);
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
                (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
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
      setTimeout(() => {
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
    
        // Check if values are properly fetched before sending
        if (
          stepCount !== null &&
          caloriesBurned !== null &&
          avgHeartRate !== null &&
          sleepDuration !== null &&
          activeMins !== null
        ) {
          console.log("Health data validated, sending to backend:", healthData);
          sendHealthDataToBackend(healthData);
        } else {
          console.warn("Incomplete health data, not sending:", healthData);
        }
      }, 1000); // 1-second delay 

    } catch (err) {
      console.error("Error fetching health data:", err);
    }
  };

  const sendHealthDataToBackend = async (healthData: any) => {
    if (!healthKitAvailable) return;

    try {
      await fetchFunctionWithAuth("health_datas/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(healthData),
      });
      console.log("Health data sent successfully");
    } catch (error) {
      console.error("Error sending health data:", error);
    }
  };

  return {
    stepCount,
    caloriesBurned,
    avgHeartRate,
    sleepDuration,
    activeMins,
    hasConsented,
    healthKitAvailable,
    requestAuthorization,
    fetchHealthData,
  };
};
