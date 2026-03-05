import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, Calendar, CheckCircle, Coffee, Star, TrendingUp, Filter, Download, X } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const [filterType, setFilterType] = useState('All');
    const [showFilterOptions, setShowFilterOptions] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const eventIdParam = queryParams.get('eventId');

    useEffect(() => {
        fetchStats();
    }, [filterType, eventIdParam]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'https://smart-event-56qg.onrender.com';
            let url = `${baseUrl}/api/analytics`;
            if (eventIdParam) {
                url += `?eventId=${eventIdParam}`;
            } else if (filterType !== 'All') {
                url += `?type=${filterType}`;
            }

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setStats(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'https://smart-event-56qg.onrender.com';
            const exportUrl = eventIdParam
                ? `${baseUrl}/api/analytics/export?eventId=${eventIdParam}`
                : `${baseUrl}/api/analytics/export`;

            const res = await axios.get(exportUrl, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'smart_event_analytics.csv');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            alert('Failed to export report');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-text-muted animate-pulse">Synchronizing Analytics...</p>
        </div>
    );

    if (!stats) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <p className="text-red-400 font-bold uppercase tracking-widest">Failed to load analytics data. Ensure backend is running.</p>
        </div>
    );

    const data = [
        { name: 'Events', value: stats.totalEvents },
        { name: 'Participants', value: stats.totalParticipants },
        { name: 'Attended', value: stats.attendedCount },
        { name: 'Food', value: stats.foodRedeemed },
    ];

    return (
        <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight mb-2">Management <span className="gradient-text">Insights</span></h2>
                    <p className="text-text-muted font-light">Real-time performance metrics for your university ecosystem.</p>
                </div>
                <div className="flex gap-3 relative">
                    {!eventIdParam && (
                        <button
                            onClick={() => setShowFilterOptions(!showFilterOptions)}
                            className={`btn-glass py-2 px-4 text-sm flex items-center gap-2 ${filterType !== 'All' ? 'border-primary text-primary' : ''}`}
                        >
                            <Filter size={16} /> {filterType === 'All' ? 'Filter' : filterType}
                        </button>
                    )}
                    {showFilterOptions && (
                        <div className="absolute top-12 left-0 w-48 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                            {['All', 'Hackathon', 'Seminar', 'Workshop', 'Cultural'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => { setFilterType(type); setShowFilterOptions(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors ${filterType === type ? 'text-primary font-bold' : 'text-text-muted'}`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    )}
                    {eventIdParam && (
                        <button onClick={() => navigate('/admin')} className="btn-glass py-2 px-4 text-sm flex items-center gap-2 text-red-400 hover:text-white hover:bg-red-500/20"> <X size={16} /> Clear Event Filter </button>
                    )}
                    <button onClick={handleExport} className="btn-primary py-2 px-4 text-sm flex items-center gap-2 shadow-lg shadow-primary/20"> <Download size={16} /> Export Report </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                <StatCard icon={<Calendar className="text-primary" />} label="Events" value={stats.totalEvents} trend="+12%" />
                <StatCard icon={<Users className="text-secondary" />} label="Reach" value={stats.totalParticipants} trend="+24%" />
                <StatCard icon={<CheckCircle className="text-green-400" />} label="Attendance" value={`${stats.attendanceRate}%`} subValue={`${stats.attendedCount} users`} />
                <StatCard icon={<Coffee className="text-accent" />} label="Redemptions" value={stats.foodRedeemed} subValue="Food Tokens" />
                <StatCard icon={<Star className="text-yellow-400" />} label="Satisfaction" value={stats.avgRating} subValue={`${stats.totalFeedback} reviews`} />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-panel p-10 rounded-[2.5rem] border border-white/5">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3">
                            <TrendingUp className="text-primary" /> Engagement Overview
                        </h3>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted glass-panel px-3 py-1 rounded-full">Last 30 Days</div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} barGap={8}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                                <YAxis stroke="#64748b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '16px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                                        backdropFilter: 'blur(10px)'
                                    }}
                                    itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="value" fill="url(#colorBar)" radius={[8, 8, 8, 8]} barSize={50} />
                                <defs>
                                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#d946ef" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5">
                    <h3 className="text-2xl font-bold tracking-tight mb-8">Recent Feedback</h3>
                    <div className="space-y-6">
                        {stats.latestFeedback && stats.latestFeedback.length > 0 ? (
                            stats.latestFeedback.map((f, i) => (
                                <FeedbackItem key={i} name={f.userName} role={`Event: ${f.eventName}`} rating={f.rating} comment={f.comment} />
                            ))
                        ) : (
                            <p className="text-text-muted text-sm italic border border-dashed border-white/10 p-4 rounded-xl text-center">No feedback received yet.</p>
                        )}
                    </div>
                    <button className="w-full mt-10 py-3 rounded-xl border border-white/5 text-sm font-bold text-text-muted hover:bg-white/5 transition-all">View All Reviews</button>
                </div>
            </div>

            {eventIdParam && stats.attendedMembersList && (
                <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5 mt-12 bg-black/20">
                    <h3 className="text-2xl font-bold tracking-tight mb-8 text-primary">Attendance & Food Details</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        <div className="lg:col-span-1 glass-card p-6 rounded-3xl border border-white/5">
                            <h4 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Menu Selection Counts</h4>
                            {Object.keys(stats.foodItemCounts).length > 0 ? (
                                <ul className="space-y-4">
                                    {Object.entries(stats.foodItemCounts).map(([item, count]) => (
                                        <li key={item} className="flex justify-between items-center text-sm">
                                            <span className="text-text-muted">{item}</span>
                                            <span className="bg-primary/20 text-primary px-3 py-1 rounded-full font-bold">{count}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-text-muted italic flex items-center justify-center p-4 border border-dashed border-white/10 rounded-xl">No specific food items selected yet.</p>
                            )}
                        </div>

                        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
                            <h4 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4">Attended Members <span className="text-primary">({stats.attendedMembersList.length})</span></h4>
                            {stats.attendedMembersList.length > 0 ? (
                                <div className="space-y-3 pr-2">
                                    {stats.attendedMembersList.map((m, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row justify-between sm:items-center bg-black/40 p-4 rounded-xl border border-white/5 gap-3 hover:border-primary/20 transition-all">
                                            <span className="font-bold text-sm">{m.name}</span>
                                            <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-widest items-center">
                                                <span className={`px-2 py-1 rounded ${m.foodPreference === 'Veg' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{m.foodPreference}</span>
                                                {m.selectedMenuItems && m.selectedMenuItems.map(item => (
                                                    <span key={item} className="bg-white/5 text-text-muted px-2 py-1 rounded border border-white/10">{item}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-text-muted italic flex items-center justify-center p-4 border border-dashed border-white/10 rounded-xl h-24">No members have attended this event yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon, label, value, trend, subValue }) => (
    <div className="glass-card p-8 rounded-[2rem] relative overflow-hidden group">
        <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                {icon}
            </div>
            {trend && (
                <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">
                    {trend}
                </span>
            )}
        </div>
        <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">{label}</p>
            <h4 className="text-3xl font-extrabold tracking-tight">{value}</h4>
            {subValue && <p className="text-[10px] text-text-muted font-medium">{subValue}</p>}
        </div>
    </div>
);

const FeedbackItem = ({ name, role, rating, comment }) => (
    <div className="group border-b border-white/5 pb-6 last:border-0 last:pb-0">
        <div className="flex justify-between items-start mb-3">
            <div>
                <h5 className="font-bold text-sm tracking-tight">{name}</h5>
                <span className="text-[10px] text-text-muted uppercase tracking-widest">{role}</span>
            </div>
            <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-700"} />
                ))}
            </div>
        </div>
        <p className="text-text-muted text-xs leading-relaxed font-light italic bg-white/5 p-3 rounded-xl border border-white/5 group-hover:border-primary/20 transition-all">"{comment}"</p>
    </div>
);

export default AdminDashboard;
