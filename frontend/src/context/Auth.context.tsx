import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    user: { username: string; email: string } | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (userData: { username: string; email: string }, token: string) => void;
    register: (userData: { username: string; email: string }, token: string) => void;
    logout: () => void;
    updateUser: (updatedUserData: { username: string; email: string }) => void;
    checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<{ username: string; email: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);


    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem("token");
            const userStr = localStorage.getItem("user");

            if (token && userStr) {
                const userData = JSON.parse(userStr);
                setUser(userData);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error("Error checking auth status:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const login = (userData: { username: string, email: string }, token: string) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    };

    const register = (userData: { username: string, email: string }, token: string) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    };


    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setIsAuthenticated(false);
        window.location.href = "/";
    };

    const updateUser = (updatedUserData: { username: string, email: string }) => {
        const newUserData = { ...user, ...updatedUserData };
        localStorage.setItem("user", JSON.stringify(newUserData));
        setUser(newUserData);
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, register, updateUser, checkAuthStatus }
        }>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    return context;
};