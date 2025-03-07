const BASE_URL = "http://127.0.0.1:8000";

export const fetchFunction = async(endpoint:string,options = {}) => {
    const response = await fetch(`${BASE_URL}/${endpoint}`,options);
    if (!response.ok){
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
};