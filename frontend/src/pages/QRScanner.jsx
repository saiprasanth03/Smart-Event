import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Html5Qrcode } from 'html5-qrcode';
import { CheckCircle2, AlertCircle, Scan, ShieldHalf, User, Calendar as CalendarIcon, Zap, Coffee, X } from 'lucide-react';

const QRScanner = () => {
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [active, setActive] = useState(false);
    const [mode, setMode] = useState('Attendance'); // 'Attendance' or 'Food'
    const [loadingCamera, setLoadingCamera] = useState(false);
    const scannerRef = useRef(null);

    const stopScanner = async () => {
        if (scannerRef.current) {
            try {
                if (scannerRef.current.isScanning) {
                    await scannerRef.current.stop();
                }
            } catch (err) {
                console.error("Failed to stop scanner", err);
            }
        }
    };

    const startScanner = async () => {
        setLoadingCamera(true);
        setError(null);
        setResult(null);

        try {
            // First get permissions and list of cameras
            const devices = await Html5Qrcode.getCameras();
            if (devices && devices.length > 0) {
                // Now toggle React state so that <div id="reader"> enters the DOM
                setActive(true);

                // Wait for React to render the div
                setTimeout(async () => {
                    try {
                        const html5QrCode = new Html5Qrcode("reader");
                        scannerRef.current = html5QrCode;

                        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
                        const backCamera = devices.find(device => device.label.toLowerCase().includes('back'));
                        const cameraId = backCamera ? backCamera.id : devices[0].id;

                        await html5QrCode.start(
                            cameraId,
                            config,
                            (decodedText) => handleScanSuccess(decodedText, html5QrCode),
                            () => { }
                        );
                    } catch (err) {
                        console.error("Scanner Error:", err);
                        setActive(false);
                        setError(`Scanner failed: ${err?.message || err}`);
                    } finally {
                        setLoadingCamera(false);
                    }
                }, 100);
            } else {
                setLoadingCamera(false);
                setError("No cameras found on your device.");
            }
        } catch (err) {
            console.error("Camera Init Error:", err);
            setLoadingCamera(false);
            setError(`Camera Access Failed: ${err?.message || err || 'Please check permissions.'}`);
        }
    };

    const handleScanSuccess = async (decodedText, scanner) => {
        try {
            const data = JSON.parse(decodedText);

            // Stop scanner immediately on success
            await scanner.stop();
            setActive(false);

            if (mode === 'Attendance') {
                handleAttendance(data);
            } else {
                handleFoodRedemption(data);
            }
        } catch (err) {
            setError('Verification Matrix Error: Invalid data format detected.');
            await scanner.stop();
            setActive(false);
        }
    };

    useEffect(() => {
        return () => {
            stopScanner();
        };
    }, []);

    const handleAttendance = async (data) => {
        try {
            // Determine if we're scanning a dynamic location QR or a static participant ticket
            const endpoint = data.type === 'attendance'
                ? 'verify-attendance'
                : 'verify-ticket'; // The endpoint name for ticket verification in backend is verify-attendance but we need to pass right method

            const payloadData = data.type === 'ticket' ? { ticketId: data.ticketId, method: 'Ticket' } : { ...data, method: 'QR' };

            const res = await axios.post(`https://smart-event-56qg.onrender.com/api/registrations/verify-attendance`, payloadData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setResult({
                message: res.data.message,
                user: res.data.registration.userName,
                event: res.data.registration.eventName
            });
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Access Denied: Synchronization Failure');
            setResult(null);
        }
    };

    const handleFoodRedemption = async (data) => {
        try {
            const res = await axios.post('https://smart-event-56qg.onrender.com/api/registrations/redeem-food', {
                ticketId: data.ticketId
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setResult({
                message: 'Food Token Redeemed!',
                user: res.data.registration.user.name,
                event: res.data.registration.event.name
            });
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Food Redemption Failed');
            setResult(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-8 py-20">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-text-main/10 text-[10px] font-bold uppercase tracking-widest text-primary mb-6">
                    <ShieldHalf size={14} fill="currentColor" /> Secure Verification Node
                </div>
                <h2 className="text-5xl font-extrabold tracking-tight mb-4 tracking-tighter">Event <span className="gradient-text">Checkpoint</span></h2>
                <p className="text-text-muted font-light max-w-lg mx-auto mb-10">Initialize authentication protocols to verify participant identity and log presence in the system ledger.</p>

                <div className="flex bg-text-main/5 p-1 rounded-2xl border border-text-main/5 w-fit mx-auto">
                    <button
                        onClick={() => { setMode('Attendance'); stopScanner(); setActive(false); setResult(null); setError(null); }}
                        className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${mode === 'Attendance' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <ShieldHalf size={14} className="inline mr-2" /> Attendance
                    </button>
                    <button
                        onClick={() => { setMode('Food'); stopScanner(); setActive(false); setResult(null); setError(null); }}
                        className={`px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${mode === 'Food' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <Coffee size={14} className="inline mr-2" /> Food Token
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center">
                {!active && !result && !error ? (
                    <button
                        onClick={startScanner}
                        disabled={loadingCamera}
                        className="group relative w-64 h-64 rounded-full glass-panel border border-text-main/10 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-primary/10 transition-all duration-500 shadow-2xl disabled:opacity-50"
                    >
                        {loadingCamera ? (
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        ) : (
                            <>
                                <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping opacity-20" />
                                <Scan size={64} className="text-primary group-hover:scale-110 transition-transform duration-500" />
                                <span className="font-bold tracking-widest uppercase text-xs">Initialize Scan</span>
                            </>
                        )}
                    </button>
                ) : (
                    <div className="w-full max-w-xl">
                        <div className={`glass-panel p-2 rounded-[2.5rem] overflow-hidden shadow-2xl border border-text-main/10 mb-12 relative ${!active && 'hidden'}`}>
                            <div id="reader" className="rounded-[2rem] overflow-hidden bg-black"></div>
                            <button
                                onClick={() => { stopScanner(); setActive(false); }}
                                className="absolute top-6 right-6 p-2 bg-black/50 text-white rounded-full hover:bg-black transition-colors z-[10]"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {result && (
                            <div className="glass-panel p-10 rounded-[2.5rem] border border-green-500/20 text-center animate-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-400 mx-auto mb-6 shadow-lg shadow-green-500/10">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h3 className="text-3xl font-bold mb-4 gradient-text">{result.message}</h3>

                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <ResultValue icon={<User size={14} />} label="Identity" value={result.user} />
                                    <ResultValue icon={<CalendarIcon size={14} />} label="Event Node" value={result.event} />
                                </div>

                                <button
                                    onClick={() => { setResult(null); startScanner(); }}
                                    className="btn-primary w-full mt-10 py-4 text-sm font-bold"
                                >
                                    Next Checkpoint <Zap size={16} />
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="glass-panel p-10 rounded-[2.5rem] border border-red-500/20 text-center animate-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-400 mx-auto mb-6 shadow-lg shadow-red-500/10">
                                    <AlertCircle size={40} />
                                </div>
                                <h3 className="text-2xl font-bold text-red-400 mb-4">{error}</h3>
                                <p className="text-text-muted text-sm font-light mb-8">The scanned protocol could not be deciphered or is unauthorized for this node.</p>
                                <button
                                    onClick={() => { setError(null); startScanner(); }}
                                    className="btn-glass w-full py-4 text-sm font-bold border-red-500/20 text-red-400"
                                >
                                    Retry Handshake
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="mt-20 flex justify-center gap-12 opacity-30 grayscale invert dark:invert-0">
                <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="Trusted" className="h-6" />
                <img src="https://img.icons8.com/color/48/000000/verified-account.png" alt="Verified" className="h-6" />
                <img src="https://img.icons8.com/ios-filled/50/ffffff/qr-code.png" alt="QR" className="h-6" />
            </div>
        </div>
    );
};

const ResultValue = ({ icon, label, value }) => (
    <div className="bg-text-main/5 p-4 rounded-2xl flex flex-col items-center gap-1 border border-text-main/5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-text-muted text-center leading-tight">
            {icon} {label}
        </div>
        <div className="font-bold text-sm tracking-tight text-text-main text-center break-words w-full">{value}</div>
    </div>
);

export default QRScanner;
