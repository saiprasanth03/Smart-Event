import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Send, Layout, MessageSquare, AlertCircle, Sparkles } from 'lucide-react';

const FeedbackPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return setMessage({ type: 'error', text: 'Please select a rating' });

        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/registrations/feedback', {
                eventId,
                rating,
                comment
            });
            setMessage({ type: 'success', text: 'Thank you for your valuable feedback!' });
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Error submitting feedback' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-16">
            <div className="flex flex-col md:flex-row gap-12">
                <div className="md:w-1/3">
                    <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-8">
                        <MessageSquare size={32} />
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight mb-6">Your Voice <br /><span className="gradient-text">Matters</span></h2>
                    <p className="text-text-muted font-light leading-relaxed">
                        Your insights help us craft better experiences. Tell us what you loved and what we can improve.
                    </p>
                </div>

                <div className="flex-1">
                    <div className="glass-panel p-10 rounded-[2.5rem] border border-white/5 shadow-2xl">
                        {message && (
                            <div className={`mb-8 p-5 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in-95 duration-300 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                <AlertCircle size={24} />
                                <p className="font-semibold">{message.text}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">Overall Satisfaction</label>
                                <div className="flex gap-3">
                                    {[...Array(5)].map((_, i) => {
                                        const starValue = i + 1;
                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                className="transition-all duration-300 transform hover:scale-125 focus:outline-none"
                                                onClick={() => setRating(starValue)}
                                                onMouseEnter={() => setHover(starValue)}
                                                onMouseLeave={() => setHover(0)}
                                            >
                                                <Star
                                                    size={42}
                                                    className={`${(hover || rating) >= starValue ? 'fill-yellow-400 text-yellow-400 glow-yellow' : 'text-white/10'}`}
                                                />
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">Detailed Thoughts</label>
                                <div className="relative group">
                                    <textarea
                                        className="input-field min-h-[160px] py-5 px-6"
                                        placeholder="What was your favorite moment? Any suggestions for the next one?"
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full py-5 text-xl font-bold tracking-tight shadow-primary/20 shadow-2xl"
                            >
                                {loading ? 'Submitting...' : 'Submit Identity Review'} <Send size={20} className="ml-2" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeedbackPage;
