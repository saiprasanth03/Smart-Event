import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Layout, Type, MapPin, Calendar as CalendarIcon, Clock, Users, Coffee, Award, Rocket, QrCode, Crosshair, Map as MapIcon, X, Save } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix Marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Polygon, Popup } from 'react-leaflet';

const SearchField = ({ setFormData, setMessage }) => {
    const [query, setQuery] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const newCoords = { lat: parseFloat(lat), lng: parseFloat(lon) };
                setFormData(prev => ({
                    ...prev,
                    coordinates: newCoords,
                    location: display_name.split(',')[0]
                }));
                setMessage({ type: 'success', text: `Found: ${display_name.split(',')[0]}` });
            } else {
                setMessage({ type: 'error', text: 'Location not found.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Search failed.' });
        }
    };

    return (
        <form onSubmit={handleSearch} className="absolute top-4 left-14 z-[1000] flex gap-2 w-64 md:w-80">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search coordinates..."
                className="w-full bg-surface/90 backdrop-blur-md border border-text-main/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-xl"
            />
            <button type="submit" className="p-2 bg-primary text-white rounded-xl shadow-lg hover:scale-105 transition-transform">
                <Crosshair size={18} />
            </button>
        </form>
    );
};



const LocationMarker = ({ coordinates, setFormData, showMap }) => {
    const map = useMap();

    useEffect(() => {
        if (coordinates?.lat && coordinates?.lng) {
            map.flyTo([coordinates.lat, coordinates.lng], map.getZoom() || 16);
        }
    }, [coordinates.lat, coordinates.lng, map]);

    useMapEvents({
        click(e) {
            setFormData(prev => ({
                ...prev,
                coordinates: { lat: e.latlng.lat, lng: e.latlng.lng }
            }));
        },
    });

    useEffect(() => {
        if (showMap) {
            const timer = setTimeout(() => {
                map.invalidateSize();
                window.dispatchEvent(new Event('resize'));
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [showMap, map]);

    return (
        <>
            {coordinates.lat && <Marker position={[coordinates.lat, coordinates.lng]} />}
        </>
    );
};

const EditEvent = () => {
    const { eventId } = useParams();
    const [formData, setFormData] = useState({
        name: '',
        type: 'Technical Event',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        maxParticipants: 50,
        foodAvailable: false,
        vegAllowable: true,
        nonVegAllowable: false,
        availableMenuItems: [],
        certificateAvailable: true,
        coordinates: { lat: 17.3850, lng: 78.4867 },
        isTeamEvent: false,
        maxTeamSize: 1,
        maxTeams: 0,
        hodSignature: '',
        principalSignature: '',
        vicePrincipalSignature: ''
    });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [allowedRegion, setAllowedRegion] = useState([]);
    const [newItemText, setNewItemText] = useState('');
    const navigate = useNavigate();

    const drawCreated = (e) => {
        if (e.layerType === 'polygon') {
            const latlngs = e.layer.getLatLngs()[0].map(ll => [ll.lat, ll.lng]);
            setAllowedRegion(latlngs);
        }
    };
    const drawEdited = (e) => {
        e.layers.eachLayer(layer => {
            const latlngs = layer.getLatLngs()[0].map(ll => [ll.lat, ll.lng]);
            setAllowedRegion(latlngs);
        });
    };
    const drawDeleted = () => {
        setAllowedRegion([]);
    };

    const handleAddItem = () => {
        if (newItemText.trim()) {
            setFormData(prev => ({
                ...prev,
                availableMenuItems: [...(prev.availableMenuItems || []), newItemText.trim()]
            }));
            setNewItemText('');
        }
    };

    const handleRemoveItem = (indexToRemove) => {
        setFormData(prev => ({
            ...prev,
            availableMenuItems: (prev.availableMenuItems || []).filter((_, idx) => idx !== indexToRemove)
        }));
    };

    useEffect(() => {
        fetchEvent();
    }, [eventId]);

    const fetchEvent = async () => {
        try {
            const res = await axios.get(`https://smart-event-56qg.onrender.com/api/events/${eventId}`);
            const data = res.data;
            // Format date for input
            if (data.date) data.date = new Date(data.date).toISOString().split('T')[0];
            setFormData(data);
            if (data.allowedRegion) setAllowedRegion(data.allowedRegion);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to load event data.' });
        } finally {
            setLoading(false);
        }
    };

    const detectLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setFormData(prev => ({
                    ...prev,
                    coordinates: { lat: pos.coords.latitude, lng: pos.coords.longitude }
                }));
                setMessage({ type: 'success', text: 'GPS Locked!' });
            }, () => {
                setMessage({ type: 'error', text: 'Location access denied.' });
            });
        }
    };

    const handleImageUpload = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit for signatures
                setMessage({ type: 'error', text: 'Signature image must be under 1MB' });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.put(`https://smart-event-56qg.onrender.com/api/events/${eventId}`, { ...formData, allowedRegion }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMessage({ type: 'success', text: 'Event updated successfully.' });
            setTimeout(() => navigate('/admin/events'), 1500);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Error updating event' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-text-muted">Loading architectural specs...</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-8 py-16">
            <div className="flex items-center gap-4 mb-12">
                <button onClick={() => navigate('/admin/events')} className="p-2 hover:bg-white/5 rounded-full">
                    <X size={24} />
                </button>
                <h2 className="text-4xl font-bold tracking-tight font-display">Edit <span className="gradient-text">Event</span></h2>
            </div>

            {showMap && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
                    <div className="glass-panel w-full max-w-4xl rounded-[2.5rem] border border-text-main/10 overflow-hidden flex flex-col h-[80vh]">
                        <div className="p-6 flex justify-between items-center border-b border-text-main/5">
                            <div className="flex items-center gap-3">
                                <MapIcon className="text-primary" size={24} />
                                <h3 className="text-xl font-bold">Configure Event Space</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <button type="button" onClick={() => setShowMap(false)} className="p-2 hover:bg-text-main/5 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 relative bg-surface-alt min-h-[400px]">
                            <SearchField setFormData={setFormData} setMessage={setMessage} />
                            <MapContainer
                                center={[formData.coordinates.lat || 17.3850, formData.coordinates.lng || 78.4867]}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                                {allowedRegion.length > 0 && (
                                    <Polygon
                                        positions={allowedRegion}
                                        pathOptions={{ color: '#8b5cf6', fillColor: '#8b5cf6', fillOpacity: 0.3 }}
                                    />
                                )}

                                <LocationMarker
                                    coordinates={formData.coordinates}
                                    setFormData={setFormData}
                                    showMap={showMap}
                                />
                            </MapContainer>
                        </div>
                        <div className="p-6 border-t border-text-main/5 flex justify-between items-center bg-surface">
                            <span className="font-mono text-xs">{formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}</span>
                            <button type="button" onClick={() => setShowMap(false)} className="btn-primary py-2 px-6 text-sm">
                                Confirm & Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="glass-panel p-10 md:p-14 rounded-[3rem] border border-text-main/5 shadow-2xl relative overflow-hidden">
                {message && (
                    <div className={`mb-10 p-5 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-300 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                        <p className="font-semibold">{message.text}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Event Master Title</label>
                        <div className="relative group">
                            <Type className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={20} />
                            <input type="text" className="input-field pl-14 py-5 text-lg" placeholder="Event Name" required
                                value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Strategic Category</label>
                            <select className="input-field py-5"
                                value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                <option>Hackathon</option>
                                <option>Workshop</option>
                                <option>Guest Lecture</option>
                                <option>Seminar</option>
                                <option>Technical Event</option>
                                <option>Cultural Event</option>
                            </select>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Physical Location</label>
                            <div className="relative group">
                                <input type="text" className="input-field py-5 pr-32" placeholder="e.g. Hall A-01" required
                                    value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                    <button type="button" onClick={detectLocation} className="p-2.5 bg-white/5 hover:bg-white/10 text-text-muted hover:text-primary rounded-xl transition-all">
                                        <Crosshair size={18} />
                                    </button>
                                    <button type="button" onClick={() => setShowMap(true)} className="p-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl transition-all">
                                        <MapIcon size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Global Capacity</label>
                            <input type="number" className="input-field py-5 text-center text-xl font-bold" min="1"
                                value={formData.maxParticipants} onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })} />
                        </div>
                        <div className="grid grid-cols-3 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Event Date</label>
                                <input type="date" className="input-field py-5" required
                                    value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Start Time</label>
                                <input type="time" className="input-field py-5" required
                                    value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">End Time</label>
                                <input type="time" className="input-field py-5" required
                                    value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Event Description</label>
                        <textarea
                            className="input-field min-h-[160px] py-6 px-7"
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <ToggleCard active={formData.foodAvailable} onClick={() => setFormData({ ...formData, foodAvailable: !formData.foodAvailable })} icon={<Coffee size={18} />} label="Food Buffet" />
                        <ToggleCard active={formData.certificateAvailable} onClick={() => setFormData({ ...formData, certificateAvailable: !formData.certificateAvailable })} icon={<Award size={18} />} label="Certificates" />
                        <ToggleCard active={formData.foodSelectionActive} onClick={() => setFormData({ ...formData, foodSelectionActive: !formData.foodSelectionActive })} icon={<Rocket size={18} />} label="Open Food Choice" />
                    </div>

                    {formData.foodAvailable && (
                        <div className="space-y-4 pt-4 border-t border-text-main/5 animate-in slide-in-from-top-4 duration-300">
                            <h4 className="text-[12px] font-black tracking-widest uppercase text-primary mb-2">Menu Configurator</h4>
                            <div className="flex gap-6 mb-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" className="w-5 h-5 rounded border-text-main/20 text-primary focus:ring-primary bg-surface/50" checked={formData.vegAllowable} onChange={(e) => setFormData({ ...formData, vegAllowable: e.target.checked })} />
                                    <span className="text-sm font-semibold group-hover:text-primary transition-colors">Vegetarian Allowable</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" className="w-5 h-5 rounded border-text-main/20 text-red-500 focus:ring-red-500 bg-surface/50" checked={formData.nonVegAllowable} onChange={(e) => setFormData({ ...formData, nonVegAllowable: e.target.checked })} />
                                    <span className="text-sm font-semibold group-hover:text-primary transition-colors">Non-Vegetarian Allowable</span>
                                </label>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Available Menu Items</label>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        className="input-field py-3 px-4 text-sm flex-1 max-w-lg"
                                        placeholder="e.g., Margarita Pizza"
                                        value={newItemText}
                                        onChange={(e) => setNewItemText(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddItem();
                                            }
                                        }}
                                    />
                                    <button type="button" onClick={handleAddItem} className="btn-primary px-8 rounded-xl font-bold">+ Add</button>
                                </div>
                                <div className="mt-4 space-y-2">
                                    {(!formData.availableMenuItems || formData.availableMenuItems.length === 0) ? (
                                        <p className="text-xs text-text-muted italic flex items-center h-10 px-4 opacity-50">No specific items added.</p>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {formData.availableMenuItems.map((item, idx) => (
                                                <div key={idx} className="bg-text-main/10 text-text-main px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-3 group border border-text-main/5">
                                                    <span>{item}</span>
                                                    <button type="button" onClick={() => handleRemoveItem(idx)} className="text-text-muted hover:text-red-400 opacity-50 group-hover:opacity-100 transition-all">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-6 border-t border-white/5 space-y-6 animate-in fade-in duration-500">
                        <div>
                            <h4 className="text-sm font-bold tracking-widest uppercase text-primary mb-2 flex items-center gap-2"><Award size={16} /> Digital Signatures</h4>
                            <p className="text-[10px] text-text-muted mb-6">Upload clear, transparent PNG signatures for automated certificate generation.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">HOD Signature</label>
                                <div className="relative">
                                    <input type="file" accept="image/*" className="w-full text-xs text-text-muted file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-all border border-white/5 rounded-2xl p-2"
                                        onChange={(e) => handleImageUpload(e, 'hodSignature')} />
                                    {formData.hodSignature && <img src={formData.hodSignature} alt="HOD Preview" className="h-10 mt-3 rounded object-contain bg-white/10 p-1" />}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Principal Signature</label>
                                <div className="relative">
                                    <input type="file" accept="image/*" className="w-full text-xs text-text-muted file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-all border border-white/5 rounded-2xl p-2"
                                        onChange={(e) => handleImageUpload(e, 'principalSignature')} />
                                    {formData.principalSignature && <img src={formData.principalSignature} alt="Prin Preview" className="h-10 mt-3 rounded object-contain bg-white/10 p-1" />}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted ml-1">Vice Principal</label>
                                <div className="relative">
                                    <input type="file" accept="image/*" className="w-full text-xs text-text-muted file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 transition-all border border-white/5 rounded-2xl p-2"
                                        onChange={(e) => handleImageUpload(e, 'vicePrincipalSignature')} />
                                    {formData.vicePrincipalSignature && <img src={formData.vicePrincipalSignature} alt="VP Preview" className="h-10 mt-3 rounded object-contain bg-white/10 p-1" />}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary w-full py-6 text-xl font-bold tracking-[0.1em] shadow-primary/25 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        {loading ? 'Processing...' : 'SAVE CHANGES'} <Save size={24} className="ml-3 inline group-hover:scale-110 transition-transform" />
                    </button>
                </form>
            </div>
        </div>
    );
};

const ToggleCard = ({ active, onClick, icon, label }) => (
    <button
        type="button"
        onClick={onClick}
        className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border ${active ? 'bg-primary/20 border-primary text-white' : 'bg-white/5 border-white/5 text-text-muted hover:bg-white/10'}`}
    >
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
    </button>
);

export default EditEvent;
