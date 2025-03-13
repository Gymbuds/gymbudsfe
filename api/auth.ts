const BASE_URL = process.env.EXPO_PUBLIC_DB_URL;

export const fetchFunction = async(endpoint:string,options) => {
    const accessToken =  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwiZXhwIjoxNzQxODM4NzYwfQ.CvC2qM27klGWe4diLSgkpYIpgk60WZim_WK3kCxhSsI' // WE need to make a function 
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