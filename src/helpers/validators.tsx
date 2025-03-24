async function validateLocation(lat, lon) {
    const apiKey = "YOUR_GOOGLE_MAPS_API_KEY";
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== "OK" || data.results.length === 0) {
            return { valid: false, reason: "Invalid coordinates or location not found" };
        }

        const locationInfo = data.results[0].formatted_address;

        // Check if the location is categorized as "Natural Feature" (which may include oceans)
        const types = data.results[0].types;
        const isOnLand = !types.includes("natural_feature") && !types.includes("ocean");

        return isOnLand
            ? { valid: true, location: locationInfo }
            : { valid: false, reason: "Location is in the ocean" };

    } catch (error) {
        return { valid: false, reason: "API error: " + error.message };
    }
}

// Example Usage
// validateLocation(37.7749, -122.4194).then(console.log);
