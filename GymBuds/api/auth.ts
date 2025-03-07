const BASE_URL = process.env.EXPO_PUBLIC_DB_URL;

export const fetchFunction = async(endpoint:string,options = {}) => {
    console.log("hi",BASE_URL)
    const response = await fetch(`${BASE_URL}/${endpoint}`,options);
    if (!response.ok){
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
};