import { motion } from 'framer-motion';
import { ArrowLeft, Navigation, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { getMissionImageUrls } from '@/lib/utils';
import { useMissionStore } from '@/store/useMissionStore';

// Create custom icons using divIcon
const createCustomIcon = (price: number) => {
  const htmlElement = document.createElement('div');
  htmlElement.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; transform: translate(-50%, -100%); width: max-content;">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#2563eb" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      <div style="background: white; padding: 2px 6px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); font-weight: bold; font-size: 12px; margin-top: -4px; border: 1px solid #e2e8f0; color: #0f172a;">
        ${price}€
      </div>
    </div>
  `;
  return L.divIcon({
    html: htmlElement.innerHTML,
    className: '',
    iconSize: [0, 0], // Anchor point is 0,0 since we translate in HTML
    iconAnchor: [0, 0]
  });
};

export function NearbyMapScreen() {
  const navigate = useNavigate();
  const { missions, fetchMissions } = useMissionStore();

  useEffect(() => {
    fetchMissions();
  }, []);

  // For demonstration, map centers on a fixed position, 
  // but markers take lat/lng (randomizing slightly around center if null to simulate)
  const centerLat = 48.8606;
  const centerLng = 2.3376;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-gray-100 relative"
    >
      {/* Real Map Background */}
      <div className="absolute inset-0 z-0">
         <MapContainer center={[centerLat, centerLng]} zoom={15} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
               url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            {missions.map((mission, index) => {
              // Mock random coordinate around center if missing
              const lat = mission.latitude || centerLat + (Math.random() - 0.5) * 0.01;
              const lng = mission.longitude || centerLng + (Math.random() - 0.5) * 0.01;
              
              return (
                <Marker key={mission.id} position={[lat, lng]} icon={createCustomIcon(mission.budget)}>
                  <Popup>
                    <div className="font-bold text-slate-900">{mission.title}</div>
                    <div className="text-sm font-medium text-slate-600">{mission.budget}€</div>
                  </Popup>
                </Marker>
              );
            })}
            
            {/* User Location Marker */}
            <Marker position={[centerLat - 0.001, centerLng - 0.002]} icon={L.divIcon({
              html: `<div class="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg before:content-[''] before:absolute before:w-12 before:h-12 before:bg-blue-500/30 before:rounded-full before:-top-3 before:-left-3 before:animate-ping" style="transform: translate(-50%, -50%);"></div>`,
              className: '',
              iconSize: [0, 0],
              iconAnchor: [0, 0]
            })} />
         </MapContainer>
      </div>

      <div className="px-6 pt-12 pb-4 z-10 flex gap-4 items-center pointer-events-none">
        <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 active:scale-95 transition-transform text-slate-600 pointer-events-auto">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 bg-white rounded-xl h-12 flex items-center px-4 shadow-sm border border-slate-200 text-sm font-bold text-slate-900">
           Paris 11e Arr.
        </div>
        <button className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 active:scale-95 transition-transform text-slate-600 pointer-events-auto">
          <SlidersHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute bottom-24 w-full z-10 pointer-events-none">
        <div className="flex overflow-x-auto gap-4 px-6 pb-4 snap-x snap-mandatory hide-scroll pointer-events-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
           {missions.map((mission) => {
             const missionImages = getMissionImageUrls(mission);

             return (
             <div key={mission.id} onClick={() => navigate(`/mission/${mission.id}`)} className="bg-white rounded-2xl p-5 shadow-lg border border-slate-200 min-w-[280px] w-[85%] shrink-0 snap-center flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow">
                 {missionImages.length > 0 && (
                   <div className="w-full h-28 overflow-hidden rounded-xl bg-slate-100">
                     <img src={missionImages[0]} alt={mission.title} className="w-full h-full object-cover" />
                   </div>
                 )}
                 <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 text-base line-clamp-1">{mission.title}</h3>
                    <span className="font-bold text-slate-900">{mission.budget}€</span>
                 </div>
                 <p className="text-xs text-slate-500 line-clamp-2 font-medium">{mission.description}</p>
                 <div className="flex items-center gap-1 mt-1 pt-3 border-t border-slate-100 text-xs text-slate-600 font-bold">
                    <Navigation className="w-4 h-4 text-blue-600" />
                    <span className="capitalize">{mission.category}</span>
                    <span className="text-slate-300 mx-1">•</span>
                    <span>À proximité</span>
                 </div>
             </div>
           )})}
        </div>
      </div>
    </motion.div>
  );
}
