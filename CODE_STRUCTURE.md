# Struktur Code Bank Sampah RW

## 📁 Struktur Direktori

```
src/
├── components/           # React Components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── Dashboard.tsx    # Dashboard utama dengan statistik real-time
│   ├── WasteDeposit.tsx # Input setoran sampah + integrasi tabungan
│   ├── RTManagement.tsx # CRUD manajemen data RT
│   ├── Savings.tsx      # Manajemen dan monitoring tabungan
│   ├── Reports.tsx      # Laporan komprehensif dengan filter periode
│   ├── Login.tsx        # Autentikasi user
│   ├── Layout.tsx       # Layout wrapper dengan navigation
│   ├── Navigation.tsx   # Sidebar navigation
│   ├── ProtectedRoute.tsx # Route protection
│   └── Settings.tsx     # Pengaturan aplikasi
├── contexts/
│   └── AuthContext.tsx  # Context untuk autentikasi user
├── services/
│   ├── databaseService.ts # Service layer untuk Firestore operations
│   └── authService.ts    # Service layer untuk Firebase Auth
├── lib/
│   ├── firebase.ts      # Firebase configuration
│   └── utils.ts         # Utility functions
├── hooks/
│   ├── use-mobile.tsx   # Hook untuk responsive design
│   └── use-toast.ts     # Hook untuk toast notifications
└── pages/
    ├── Index.tsx        # Main app page
    └── NotFound.tsx     # 404 page
```

## 🔥 Firebase Integration

### Collections Used:
- `users` - User profiles dan roles
- `rts` - Data RT (nama ketua, alamat, saldo, dll)
- `members` - Member RT (kolektif per RT)
- `wasteDeposits` - Transaksi setoran sampah
- `savingsTransactions` - Transaksi tabungan (setoran/penarikan)

### Authentication:
- Firebase Auth dengan email/password
- Auto-profile creation untuk user baru
- Role-based access (admin/operator)

## 🚀 Component Features

### 1. Dashboard.tsx
- **Purpose**: Overview sistem dengan statistik real-time
- **Features**: Total RT, anggota, tabungan, transaksi
- **Data Source**: Firebase Firestore (real-time)
- **Access**: Admin (semua data), Operator (data RT sendiri)

### 2. WasteDeposit.tsx
- **Purpose**: Input setoran sampah dengan integrasi tabungan
- **Features**: 
  - Form input dengan validasi
  - Kalkulasi otomatis nilai sampah
  - Auto-credit ke saldo RT
  - Real-time statistics
- **Integration**: Otomatis membuat transaksi tabungan

### 3. RTManagement.tsx
- **Purpose**: CRUD manajemen data RT
- **Features**:
  - Add/Edit/Delete RT (admin only)
  - View RT dengan saldo real-time
  - Role-based UI
- **Integration**: Saldo update otomatis dari setoran

### 4. Savings.tsx
- **Purpose**: Monitoring dan manajemen tabungan
- **Features**:
  - Overview saldo per RT
  - Riwayat transaksi tabungan
  - Statistics (total setoran, penarikan, saldo)
- **Data**: Real dari transaksi setoran sampah

### 5. Reports.tsx
- **Purpose**: Laporan komprehensif dengan analytics
- **Features**:
  - Filter periode custom
  - Breakdown per RT
  - Export ready (PDF)
  - Recent activities

## 🛠️ Data Flow

```
Input Setoran Sampah →
├── Simpan WasteDeposit
├── Buat/Update Member RT
├── Buat SavingsTransaction (deposit)
├── Update saldo RT
└── Real-time update semua komponen
```

## 🔐 Role-Based Access

### Admin:
- Full access semua data dan fungsi
- CRUD RT, view semua transaksi
- Dashboard global, laporan komprehensif

### Operator RT:
- Access terbatas ke RT mereka sendiri
- Input setoran untuk RT mereka
- View transaksi RT sendiri

## 📱 Responsive Design

- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interfaces
- Progressive Web App ready

## 🎨 UI/UX

- **Design System**: shadcn/ui + Tailwind CSS
- **Theme**: Consistent green theme untuk Bank Sampah
- **Icons**: Lucide React icons
- **Typography**: System fonts dengan fallbacks
- **Animations**: Smooth transitions dan loading states

## 🚦 Development Guidelines

### File Naming:
- PascalCase untuk components: `ComponentName.tsx`
- camelCase untuk services: `serviceName.ts`
- kebab-case untuk utilities: `utility-name.ts`

### Import Organization:
```typescript
// 1. React imports
import { useState, useEffect } from "react";

// 2. UI components
import { Card, CardContent } from "@/components/ui/card";

// 3. Icons
import { Users, Wallet } from "lucide-react";

// 4. Services & contexts
import { databaseService } from "@/services/databaseService";
import { useAuth } from "@/contexts/AuthContext";
```

### Code Structure:
1. Component documentation header
2. Imports (organized by category)
3. Interfaces/types
4. Component definition
5. State management
6. Effects and lifecycle
7. Event handlers
8. Utility functions
9. Render logic

## 🔍 Debugging & Monitoring

- Console errors untuk development
- Toast notifications untuk user feedback
- Loading states untuk UX
- Error boundaries untuk production
- Firebase console untuk data monitoring

## 📝 Next Steps

1. **PDF Export**: Implement laporan PDF export
2. **Advanced Analytics**: Chart.js integration
3. **Notifications**: Real-time notifications
4. **Backup**: Automated data backup
5. **Mobile App**: React Native version
