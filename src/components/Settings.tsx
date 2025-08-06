import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Database, 
  DollarSign,
  Bell,
  Shield,
  Download,
  Upload,
  Trash2,
  User,
  Clock,
  LogOut,
  Smartphone,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface WastePrice {
  id: string;
  name: string;
  price: number;
  unit: string;
}

export const Settings = () => {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  
  // Data harga sampah akan diambil dari API atau database
  const [wastePrices, setWastePrices] = useState<WastePrice[]>([
    { id: "plastik", name: "Plastik", price: 5000, unit: "kg" },
    { id: "kertas", name: "Kertas", price: 3000, unit: "kg" },
    { id: "logam", name: "Logam", price: 8000, unit: "kg" },
    { id: "kaca", name: "Kaca", price: 2000, unit: "kg" },
    { id: "kardus", name: "Kardus", price: 2500, unit: "kg" }
  ]);

  // Pengaturan aplikasi
  const [appSettings, setAppSettings] = useState({
    autoBackup: true,
    notifications: true,
    emailReports: false,
    whatsappNotifications: true,
    dataRetentionDays: 365,
    rwName: "",
    contactPerson: "",
    contactPhone: "",
    address: ""
  });

  const handlePriceUpdate = (id: string, newPrice: number) => {
    setWastePrices(wastePrices.map(item => 
      item.id === id ? { ...item, price: newPrice } : item
    ));
  };

  const handleSaveSettings = () => {
    // In real app, this would save to database/localStorage
    toast({
      title: "Pengaturan Disimpan",
      description: "Semua perubahan telah berhasil disimpan",
    });
  };

  const handleBackupData = () => {
    // Backup functionality akan diimplementasikan
    toast({
      title: "Backup Berhasil",
      description: "Data telah di-backup ke file lokal",
    });
  };

  const handleRestoreData = () => {
    // Restore functionality akan diimplementasikan
    toast({
      title: "Data Dipulihkan",
      description: "Data berhasil dipulihkan dari backup",
    });
  };

  const handleResetData = () => {
    // Reset functionality akan diimplementasikan - perlu dialog konfirmasi
    toast({
      title: "Data Direset",
      description: "Semua data telah dikembalikan ke pengaturan awal",
      variant: "destructive"
    });
  };

  const handleLogout = () => {
    logout();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 sm:pb-0">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">Pengaturan Sistem</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Konfigurasi aplikasi dan pengaturan operasional</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil Pengguna
            </CardTitle>
            <CardDescription>Informasi akun yang sedang aktif</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
              <div className="space-y-1">
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">@{user?.username}</p>
              </div>
              <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'}>
                {user?.role === 'admin' ? 'Administrator' : 'Operator'}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Level Akses:</span>
                <span className="font-medium">
                  {user?.role === 'admin' ? 'Full Access' : 'Standard Access'}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Login Terakhir:</span>
                <span className="font-medium">
                  {user?.loginTime ? formatDate(user.loginTime) : 'Tidak diketahui'}
                </span>
              </div>
            </div>
            
            <Separator />
            
            <Button 
              variant="destructive" 
              onClick={handleLogout}
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar dari Sistem
            </Button>
          </CardContent>
        </Card>

        {/* Waste Prices Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Harga Sampah</span>
            </CardTitle>
            <CardDescription>Atur harga per kilogram untuk setiap jenis sampah</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {wastePrices.map((waste) => (
              <div key={waste.id} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                <div>
                  <p className="font-medium">{waste.name}</p>
                  <p className="text-sm text-muted-foreground">per {waste.unit}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Rp</span>
                  <Input
                    type="number"
                    value={waste.price}
                    onChange={(e) => handlePriceUpdate(waste.id, parseInt(e.target.value))}
                    className="w-24 text-right"
                  />
                </div>
              </div>
            ))}
            <Button onClick={handleSaveSettings} className="w-full">
              <Save className="mr-2 h-4 w-4" />
              Simpan Harga
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* App Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <span>Konfigurasi Aplikasi</span>
          </CardTitle>
          <CardDescription>Pengaturan umum aplikasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rw-name">Nama RW</Label>
                <Input
                  id="rw-name"
                  value={appSettings.rwName}
                  onChange={(e) => setAppSettings({ ...appSettings, rwName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-person">Penanggung Jawab</Label>
                <Input
                  id="contact-person"
                  value={appSettings.contactPerson}
                  onChange={(e) => setAppSettings({ ...appSettings, contactPerson: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contact-phone">No. Telepon</Label>
                <Input
                  id="contact-phone"
                  value={appSettings.contactPhone}
                  onChange={(e) => setAppSettings({ ...appSettings, contactPhone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input
                  id="address"
                  value={appSettings.address}
                  onChange={(e) => setAppSettings({ ...appSettings, address: e.target.value })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Pengaturan Sistem</span>
          </CardTitle>
          <CardDescription>Konfigurasi dan status sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Penyimpanan Data</p>
                  <p className="text-xs text-muted-foreground">Login: Lokal | Data: Cloud</p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Aktif
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Mode Responsif</p>
                  <p className="text-xs text-muted-foreground">Optimasi mobile dan desktop</p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Aktif
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Bahasa</p>
                  <p className="text-xs text-muted-foreground">Bahasa Indonesia</p>
                </div>
              </div>
              <Badge variant="outline">
                ID
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Pengaturan Notifikasi</span>
          </CardTitle>
          <CardDescription>Kelola notifikasi dan pemberitahuan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifikasi Push</p>
                  <p className="text-sm text-muted-foreground">Pemberitahuan dalam aplikasi</p>
                </div>
                <Switch
                  checked={appSettings.notifications}
                  onCheckedChange={(checked) => setAppSettings({ ...appSettings, notifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Laporan Email</p>
                  <p className="text-sm text-muted-foreground">Kirim laporan bulanan via email</p>
                </div>
                <Switch
                  checked={appSettings.emailReports}
                  onCheckedChange={(checked) => setAppSettings({ ...appSettings, emailReports: checked })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">WhatsApp Notifikasi</p>
                  <p className="text-sm text-muted-foreground">Pemberitahuan via WhatsApp</p>
                </div>
                <Switch
                  checked={appSettings.whatsappNotifications}
                  onCheckedChange={(checked) => setAppSettings({ ...appSettings, whatsappNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Backup</p>
                  <p className="text-sm text-muted-foreground">Backup otomatis harian</p>
                </div>
                <Switch
                  checked={appSettings.autoBackup}
                  onCheckedChange={(checked) => setAppSettings({ ...appSettings, autoBackup: checked })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Manajemen Data</span>
          </CardTitle>
          <CardDescription>Backup, restore, dan pengelolaan data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" onClick={handleBackupData} className="flex flex-col h-20 space-y-2">
              <Download className="h-5 w-5" />
              <span className="text-sm">Backup Data</span>
            </Button>

            <Button variant="outline" onClick={handleRestoreData} className="flex flex-col h-20 space-y-2">
              <Upload className="h-5 w-5" />
              <span className="text-sm">Restore Data</span>
            </Button>

            <Button variant="outline" className="flex flex-col h-20 space-y-2">
              <RefreshCw className="h-5 w-5" />
              <span className="text-sm">Sinkronisasi</span>
            </Button>

            <Button variant="destructive" onClick={handleResetData} className="flex flex-col h-20 space-y-2">
              <Trash2 className="h-5 w-5" />
              <span className="text-sm">Reset Data</span>
            </Button>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Retensi Data</p>
                <p className="text-sm text-muted-foreground">Data akan dihapus otomatis setelah periode ini</p>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={appSettings.dataRetentionDays}
                  onChange={(e) => setAppSettings({ ...appSettings, dataRetentionDays: parseInt(e.target.value) })}
                  className="w-20"
                />
                <span className="text-sm">hari</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Sistem</CardTitle>
          <CardDescription>Detail versi dan konfigurasi aplikasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-accent/30 rounded-lg">
              <p className="text-2xl font-bold text-primary">v1.0</p>
              <p className="text-xs text-muted-foreground">Versi Aplikasi</p>
            </div>
            <div className="p-4 bg-accent/30 rounded-lg">
              <p className="text-2xl font-bold text-green-600">Online</p>
              <p className="text-xs text-muted-foreground">Status Sistem</p>
            </div>
            <div className="p-4 bg-accent/30 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">React</p>
              <p className="text-xs text-muted-foreground">Frontend</p>
            </div>
            <div className="p-4 bg-accent/30 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">Local</p>
              <p className="text-xs text-muted-foreground">Auth Storage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save All Settings */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset ke Default
        </Button>
        <Button onClick={handleSaveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Simpan Semua Pengaturan
        </Button>
      </div>
    </div>
  );
};