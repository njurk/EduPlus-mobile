import { authApi, setOnUnauthorized, User } from '@/services/api';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isParent: boolean;
    isStudent: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setOnUnauthorized(() => {
            setToken(null);
            setUser(null);
        });
    }, []);

    useEffect(() => {
        const loadStoredAuth = async () => {
            try {
                const [storedToken, storedUser] = await Promise.all([
                    authApi.getStoredToken(),
                    authApi.getStoredUser(),
                ]);
                if (storedToken && storedUser) {
                    setToken(storedToken);
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
        setToken(response.token);
        setUser(response.user);
    }, []);

    const logout = useCallback(async () => {
        await authApi.logout();
        setToken(null);
        setUser(null);
    }, []);

    const isParent = user?.roleLevel === 3;
    const isStudent = user?.roleLevel === 4;

    return (
        <AuthContext.Provider value={{ user, token, isLoading, isParent, isStudent, login, logout }}>
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
