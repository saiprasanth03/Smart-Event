import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldCheck, QrCode, Award, Utensils, Zap, BarChart3, Users } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[120px] -z-10" />

            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-8 pt-24 pb-32 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-text-main/10 text-xs font-bold uppercase tracking-widest text-primary mb-8 animate-float">
                    <Zap size={14} fill="currentColor" /> The Next Generation Event Management
                </div>

                <h1 className="text-7xl md:text-8xl font-extrabold mb-8 tracking-tighter leading-[1.05]">
                    Orchestrate <br />
                    <span className="gradient-text">Extraordinary</span> Events
                </h1>

                <p className="text-xl text-text-muted mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                    Scale your university events, hackathons, and workshops with an all-in-one platform built for speed, transparency, and security.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-6 mb-24">
                    <Link to="/register" className="btn-primary text-lg px-10 py-5">
                        Launch Your Event <ArrowRight size={20} />
                    </Link>
                    <Link to="/login" className="btn-glass text-lg px-10 py-5">
                        Explore Platform
                    </Link>
                </div>

                {/* Hero Image/Card Preview */}
                <div className="relative max-w-5xl mx-auto glass-panel p-4 rounded-3xl border border-text-main/10 bg-text-main/5">
                    <div className="bg-dark-bg rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                        {/* Mock Dashboard UI Snippet */}
                        <div className="flex gap-4 p-8">
                            <div className="glass-card p-6 rounded-2xl w-48 h-32 flex flex-col justify-between">
                                <Users className="text-primary" />
                                <div className="font-bold text-2xl">2.4k+</div>
                                <div className="text-[10px] text-text-muted uppercase tracking-widest">Registrations</div>
                            </div>
                            <div className="glass-card p-6 rounded-2xl w-48 h-32 flex flex-col justify-between translate-y-8">
                                <BarChart3 className="text-secondary" />
                                <div className="font-bold text-2xl">98%</div>
                                <div className="text-[10px] text-text-muted uppercase tracking-widest">Attendance</div>
                            </div>
                            <div className="glass-card p-6 rounded-2xl w-48 h-32 flex flex-col justify-between">
                                <Award className="text-accent" />
                                <div className="font-bold text-2xl">1.2k</div>
                                <div className="text-[10px] text-text-muted uppercase tracking-widest">Certificates</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="max-w-7xl mx-auto px-8 py-32 border-t border-text-main/5">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Powerful Tools For <span className="text-primary">Every Admin</span></h2>
                    <p className="text-text-muted max-w-xl mx-auto font-light">From registration to feedback, automate every step of the lifecycle with zero friction.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<QrCode className="text-primary" size={24} />}
                        title="Instant QR Ticketing"
                        desc="Automated ticket generation with unique security keys sent instantly to every participant."
                    />
                    <FeatureCard
                        icon={<ShieldCheck className="text-secondary" size={24} />}
                        title="Multi-Layer Verification"
                        desc="Verify identity using QR scans, geolocation radius, or simulated biometric matching for 100% accuracy."
                    />
                    <FeatureCard
                        icon={<Award className="text-accent" size={24} />}
                        title="Auto-Certified Success"
                        desc="Dynamic PDF certificates generated immediately after the event ends, signed and ready for LinkedIn."
                    />
                    <FeatureCard
                        icon={<Utensils className="text-orange-400" size={24} />}
                        title="Smart Food Tokens"
                        desc="Prevents double-redemption of lunch and snacks with individual secure tokens."
                    />
                    <FeatureCard
                        icon={<BarChart3 className="text-cyan-400" size={24} />}
                        title="Deep Insights"
                        desc="Real-time analytics on engagement, attendance patterns, and participant feedback."
                    />
                    <FeatureCard
                        icon={<Zap className="text-yellow-400" size={24} />}
                        title="Lightning Fast"
                        desc="Built with cutting-edge tech to handle thousands of concurrent users during high-stakes hackathons."
                    />
                </div>
            </section>

            {/* Call to Action */}
            <section className="bg-gradient-to-r from-primary/10 to-secondary/10 py-32 text-center px-8">
                <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">Ready to transform your events?</h2>
                <Link to="/register" className="btn-primary text-lg px-12 py-5 inline-flex mx-auto">
                    Get Started For Free
                </Link>
            </section>

            {/* Footer */}
            <footer className="max-w-7xl mx-auto px-8 py-12 text-sm text-text-muted text-center border-t border-text-main/5">
                © 2024 SmartEvent Platform. Built for excellence in university management.
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div className="glass-card p-10 rounded-[2.5rem] flex flex-col items-start gap-6 group">
        <div className="w-14 h-14 rounded-2xl bg-text-main/5 border border-text-main/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/50 transition-all duration-500">
            {icon}
        </div>
        <div className="space-y-3">
            <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
            <p className="text-text-muted leading-relaxed font-light">{desc}</p>
        </div>
    </div>
);

export default LandingPage;
