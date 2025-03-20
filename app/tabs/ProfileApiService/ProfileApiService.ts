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

// Upload new profile picture
export const uploadProfilePicture = async (imageData: any) => {
  const formData = new FormData();
  formData.append('profilePicture', imageData);

  try {
    const response = await fetchFunctionWithAuth('user/profile_picture', {
      method: 'POST',
      body: formData,
    });
    
    return response; // Returns the updated profile picture URL
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};