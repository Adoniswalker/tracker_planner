import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const MAPBOX_ACCESS_TOKEN = ""
const MAPBOX_DIRECTIONS_API = "https://api.mapbox.com/directions/v5/mapbox/driving";

const isValidCoordinates = (coordStr) => {
    const parts = coordStr.split(",").map((part) => part.trim());
    if (parts.length !== 2) return false;
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);
    return (
        !isNaN(lat) &&
        !isNaN(lon) &&
        lat >= -90 &&
        lat <= 90 &&
        lon >= -180 &&
        lon <= 180
    );
};

const MapUpdater = ({ waypoints }) => {
    const map = useMap();
    useEffect(() => {
        if (waypoints.length > 0) {
            const bounds = L.latLngBounds(waypoints);
            map.fitBounds(bounds);
        }
    }, [waypoints, map]);
    return null;
};

export default function Dashboard() {
    const [trip, setTrip] = useState({
        currentLocation: "",
        pickupLocation: "",
        dropoffLocation: "",
        cycleHours: "",
    });
    const [waypoints, setWaypoints] = useState([]);
    const [route, setRoute] = useState([]);

    const handleChange = (e) => {
        setTrip({ ...trip, [e.target.name]: e.target.value });
    };

    const fetchRoute = async (waypoints) => {
        const coordinates = waypoints.map(point => point.reverse().join(",")).join(";");
        const url = `${MAPBOX_DIRECTIONS_API}/${coordinates}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.routes.length > 0) {
                setRoute(data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]));
            }
        } catch (error) {
            console.error("Error fetching route:", error);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (
            isValidCoordinates(trip.currentLocation) &&
            isValidCoordinates(trip.pickupLocation) &&
            isValidCoordinates(trip.dropoffLocation)
        ) {
            const current = trip.currentLocation.split(",").map(parseFloat);
            const pickup = trip.pickupLocation.split(",").map(parseFloat);
            const dropoff = trip.dropoffLocation.split(",").map(parseFloat);
            const newWaypoints = [current, pickup, dropoff];
            setWaypoints(newWaypoints);
            fetchRoute(newWaypoints);
        } else {
            alert("One of your locations is invalid");
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-bold mb-4 text-center">Trip Planner</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                {["currentLocation", "pickupLocation", "dropoffLocation"].map((field, index) => (
                    <div key={index}>
                        <label className="block text-gray-700 font-semibold mb-1">
                            {field.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                        </label>
                        <input
                            type="text"
                            name={field}
                            placeholder={`Enter ${field}`}
                            className="border p-2 w-full rounded-md"
                            onChange={handleChange}
                        />
                    </div>
                ))}
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md w-full hover:bg-blue-600">
                    Plan Trip
                </button>
            </form>

            <div className="mt-6 h-64 border rounded-lg overflow-hidden">
                <MapContainer center={[-1.2921, 36.8219]} zoom={6} style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapUpdater waypoints={waypoints} />
                    {waypoints.map((point, index) => (
                        <Marker key={index} position={point} />
                    ))}
                    {route.length > 1 && <Polyline positions={route} color="blue" />}
                </MapContainer>
            </div>
        </div>
    );
}
