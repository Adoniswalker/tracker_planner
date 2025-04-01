export const isValidCoordinates = (coordStr: string): [number, number] | false => {
    const parts = coordStr.split(",").map((part) => part.trim());
    if (parts.length !== 2) return false;
    const lon = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);
    if (
        isNaN(lon) || isNaN(lat) ||
        lat < -90 || lat > 90 ||
        lon < -180 || lon > 180
    ) {
        return false;
    }
    return [lon, lat];
};