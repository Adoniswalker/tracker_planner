import {useState} from "react";
import {MapContainer, TileLayer, Polyline} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {isValidCoordinates} from "../helpers/validators.tsx";
// import L from "leaflet";

// const MapUpdater = ({waypoints}) => {
//     const map = useMap();
//     useEffect(() => {
//         if (waypoints.length > 0) {
//             const bounds = L.latLngBounds(waypoints);
//             map.fitBounds(bounds);
//         }
//     }, [waypoints, map]);
//     return null;
// };

export default function Dashboard() {
    const [trip, setTrip] = useState({
        currentLocation: "",
        pickupLocation: "",
        dropoffLocation: "",
        cycleHours: "",
    });
    // const [waypoints, setWaypoints] = useState([]);
    const [route, setRoute] = useState([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTrip({...trip, [e.target.name]: e.target.value});
    };

    const fetchRoute = async (waypoints: { current: [number, number]; pickup: [number, number]; dropoff: [number, number]; }) => {
        const url = `${import.meta.env.VITE_BACKEND_URL}/api/directions/`
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(waypoints)
            });
            const data = await response.json();
            if (data.route.coordinates.length > 0) {
                setRoute(data.route.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]));
            }
        } catch (error) {
            console.error("Error fetching route:", error);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const current = isValidCoordinates(trip.currentLocation);
        const pickup = isValidCoordinates(trip.pickupLocation);
        const dropoff = isValidCoordinates(trip.dropoffLocation)

        if (current && pickup && dropoff) {
            const wayPoints = {current, pickup, dropoff}
            fetchRoute(wayPoints);
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
                <MapContainer center={[-1.2921, 36.8219]} zoom={6} style={{height: "100%", width: "100%"}}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
                    {/*<MapUpdater waypoints={waypoints}/>*/}
                    {/*{waypoints.map((point, index) => (*/}
                    {/*    <Marker key={index} position={point}/>*/}
                    {/*))}*/}
                    {route.length > 1 && <Polyline positions={route} color="blue"/>}
                </MapContainer>
            </div>
        </div>
    );
}
