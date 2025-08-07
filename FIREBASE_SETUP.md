# Firebase Integration - Bank Sampah RW

Firebase telah berhasil dikonfigurasi untuk aplikasi Bank Sampah RW dengan fitur-fitur berikut:

## ✅ Fitur yang Telah Diimplementasi

### 1. Authentication Service
- Login menggunakan email dan password
- Logout
- Auth state monitoring
- Role-based authentication (admin, operator, user)
- Session persistence

### 2. Database Service  
- RT Management (CRUD operations)
- Member Management (CRUD operations)
- Waste Deposit transactions
- Savings transactions with automatic balance updates
- Member number auto-generation
- Batch operations untuk konsistensi data

### 3. Security Rules
- Role-based access control
- RT-specific data isolation untuk operators
- Admin memiliki akses penuh ke semua data
- Operators hanya bisa akses data RT mereka sendiri

### 4. File yang Telah Dibuat/Diupdate

```
src/
├── lib/
│   └── firebase.ts                 # Firebase configuration
├── services/
│   ├── authService.ts             # Authentication service
│   └── databaseService.ts         # Database operations
├── contexts/
│   └── AuthContext.tsx            # Updated untuk Firebase
├── components/
│   ├── Login.tsx                  # Updated untuk Firebase auth
│   ├── Layout.tsx                 # Updated user info display
│   └── ProtectedRoute.tsx         # Updated auth checking
.env.local                         # Environment variables
firestore.rules                   # Security rules
sample-data.js                    # Sample data untuk testing
```

## 🚀 Langkah Selanjutnya

### 1. Setup Users di Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Pilih project "projek-banksampah"
3. Buka Authentication > Users
4. Tambahkan user baru:

**Admin User:**
- Email: `admin@banksampah.local`
- Password: `admin123`

**Operator RT 001:**
- Email: `operator.rt001@banksampah.local` 
- Password: `operator123`

### 2. Setup User Profiles di Firestore

1. Buka Firestore Database
2. Buat collection `users`
3. Tambahkan document dengan UID dari Authentication:

**Admin Profile:**
```json
{
  "email": "admin@banksampah.local",
  "role": "admin",
  "fullName": "Administrator Bank Sampah",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "isActive": true
}
```

**Operator Profile:**
```json
{
  "email": "operator.rt001@banksampah.local",
  "role": "operator", 
  "rtNumber": "001",
  "fullName": "Operator RT 001",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "isActive": true
}
```

### 3. Deploy Security Rules

1. Di Firebase Console, buka Firestore Database
2. Pergi ke Rules tab
3. Copy isi dari file `firestore.rules` 
4. Publish rules

### 4. Test Authentication

1. Buka aplikasi di browser: `http://localhost:8080`
2. Coba login dengan kredensial yang telah dibuat
3. Verifikasi role-based access berfungsi

## 🔧 Environment Variables

Pastikan file `.env.local` memiliki konfigurasi yang benar:

```bash
VITE_FIREBASE_API_KEY=AIzaSyDiqpqppJRm4NyjY9FyA6-q-pf-X8ZJUUg
VITE_FIREBASE_AUTH_DOMAIN=projek-banksampah.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=projek-banksampah
VITE_FIREBASE_STORAGE_BUCKET=projek-banksampah.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=117375971867
VITE_FIREBASE_APP_ID=1:117375971867:web:7ba446f2bd6bb6e2293ebe
VITE_FIREBASE_MEASUREMENT_ID=G-RFRETLE6W5
```

## 📱 Penggunaan API

### Authentication
```typescript
import { authService } from '@/services/authService';

// Login
await authService.login('email@example.com', 'password');

// Get current user
const user = await authService.getCurrentUserProfile();

// Logout
await authService.logout();
```

### Database Operations
```typescript
import { databaseService } from '@/services/databaseService';

// Create RT
const rtId = await databaseService.createRT({
  rtNumber: '001',
  rtLeader: 'Pak RT',
  phone: '081234567890',
  address: 'Jl. Contoh',
  totalMembers: 0,
  activeMembers: 0,
  totalSavings: 0,
  isActive: true
});

// Add member
const memberId = await databaseService.createMember({
  rtNumber: '001',
  memberNumber: '001-001',
  fullName: 'Ibu Contoh',
  phone: '081234567891',
  address: 'Jl. Contoh No. 2',
  joinDate: new Date(),
  totalSavings: 0,
  totalWithdrawals: 0,
  isActive: true
});
```

## 🔒 Security Features

1. **Role-based Access Control**: Admin, Operator, dan User memiliki akses berbeda
2. **Data Isolation**: Operator hanya bisa akses data RT mereka
3. **Input Validation**: Semua input divalidasi sebelum disimpan
4. **Transaction Consistency**: Menggunakan batch operations untuk konsistensi data
5. **Error Handling**: Comprehensive error handling dengan pesan dalam bahasa Indonesia

## 📊 Monitoring

1. **Authentication Analytics**: Monitor login/logout di Firebase Analytics
2. **Database Usage**: Track read/write operations di Firestore Usage
3. **Error Tracking**: Implementasi error logging untuk debugging

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build untuk production
npm run build
```

Firebase integration sudah lengkap dan siap untuk development lebih lanjut! 🎉
