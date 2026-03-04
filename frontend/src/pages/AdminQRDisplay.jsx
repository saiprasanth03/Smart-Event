import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { QrCode, RefreshCw, ArrowLeft, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

const AdminQRDisplay = () => {
    const { eventId } = useParams();
    const [qrImage, setQrImage] = useState(null);
    const [expiresAt, setExpiresAt] = useState(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchQR = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/registrations/dynamic-qr/${eventId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setQrImage(res.data.qrImage);
            setExpiresAt(res.data.expiresAt);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching QR:', err);
        }
    };

    useEffect(() => {
        fetchQR();
    }, [eventId]);

    useEffect(() => {
        if (!expiresAt) return;
        const timer = setInterval(() => {
            const now = Date.now();
            const remaining = Math.max(0, Math.ceil((expiresAt - now) / 1000));
            setTimeLeft(remaining);

            // If time is up, refresh
            if (remaining === 0) {
                setLoading(true); // Show loading instantly
                setTimeLeft(30); // Optimistic reset
                fetchQR();
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [expiresAt]);

    return (
        <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-6 bg-[#030712] relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />

            <button
                onClick={() => navigate('/admin/events')}
                className="absolute top-8 left-8 flex items-center gap-2 text-text-muted hover:text-white transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span className="font-bold uppercase tracking-widest text-[10px]">Back to Console</span>
            </button>

            <div className="glass-panel max-w-2xl w-full p-12 rounded-[3.5rem] border border-white/5 shadow-2xl text-center space-y-10 relative z-10">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-1.5 rounded-full border border-green-500/20 mb-4 animate-pulse">
                        <ShieldCheck size={14} />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Secure Dynamic Attendance</span>
                    </div>
                    <h2 className="text-4xl font-bold font-display tracking-tight leading-tight">Syncing Security <br /><span className="gradient-text font-black">Gate active</span></h2>
                </div>

                <div className="relative group max-w-[320px] mx-auto">
                    <div className="absolute -inset-4 bg-primary/20 blur-2xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="glass-panel p-8 rounded-[2.5rem] border border-white/10 relative bg-white/5 overflow-hidden">
                        {loading ? (
                            <div className="aspect-square flex items-center justify-center">
                                <RefreshCw className="text-primary animate-spin" size={48} />
                            </div>
                        ) : (
                            <img src={qrImage} alt="Dynamic QR" className="w-full h-full rounded-2xl glow-white" />
                        )}

                        {/* Progress Bar */}
                        <div className="absolute bottom-0 left-0 h-1.5 bg-primary/30 w-full">
                            <div
                                className="h-full bg-primary transition-all duration-1000 ease-linear"
                                style={{ width: `${(timeLeft / 30) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-4 py-3 px-8 glass-panel rounded-2xl border border-white/5">
                        <Clock size={20} className="text-text-muted" />
                        <div className="text-left leading-none">
                            <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1">Rotating In</p>
                            <span className="text-2xl font-mono font-black text-white">{timeLeft}s</span>
                        </div>
                        <div className="w-0.5 h-8 bg-white/10 mx-2" />
                        <div className="text-left leading-none">
                            <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest mb-1">Event Reference</p>
                            <span className="text-xl font-mono text-primary font-bold">{eventId}</span>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-sm">
                        <p className="text-text-muted text-sm leading-relaxed font-light">
                            Ask participants to scan this code via the <span className="text-white font-medium">SmartEvent Scanner</span> inside their dashboard. This code self-destructs every 30 seconds for maximum security.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-green-400/60">
                            <CheckCircle2 size={12} />
                            <span className="text-[9px] font-bold uppercase tracking-widest text">Location proximity enforced</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminQRDisplay;
