const apiKey = "AIzaSyCv0H_JQ1RwiISCjUMq48rmnBs4FMmUG3A";

export const getCoordinatesFromZip = async (zipCode: string) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${apiKey}`
    );
    const data = await response.json();

    if (data.status === "OK") {
      const location = data.results[0].geometry.location;
      console.log(location.lat, location.lng);
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } else {
      throw new Error(`Geocoding failed: ${data.status}`);
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    return null;
  }
};