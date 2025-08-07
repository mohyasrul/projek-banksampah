import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'operator' | 'user';
  rtNumber?: string;
  fullName: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

class AuthService {
  // Login dengan email dan password
  async login(email: string, password: string): Promise<UserProfile> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Ambil profile user dari Firestore
      let userProfile = await this.getUserProfile(user.uid);
      
      // Jika profile tidak ada, buat profile default
      if (!userProfile) {
        console.log('Profile tidak ditemukan, membuat profile default...');
        userProfile = await this.createDefaultProfile(user);
      }

      if (!userProfile.isActive) {
        throw new Error('Akun tidak aktif. Hubungi administrator.');
      }

      // Update last login
      await this.updateLastLogin(user.uid);
      
      return userProfile;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Jika error dari auth (seperti wrong password), gunakan message asli
      if (error.code) {
        throw new Error(this.getAuthErrorMessage(error.code));
      }
      
      // Jika error lain, gunakan message error
      throw new Error(error.message || 'Terjadi kesalahan saat login');
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Gagal logout');
    }
  }

  // Get current user profile
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    return await this.getUserProfile(user.uid);
  }

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          uid,
          email: data.email,
          role: data.role,
          rtNumber: data.rtNumber,
          fullName: data.fullName,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLogin: data.lastLogin?.toDate(),
          isActive: data.isActive
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Update last login
  async updateLastLogin(uid: string): Promise<void> {
    try {
      const { updateDoc } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', uid), {
        lastLogin: new Date()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  // Create default profile untuk user baru
  async createDefaultProfile(user: User): Promise<UserProfile> {
    try {
      const { setDoc } = await import('firebase/firestore');
      
      // Tentukan role berdasarkan email
      let role: 'admin' | 'operator' | 'user' = 'user';
      let rtNumber: string | undefined;
      
      if (user.email?.includes('admin')) {
        role = 'admin';
      } else if (user.email?.includes('operator') || user.email?.includes('rw')) {
        role = 'operator';
        // Extract RT number dari email jika ada pattern seperti rw10@
        const rtMatch = user.email.match(/rw(\d+)/i);
        rtNumber = rtMatch ? rtMatch[1].padStart(3, '0') : '001';
      }

      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        role,
        rtNumber,
        fullName: user.displayName || user.email?.split('@')[0] || 'User',
        createdAt: new Date(),
        isActive: true
      };

      // Simpan ke Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: userProfile.email,
        role: userProfile.role,
        rtNumber: userProfile.rtNumber,
        fullName: userProfile.fullName,
        createdAt: userProfile.createdAt,
        isActive: userProfile.isActive
      });

      console.log('Profile default berhasil dibuat:', userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error creating default profile:', error);
      throw new Error('Gagal membuat profile user');
    }
  }

  // Monitor auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get auth error messages in Indonesian
  private getAuthErrorMessage(errorCode: string): string {
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
        return 'Terlalu banyak percobaan login. Coba lagi nanti.';
      case 'auth/network-request-failed':
        return 'Koneksi internet bermasalah';
      default:
        return 'Terjadi kesalahan saat login';
    }
  }

  // Check if user has permission
  hasPermission(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.includes(userRole);
  }

  // Check if user can access RT management
  canManageRT(userRole: string, userRtNumber?: string, targetRtNumber?: string): boolean {
    if (userRole === 'admin') return true;
    if (userRole === 'operator' && userRtNumber === targetRtNumber) return true;
    return false;
  }
}

export const authService = new AuthService();
