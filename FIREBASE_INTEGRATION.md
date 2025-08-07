# Firebase Integration Guide - Aplikasi Bank Sampah RW

## Daftar Isi
1. [Pengantar Firebase](#pengantar-firebase)
2. [Setup Project Firebase](#setup-project-firebase)
3. [Konfigurasi Aplikasi](#konfigurasi-aplikasi)
4. [Struktur Database Firestore](#struktur-database-firestore)
5. [Implementasi Authentication](#implementasi-authentication)
6. [Implementasi Database Operations](#implementasi-database-operations)
7. [Security Rules](#security-rules)
8. [Deployment & Production](#deployment--production)
9. [Monitoring & Analytics](#monitoring--analytics)
10. [Troubleshooting](#troubleshooting)

---

## Pengantar Firebase

### Mengapa Firebase untuk Bank Sampah?

**Firebase** adalah platform Backend-as-a-Service (BaaS) dari Google yang sangat cocok untuk aplikasi bank sampah karena:

#### 🎯 **Keunggulan untuk Bank Sampah:**
- **Real-time Database**: Data setoran langsung tersinkron
- **Authentication**: Login aman untuk pengelola
- **Cloud Storage**: Simpan foto/dokumen dengan aman
- **Offline Support**: Tetap bisa input data tanpa internet
- **Security Rules**: Proteksi data sensitif tabungan
- **Scalability**: Bisa menangani growth dari 1 RW ke banyak RW

#### 🔧 **Firebase Services yang Digunakan:**
1. **Firebase Authentication** - Sistem login pengelola
2. **Cloud Firestore** - Database utama untuk data RT, setoran, tabungan
3. **Firebase Hosting** - Deploy aplikasi web
4. **Cloud Storage** - Simpan gambar/dokumen
5. **Firebase Analytics** - Monitor usage aplikasi
6. **Cloud Functions** - Logic backend untuk kalkulasi kompleks

---

## Setup Project Firebase

### Step 1: Buat Project Firebase

1. **Akses Firebase Console**
   ```
   Buka: https://console.firebase.google.com
   Login dengan Google Account
   ```

2. **Create New Project**
   ```
   Klik "Add project"
   Project Name: "bank-sampah-rw-[nama-rw]"
   Project ID: bank-sampah-rw-xxx (auto-generated)
   Location: asia-southeast1 (Singapore - terdekat dengan Indonesia)
   ```

3. **Enable Google Analytics**
   ```
   ✅ Enable Google Analytics for this project
   Analytics Account: Create new atau pilih existing
   ```

### Step 2: Setup Authentication

1. **Enable Authentication**
   ```
   Firebase Console > Authentication > Get Started
   ```

2. **Configure Sign-in Methods**
   ```
   Sign-in method tab > Add new provider
   
   Recommended untuk Bank Sampah:
   ✅ Email/Password (untuk pengelola)
   ✅ Google (untuk kemudahan login)
   ❌ Anonymous (tidak direkomendasikan untuk data sensitif)
   ```

3. **Setup Authorized Domains**
   ```
   Settings > Authorized domains
   Tambahkan:
   - localhost (untuk development)
   - your-domain.com (untuk production)
   ```

### Step 3: Setup Firestore Database

1. **Create Firestore Database**
   ```
   Firebase Console > Firestore Database > Create database
   ```

2. **Choose Mode**
   ```
   🔒 Start in production mode (recommended)
   
   Alasan: Data tabungan bersifat sensitif, 
   kita akan setup security rules manual
   ```

3. **Select Location**
   ```
   Database location: asia-southeast1 (Singapore)
   ⚠️ Location tidak bisa diubah setelah dibuat!
   ```

### Step 4: Setup Cloud Storage

1. **Enable Cloud Storage**
   ```
   Firebase Console > Storage > Get Started
   ```

2. **Configure Storage Rules**
   ```
   Start in production mode
   Location: asia-southeast1 (sama dengan Firestore)
   ```

---

## Konfigurasi Aplikasi

### Step 1: Install Firebase SDK

```bash
# Install Firebase dan dependencies
npm install firebase
npm install firebase-admin  # untuk cloud functions jika diperlukan

# Install types untuk TypeScript
npm install --save-dev @types/firebase
```

### Step 2: Firebase Configuration

**Create file: `src/lib/firebase.ts`**

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "bank-sampah-rw-xxx.firebaseapp.com",
  projectId: "bank-sampah-rw-xxx",
  storageBucket: "bank-sampah-rw-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
```

### Step 3: Environment Variables

**Create file: `.env.local`**

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDiqpqppJRm4NyjY9FyA6-q-pf-X8ZJUUg
VITE_FIREBASE_AUTH_DOMAIN=projek-banksampah.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=projek-banksampah
VITE_FIREBASE_STORAGE_BUCKET=projek-banksampah.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=117375971867
VITE_FIREBASE_APP_ID=1:117375971867:web:7ba446f2bd6bb6e2293ebe
VITE_FIREBASE_MEASUREMENT_ID=G-RFRETLE6W5

# App Configuration
VITE_APP_NAME=Bank Sampah RW
VITE_APP_VERSION=1.0.0
```

**Update `src/lib/firebase.ts` untuk menggunakan env vars:**

```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
```

---

## Struktur Database Firestore

### Collection Structure

```
bank-sampah-rw/
├── rw/
│   └── {rwId}/
│       ├── info: { nama, alamat, pengurus, created_at }
│       ├── rt/
│       │   └── {rtId}/
│       │       ├── info: { nomor, ketua, jumlah_kk, alamat, kontak }
│       │       ├── saldo: { current, total_setoran, total_penarikan }
│       │       └── transaksi/
│       │           └── {transaksiId}/
│       │               ├── type: "setoran" | "penarikan"
│       │               ├── amount: number
│       │               ├── date: timestamp
│       │               └── details: object
│       ├── waste_types/
│       │   └── {wasteTypeId}/
│       │       ├── name: string
│       │       ├── price_per_kg: number
│       │       ├── category: string
│       │       └── active: boolean
│       ├── setoran/
│       │   └── {setoranId}/
│       │       ├── rt_id: string
│       │       ├── waste_type_id: string
│       │       ├── weight: number
│       │       ├── price_per_kg: number
│       │       ├── total_value: number
│       │       ├── date: timestamp
│       │       ├── input_by: string (user_id)
│       │       └── created_at: timestamp
│       ├── penarikan/
│       │   └── {penarikanId}/
│       │       ├── rt_id: string
│       │       ├── amount: number
│       │       ├── balance_before: number
│       │       ├── balance_after: number
│       │       ├── date: timestamp
│       │       ├── processed_by: string (user_id)
│       │       ├── notes: string
│       │       └── created_at: timestamp
│       └── laporan/
│           └── {laporanId}/
│               ├── type: "harian" | "mingguan" | "bulanan"
│               ├── period: { start: timestamp, end: timestamp }
│               ├── summary: object
│               ├── generated_by: string (user_id)
│               └── created_at: timestamp
└── users/
    └── {userId}/
        ├── email: string
        ├── name: string
        ├── role: "pengelola" | "admin" | "viewer"
        ├── rw_access: string[] (array of rwId)
        ├── last_login: timestamp
        └── created_at: timestamp
```

### Data Types & Interfaces

**Create file: `src/types/firebase.ts`**

```typescript
import { Timestamp } from 'firebase/firestore';

// Base interfaces
export interface BaseDocument {
  id: string;
  created_at: Timestamp;
  updated_at?: Timestamp;
}

// RW related
export interface RWInfo extends BaseDocument {
  nama: string;
  alamat: string;
  pengurus: {
    ketua: string;
    sekretaris: string;
    bendahara: string;
  };
  total_rt: number;
  active: boolean;
}

// RT related
export interface RTInfo extends BaseDocument {
  nomor: string; // "RT 01", "RT 02"
  ketua: string;
  jumlah_kk: number;
  alamat: string;
  kontak?: string;
  active: boolean;
}

export interface RTSaldo extends BaseDocument {
  rt_id: string;
  current: number;
  total_setoran: number;
  total_penarikan: number;
  last_transaction: Timestamp;
}

// Waste related
export interface WasteType extends BaseDocument {
  name: string;
  price_per_kg: number;
  category: string;
  description?: string;
  active: boolean;
}

// Transaction related
export interface Setoran extends BaseDocument {
  rt_id: string;
  waste_type_id: string;
  waste_type_name: string; // denormalized for easy querying
  weight: number;
  price_per_kg: number;
  total_value: number;
  date: Timestamp;
  input_by: string; // user_id
  notes?: string;
}

export interface Penarikan extends BaseDocument {
  rt_id: string;
  rt_name: string; // denormalized
  amount: number;
  balance_before: number;
  balance_after: number;
  date: Timestamp;
  processed_by: string; // user_id
  notes?: string;
  receipt_number?: string;
}

// User related
export interface User extends BaseDocument {
  uid: string;
  email: string;
  name: string;
  role: 'pengelola' | 'admin' | 'viewer';
  rw_access: string[]; // array of rwId that user can access
  last_login: Timestamp;
  active: boolean;
}

// Report related
export interface Laporan extends BaseDocument {
  type: 'harian' | 'mingguan' | 'bulanan';
  period: {
    start: Timestamp;
    end: Timestamp;
  };
  summary: {
    total_setoran_kg: number;
    total_setoran_value: number;
    total_penarikan: number;
    active_rt: number;
    top_waste_types: {
      name: string;
      weight: number;
      value: number;
    }[];
    top_rt: {
      rt_name: string;
      total_value: number;
      transaction_count: number;
    }[];
  };
  generated_by: string; // user_id
}
```

---

## Implementasi Authentication

### Authentication Service

**Create file: `src/services/authService.ts`**

```typescript
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types/firebase';

class AuthService {
  // Login pengelola
  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user data from Firestore
      const userDoc = await this.getUserData(user.uid);
      
      if (!userDoc || !userDoc.active) {
        throw new Error('User tidak aktif atau tidak ditemukan');
      }
      
      // Update last login
      await this.updateLastLogin(user.uid);
      
      return userDoc;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error('Gagal logout');
    }
  }

  // Get user data from Firestore
  async getUserData(uid: string): Promise<User | null> {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        return { id: userDocSnap.id, ...userDocSnap.data() } as User;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Update last login
  async updateLastLogin(uid: string) {
    try {
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, {
        last_login: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  // Auth state observer
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userData = await this.getUserData(firebaseUser.uid);
        callback(userData);
      } else {
        callback(null);
      }
    });
  }

  // Reset password
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Get current user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Error message mapping
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Email tidak terdaftar';
      case 'auth/wrong-password':
        return 'Password salah';
      case 'auth/invalid-email':
        return 'Format email tidak valid';
      case 'auth/user-disabled':
        return 'Akun telah dinonaktifkan';
      case 'auth/too-many-requests':
        return 'Terlalu banyak percobaan login. Coba lagi nanti';
      case 'auth/network-request-failed':
        return 'Koneksi internet bermasalah';
      default:
        return 'Terjadi kesalahan saat login';
    }
  }
}

export const authService = new AuthService();
```

### Auth Context

**Create file: `src/contexts/AuthContext.tsx`**

```tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { User } from '@/types/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const user = await authService.login(email, password);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    await authService.resetPassword(email);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### Protected Route Component

**Create file: `src/components/ProtectedRoute.tsx`**

```tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'pengelola' | 'admin' | 'viewer';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-12 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">
            Anda tidak memiliki akses ke halaman ini
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
```

### Login Component Update

**Update file: `src/components/Login.tsx`**

```tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Leaf, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, resetPassword } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast({
        title: "Login Berhasil",
        description: "Selamat datang di Bank Sampah RW",
      });
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!formData.email) {
      setError('Masukkan email terlebih dahulu');
      return;
    }

    try {
      await resetPassword(formData.email);
      toast({
        title: "Reset Password",
        description: "Link reset password telah dikirim ke email Anda",
      });
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto bg-primary p-3 rounded-lg w-fit">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Bank Sampah RW</CardTitle>
            <p className="text-muted-foreground">Login Pengelola</p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="pengelola@banksampah.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? "Memproses..." : "Login"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-sm text-primary hover:underline"
              >
                Lupa Password?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
```

---

## Implementasi Database Operations

### Database Service

**Create file: `src/services/databaseService.ts`**

```typescript
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  writeBatch,
  increment,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  RTInfo, 
  RTSaldo, 
  WasteType, 
  Setoran, 
  Penarikan, 
  User 
} from '@/types/firebase';

class DatabaseService {
  // ===== RT MANAGEMENT =====
  
  // Get all RT
  async getAllRT(rwId: string): Promise<RTInfo[]> {
    try {
      const rtCollection = collection(db, 'rw', rwId, 'rt');
      const rtSnapshot = await getDocs(query(rtCollection, where('active', '==', true)));
      
      return rtSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RTInfo[];
    } catch (error) {
      console.error('Error getting RT list:', error);
      throw new Error('Gagal mengambil data RT');
    }
  }

  // Add new RT
  async addRT(rwId: string, rtData: Omit<RTInfo, 'id' | 'created_at'>): Promise<string> {
    try {
      const batch = writeBatch(db);
      
      // Add RT info
      const rtRef = doc(collection(db, 'rw', rwId, 'rt'));
      batch.set(rtRef, {
        ...rtData,
        created_at: Timestamp.now(),
        active: true
      });
      
      // Initialize RT saldo
      const saldoRef = doc(db, 'rw', rwId, 'rt', rtRef.id, 'saldo', 'current');
      batch.set(saldoRef, {
        rt_id: rtRef.id,
        current: 0,
        total_setoran: 0,
        total_penarikan: 0,
        last_transaction: Timestamp.now(),
        created_at: Timestamp.now()
      });
      
      await batch.commit();
      return rtRef.id;
    } catch (error) {
      console.error('Error adding RT:', error);
      throw new Error('Gagal menambahkan RT');
    }
  }

  // Update RT
  async updateRT(rwId: string, rtId: string, rtData: Partial<RTInfo>): Promise<void> {
    try {
      const rtRef = doc(db, 'rw', rwId, 'rt', rtId);
      await updateDoc(rtRef, {
        ...rtData,
        updated_at: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating RT:', error);
      throw new Error('Gagal mengupdate RT');
    }
  }

  // Delete RT (soft delete)
  async deleteRT(rwId: string, rtId: string): Promise<void> {
    try {
      const rtRef = doc(db, 'rw', rwId, 'rt', rtId);
      await updateDoc(rtRef, {
        active: false,
        updated_at: Timestamp.now()
      });
    } catch (error) {
      console.error('Error deleting RT:', error);
      throw new Error('Gagal menghapus RT');
    }
  }

  // ===== WASTE TYPES =====
  
  // Get all waste types
  async getWasteTypes(rwId: string): Promise<WasteType[]> {
    try {
      const wasteTypesCollection = collection(db, 'rw', rwId, 'waste_types');
      const wasteTypesSnapshot = await getDocs(
        query(wasteTypesCollection, where('active', '==', true))
      );
      
      return wasteTypesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as WasteType[];
    } catch (error) {
      console.error('Error getting waste types:', error);
      throw new Error('Gagal mengambil data jenis sampah');
    }
  }

  // ===== SETORAN MANAGEMENT =====
  
  // Add setoran
  async addSetoran(rwId: string, setoranData: Omit<Setoran, 'id' | 'created_at'>): Promise<string> {
    try {
      const batch = writeBatch(db);
      
      // Add setoran record
      const setoranRef = doc(collection(db, 'rw', rwId, 'setoran'));
      batch.set(setoranRef, {
        ...setoranData,
        created_at: Timestamp.now()
      });
      
      // Update RT saldo
      const saldoRef = doc(db, 'rw', rwId, 'rt', setoranData.rt_id, 'saldo', 'current');
      batch.update(saldoRef, {
        current: increment(setoranData.total_value),
        total_setoran: increment(setoranData.total_value),
        last_transaction: Timestamp.now()
      });
      
      // Add to RT transaction history
      const transaksiRef = doc(collection(db, 'rw', rwId, 'rt', setoranData.rt_id, 'transaksi'));
      batch.set(transaksiRef, {
        type: 'setoran',
        amount: setoranData.total_value,
        date: setoranData.date,
        details: {
          waste_type: setoranData.waste_type_name,
          weight: setoranData.weight,
          price_per_kg: setoranData.price_per_kg
        },
        created_at: Timestamp.now()
      });
      
      await batch.commit();
      return setoranRef.id;
    } catch (error) {
      console.error('Error adding setoran:', error);
      throw new Error('Gagal menambahkan setoran');
    }
  }

  // Get recent setoran
  async getRecentSetoran(rwId: string, limitCount: number = 10): Promise<Setoran[]> {
    try {
      const setoranCollection = collection(db, 'rw', rwId, 'setoran');
      const setoranSnapshot = await getDocs(
        query(setoranCollection, orderBy('created_at', 'desc'), limit(limitCount))
      );
      
      return setoranSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Setoran[];
    } catch (error) {
      console.error('Error getting recent setoran:', error);
      throw new Error('Gagal mengambil data setoran terbaru');
    }
  }

  // ===== PENARIKAN MANAGEMENT =====
  
  // Get RT saldo
  async getRTSaldo(rwId: string, rtId: string): Promise<RTSaldo | null> {
    try {
      const saldoRef = doc(db, 'rw', rwId, 'rt', rtId, 'saldo', 'current');
      const saldoSnap = await getDoc(saldoRef);
      
      if (saldoSnap.exists()) {
        return { id: saldoSnap.id, ...saldoSnap.data() } as RTSaldo;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting RT saldo:', error);
      throw new Error('Gagal mengambil saldo RT');
    }
  }

  // Process penarikan
  async processPenarikan(
    rwId: string, 
    penarikanData: Omit<Penarikan, 'id' | 'created_at'>
  ): Promise<string> {
    try {
      const batch = writeBatch(db);
      
      // Check saldo first
      const saldoRef = doc(db, 'rw', rwId, 'rt', penarikanData.rt_id, 'saldo', 'current');
      const saldoSnap = await getDoc(saldoRef);
      
      if (!saldoSnap.exists()) {
        throw new Error('Data saldo RT tidak ditemukan');
      }
      
      const currentSaldo = saldoSnap.data()?.current || 0;
      if (currentSaldo < penarikanData.amount) {
        throw new Error('Saldo tidak mencukupi');
      }
      
      // Add penarikan record
      const penarikanRef = doc(collection(db, 'rw', rwId, 'penarikan'));
      batch.set(penarikanRef, {
        ...penarikanData,
        created_at: Timestamp.now()
      });
      
      // Update RT saldo
      batch.update(saldoRef, {
        current: increment(-penarikanData.amount),
        total_penarikan: increment(penarikanData.amount),
        last_transaction: Timestamp.now()
      });
      
      // Add to RT transaction history
      const transaksiRef = doc(collection(db, 'rw', rwId, 'rt', penarikanData.rt_id, 'transaksi'));
      batch.set(transaksiRef, {
        type: 'penarikan',
        amount: penarikanData.amount,
        date: penarikanData.date,
        details: {
          notes: penarikanData.notes
        },
        created_at: Timestamp.now()
      });
      
      await batch.commit();
      return penarikanRef.id;
    } catch (error) {
      console.error('Error processing penarikan:', error);
      throw new Error(error instanceof Error ? error.message : 'Gagal memproses penarikan');
    }
  }

  // ===== DASHBOARD DATA =====
  
  // Get dashboard summary
  async getDashboardSummary(rwId: string) {
    try {
      // Get all RT saldo
      const rtList = await this.getAllRT(rwId);
      const saldoPromises = rtList.map(rt => this.getRTSaldo(rwId, rt.id));
      const saldoList = await Promise.all(saldoPromises);
      
      const totalTabungan = saldoList.reduce((sum, saldo) => 
        sum + (saldo?.current || 0), 0
      );
      
      const totalSetoran = saldoList.reduce((sum, saldo) => 
        sum + (saldo?.total_setoran || 0), 0
      );
      
      const totalPenarikan = saldoList.reduce((sum, saldo) => 
        sum + (saldo?.total_penarikan || 0), 0
      );
      
      // Get today's setoran count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = Timestamp.fromDate(today);
      
      const setoranCollection = collection(db, 'rw', rwId, 'setoran');
      const todaySetoranSnapshot = await getDocs(
        query(setoranCollection, where('date', '>=', todayTimestamp))
      );
      
      return {
        totalRT: rtList.length,
        totalTabungan,
        totalSetoran,
        totalPenarikan,
        transaksiHariIni: todaySetoranSnapshot.size,
        rtList: rtList.map(rt => {
          const saldo = saldoList.find(s => s?.rt_id === rt.id);
          return {
            ...rt,
            saldo: saldo?.current || 0
          };
        })
      };
    } catch (error) {
      console.error('Error getting dashboard summary:', error);
      throw new Error('Gagal mengambil ringkasan dashboard');
    }
  }

  // ===== REAL-TIME LISTENERS =====
  
  // Listen to setoran changes
  onSetoranChange(rwId: string, callback: (setoran: Setoran[]) => void) {
    const setoranCollection = collection(db, 'rw', rwId, 'setoran');
    const q = query(setoranCollection, orderBy('created_at', 'desc'), limit(5));
    
    return onSnapshot(q, (snapshot) => {
      const setoran = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Setoran[];
      callback(setoran);
    });
  }

  // Listen to saldo changes
  onSaldoChange(rwId: string, rtId: string, callback: (saldo: RTSaldo | null) => void) {
    const saldoRef = doc(db, 'rw', rwId, 'rt', rtId, 'saldo', 'current');
    
    return onSnapshot(saldoRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as RTSaldo);
      } else {
        callback(null);
      }
    });
  }
}

export const databaseService = new DatabaseService();
```

---

## Security Rules

### Firestore Security Rules

**Firebase Console > Firestore Database > Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - hanya user yang login bisa akses data sendiri
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
                     resource.data.role in ['admin'] &&
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // RW collection - hanya user yang memiliki akses
    match /rw/{rwId} {
      allow read, write: if request.auth != null && 
                            rwId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rw_access;
      
      // RT subcollection
      match /rt/{rtId} {
        allow read, write: if request.auth != null && 
                              rwId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rw_access;
        
        // RT transactions and saldo
        match /{subcollection=**} {
          allow read, write: if request.auth != null && 
                                rwId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rw_access;
        }
      }
      
      // Waste types - read untuk semua user yang punya akses RW
      match /waste_types/{wasteTypeId} {
        allow read: if request.auth != null && 
                       rwId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rw_access;
        allow write: if request.auth != null && 
                        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'pengelola'] &&
                        rwId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rw_access;
      }
      
      // Setoran - pengelola dan admin bisa write, semua bisa read
      match /setoran/{setoranId} {
        allow read: if request.auth != null && 
                       rwId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rw_access;
        allow create: if request.auth != null && 
                         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'pengelola'] &&
                         rwId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rw_access &&
                         request.resource.data.input_by == request.auth.uid;
        allow update, delete: if request.auth != null && 
                                 get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      }
      
      // Penarikan - sama seperti setoran
      match /penarikan/{penarikanId} {
        allow read: if request.auth != null && 
                       rwId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rw_access;
        allow create: if request.auth != null && 
                         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'pengelola'] &&
                         rwId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rw_access &&
                         request.resource.data.processed_by == request.auth.uid;
        allow update, delete: if request.auth != null && 
                                 get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      }
      
      // Laporan - semua bisa read, admin & pengelola bisa write
      match /laporan/{laporanId} {
        allow read: if request.auth != null && 
                       rwId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rw_access;
        allow write: if request.auth != null && 
                        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'pengelola'] &&
                        rwId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rw_access;
      }
    }
  }
}
```

### Cloud Storage Security Rules

**Firebase Console > Storage > Rules**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Images and documents untuk RW
    match /rw/{rwId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
                            rwId in firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.rw_access;
    }
    
    // User profile images
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public assets (logos, etc)
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                      firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## Deployment & Production

### Build & Deploy Setup

**Update `package.json`:**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && firebase deploy"
  },
  "devDependencies": {
    "firebase-tools": "^12.0.0"
  }
}
```

### Firebase Hosting Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Hosting
firebase init hosting

# Jawab pertanyaan:
# ? What do you want to use as your public directory? dist
# ? Configure as a single-page app (rewrite all urls to /index.html)? Yes
# ? Set up automatic builds and deploys with GitHub? No (bisa Yes jika ingin CI/CD)
# ? File dist/index.html already exists. Overwrite? No
```

**Create `firebase.json`:**

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp|js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### Environment Configuration

**Production `.env.production`:**

```env
# Firebase Production Configuration
VITE_FIREBASE_API_KEY=your-production-api-key
VITE_FIREBASE_AUTH_DOMAIN=bank-sampah-rw-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bank-sampah-rw-xxx
VITE_FIREBASE_STORAGE_BUCKET=bank-sampah-rw-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# App Configuration
VITE_APP_NAME=Bank Sampah RW
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production
```

### Deploy Commands

```bash
# Build untuk production
npm run build

# Deploy ke Firebase Hosting
firebase deploy --only hosting

# Deploy semua (hosting + rules)
firebase deploy

# Deploy dengan target spesifik
firebase deploy --only hosting,firestore:rules

# Preview sebelum deploy
firebase hosting:channel:deploy preview
```

---

## Monitoring & Analytics

### Firebase Analytics Setup

**Update `src/lib/firebase.ts`:**

```typescript
import { logEvent } from 'firebase/analytics';
import { analytics } from '@/lib/firebase';

// Custom analytics events untuk bank sampah
export const logBankSampahEvent = {
  setoranAdded: (rtId: string, wasteType: string, value: number) => {
    logEvent(analytics, 'setoran_added', {
      rt_id: rtId,
      waste_type: wasteType,
      value: value
    });
  },
  
  penarikanProcessed: (rtId: string, amount: number) => {
    logEvent(analytics, 'penarikan_processed', {
      rt_id: rtId,
      amount: amount
    });
  },
  
  laporanGenerated: (type: string, period: string) => {
    logEvent(analytics, 'laporan_generated', {
      report_type: type,
      period: period
    });
  },
  
  userLogin: (role: string) => {
    logEvent(analytics, 'login', {
      method: 'email',
      user_role: role
    });
  }
};
```

### Performance Monitoring

**Install Firebase Performance:**

```bash
npm install firebase/performance
```

**Update `src/lib/firebase.ts`:**

```typescript
import { getPerformance } from 'firebase/performance';

export const perf = getPerformance(app);
```

**Add performance traces:**

```typescript
import { trace } from 'firebase/performance';
import { perf } from '@/lib/firebase';

// Example: Monitor setoran input performance
const addSetoranTrace = trace(perf, 'add_setoran');
addSetoranTrace.start();

try {
  await databaseService.addSetoran(rwId, setoranData);
  addSetoranTrace.putAttribute('success', 'true');
} catch (error) {
  addSetoranTrace.putAttribute('success', 'false');
  throw error;
} finally {
  addSetoranTrace.stop();
}
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. Firebase Configuration Issues

**Problem**: `Firebase: Error (auth/invalid-api-key)`

**Solution**:
```bash
# Check environment variables
echo $VITE_FIREBASE_API_KEY

# Regenerate config from Firebase Console
# Project Settings > General > Your apps > Config
```

#### 2. Firestore Permission Denied

**Problem**: `Missing or insufficient permissions`

**Solution**:
```javascript
// Check security rules di Firebase Console
// Pastikan user sudah login dan memiliki akses yang benar

// Debug dengan enable logging
import { connectFirestoreEmulator, enableNetwork } from 'firebase/firestore';

// Development only
if (location.hostname === 'localhost') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

#### 3. Real-time Listener Memory Leaks

**Problem**: Component unmount tapi listener masih aktif

**Solution**:
```typescript
useEffect(() => {
  const unsubscribe = databaseService.onSetoranChange(rwId, setSetoranList);
  
  // Cleanup function
  return () => {
    unsubscribe();
  };
}, [rwId]);
```

#### 4. Batch Write Limits

**Problem**: `Maximum 500 writes per batch`

**Solution**:
```typescript
// Split large operations into multiple batches
const batchSize = 500;
const batches = [];

for (let i = 0; i < operations.length; i += batchSize) {
  const batch = writeBatch(db);
  const chunk = operations.slice(i, i + batchSize);
  
  chunk.forEach(operation => {
    // Add operations to batch
  });
  
  batches.push(batch.commit());
}

await Promise.all(batches);
```

#### 5. Offline Support Issues

**Problem**: Data tidak tersync ketika online kembali

**Solution**:
```typescript
import { enableNetwork, disableNetwork } from 'firebase/firestore';

// Enable offline persistence
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});

// Monitor network status
window.addEventListener('online', () => {
  enableNetwork(db);
});

window.addEventListener('offline', () => {
  disableNetwork(db);
});
```

### Debugging Tools

#### Firebase Emulator Suite

```bash
# Install emulator
npm install -g firebase-tools

# Setup emulator
firebase init emulators

# Run emulator
firebase emulators:start

# Run with import/export
firebase emulators:start --import=./firebase-data --export-on-exit
```

#### Console Logging

```typescript
// Enable Firestore logging
import { enableLogging } from 'firebase/firestore';

if (process.env.NODE_ENV === 'development') {
  enableLogging(true);
}
```

---

## Best Practices

### 1. **Data Structure Design**
- ✅ Denormalize data untuk query yang cepat
- ✅ Gunakan subcollection untuk data hierarkis
- ✅ Batasi nesting maksimal 100 levels
- ✅ Index field yang sering di-query

### 2. **Security**
- ✅ Selalu validasi di security rules
- ✅ Jangan percaya client-side validation
- ✅ Gunakan role-based access control
- ✅ Audit security rules secara berkala

### 3. **Performance**
- ✅ Minimize query complexity
- ✅ Use pagination untuk large datasets
- ✅ Cache data di client side
- ✅ Monitor quota usage

### 4. **Cost Optimization**
- ✅ Minimize document reads
- ✅ Use real-time listeners dengan bijak
- ✅ Archive old data ke cold storage
- ✅ Monitor billing alerts

---

**Firebase Integration Guide v1.0**  
*Terakhir diperbarui: 7 Agustus 2025*  
*Untuk pertanyaan teknis, hubungi tim development*
