import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Users, Plus, Layout, ArrowRight, Star, ExternalLink, QrCode, Trash2, Edit, Award, Settings, CheckCircle, XCircle } from 'lucide-react';

const EventManagement = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [awardsModalOpen, setAwardsModalOpen] = useState(false);
    const [selectedEventForAwards, setSelectedEventForAwards] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/events');
            setEvents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (eventId) => {
        if (window.confirm('Are you sure you want to delete this event? This will also remove all registrations and cannot be undone.')) {
            try {
                await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                fetchEvents();
            } catch (err) {
                alert(err.response?.data?.message || 'Error deleting event');
            }
        }
    };

    const toggleFeature = async (eventId, feature) => {
        try {
            const res = await axios.patch(`http://localhost:5000/api/events/${eventId}/toggle-${feature}`, {}, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            // Immediately update local state without needing a refresh or second network request
            if (res.data.event) {
                setEvents(prevEvents => prevEvents.map(e => e.eventId === eventId ? res.data.event : e));
            } else {
                fetchEvents();
            }
        } catch (err) {
            alert(err.response?.data?.message || `Error toggling ${feature}`);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-text-muted animate-pulse">Retrieving Ecosystem Events...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight mb-2">Event <span className="gradient-text">Architecture</span></h2>
                    <p className="text-text-muted font-light">Monitor and manage all university engagements from one command center.</p>
                </div>
                <button
                    onClick={() => navigate('/admin/create-event')}
                    className="btn-primary py-3 px-6 shadow-primary/20 shadow-xl"
                >
                    <Plus size={20} /> Launch New Event
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map((event) => {
                    const eventCreatorId = event.createdBy?._id || event.createdBy;
                    const isOwner = eventCreatorId && user && (eventCreatorId === user.id || eventCreatorId === user._id);

                    return (
                        <div key={event._id} className="glass-card p-8 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all group flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6 w-full">
                                <div className="flex flex-col gap-2">
                                    <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit">
                                        {event.type}
                                    </div>
                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded w-fit">
                                        Creator: {event.createdBy?.name || 'Unknown'}
                                    </span>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span className="text-[10px] font-mono font-bold text-text-muted uppercase tracking-widest bg-white/5 px-2 py-1 rounded">
                                        ID: {event.eventId}
                                    </span>
                                    {isOwner && (
                                        <button
                                            onClick={() => handleDelete(event.eventId)}
                                            className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                            title="Delete Event"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2">{event.name}</h3>

                            <div className="space-y-4 mb-8 flex-1">
                                <EventDetail icon={<Calendar size={16} />} text={new Date(event.date).toLocaleDateString()} />
                                <EventDetail icon={<MapPin size={16} />} text={event.location} />
                                <EventDetail icon={<Users size={16} />} text={`${event.maxParticipants} Capacity`} />
                            </div>

                            {/* Toggles (Owner Only) */}
                            {isOwner && (
                                <div className="mb-6 bg-black/20 p-4 rounded-xl space-y-3 border border-white/5">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] font-bold uppercase tracking-widest gap-2">
                                        <span className="text-text-muted flex items-center gap-2"><CheckCircle size={12} /> Attendance Tracking</span>
                                        <button
                                            onClick={() => toggleFeature(event.eventId, 'attendance')}
                                            className={`px-3 py-1 rounded-full flex items-center gap-1 transition-all w-full sm:w-auto justify-center ${event.attendanceActive !== false ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                                        >
                                            {event.attendanceActive !== false ? <><CheckCircle size={10} /> Active</> : <><XCircle size={10} /> Disabled</>}
                                        </button>
                                    </div>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] font-bold uppercase tracking-widest gap-2">
                                        <span className="text-text-muted flex items-center gap-2"><Award size={12} /> Certificates</span>
                                        <button
                                            onClick={() => toggleFeature(event.eventId, 'certificates')}
                                            className={`px-3 py-1 rounded-full flex items-center gap-1 transition-all w-full sm:w-auto justify-center ${event.certificateAvailable ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                                        >
                                            {event.certificateAvailable ? <><CheckCircle size={10} /> Active</> : <><XCircle size={10} /> Disabled</>}
                                        </button>
                                    </div>
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] font-bold uppercase tracking-widest gap-2">
                                        <span className="text-text-muted flex items-center gap-2"><Star size={12} /> Feedback Form</span>
                                        <button
                                            onClick={() => toggleFeature(event.eventId, 'feedback')}
                                            className={`px-3 py-1 rounded-full flex items-center gap-1 transition-all w-full sm:w-auto justify-center ${event.feedbackAvailable ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                                        >
                                            {event.feedbackAvailable ? <><CheckCircle size={10} /> Active</> : <><XCircle size={10} /> Disabled</>}
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => { setSelectedEventForAwards(event); setAwardsModalOpen(true); }}
                                        className="w-full mt-2 py-2 btn-glass text-blue-400 border-blue-400/20 hover:bg-blue-400/10 text-[9px] font-bold uppercase tracking-widest flex justify-center items-center gap-2 transition"
                                    >
                                        <Users size={12} /> View Participants & Awards
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-col xl:grid xl:grid-cols-2 gap-3 mt-auto">
                                <button
                                    onClick={() => navigate(`/admin?eventId=${event._id}`)}
                                    className="btn-glass py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                    title="View Analytics"
                                >
                                    <Layout size={14} /> Analytics
                                </button>
                                {isOwner && (
                                    <button
                                        onClick={() => navigate(`/admin/edit-event/${event.eventId}`)}
                                        className="btn-glass py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:text-primary transition-colors"
                                        title="Edit Event Details"
                                    >
                                        <Edit size={14} /> Edit
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate(`/admin/display-qr/${event.eventId}`)}
                                    className={`btn-primary py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 ${!isOwner ? 'col-span-2' : ''}`}
                                    title="Show Attendance QR"
                                >
                                    <QrCode size={14} /> Display QR
                                </button>
                                <button
                                    onClick={() => navigate(`/admin/scanner`)}
                                    className="btn-glass col-span-2 py-2.5 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                    title="Open Scanner"
                                >
                                    <ExternalLink size={14} /> Entry Scanner Node
                                </button>
                            </div>
                        </div>
                    );
                })}

                {events.length === 0 && (
                    <div className="col-span-full py-24 text-center glass-panel rounded-[2.5rem] border-dashed border-2 border-white/10">
                        <Plus className="mx-auto text-text-muted mb-4 opacity-20" size={48} />
                        <h4 className="text-xl font-bold text-text-muted">No events launched yet</h4>
                        <p className="text-text-muted text-sm font-light mt-2">Start by creating your first university engagement.</p>
                    </div>
                )}
            </div>

            {awardsModalOpen && selectedEventForAwards && (
                <AwardsModal event={selectedEventForAwards} onClose={() => { setAwardsModalOpen(false); setSelectedEventForAwards(null); }} />
            )}
        </div>
    );
};

const AwardsModal = ({ event, onClose }) => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/registrations/event-registrations/${event.eventId}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setRegistrations(res.data);
            } catch (err) {
                alert(err.response?.data?.message || 'Error fetching teams');
            } finally {
                setLoading(false);
            }
        };
        fetchRegistrations();
    }, [event.eventId]);

    const handleAssignAward = async (regId, award) => {
        setProcessing(true);
        try {
            await axios.post('http://localhost:5000/api/registrations/assign-award', {
                registrationId: regId,
                award: award
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setRegistrations(prev => prev.map(r => r._id === regId ? { ...r, award } : r));
        } catch (err) {
            alert(err.response?.data?.message || 'Error assigning award');
        } finally {
            setProcessing(false);
        }
    };

    const filteredRegs = registrations.filter(r => r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[2000] flex items-center justify-center p-6">
            <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl shadow-primary/20">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-3xl font-bold flex items-center gap-3"><Users className="text-blue-400" size={32} /> Participants & Details</h3>
                        <p className="text-text-muted text-sm mt-1">{event.name}</p>
                    </div>
                    <button onClick={onClose} className="text-text-muted hover:text-white p-2 bg-white/5 rounded-full"><Plus size={24} className="rotate-45" /></button>
                </div>

                <input
                    type="text"
                    placeholder="Search by team leader name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none transition-colors mb-6"
                />

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2 border-t border-white/5 pt-4">
                    {loading ? (
                        <p className="text-center text-text-muted py-8 flex flex-col items-center gap-3"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />Loading teams...</p>
                    ) : filteredRegs.length === 0 ? (
                        <p className="text-center text-text-muted py-8">No participants found.</p>
                    ) : (
                        filteredRegs.map(reg => (
                            <div key={reg._id} className="bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-primary/20 transition-all flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                <div>
                                    <h5 className="font-bold tracking-tight text-lg">{reg.user?.name} {reg.teamSize > 1 && <span className="text-primary text-xs ml-2 bg-primary/10 px-2 py-0.5 rounded-full">+ {reg.teamMembers?.length || reg.teamSize - 1} members</span>}</h5>
                                    <p className="text-[10px] text-text-muted mt-2 font-mono uppercase tracking-widest bg-white/5 inline-block px-2 py-1 rounded">ID: {reg.collegeId}</p>

                                    <div className="mt-4 space-y-3 bg-black/30 p-4 rounded-xl border border-white/5">
                                        <h6 className="text-[9px] font-bold uppercase tracking-widest text-primary mb-2">Team Roster & Catering</h6>
                                        <div className="space-y-2">
                                            {/* Primary User Row */}
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-2">
                                                <span className="text-xs font-semibold">{reg.user?.name} <span className="text-[9px] text-text-muted uppercase tracking-widest ml-1">(Leader)</span></span>
                                                <div className="text-[10px] text-text-muted flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded ${reg.foodPreference === 'Veg' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{reg.foodPreference}</span>
                                                    {(reg.selectedMenuItems || []).length > 0 && <span className="text-[9px] italic max-w-[120px] truncate">{reg.selectedMenuItems.join(', ')}</span>}
                                                </div>
                                            </div>

                                            {/* Team Members */}
                                            {reg.teamMembers && reg.teamMembers.map((m, i) => (
                                                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                                    <span className="text-xs font-semibold">{m.name} <span className="text-[9px] text-text-muted uppercase tracking-widest ml-1">({m.collegeId})</span></span>
                                                    <div className="text-[10px] text-text-muted flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded ${m.foodPreference === 'Veg' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{m.foodPreference}</span>
                                                        {(m.selectedMenuItems || []).length > 0 && <span className="text-[9px] italic max-w-[120px] truncate">{m.selectedMenuItems.join(', ')}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 w-full md:w-auto mt-2 md:mt-0">
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-text-muted flex justify-between items-center mb-1">
                                        Attendance:
                                        <span className={`px-2 py-0.5 rounded ml-2 ${reg.attendanceStatus !== 'Registered' ? 'bg-green-500/20 text-green-400' : 'bg-white/5'}`}>{reg.attendanceStatus !== 'Registered' ? 'Attended' : 'Pending'}</span>
                                    </span>
                                    <span className="text-[9px] uppercase font-bold tracking-widest text-text-muted flex justify-between items-center mb-2">
                                        Award:
                                        <span className={`px-2 py-0.5 rounded ml-2 ${reg.award !== 'None' ? 'bg-yellow-400/20 text-yellow-400' : 'bg-white/5'}`}>{reg.award || 'None'}</span>
                                    </span>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAssignAward(reg._id, 'Winners')} disabled={processing} className={`btn-glass text-[9px] font-bold uppercase tracking-widest py-1.5 px-3 flex-1 ${reg.award === 'Winners' ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400' : ''}`}>Winners</button>
                                        <button onClick={() => handleAssignAward(reg._id, '1st Runners')} disabled={processing} className={`btn-glass text-[9px] font-bold uppercase tracking-widest py-1.5 px-3 flex-1 ${reg.award === '1st Runners' ? 'bg-gray-300/20 border-gray-300 text-gray-300' : ''}`}>1st Runners</button>
                                        <button onClick={() => handleAssignAward(reg._id, '2nd Runners')} disabled={processing} className={`btn-glass text-[9px] font-bold uppercase tracking-widest py-1.5 px-3 flex-1 ${reg.award === '2nd Runners' ? 'bg-amber-600/20 border-amber-600 text-amber-500' : ''}`}>2nd Runners</button>
                                        <button onClick={() => handleAssignAward(reg._id, 'None')} disabled={processing} className="btn-glass text-[9px] font-bold uppercase py-1.5 px-3 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white" title="Remove Award"><XCircle size={12} /></button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

const EventDetail = ({ icon, text }) => (
    <div className="flex items-center gap-3 text-text-muted text-sm font-light">
        <div className="text-primary/60">{icon}</div>
        <span>{text}</span>
    </div>
);

export default EventManagement;
