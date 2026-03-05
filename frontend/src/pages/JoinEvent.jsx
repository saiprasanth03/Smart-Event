import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Clock, ArrowRight, AlertCircle, Sparkles, Users, Coffee } from 'lucide-react';

const JoinEvent = () => {
    const [eventId, setEventId] = useState('');
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [collegeId, setCollegeId] = useState('');
    const [teamName, setTeamName] = useState('');
    const [teamSize, setTeamSize] = useState(1);
    const [teamMembers, setTeamMembers] = useState([]);
    const [foodPreference, setFoodPreference] = useState('Veg');
    const [selectedMenuItems, setSelectedMenuItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        if (id) {
            setEventId(id.replace(/\s/g, '').toUpperCase());
        }
    }, []);

    // Update team members array when team size changes
    const updateTeamSize = (size) => {
        setTeamSize(size);
        const members = Array.from({ length: size - 1 }, (_, i) => ({
            name: '',
            collegeId: '',
            foodPreference: 'Veg',
            selectedMenuItems: []
        }));
        setTeamMembers(members);
    };

    const handleMemberChange = (index, field, value) => {
        const newMembers = [...teamMembers];
        newMembers[index][field] = value;
        setTeamMembers(newMembers);
    };

    const handleMemberMenuItemToggle = (index, item) => {
        const newMembers = [...teamMembers];
        const currentItems = newMembers[index].selectedMenuItems || [];
        if (currentItems.includes(item)) {
            newMembers[index].selectedMenuItems = currentItems.filter(i => i !== item);
        } else {
            newMembers[index].selectedMenuItems = [...currentItems, item];
        }
        setTeamMembers(newMembers);
    };

    const handleMenuItemToggle = (item) => {
        if (selectedMenuItems.includes(item)) {
            setSelectedMenuItems(selectedMenuItems.filter(i => i !== item));
        } else {
            setSelectedMenuItems([...selectedMenuItems, item]);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`https://smart-event-56qg.onrender.com/api/events/${eventId}`);
            setEvent(res.data);
            if (res.data.isTeamEvent) updateTeamSize(2);
        } catch (err) {
            setError('Event not found. Please check the ID.');
            setEvent(null);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!collegeId) {
            setError('College/Office ID is required for registration.');
            return;
        }

        // Validate team member details
        if (event.isTeamEvent) {
            if (!teamName) {
                setError('A Team Name is required for this event.');
                return;
            }
            const missing = teamMembers.some(m => !m.name || !m.collegeId);
            if (missing) {
                setError('Please provide Name and College ID for all team members.');
                return;
            }
        }

        setLoading(true);
        setError('');
        try {
            await axios.post('https://smart-event-56qg.onrender.com/api/registrations/register', {
                eventId,
                collegeId,
                teamName: event.isTeamEvent ? teamName : undefined,
                foodPreference,
                selectedMenuItems,
                teamSize: event.isTeamEvent ? teamSize : 1,
                teamMembers: event.isTeamEvent ? teamMembers : []
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            navigate('/dashboard');
        } catch (err) {
            console.error('Registration failure details:', err.response?.data);
            const serverErrorMessage = err.response?.data?.error ? `Server details: ${err.response.data.error}` : null;
            setError(serverErrorMessage || err.response?.data?.message || 'Registration failed - please try a different College ID or contact support');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-16">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold tracking-tight mb-4">Discover your next <span className="gradient-text">Experience</span></h2>
                <p className="text-text-muted font-light">Enter a unique Event ID provided by organizers to join the ecosystem.</p>
            </div>

            <div className="glass-panel p-8 rounded-[2rem] max-w-xl mx-auto mb-12 border border-text-main/5">
                <form onSubmit={handleSearch} className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            className="input-field pl-12"
                            placeholder="Enter Event ID (e.g. AB123)"
                            value={eventId}
                            onChange={(e) => setEventId(e.target.value.replace(/\s/g, '').toUpperCase())}
                        />
                    </div>
                    <button type="submit" className="btn-primary px-8">Search</button>
                </form>
            </div>

            {error && (
                <div className="bg-red-500/10 text-red-400 p-4 rounded-xl max-w-xl mx-auto mb-8 border border-red-500/20 flex items-center gap-3 animate-in shake duration-500">
                    <AlertCircle size={18} />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {event && (
                <div className="glass-panel p-10 rounded-[2.5rem] border border-text-main/5 shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl pointer-events-none" />

                    <div className="flex flex-col md:flex-row justify-between gap-10">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20">
                                    {event.type}
                                </div>
                                {event.isTeamEvent && (
                                    <div className="inline-block bg-secondary/10 text-secondary px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-secondary/20">
                                        Team Event
                                    </div>
                                )}
                            </div>
                            <h3 className="text-3xl font-bold mb-4">{event.name}</h3>
                            <p className="text-text-muted mb-8 leading-relaxed font-light">{event.description}</p>

                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <InfoItem icon={<Calendar size={18} />} label="Date" value={new Date(event.date).toLocaleDateString()} />
                                <InfoItem icon={<Clock size={18} />} label="Time" value={`${event.startTime} - ${event.endTime}`} />
                                <InfoItem icon={<MapPin size={18} />} label="Location" value={event.location} />
                                <InfoItem icon={<Users size={18} />} label="Capacity" value={`${event.maxParticipants} max`} />
                            </div>

                            {event.foodAvailable && event.availableMenuItems && event.availableMenuItems.length > 0 && (
                                <div className="mb-8 p-6 bg-primary/5 border border-primary/10 rounded-2xl animate-in slide-in-from-left-4 duration-500">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Coffee size={18} className="text-primary" />
                                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Catering Specifications</h4>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Available Options</span>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {event.availableMenuItems.map((item, idx) => (
                                                    <span key={idx} className="bg-surface border border-text-main/10 px-3 py-1.5 rounded-lg text-xs font-semibold text-text-main">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="md:w-72 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">College / Office ID</label>
                                    <input
                                        type="text"
                                        className="input-field py-3 text-sm"
                                        placeholder="e.g. EMP-123456"
                                        value={collegeId}
                                        onChange={(e) => setCollegeId(e.target.value)}
                                    />
                                </div>

                                {event.foodAvailable && (
                                    <div className="space-y-4 pt-4 border-t border-text-main/5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Your Food Preference</label>
                                        <div className="flex bg-text-main/5 p-1 rounded-xl">
                                            {event.vegAllowable && (
                                                <button
                                                    onClick={() => setFoodPreference('Veg')}
                                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${foodPreference === 'Veg' ? 'bg-green-500 text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                                                >
                                                    Vegetarian
                                                </button>
                                            )}
                                            {event.nonVegAllowable && (
                                                <button
                                                    onClick={() => setFoodPreference('Non-Veg')}
                                                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${foodPreference === 'Non-Veg' ? 'bg-red-500 text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                                                >
                                                    Non-Veg
                                                </button>
                                            )}
                                        </div>

                                        {event.availableMenuItems && event.availableMenuItems.length > 0 && (
                                            <div className="mt-4 pt-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1 block mb-3">Select Specific Items</label>
                                                <div className="grid gap-2">
                                                    {event.availableMenuItems.map((item, idx) => (
                                                        <label key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-text-main/5 bg-surface/50 cursor-pointer hover:bg-surface transition-colors group">
                                                            <div className="relative flex items-center justify-center">
                                                                <input
                                                                    type="checkbox"
                                                                    className="w-5 h-5 rounded border-text-main/20 text-primary focus:ring-primary bg-surface/50 accent-primary"
                                                                    checked={selectedMenuItems.includes(item)}
                                                                    onChange={() => handleMenuItemToggle(item)}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors">{item}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {event.isTeamEvent && (
                                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                                        <div className="space-y-4 pt-4 border-t border-text-main/5">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Team Identity</label>
                                            <input
                                                type="text"
                                                className="input-field py-3 text-sm"
                                                placeholder="e.g. Code Ninjas"
                                                value={teamName}
                                                onChange={(e) => setTeamName(e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted ml-1">Team Size</label>
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="range"
                                                    min="2"
                                                    max={event.maxTeamSize || 10}
                                                    value={teamSize}
                                                    onChange={(e) => updateTeamSize(parseInt(e.target.value))}
                                                    className="flex-1 accent-primary"
                                                />
                                                <span className="font-mono font-bold bg-white/5 px-3 py-1 rounded-lg border border-white/5">{teamSize}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-text-main/5">
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Member Details</p>
                                            {teamMembers.map((member, idx) => (
                                                <div key={idx} className="space-y-3 p-4 rounded-2xl bg-text-main/5 border border-text-main/5">
                                                    <p className="text-[9px] font-bold text-text-muted uppercase">Member {idx + 2}</p>
                                                    <input
                                                        type="text"
                                                        placeholder="Full Name"
                                                        className="input-field py-2.5 text-xs"
                                                        value={member.name}
                                                        onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="College/Office ID"
                                                        className="input-field py-2.5 text-xs"
                                                        value={member.collegeId}
                                                        onChange={(e) => handleMemberChange(idx, 'collegeId', e.target.value)}
                                                    />
                                                    {event.foodAvailable && (
                                                        <div className="space-y-4">
                                                            <div className="flex bg-black/10 p-1 rounded-lg">
                                                                {event.vegAllowable && (
                                                                    <button
                                                                        onClick={() => handleMemberChange(idx, 'foodPreference', 'Veg')}
                                                                        className={`flex-1 py-1 rounded-[6px] text-[9px] font-bold transition-all ${member.foodPreference === 'Veg' ? 'bg-green-500 text-white' : 'text-text-muted'}`}
                                                                    >
                                                                        Veg
                                                                    </button>
                                                                )}
                                                                {event.nonVegAllowable && (
                                                                    <button
                                                                        onClick={() => handleMemberChange(idx, 'foodPreference', 'Non-Veg')}
                                                                        className={`flex-1 py-1 rounded-[6px] text-[9px] font-bold transition-all ${member.foodPreference === 'Non-Veg' ? 'bg-red-500 text-white' : 'text-text-muted'}`}
                                                                    >
                                                                        Non-Veg
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {event.availableMenuItems && event.availableMenuItems.length > 0 && (
                                                                <div className="mt-4 pt-2 border-t border-text-main/5">
                                                                    <label className="text-[9px] font-bold uppercase tracking-widest text-text-muted ml-1 block mb-2">Select Items</label>
                                                                    <div className="flex flex-col gap-2">
                                                                        {event.availableMenuItems.map((item, itemIdx) => (
                                                                            <label key={itemIdx} className="flex items-center gap-2 cursor-pointer">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    className="w-4 h-4 rounded border-text-main/20 accent-primary"
                                                                                    checked={(member.selectedMenuItems || []).includes(item)}
                                                                                    onChange={() => handleMemberMenuItemToggle(idx, item)}
                                                                                />
                                                                                <span className="text-xs font-semibold text-text-main">{item}</span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleRegister}
                                disabled={loading}
                                className="btn-primary w-full py-5 text-lg group shadow-xl"
                            >
                                {loading ? 'Processing...' : 'Secure My Spot'} <ArrowRight className="group-hover:translate-x-1 transition-transform ml-2" />
                            </button>
                            <div className="flex items-center justify-center gap-2 text-[10px] text-text-muted uppercase tracking-widest">
                                <Sparkles size={12} className="text-primary" />
                                <span>Blockchain-secured ticket</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-text-main/5 flex items-center justify-center text-primary">
            {icon}
        </div>
        <div>
            <p className="text-[10px] text-text-muted uppercase tracking-widest leading-none mb-1">{label}</p>
            <p className="font-semibold text-sm">{value}</p>
        </div>
    </div>
);

export default JoinEvent;
