import { fetchFunctionWithAuth } from '@/api/auth';

// Fetch all workout logs for the authenticated user
export const fetchWorkoutLogs = async () => {
    try {
      return await fetchFunctionWithAuth("workout_logs", { method: "GET" });
    } catch (error) {
      console.error('Error fetching workout logs:', error);
      throw error;
    }
  };

// Create a new workout log
export const createWorkoutLog = async (workoutLogData: any) => {
  try {
    return await fetchFunctionWithAuth("workout_logs/log", {
      method: "POST",
      body: JSON.stringify(workoutLogData),
    });
  } catch (error) {
    console.error('Error creating workout log:', error);
    throw error;
  }
};

// Update an existing workout log
export const updateWorkoutLog = async (logId: number, workoutLogData: any) => {
  try {
    return await fetchFunctionWithAuth(`workout_logs/log/${logId}`, {
      method: "PUT",
      body: JSON.stringify(workoutLogData),
    });
  } catch (error) {
    console.error('Error updating workout log:', error);
    throw error;
  }
};

// Delete a workout log
export const deleteWorkoutLog = async (logId: number) => {
  try {
    return await fetchFunctionWithAuth(`workout_logs/log/${logId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error('Error deleting workout log:', error);
    throw error;
  }
};
