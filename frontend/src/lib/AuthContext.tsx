import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { request } from './http';
interface User { id: number; name: string; email: string }
interface AuthContextType {
 user: User | null; loading: boolean;
 signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
 signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
 const [user, setUser] = useState<User | null>(null);
 const [loading, setLoading] = useState(true);
 useEffect(() => { request('/session').then(result => setUser(result.user)).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
 const signIn = async (email: string, password: string) => {
  try { await request('/session'); const result = await request('/login', { method: 'POST', body: JSON.stringify({ email, password }) }); setUser(result.user); return { error: null }; }
  catch (error) { return { error: error as Error }; }
 };
 const signOut = async () => { await request('/logout', { method: 'POST' }); setUser(null); };
 return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('AuthProvider required'); return value; }
