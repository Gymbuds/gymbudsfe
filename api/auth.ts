import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_DB_URL;

export const fetchFunctionWithAuth = async(endpoint:string,options) => {

    let auth_token =  await AsyncStorage.getItem('userToken');
    const refresh_token = await AsyncStorage.getItem('refreshToken');
    const auth_res = await fetch(`${BASE_URL}/auth/check-auth`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({auth_token}),
    })
    if (auth_res.status == 401){
        const refresh_res = await fetchFunction('auth/refresh',{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({refresh_token})
        })
        await AsyncStorage.setItem("userToken", refresh_res.access_token);
    }
    auth_token =  await AsyncStorage.getItem('userToken');
    const headers = {
        'Content-Type':'application/json',
        ...(auth_token && { 'Authorization': `Bearer ${auth_token}` }),
        ...options?.headers,
    }
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
        ...options,
        headers,
    });
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
};
export const fetchFunction = async (endpoint: string, options: any) => {
    const response = await fetch(`${BASE_URL}/${endpoint}`, options);
  
    if (!response.ok) {
      let errorMessage = `HTTP error! Status: ${response.status}`;
      try {
        const data = await response.json();
        if (data?.detail) errorMessage = data.detail;
      } catch {}
      throw new Error(errorMessage);
    }
    return await response.json();
  };