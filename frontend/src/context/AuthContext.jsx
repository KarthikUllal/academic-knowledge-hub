import { createContext, useContext, useEffect, useState } from "react";

import { loginUser, registerUser, logoutUser } from "../services/auth.service";

import { getUserProfile } from "../services/user.service";

// Create authentication context
const AuthContext = createContext(null);

// Custom hook to access authentication context
export const useAuth = () => {
    return useContext(AuthContext);
};

// Authentication provider
export const AuthProvider = ({ children }) => {
    // Authentication states
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check existing authentication session
    const checkAuth = async () => {
        try {
            const response = await getUserProfile();

            setUser(response.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Login
    const login = async (credentials) => {
        const response = await loginUser(credentials);

        await checkAuth();

        return response.data;
    };

    // Register
    const register = async (userData) => {
        const response = await registerUser(userData);

        return response.data;
    };

    // Logout
    const logout = async () => {
        try {
            await logoutUser();
        } finally {
            setUser(null);
        }
    };

    // Check authentication when application loads
    useEffect(() => {
        checkAuth();
    }, []);

    // Values shared with all child components
    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
