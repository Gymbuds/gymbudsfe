
import { fetchFunctionWithAuth } from '@/api/auth';

// Fetch user profile data
export const fetchUserProfile = async () => {
  try {
    return await fetchFunctionWithAuth("users/profile", { method: "GET" });
  } catch (error) {
    console.error('Error fetching profile data:', error);
    throw error;
  }
};
export const fetchUserHealthDatas = async() =>{
  try{
    const res =  await fetchFunctionWithAuth("health_datas",{method:"GET"});
    console.log(res)
    return res
  }
  catch (error){
    console.error("Error fetching User's Health Data",error);
    throw error;
  }
}
export const postUserGoals = async (goals: string[]) => {
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
export const fetchUserGoals = async () => {
  try {
    const response = await fetchFunctionWithAuth("user_goal/goals", {
      method: "GET",
    });
    return response; // should be an array like ["BUILD_MUSCLE", "GAIN_STRENGTH"]
  } catch (error) {
    console.error("Failed to fetch user goals:", error)
  }
};