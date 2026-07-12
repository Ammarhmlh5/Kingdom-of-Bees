import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Apiary {
    id: string;
    name: string;
    locationLat: number | null;
    locationLng: number | null;
    healthRating?: string;
}

interface LiveApiaryMapProps {
    apiaries: Apiary[];
}

export function LiveApiaryMap({ apiaries }: LiveApiaryMapProps) {
    const center: [number, number] = [24.7136, 46.6753]; // Default to Riyadh

    // Get valid markers - safely check if apiaries is an array
    const markers = Array.isArray(apiaries)
        ? apiaries.filter(a => a.locationLat && a.locationLng)
        : [];

    return (
        <div className="h-full w-full rounded-lg overflow-hidden border border-border/50">
            <MapContainer
                center={center}
                zoom={6}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                {markers.map((apiary) => (
                    <Marker
                        key={apiary.id}
                        position={[Number(apiary.locationLat), Number(apiary.locationLng)]}
                    >
                        <Popup>
                            <div className="text-right font-sans">
                                <h3 className="font-bold text-gray-900">{apiary.name}</h3>
                                <p className="text-xs text-gray-500 mt-1">الحالة: {apiary.healthRating || 'جيدة'}</p>
                                <a href={`/apiary/${apiary.id}`} className="text-[10px] text-primary hover:underline mt-2 block">
                                    عرض التفاصيل
                                </a>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
