
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