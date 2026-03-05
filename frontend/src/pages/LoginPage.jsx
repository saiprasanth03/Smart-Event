// import React, { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate, Link } from 'react-router-dom';
// import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';

// const LoginPage = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const { login } = useAuth();
//     const navigate = useNavigate();

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const user = await login(email, password);
//             navigate(user.role === 'Admin' ? '/admin' : '/dashboard');
//         } catch (err) {
//             setError(err.response?.data?.message || 'Login failed');
//         }
//     };

//     return (
//         <div className="min-h-[90vh] flex items-center justify-center px-6 relative overflow-hidden">
//             <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10" />
//             <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-[100px] -z-10" />

//             <div className="glass-panel p-10 sm:p-12 rounded-[2.5rem] w-full max-w-md border border-white/10 shadow-2xl relative">
//                 <div className="w-16 h-16 bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl animate-float">
//                     <LogIn className="text-white" size={28} />
//                 </div>

//                 <div className="text-center mb-10">
//                     <h2 className="text-3xl font-bold mb-2 tracking-tight">Welcome Back</h2>
//                     <p className="text-text-muted font-light">Enter your credentials to access your dashboard</p>
//                 </div>

//                 {error && (
//                     <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 text-sm border border-red-500/20 flex items-center gap-3">
//                         <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
//                         {error}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div className="space-y-2">
//                         <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">Email Address</label>
//                         <div className="relative group">
//                             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
//                             <input
//                                 type="email"
//                                 className="input-field pl-12"
//                                 placeholder="name@university.edu"
//                                 value={email}
//                                 onChange={(e) => setEmail(e.target.value)}
//                                 required
//                             />
//                         </div>
//                     </div>

//                     <div className="space-y-2">
//                         <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">Secret Password</label>
//                         <div className="relative group">
//                             <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" size={18} />
//                             <input
//                                 type="password"
//                                 className="input-field pl-12"
//                                 placeholder="••••••••"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 required
//                             />
//                         </div>
//                     </div>

//                     <button type="submit" className="btn-primary w-full py-4 text-lg">
//                         Experience Now <Sparkles size={18} />
//                     </button>
//                 </form>

//                 <div className="mt-8 text-center">
//                     <p className="text-text-muted text-sm font-light">
//                         New to the platform? <Link to="/register" className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4 transition-all">Create Account</Link>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default LoginPage;



import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, Sparkles } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // send API URL to login function
      const user = await login(email, password, API);

      if (user?.role === "Admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-[100px] -z-10" />

      <div className="glass-panel p-10 sm:p-12 rounded-[2.5rem] w-full max-w-md border border-white/10 shadow-2xl relative">
        <div className="w-16 h-16 bg-gradient-to-tr from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
          <LogIn className="text-white" size={28} />
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-2 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-text-muted font-light">
            Enter your credentials to access your dashboard
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 text-sm border border-red-500/20 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">
              Email Address
            </label>
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors"
                size={18}
              />
              <input
                type="email"
                className="input-field pl-12"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted ml-1">
              Secret Password
            </label>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors"
                size={18}
              />
              <input
                type="password"
                className="input-field pl-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
            Experience Now <Sparkles size={18} />
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-text-muted text-sm font-light">
            New to the platform?{" "}
            <Link
              to="/register"
              className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4 transition-all"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
