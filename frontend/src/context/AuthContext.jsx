// import React, { createContext, useState, useContext, useEffect } from 'react';
// import axios from 'axios';

// // Configure axios defaults
// axios.defaults.baseURL = 'https://smart-event-56qg.onrender.com';

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//             fetchUser();
//         } else {
//             setLoading(false);
//         }
//     }, []);

//     const fetchUser = async () => {
//         try {
//             const res = await axios.get('https://smart-event-56qg.onrender.com/api/auth/me');
//             setUser(res.data);
//         } catch (err) {
//             console.error('Session restoration failed:', err);
//             localStorage.removeItem('token');
//             delete axios.defaults.headers.common['Authorization'];
//             setUser(null);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const login = async (email, password) => {
//         const res = await axios.post('https://smart-event-56qg.onrender.com/api/auth/login', { email, password });
//         localStorage.setItem('token', res.data.token);
//         axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
//         setUser(res.data.user);
//         return res.data.user;
//     };

//     const register = async (userData) => {
//         const res = await axios.post('https://smart-event-56qg.onrender.com/api/auth/register', userData);
//         localStorage.setItem('token', res.data.token);
//         axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
//         setUser(res.data.user);
//         return res.data.user;
//     };

//     const logout = () => {
//         localStorage.removeItem('token');
//         delete axios.defaults.headers.common['Authorization'];
//         setUser(null);
//     };

//     return (
//         <AuthContext.Provider value={{ user, loading, login, register, logout }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

// export const useAuth = () => useContext(AuthContext);




import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

// backend URL from environment variable
const API = import.meta.env.VITE_API_URL;

// Configure axios base URL
axios.defaults.baseURL = API;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get("/api/auth/me");
      setUser(res.data);
    } catch (err) {
      console.error("Session restoration failed:", err);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await axios.post("/api/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", res.data.token);
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${res.data.token}`;

    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (userData) => {
    const res = await axios.post("/api/auth/register", userData);

    localStorage.setItem("token", res.data.token);
    axios.defaults.headers.common[
      "Authorization"
    ] = `Bearer ${res.data.token}`;

    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

