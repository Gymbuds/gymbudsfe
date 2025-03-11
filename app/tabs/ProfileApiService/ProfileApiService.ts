import axios from 'axios';

const API_BASE_URL = 'https://your-backend.com/api';

// Fetch user profile data
export const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/profile`);
      return response.data;
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
      const response = await axios.post(`${API_BASE_URL}/user/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data; // Returns the updated profile picture URL
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  };