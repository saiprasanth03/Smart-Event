import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Html5Qrcode } from 'html5-qrcode';
import { QrCode, Award, Coffee, Search, Calendar, Download, Star, CheckCircle, MapPin, Clock, ArrowRight, Sparkles, Plus, Fingerprint } from 'lucide-react';

const UserDashboard = () => {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('explore');
    const [loading, setLoading] = useState(true);

    const [myEvents, setMyEvents] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
        fetchMyRegistrations();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await axios.get('https://smart-event-56qg.onrender.com/api/events');
            setEvents(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyRegistrations = async () => {
        try {
            const res = await axios.get('https://smart-event-56qg.onrender.com/api/registrations/my-registrations', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setMyEvents(res.data);
        } catch (err) {
            console.error('Error fetching registrations:', err);
        }
    };

    const register = async (eventId) => {
        try {
            await axios.post('https://smart-event-56qg.onrender.com/api/registrations/register', { eventId }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            alert('Confirmed! Your digital ticket is ready in "My Tickets".');
            fetchEvents();
            fetchMyRegistrations();
        } catch (err) {
            alert(err.response?.data?.message || 'Registration failed');
        }
    };

    if (loading && events.length === 0) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-text-muted animate-pulse">Scanning the ecosystem...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight mb-2">My Event <span className="gradient-text">Passport</span></h2>
                    <p className="text-text-muted font-light">Manage your registrations, access tickets, and claim rewards.</p>
                </div>
                <button
                    onClick={() => navigate('/join-event')}
                    className="btn-primary py-3 px-6 shadow-primary/20 shadow-xl flex items-center gap-2"
                >
                    <Plus size={20} /> Join New Event
                </button>
            </div>

            <div className="flex gap-4 mb-8 bg-text-main/5 p-1 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('explore')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'explore' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                >
                    Explore Events
                </button>
                <button
                    onClick={() => setActiveTab('tickets')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'tickets' ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:text-text-main'}`}
                >
                    My Tickets
                </button>
            </div>

            {activeTab === 'explore' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {events.map((evt) => (
                        <div key={evt._id} className="glass-card p-8 rounded-[2rem] border border-white/5 hover:border-primary/20 transition-all group flex flex-col h-full">
                            <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit mb-4">
                                {evt.type}
                            </div>
                            <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors line-clamp-2">{evt.name}</h3>
                            <div className="space-y-4 mb-8 flex-1 text-sm text-text-muted font-light">
                                <div className="flex items-center gap-3"><Calendar size={16} className="text-primary/60" /><span>{new Date(evt.date).toLocaleDateString()}</span></div>
                                <div className="flex items-center gap-3"><MapPin size={16} className="text-primary/60" /><span>{evt.location}</span></div>
                            </div>
                            <div className="mt-auto">
                                <button
                                    onClick={() => navigate(`/join-event?id=${evt.eventId}`)}
                                    className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
                                >
                                    Join Event <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && (
                        <div className="col-span-full py-24 text-center glass-panel rounded-[2.5rem] border-dashed border-2 border-text-main/10">
                            <Calendar className="mx-auto text-text-muted mb-4 opacity-20" size={48} />
                            <h4 className="text-xl font-bold text-text-muted">No events available in the ecosystem</h4>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {myEvents.map((registration) => (
                        <TicketItem
                            key={registration._id}
                            registration={registration}
                            onRefresh={fetchMyRegistrations}
                        />
                    ))}

                    {myEvents.length === 0 && (
                        <div className="col-span-full py-24 text-center glass-panel rounded-[2.5rem] border-dashed border-2 border-text-main/10">
                            <Calendar className="mx-auto text-text-muted mb-4 opacity-20" size={48} />
                            <h4 className="text-xl font-bold text-text-muted">No active registrations</h4>
                            <p className="text-text-muted text-sm font-light mt-2">Explore the events tab to get started.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// New StatusBadge component
const StatusBadge = ({ status }) => {
    let badgeClass = '';
    let badgeText = status;

    switch (status) {
        case 'Registered':
            badgeClass = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            break;
        case 'Attended':
            badgeClass = 'bg-green-500/10 text-green-400 border-green-500/20';
            break;
        case 'RedeemedFood':
            badgeClass = 'bg-green-500/10 text-green-400 border-green-500/20';
            badgeText = 'Attended'; // Display 'Attended' if food is redeemed
            break;
        default:
            badgeClass = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
            break;
    }

    return (
        <span className={`badge ${badgeClass}`}>
            {badgeText}
        </span>
    );
};

const TicketItem = ({ registration, onRefresh }) => {
    const { event, qrTicket, attendanceStatus, foodRedeemed, ticketId } = registration;
    const [loading, setLoading] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [scannerError, setScannerError] = useState(null);
    const [updatingFood, setUpdatingFood] = useState(false);
    const [selectedQr, setSelectedQr] = useState(null);
    const [downloadingCert, setDownloadingCert] = useState(false);
    const navigate = useNavigate();

    const handleDownloadCertificate = async (endpoint, filename) => {
        try {
            setDownloadingCert(true);
            const res = await fetch(`https://smart-event-56qg.onrender.com/api/registrations/${endpoint}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!res.ok) {
                let errData;
                try { errData = await res.json(); } catch (e) { errData = { message: 'Error formatting response' } }
                throw new Error(errData.message || 'Error downloading certificate');
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error(err.message || 'Failed to download certificate');
        } finally {
            setDownloadingCert(false);
        }
    };

    const handleUpdateFood = async (preference, memberIndex = null) => {
        setUpdatingFood(true);
        try {
            await axios.put('https://smart-event-56qg.onrender.com/api/registrations/update-food', {
                ticketId,
                foodPreference: preference,
                teamMemberIndex: memberIndex
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            onRefresh();
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed');
        } finally {
            setUpdatingFood(false);
        }
    };

    useEffect(() => {
        let scanner = null;
        if (showScanner) {
            setTimeout(async () => {
                try {
                    scanner = new Html5Qrcode("participant-scanner");

                    const devices = await Html5Qrcode.getCameras();
                    if (devices && devices.length > 0) {
                        const backCamera = devices.find(d => d.label.toLowerCase().includes('back'));
                        const cameraId = backCamera ? backCamera.id : devices[0].id;

                        await scanner.start(
                            cameraId,
                            { fps: 10, qrbox: { width: 250, height: 250 } },
                            async (decodedText) => {
                                try {
                                    const data = JSON.parse(decodedText);
                                    if (data.type !== 'attendance') throw new Error('Invalid QR type');

                                    setLoading(true);
                                    setScannerError(null);

                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(
                                            (pos) => sendAttendanceRequest(data, pos.coords.latitude, pos.coords.longitude, scanner),
                                            () => sendAttendanceRequest(data, null, null, scanner)
                                        );
                                    } else {
                                        sendAttendanceRequest(data, null, null, scanner);
                                    }
                                } catch (err) {
                                    setScannerError(err.response?.data?.message || 'Invalid or expired QR code');
                                    setLoading(false);
                                }
                            },
                            () => { }
                        );
                    } else {
                        setScannerError("No cameras found.");
                    }
                } catch (err) {
                    setScannerError(`Camera failed: ${err.message || err}`);
                }
            }, 100);
        }
        return () => {
            if (scanner && scanner.isScanning) {
                scanner.stop().then(() => scanner.clear()).catch(console.error);
            }
        };
    }, [showScanner]);

    const sendAttendanceRequest = async (data, lat, lng, scannerInstance) => {
        try {
            await axios.post('https://smart-event-56qg.onrender.com/api/registrations/verify-attendance', {
                eventId: data.eventId,
                dynamicToken: data.dynamicToken,
                method: 'QR',
                userLat: lat,
                userLng: lng
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            if (scannerInstance) scannerInstance.clear();
            setShowScanner(false);
            alert('Attendance verified successfully with Location sync!');
            onRefresh();
        } catch (err) {
            setScannerError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleLocationAttendance = async () => {
        if (!navigator.geolocation) return alert('Geolocation is not supported by your browser');

        setLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                await axios.post('https://smart-event-56qg.onrender.com/api/registrations/verify-attendance', {
                    eventId: event.eventId, // Use unique eventId string
                    method: 'Location',
                    userLat: position.coords.latitude,
                    userLng: position.coords.longitude
                }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                alert('Attendance verified via location!');
                onRefresh();
            } catch (err) {
                alert(err.response?.data?.message || 'Location verification failed');
            } finally {
                setLoading(false);
            }
        }, () => {
            alert('Unable to retrieve your location');
            setLoading(false);
        }, { enableHighAccuracy: true });
    };

    return (
        <div className="glass-card rounded-[2rem] overflow-hidden border border-text-main/5 hover:border-primary/20 transition-all flex flex-col h-full bg-gradient-to-b from-text-main/5 to-transparent">
            {showScanner && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[2000] flex items-center justify-center p-6">
                    <div className="glass-panel p-8 rounded-[2.5rem] border border-text-main/10 max-w-md w-full text-center space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Scan Event QR</h3>
                            <button onClick={() => setShowScanner(false)} className="text-text-muted hover:text-white"><Plus size={24} className="rotate-45" /></button>
                        </div>
                        <div id="participant-scanner" className="rounded-2xl overflow-hidden bg-black/40 border border-text-main/5"></div>
                        {scannerError && <p className="text-red-400 text-xs font-bold animate-pulse">{scannerError}</p>}
                        <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest">Hold your camera over the organizer's QR</p>
                    </div>
                </div>
            )}

            {/* QR View Modal */}
            {selectedQr && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[3000] flex items-center justify-center p-6" onClick={() => setSelectedQr(null)}>
                    <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10 max-w-sm w-full text-center space-y-6 relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedQr(null)} className="absolute top-6 right-6 text-text-muted hover:text-white"><Plus size={24} className="rotate-45" /></button>
                        <h3 className="text-xl font-bold tracking-tight mb-2">Access Token</h3>

                        <div className="bg-white p-4 rounded-3xl mx-auto w-fit shadow-2xl shadow-primary/20">
                            <img src={selectedQr.image} alt="QR Code" className="w-48 h-48 rounded-xl" />
                        </div>

                        <div className="space-y-3 bg-black/40 p-4 rounded-2xl border border-white/5">
                            <div>
                                <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest mb-1">Passholder</p>
                                <p className="text-lg font-bold text-white line-clamp-1">{selectedQr.name}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-white/5 p-2 rounded-xl">
                                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mb-0.5">Ticket ID</p>
                                    <p className="text-xs font-mono font-bold text-primary">{selectedQr.id.substring(0, 8)}</p>
                                </div>
                                <div className="bg-white/5 p-2 rounded-xl">
                                    <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest mb-0.5">Food Choice</p>
                                    <div className="flex flex-col">
                                        <p className={`text-xs font-bold ${selectedQr.food === 'Veg' ? 'text-green-400' : 'text-red-400'}`}>{selectedQr.food}</p>
                                        {selectedQr.items && selectedQr.items.length > 0 && (
                                            <p className="text-[8px] text-text-muted mt-1 leading-tight max-w-[100px] truncate">{selectedQr.items.join(', ')}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest mt-4">Present this to the organizers</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="p-8 border-b border-text-main/5 bg-text-main/5">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col gap-1">
                        <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest w-fit">
                            {event.type}
                        </div>
                        <span className="text-[10px] font-mono font-bold text-primary/60 mt-1 ml-1">ID: {event.eventId}</span>
                    </div>
                    <StatusBadge status={attendanceStatus} />
                </div>
                {registration.teamName && (
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-1">
                        Team: {registration.teamName}
                    </div>
                )}
                <h3 className="text-2xl font-bold mb-2 tracking-tight line-clamp-1">{event.name}</h3>
                <div className="flex items-center gap-2 text-text-muted text-xs font-light">
                    <Calendar size={12} className="text-primary/60" />
                    {new Date(event.date).toLocaleDateString()}
                    <span className="mx-2 opacity-20">|</span>
                    <MapPin size={12} className="text-primary/60" />
                    {event.location}
                </div>
            </div>

            {/* Ticket Content */}
            <div className="p-8 flex-1 flex flex-col items-center justify-center bg-white/[0.02]">
                {attendanceStatus === 'Registered' ? (
                    <div
                        className="relative group cursor-pointer"
                        title="View Full QR"
                        onClick={() => setSelectedQr({ image: qrTicket, name: registration.user.name, id: ticketId, food: registration.foodPreference, items: registration.selectedMenuItems })}
                    >
                        <div className="absolute -inset-4 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all opacity-50" />
                        <img src={qrTicket} alt="QR Ticket" className="w-40 h-40 rounded-2xl border-4 border-white shadow-2xl relative" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 rounded-2xl backdrop-blur-[2px]">
                            <Search className="text-white" size={32} />
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                            <CheckCircle size={32} className="text-green-400 glow" />
                        </div>
                        <p className="text-green-400 font-bold uppercase tracking-widest text-[10px]">Access Verified</p>
                    </div>
                )}
                <p className="text-[10px] text-text-muted mt-6 font-mono uppercase tracking-widest">Entry Ref: {ticketId.substring(0, 8)}</p>
            </div>

            {/* Actions */}
            <div className="p-6 bg-black/20 flex flex-col gap-3">
                {attendanceStatus === 'Registered' ? (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setShowScanner(true)}
                            disabled={loading}
                            className="btn-primary py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <QrCode size={14} /> Scan QR
                        </button>
                        <button
                            onClick={handleLocationAttendance}
                            disabled={loading}
                            className="btn-glass py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <MapPin size={14} /> Location
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {event.certificateAvailable && (
                            <button
                                onClick={() => handleDownloadCertificate(`download-certificate/${registration._id}`, `certificate_${registration._id}.pdf`)}
                                disabled={downloadingCert}
                                className="btn-primary py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                            >
                                {downloadingCert ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Download size={14} />} Certificate
                            </button>
                        )}
                        {event.feedbackAvailable && (
                            <button
                                onClick={() => navigate(`/feedback/${registration.event._id}`)}
                                className="btn-glass py-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 text-secondary border-secondary/20"
                            >
                                <Star size={14} /> Feedback
                            </button>
                        )}
                    </div>
                )}

                {event.foodAvailable && (
                    <div className="mt-2 space-y-3">
                        <div
                            className={`p-3 rounded-xl border flex items-center justify-between transition-colors cursor-pointer ${foodRedeemed ? 'bg-green-500/5 border-green-500/10 text-green-400/60' : 'bg-orange-500/5 border-orange-500/10 text-orange-400 hover:bg-orange-500/10'}`}
                            onClick={() => setSelectedQr({ image: qrTicket, name: registration.user.name, id: ticketId, food: registration.foodPreference, items: registration.selectedMenuItems })}
                            title="View Food QR Code"
                        >
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                                <Coffee size={14} /> Food Token
                            </div>
                            <span className="text-[9px] font-bold uppercase tracking-tighter bg-text-main/5 px-2 py-0.5 rounded flex items-center gap-1">
                                {foodRedeemed ? 'Redeemed' : 'Available'} <QrCode size={10} />
                            </span>
                        </div>

                        {/* Food Menu Selections (Campus Menu) */}
                        <div className="mb-4">
                            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 relative h-full">
                                <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-primary mb-3">Campus Menu items</h5>
                                {event.availableMenuItems && event.availableMenuItems.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {event.availableMenuItems.map((item, idx) => (
                                            <span key={idx} className="bg-surface border border-text-main/10 px-2 py-1.5 rounded-lg text-[10px] font-semibold text-text-main">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-text-muted font-light leading-relaxed">Standard Event Catering</p>
                                )}
                            </div>
                        </div>

                        {/* Personal Food Choice */}
                        <div className="bg-text-main/5 p-4 rounded-xl border border-text-main/5 space-y-3">
                            <div className="flex justify-between items-center bg-black/10 p-2 rounded-lg">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted ml-2">My Preference</span>
                                <div className="flex gap-2">
                                    {event.vegAllowable && (
                                        <button
                                            onClick={() => handleUpdateFood('Veg')}
                                            disabled={foodRedeemed || updatingFood}
                                            className={`px-3 py-1 rounded text-[8px] font-black uppercase transition-all ${registration.foodPreference === 'Veg' ? 'bg-green-500 text-white shadow-lg' : 'bg-white/5 hover:bg-white/10 text-text-muted'}`}
                                        >
                                            Veg
                                        </button>
                                    )}
                                    {event.nonVegAllowable && (
                                        <button
                                            onClick={() => handleUpdateFood('Non-Veg')}
                                            disabled={foodRedeemed || updatingFood}
                                            className={`px-3 py-1 rounded text-[8px] font-black uppercase transition-all ${registration.foodPreference === 'Non-Veg' ? 'bg-red-500 text-white shadow-lg' : 'bg-white/5 hover:bg-white/10 text-text-muted'}`}
                                        >
                                            Non-Veg
                                        </button>
                                    )}
                                </div>
                            </div>

                            {registration.selectedMenuItems && registration.selectedMenuItems.length > 0 && (
                                <div className="px-2">
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted mb-2 block">My Selection</span>
                                    <div className="flex flex-wrap gap-2">
                                        {registration.selectedMenuItems.map(item => (
                                            <span key={item} className="bg-primary/20 text-primary border border-primary/20 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider">{item}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Team Details and Actions */}
                        {registration.teamMembers.length > 0 && (
                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between items-center text-xs mt-3">
                                    <span className="text-[10px] text-text-muted font-mono uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Team Size: {registration.teamSize || registration.teamMembers?.length + 1}</span>
                                    {event.certificateAvailable && (attendanceStatus === 'Attended' || attendanceStatus === 'RedeemedFood') && (
                                        <button
                                            onClick={() => handleDownloadCertificate(`download-team-certificates/${registration._id}`, `${registration.teamName || 'Team'}_certificates.pdf`)}
                                            disabled={downloadingCert}
                                            className="btn-primary py-2 px-3 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 ml-auto"
                                        >
                                            {downloadingCert ? <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Download size={10} />} Bulk Certificates
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                    {registration.teamMembers.map((member, idx) => (
                                        <div key={idx} className="bg-black/20 p-3 rounded-xl flex flex-col gap-3 border border-white/5">
                                            <div className="flex justify-between items-center">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[10px] font-bold line-clamp-1 flex items-center gap-2">
                                                        {member.name}
                                                        {attendanceStatus === 'Registered' ? (
                                                            <span
                                                                onClick={() => setSelectedQr({ image: member.qrImage, name: member.name, id: ticketId, food: member.foodPreference, items: member.selectedMenuItems })}
                                                                className="flex items-center gap-1 text-primary hover:text-white cursor-pointer bg-primary/10 px-1.5 py-0.5 rounded text-[8px] uppercase tracking-widest"
                                                                title="View Member QR"
                                                            >
                                                                <Search size={10} /> View QR
                                                            </span>
                                                        ) : (
                                                            <CheckCircle size={10} className="text-green-400" />
                                                        )}
                                                    </span>
                                                    <span className={`text-[8px] uppercase font-bold tracking-widest ${member.foodRedeemed ? 'text-green-400' : 'text-orange-400'}`}>
                                                        Food: {member.foodRedeemed ? 'Redeemed' : 'Available'}
                                                    </span>
                                                    {member.selectedMenuItems && member.selectedMenuItems.length > 0 && (
                                                        <span className="text-[7px] font-mono text-text-muted max-w-[120px] truncate">
                                                            {member.selectedMenuItems.join(', ')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1 items-end">
                                                    <div className="flex gap-1">
                                                        {event.vegAllowable && (
                                                            <button
                                                                onClick={() => handleUpdateFood('Veg', idx)}
                                                                disabled={member.foodRedeemed || updatingFood}
                                                                className={`px-2 py-1 rounded text-[7px] font-bold uppercase ${member.foodPreference === 'Veg' ? 'bg-green-500 text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                                                            >
                                                                Veg
                                                            </button>
                                                        )}
                                                        {event.nonVegAllowable && (
                                                            <button
                                                                onClick={() => handleUpdateFood('Non-Veg', idx)}
                                                                disabled={member.foodRedeemed || updatingFood}
                                                                className={`px-2 py-1 rounded text-[7px] font-bold uppercase ${member.foodPreference === 'Non-Veg' ? 'bg-red-500 text-white' : 'bg-white/5 text-text-muted hover:bg-white/10'}`}
                                                            >
                                                                Non-Veg
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {event.certificateAvailable && (attendanceStatus === 'Attended' || attendanceStatus === 'RedeemedFood') && (
                                                <div className="mt-3 flex justify-end">
                                                    <button
                                                        onClick={() => handleDownloadCertificate(`download-certificate/${registration._id}?memberToken=${member.qrToken}`, `${member.name.split(' ')[0]}_certificate.pdf`)}
                                                        disabled={downloadingCert}
                                                        className="btn-glass py-1 px-3 text-[9px] font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                                    >
                                                        {downloadingCert ? <div className="w-2 h-2 border-2 border-white/50 border-t-white rounded-full animate-spin" /> : <Download size={12} />} {member.name.split(' ')[0]}'s Certificate
                                                    </button>
                                                </div>
                                            )}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default UserDashboard;
