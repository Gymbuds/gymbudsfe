import { useState, useEffect } from "react";
import AppleHealthKit from "react-native-health"; 

export const userHealthData = () => {
  const [stepCount, setStepCount] = useState(0);
  const [healthKitAvailable, setHealthKitAvailable] = useState(false);

  useEffect(() => {
    const options = {
      permissions: {
        read: [AppleHealthKit.Constants.Permissions.StepCount],
        write: [],
      },
    };

    AppleHealthKit.initHealthKit(options, (err) => {
      if (err) {
        console.log("Error initializing HealthKit: ", err);
        return;
      }
      setHealthKitAvailable(true);
    });
  }, []);

  const fetchHealthData = () => {
    if (!healthKitAvailable) {
      console.log("HealthKit is not available yet");
      return;
    }

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();

    AppleHealthKit.getDailyStepCountSamples(
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      (err, results) => {
        if (err) {
          console.log("Error fetching step count: ", err);
          return;
        }

        const totalSteps = results.reduce((acc, curr) => acc + curr.value, 0);
        setStepCount(totalSteps);
      }
    );
  };

  return { stepCount, fetchHealthData };
};
