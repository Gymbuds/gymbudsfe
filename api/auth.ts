import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_DB_URL;

export const fetchFunctionWithAuth = async(endpoint:string,options) => {
    const accessToken =  await AsyncStorage.getItem('userToken')
    const headers = {
        'Content-Type':'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
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
export const fetchFunction = async(endpoint: string, options: any) => {
    const response = await fetch(`${BASE_URL}/${endpoint}`, options);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
};