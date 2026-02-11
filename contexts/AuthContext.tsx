import { authApi, setOnUnauthorized } from '@/services/api';
import type { User } from '@/types';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isParent: boolean;
    isStudent: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setOnUnauthorized(() => setUser(null));
    }, []);

    useEffect(() => {
        const loadStoredAuth = async () => {
            try {
                const [storedToken, storedUser] = await Promise.all([
                    authApi.getStoredToken(),
                    authApi.getStoredUser(),
                ]);
                if (storedToken && storedUser) {
                    setUser(storedUser);
                }
            } catch (error) {
                console.error('Failed to load auth:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadStoredAuth();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        const response = await authApi.loginMobile(email, password);
        setUser(response.user);
    }, []);

    const logout = useCallback(async () => {
        await authApi.logout();
        setUser(null);
    }, []);

    const isParent = user?.roleLevel === 3;
    const isStudent = user?.roleLevel === 4;

    return (
        <AuthContext.Provider value={{ user, isLoading, isParent, isStudent, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth musi być wywołane w ramach AuthProvider');
    }
    return context;
}
