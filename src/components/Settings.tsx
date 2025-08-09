import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Save, 
  DollarSign,
  Bell,
  Download,
  Upload,
  User,
  LogOut,
  AlertTriangle,
  Edit
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
  
  // State untuk dialog konfirmasi
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  
  // Data harga sampah
  const [wastePrices, setWastePrices] = useState<WastePrice[]>([
    { id: "plastik", name: "Plastik", price: 5000, unit: "kg" },
    { id: "kertas", name: "Kertas", price: 3000, unit: "kg" },
    { id: "logam", name: "Logam", price: 8000, unit: "kg" },
    { id: "kaca", name: "Kaca", price: 2000, unit: "kg" },
    { id: "kardus", name: "Kardus", price: 2500, unit: "kg" }
  ]);

  // Pengaturan aplikasi
  const [appSettings, setAppSettings] = useState({
    notifications: true,
    autoBackup: true,
    rwName: "RW 001",
    contactPerson: "Ketua RW",
    contactPhone: "+62812-3456-7890"
  });

  // State untuk editing
  const [isEditingPrices, setIsEditingPrices] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handlePriceUpdate = (id: string, newPrice: number) => {
    setWastePrices(wastePrices.map(item => 
      item.id === id ? { ...item, price: newPrice } : item
    ));
    setHasUnsavedChanges(true);
  };

  const handleSettingsChange = (key: string, value: any) => {
    setAppSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = () => {
    setHasUnsavedChanges(false);
    setIsEditingPrices(false);
    toast({
      title: "Pengaturan Disimpan",
      description: "Semua perubahan telah berhasil disimpan",
    });
  };

  const handleBackupData = () => {
    toast({
      title: "Backup Berhasil", 
      description: "Data telah di-backup",
    });
  };

  const handleRestoreData = () => {
    toast({
      title: "Data Dipulihkan",
      description: "Data berhasil dipulihkan dari backup",
    });
  };

  const handleLogout = () => {
    setIsLogoutDialogOpen(false);
    logout();
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 space-y-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
            <p className="text-muted-foreground mt-2">Kelola pengaturan aplikasi Bank Sampah</p>
          </div>
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                Perubahan belum disimpan
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6">
        {/* User Profile Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profil Pengguna
            </CardTitle>
            <CardDescription>Informasi akun yang sedang aktif</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <p className="font-semibold text-lg">{user?.fullName || 'Nama Pengguna'}</p>
                <p className="text-sm text-muted-foreground">{user?.email || 'email@example.com'}</p>
                {user?.rtNumber && (
                  <p className="text-xs text-muted-foreground">RT {user.rtNumber}</p>
                )}
              </div>
              <Badge variant={user?.role === 'admin' ? 'default' : 'secondary'} className="w-fit">
                {user?.role === 'admin' ? 'Administrator' : 
                 user?.role === 'operator' ? 'Operator' : 'Pengguna'}
              </Badge>
            </div>
            
            <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="lg" className="w-full">
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar dari Sistem
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin keluar dari sistem? Pastikan semua perubahan sudah disimpan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                    Ya, Keluar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Two Column Layout for Main Settings */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Waste Prices Settings */}
          <Card className="w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <div>
                    <CardTitle>Harga Sampah</CardTitle>
                    <CardDescription>Atur harga per kilogram sampah</CardDescription>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => setIsEditingPrices(!isEditingPrices)} 
                  variant="outline"
                  className="shrink-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {wastePrices.map((waste) => (
                <div key={waste.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{waste.name}</p>
                    <p className="text-sm text-muted-foreground">per {waste.unit}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-medium">Rp</span>
                    <Input
                      type="number"
                      value={waste.price}
                      onChange={(e) => handlePriceUpdate(waste.id, parseInt(e.target.value) || 0)}
                      className="w-20 text-right"
                      disabled={!isEditingPrices}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* RW Information */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Informasi RW</CardTitle>
              <CardDescription>Data dasar Rukun Warga</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rw-name" className="text-sm font-medium">Nama RW</Label>
                <Input
                  id="rw-name"
                  value={appSettings.rwName}
                  onChange={(e) => handleSettingsChange('rwName', e.target.value)}
                  placeholder="Contoh: RW 001"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-person" className="text-sm font-medium">Penanggung Jawab</Label>
                <Input
                  id="contact-person"
                  value={appSettings.contactPerson}
                  onChange={(e) => handleSettingsChange('contactPerson', e.target.value)}
                  placeholder="Nama penanggung jawab"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-phone" className="text-sm font-medium">No. Telepon</Label>
                <Input
                  id="contact-phone"
                  value={appSettings.contactPhone}
                  onChange={(e) => handleSettingsChange('contactPhone', e.target.value)}
                  placeholder="+62812-3456-7890"
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section - Full Width Cards */}
        <div className="grid gap-6">
          {/* Notification Settings */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Pengaturan Notifikasi
              </CardTitle>
              <CardDescription>Kelola pemberitahuan aplikasi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium">Notifikasi Push</p>
                    <p className="text-sm text-muted-foreground">Pemberitahuan dalam aplikasi</p>
                  </div>
                  <Switch
                    checked={appSettings.notifications}
                    onCheckedChange={(checked) => handleSettingsChange('notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="font-medium">Auto Backup</p>
                    <p className="text-sm text-muted-foreground">Backup otomatis data</p>
                  </div>
                  <Switch
                    checked={appSettings.autoBackup}
                    onCheckedChange={(checked) => handleSettingsChange('autoBackup', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Manajemen Data</CardTitle>
              <CardDescription>Backup dan restore data aplikasi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={handleBackupData} 
                  className="h-20 flex flex-col gap-2 hover:bg-green-50 hover:border-green-300 dark:hover:bg-green-950"
                >
                  <Download className="h-6 w-6 text-green-600" />
                  <span className="font-medium">Backup Data</span>
                </Button>

                <Button 
                  variant="outline" 
                  onClick={handleRestoreData} 
                  className="h-20 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950"
                >
                  <Upload className="h-6 w-6 text-blue-600" />
                  <span className="font-medium">Restore Data</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Settings - Floating Save Button */}
        {hasUnsavedChanges && (
          <Card className="border-orange-200 bg-orange-50/80 dark:border-orange-800 dark:bg-orange-950/80 sticky bottom-4 shadow-lg">
            <CardContent className="py-4">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">Ada perubahan yang belum disimpan</span>
                </div>
                <Button onClick={handleSaveSettings} size="lg" className="w-full sm:w-auto">
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Semua Pengaturan
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};