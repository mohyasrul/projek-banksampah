import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'operator';
  loginTime: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default admin user - di production bisa ditambah lebih banyak
const defaultUsers = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123', // Di production, password harus di-hash
    name: 'Administrator',
    role: 'admin' as const
  },
  {
    id: '2', 
    username: 'operator',
    password: 'op123',
    name: 'Operator RW',
    role: 'operator' as const
  }
];

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('banksampah_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Check if login is still valid (24 hours)
        const loginTime = new Date(parsedUser.loginTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          setUser(parsedUser);
        } else {
          // Session expired, clear localStorage
          localStorage.removeItem('banksampah_user');
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('banksampah_user');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const foundUser = defaultUsers.find(
      u => u.username === username && u.password === password
    );

    if (foundUser) {
      const loggedUser: User = {
        id: foundUser.id,
        username: foundUser.username,
        name: foundUser.name,
        role: foundUser.role,
        loginTime: new Date().toISOString()
      };

      setUser(loggedUser);
      localStorage.setItem('banksampah_user', JSON.stringify(loggedUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('banksampah_user');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
