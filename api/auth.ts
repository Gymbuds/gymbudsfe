import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = process.env.EXPO_PUBLIC_DB_URL;

export const fetchFunctionWithAuth = async(endpoint:string,options) => {
    // await fetchFunction("auth/check-auth",{
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body:
    //     })

    const auth_token =  await AsyncStorage.getItem('userToken');
    const refresh_token = await AsyncStorage.getItem('refreshToken');
    const auth_res = await fetch(`${BASE_URL}/auth/check-auth`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({auth_token}),
    })
    if (auth_res.status == 401){
        console.log("refreshtoken",refresh_token);
        const refresh_res = await fetchFunction('auth/refresh',{
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({refresh_token})
        })
        await AsyncStorage.setItem("userToken", refresh_res.access_token);
    }
    
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
export const fetchFunction = async(endpoint: string, options: any) => {
    const response = await fetch(`${BASE_URL}/${endpoint}`, options);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    // console.log(response.json())
    return response.json();
};