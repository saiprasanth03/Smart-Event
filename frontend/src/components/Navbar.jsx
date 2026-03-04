import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, LayoutDashboard, ScanLine, PlusCircle, User, Sparkles, Rocket, ArrowRight } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="glass-panel sticky top-0 z-[100] px-8 py-5 flex justify-between items-center bg-dark-bg/40 backdrop-blur-xl border-b border-text-main/5">
            <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                    <Calendar className="text-white" size={20} />
                </div>
                <span className="text-2xl font-extrabold tracking-tight font-display glow">
                    Smart<span className="gradient-text">Event</span>
                </span>
            </Link>

            <div className="flex items-center gap-8">
                {user ? (
                    <>
                        <div className="flex items-center gap-8 text-sm font-medium text-text-muted">
                            {user.role === 'Admin' ? (
                                <>
                                    <NavLink to="/admin" icon={<LayoutDashboard size={16} />} label="Dashboard" />
                                    <NavLink to="/admin/events" icon={<Calendar size={16} />} label="Manage" />
                                    <NavLink to="/admin/create-event" icon={<PlusCircle size={16} />} label="Create" />
                                    <NavLink to="/admin/scanner" icon={<ScanLine size={16} />} label="Scanner" />
                                </>
                            ) : (
                                <>
                                    <NavLink to="/dashboard" icon={<LayoutDashboard size={16} />} label="My Passport" />
                                    <NavLink to="/join-event" icon={<ArrowRight size={16} />} label="Join Event" />
                                </>
                            )}
                        </div>

                        <div className="h-6 w-px bg-text-main/10" />

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 group cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-text-main/5 border border-text-main/10 flex items-center justify-center text-xs font-bold text-primary group-hover:border-primary/50 transition-colors">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-semibold max-md:hidden uppercase tracking-wider">{user.name.split(' ')[0]}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => document.documentElement.classList.toggle('light')}
                                    className="p-2.5 rounded-xl glass-panel border border-white/5 text-text-muted hover:text-primary transition-all active:scale-90"
                                    title="Toggle Cosmic/Solar Theme"
                                >
                                    <Sparkles size={18} className="theme-icon-dark" />
                                    <Rocket size={18} className="theme-icon-light" />
                                </button>

                                <button onClick={handleLogout} className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300" title="Sign Out">
                                    <LogOut size={18} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex gap-4">
                        <Link to="/login" className="px-6 py-2.5 rounded-xl font-semibold hover:bg-white/5 transition-all border border-transparent hover:border-white/5">Login</Link>
                        <Link to="/register" className="btn-primary px-7 py-2.5">Join Now</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

const NavLink = ({ to, icon, label }) => (
    <Link to={to} className="flex items-center gap-2 hover:text-text-main transition-all group relative py-1">
        <span className="group-hover:scale-110 transition-transform">{icon}</span>
        {label}
        <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300 rounded-full" />
    </Link>
);

export default Navbar;
