import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            setUser(JSON.parse(userData));
            // Set default axios header
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
            email,
            password
        });

        const { token, ...userData } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);

        return response.data;
    };

    const register = async (name, email, password, company) => {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
            name,
            email,
            password,
            company
        });

        const { token, ...userData } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);

        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
    };

    const value = {
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
