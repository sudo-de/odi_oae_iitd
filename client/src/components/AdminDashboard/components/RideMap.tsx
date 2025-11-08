import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RideBill } from './RideBills';

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface RideMapProps {
  rides: RideBill[];
}

// IIT Delhi approximate coordinates (center)
const IIT_DELHI_CENTER: [number, number] = [28.5455, 77.1926];

// Location coordinates mapping (approximate positions within IIT Delhi campus)
const LOCATION_COORDINATES: Record<string, [number, number]> = {
  'IIT Main Gate': [28.5455, 77.1926],
  'Adhchini Gate': [28.5400, 77.1950],
  'Jia Sarai Gate': [28.5500, 77.1900],
  'Mehrauli Gate': [28.5350, 77.2000],
  'JNU Gate': [28.5300, 77.1850],
  'IIT Hospital': [28.5430, 77.1880],
  'IIT Market': [28.5440, 77.1910],
  'Dogra Hall': [28.5470, 77.1940],
  'LHC': [28.5460, 77.1930],
  'Himadri Hostel': [28.5480, 77.1950],
  'Kailash Hostel': [28.5490, 77.1960],
  'Nilgiri Hostel': [28.5500, 77.1970],
  'Jwalamukhi Hostel': [28.5510, 77.1980],
  'Karakoram Hostel': [28.5520, 77.1990],
  'Aravali Hostel': [28.5530, 77.2000],
  'Kumaon Hostel': [28.5540, 77.2010],
  'Vindhyachal Hostel': [28.5550, 77.2020],
  'Shivalik Hostel': [28.5560, 77.2030],
  'Zanskar Hostel': [28.5570, 77.2040],
  'Satpura Hostel': [28.5580, 77.2050],
  'Other': [28.5455, 77.1926],
};

// Parse location string to extract from and to locations
const parseLocation = (locationString: string): { from: string; to: string } | null => {
  const arrowMatch = locationString.match(/^(.+?)\s*→\s*(.+)$/);
  if (arrowMatch) {
    return {
      from: arrowMatch[1].trim(),
      to: arrowMatch[2].trim(),
    };
  }
  return null;
};

// Get coordinates for a location, or return default if not found
const getCoordinates = (location: string): [number, number] => {
  return LOCATION_COORDINATES[location] || IIT_DELHI_CENTER;
};

const RideMap: React.FC<RideMapProps> = ({ rides }) => {
  // Process rides to extract routes and location counts
  const mapData = useMemo(() => {
    const routes: Array<{
      from: [number, number];
      to: [number, number];
      count: number;
      rides: RideBill[];
    }> = [];
    const locationCounts = new Map<string, { count: number; rides: RideBill[] }>();

    rides.forEach((ride) => {
      const parsed = parseLocation(ride.location);
      if (parsed) {
        const fromCoords = getCoordinates(parsed.from);
        const toCoords = getCoordinates(parsed.to);

        // Track location usage
        [parsed.from, parsed.to].forEach((loc) => {
          const existing = locationCounts.get(loc);
          if (existing) {
            existing.count++;
            existing.rides.push(ride);
          } else {
            locationCounts.set(loc, { count: 1, rides: [ride] });
          }
        });

        // Find or create route
        const routeKey = `${parsed.from}→${parsed.to}`;
        const existingRoute = routes.find(
          (r) =>
            r.from[0] === fromCoords[0] &&
            r.from[1] === fromCoords[1] &&
            r.to[0] === toCoords[0] &&
            r.to[1] === toCoords[1]
        );

        if (existingRoute) {
          existingRoute.count++;
          existingRoute.rides.push(ride);
        } else {
          routes.push({
            from: fromCoords,
            to: toCoords,
            count: 1,
            rides: [ride],
          });
        }
      }
    });

    return { routes, locationCounts };
  }, [rides]);

  // Calculate bounds to fit all markers
  const bounds = useMemo(() => {
    const allCoords: [number, number][] = [];
    mapData.routes.forEach((route) => {
      allCoords.push(route.from, route.to);
    });
    Array.from(mapData.locationCounts.keys()).forEach((loc) => {
      allCoords.push(getCoordinates(loc));
    });

    if (allCoords.length === 0) {
      return undefined;
    }

    return L.latLngBounds(allCoords);
  }, [mapData]);

  if (rides.length === 0) {
    return (
      <div className="ride-map-container empty">
        <div className="map-placeholder">
          <div className="map-placeholder-icon">🗺️</div>
          <p>No rides to display on map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ride-map-container">
      <MapContainer
        center={IIT_DELHI_CENTER}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        bounds={bounds}
        boundsOptions={{ padding: [50, 50] }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Draw routes */}
        {mapData.routes.map((route, index) => (
          <Polyline
            key={`route-${index}`}
            positions={[route.from, route.to]}
            color={route.count > 5 ? '#dc3545' : route.count > 2 ? '#ffc107' : '#28a745'}
            weight={Math.min(route.count * 2, 8)}
            opacity={0.7}
          >
            <Popup>
              <div className="route-popup">
                <strong>Route</strong>
                <p>Rides: {route.count}</p>
                <p>From: {route.rides[0]?.location.split('→')[0]?.trim()}</p>
                <p>To: {route.rides[0]?.location.split('→')[1]?.trim()}</p>
              </div>
            </Popup>
          </Polyline>
        ))}

        {/* Add markers for locations */}
        {Array.from(mapData.locationCounts.entries()).map(([location, data]) => {
          const coords = getCoordinates(location);
          return (
            <Marker key={location} position={coords}>
              <Popup>
                <div className="location-popup">
                  <strong>{location}</strong>
                  <p>Total Rides: {data.count}</p>
                  <p>Revenue: ₹{data.rides.reduce((sum, r) => sum + r.fare, 0).toFixed(2)}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default RideMap;

