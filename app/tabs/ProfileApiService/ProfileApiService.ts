
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
