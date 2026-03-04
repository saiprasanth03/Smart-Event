import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, UserPlus, User, Building, Sparkles } from 'lucide-react';

const RegisterPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Participant' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await register(formData);
            navigate(user.role === 'Admin' ? '/admin' : '/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-6 relative overflow-hidden">
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-[120px] -z-10" />

            <div className="glass-panel p-10 sm:p-12 rounded-[2.5rem] w-full max-w-lg border border-white/10 shadow-2xl relative">
                <div className="w-16 h-16 bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl animate-float">
                    <UserPlus className="text-white" size={28} />
                </div>

                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold mb-2 tracking-tight">Join the Ecosystem</h2>
                    <p className="text-text-muted font-light">Create your personal identity to start managing events</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 text-sm border border-red-500/20 flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2 space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">Full Identity Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="text"
                                className="input-field pl-12"
                                placeholder="Alexander Pierce"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">University Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="email"
                                className="input-field pl-12"
                                placeholder="apierce@university.edu"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">Secure Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type="password"
                                className="input-field pl-12"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">Access Role</label>
                        <div className="relative group">
                            <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
                            <select
                                className="input-field pl-12 appearance-none"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="Participant">Participant</option>
                                <option value="Admin">Admin / Faculty</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary sm:col-span-2 py-4 text-lg mt-2 disabled:opacity-50">
                        {loading ? 'Creating Identity...' : 'Register Account'} <Sparkles size={18} />
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-text-muted text-sm font-light">
                        Already have an identity? <Link to="/login" className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4 transition-all">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
