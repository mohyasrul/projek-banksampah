/**
 * RTManagement Component
 * Manajemen data RT dalam sistem Bank Sampah
 * - CRUD operations untuk data RT
 * - Real-time saldo tabungan per RT
 * - Role-based access (admin bisa CRUD, operator read-only)
 * - Integrasi dengan sistem setoran sampah
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Users, Phone, MapPin, Loader2, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { databaseService, RT } from "@/services/databaseService";
import { useAuth } from "@/contexts/AuthContext";

export const RTManagement = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRT, setEditingRT] = useState<RT | null>(null);
  const [loading, setLoading] = useState(false);
  const [rtList, setRTList] = useState<RT[]>([]);

  const [formData, setFormData] = useState({
    rtNumber: "",
    rtLeader: "",
    totalMembers: "",
    address: "",
    phone: ""
  });

  // Load data saat component mount
  useEffect(() => {
    loadRTList();
  }, []);

  const loadRTList = async () => {
    try {
      setLoading(true);
      const data = await databaseService.getAllRTs();
      setRTList(data);
    } catch (error) {
      console.error('Error loading RT list:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data RT",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rtNumber || !formData.rtLeader || !formData.totalMembers || !formData.address) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const rtData = {
        rtNumber: formData.rtNumber,
        rtLeader: formData.rtLeader,
        phone: formData.phone,
        address: formData.address,
        totalMembers: parseInt(formData.totalMembers),
        activeMembers: 0,
        totalSavings: 0,
        isActive: true
      };

      if (editingRT && editingRT.id) {
        // Update existing RT
        await databaseService.updateRT(editingRT.id, rtData);
        toast({
          title: "Berhasil",
          description: "Data RT berhasil diperbarui"
        });
      } else {
        // Create new RT
        await databaseService.createRT(rtData);
        toast({
          title: "Berhasil",
          description: "RT baru berhasil ditambahkan"
        });
      }

      // Reload data
      await loadRTList();
      resetForm();
      setIsAddDialogOpen(false);
      setEditingRT(null);

    } catch (error: any) {
      console.error('Error saving RT:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan data RT",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (rt: RT) => {
    if (!window.confirm(`Yakin ingin menghapus RT ${rt.rtNumber}?`)) {
      return;
    }

    try {
      setLoading(true);
      if (rt.id) {
        await databaseService.deleteRT(rt.id);
        toast({
          title: "Berhasil",
          description: "RT berhasil dihapus"
        });
        await loadRTList();
      }
    } catch (error: any) {
      console.error('Error deleting RT:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus RT",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ rtNumber: "", rtLeader: "", totalMembers: "", address: "", phone: "" });
    setEditingRT(null);
  };

  const handleEdit = (rt: RT) => {
    setFormData({
      rtNumber: rt.rtNumber,
      rtLeader: rt.rtLeader,
      totalMembers: rt.totalMembers.toString(),
      address: rt.address,
      phone: rt.phone || ""
    });
    setEditingRT(rt);
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    resetForm();
  };

  // Check if user can manage this RT
  const canManageRT = (rt: RT) => {
    if (user?.role === 'admin') return true;
    if (user?.role === 'operator' && user?.rtNumber === rt.rtNumber) return true;
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-3 sm:p-6 space-y-4 sm:space-y-6 pb-24">
      <div className="px1">
        <h1 className="text-lg sm:text-xl font-semibold text-slate-700 mb-1">
          Manajemen RT
        </h1>
      </div>
      {/* Modern Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-20 h-20 sm:w-32 sm:h-32 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-white/20">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-blue-100 text-sm sm:text-lg">
                  Kelola data RT dalam sistem bank sampah
                </p>
              </div>
            </div>
            {user && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/30 self-start">
                <p className="text-xs sm:text-sm text-blue-100">
                  {user.fullName} • {user.role === 'admin' ? 'Administrator' : 'Operator'}
                </p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm">Total RT</p>
                  <p className="text-lg sm:text-2xl font-bold">{loading ? '...' : rtList.length}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200 flex-shrink-0" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm">RT Aktif</p>
                  <p className="text-lg sm:text-2xl font-bold">{loading ? '...' : rtList.filter(rt => rt.isActive).length}</p>
                </div>
                <Badge className="bg-green-500/20 text-green-200 border-green-300/30">Aktif</Badge>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm">Total KK</p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {loading ? '...' : rtList.reduce((sum, rt) => sum + rt.totalMembers, 0)}
                  </p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200 flex-shrink-0" />
              </div>
            </div>
          </div>
          
          {user?.role === 'admin' && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full sm:w-auto bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah RT Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="mx-4 max-w-sm rounded-3xl border-0 shadow-2xl">
                <DialogHeader className="text-center space-y-2 p-4 pb-3">
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <DialogTitle className="text-lg font-bold text-slate-800">
                    {editingRT ? "Edit RT" : "Tambah RT Baru"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-600">
                    {editingRT ? "Perbarui informasi RT" : "Masukkan informasi RT baru untuk sistem"}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-3 p-4 pt-0">
                  <div className="space-y-1">
                    <Label htmlFor="rtNumber" className="text-xs font-medium text-slate-600">Nomor RT *</Label>
                    <Input
                      id="rtNumber"
                      placeholder="Contoh: 001"
                      value={formData.rtNumber}
                      onChange={(e) => setFormData({...formData, rtNumber: e.target.value})}
                      disabled={loading}
                      required
                      className="rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="rtLeader" className="text-xs font-medium text-slate-600">Ketua RT *</Label>
                    <Input
                      id="rtLeader"
                      placeholder="Nama Ketua RT"
                      value={formData.rtLeader}
                      onChange={(e) => setFormData({...formData, rtLeader: e.target.value})}
                      disabled={loading}
                      required
                      className="rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="totalMembers" className="text-xs font-medium text-slate-600">Jumlah KK *</Label>
                    <Input
                      id="totalMembers"
                      type="number"
                      placeholder="Jumlah Kepala Keluarga"
                      value={formData.totalMembers}
                      onChange={(e) => setFormData({...formData, totalMembers: e.target.value})}
                      disabled={loading}
                      required
                      className="rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-10 text-sm"
                      min="1"
                      step="1"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="address" className="text-xs font-medium text-slate-600">Alamat *</Label>
                    <Input
                      id="address"
                      placeholder="Alamat lengkap RT"
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      disabled={loading}
                      required
                      className="rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-10 text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-xs font-medium text-slate-600">Kontak</Label>
                    <Input
                      id="phone"
                      placeholder="Nomor telepon/HP (opsional)"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      disabled={loading}
                      className="rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-500 h-10 text-sm"
                    />
                  </div>

                  {/* Enhanced Preview */}
                  {formData.rtNumber && formData.rtLeader && formData.totalMembers && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-2xl border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-medium text-blue-800">RT {formData.rtNumber}</p>
                          <p className="text-sm font-bold text-blue-700">
                            {formData.rtLeader} • {formData.totalMembers} KK
                          </p>
                        </div>
                        <div className="bg-blue-100 p-1.5 rounded-lg">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCloseDialog} 
                      disabled={loading}
                      className="flex-1 rounded-2xl border-slate-200 hover:bg-slate-50 h-9 text-xs"
                    >
                      Batal
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg h-9 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                    >
                      {loading ? (
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{editingRT ? "Memperbarui..." : "Menyimpan..."}</span>
                        </div>
                      ) : (
                        editingRT ? "Perbarui" : "Simpan"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && !rtList.length && (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin mx-auto mb-3 sm:mb-4 text-blue-600" />
            <p className="text-sm sm:text-base text-slate-600">Memuat data RT...</p>
          </div>
        </div>
      )}

      {/* RT Cards Grid - Mobile Optimized */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rtList.map((rt) => (
          <Card key={rt.id} className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white">
            <CardHeader className="pb-3 sm:pb-4 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg sm:rounded-xl">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold text-slate-800">RT {rt.rtNumber}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-500">{rt.rtLeader}</CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={rt.isActive ? "default" : "secondary"}
                  className={`text-xs ${rt.isActive ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600'}`}
                >
                  {rt.isActive ? "Aktif" : "Nonaktif"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              {/* Statistics */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="bg-slate-50 rounded-lg sm:rounded-xl p-2 sm:p-3">
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-600 mb-1">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Total KK</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-800">{rt.totalMembers}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg sm:rounded-xl p-2 sm:p-3">
                  <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-green-600 mb-1">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>Aktif</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-green-700">{rt.activeMembers}</p>
                </div>
              </div>
              
              {/* Address */}
              <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 bg-slate-50 rounded-lg sm:rounded-xl p-2 sm:p-3">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{rt.address}</span>
              </div>
              
              {/* Phone */}
              {rt.phone && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 bg-slate-50 rounded-lg sm:rounded-xl p-2 sm:p-3">
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>{rt.phone}</span>
                </div>
              )}

              {/* Total Savings */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-emerald-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-emerald-600 font-medium">Total Saldo Tabungan</p>
                    <p className="text-base sm:text-lg font-bold text-emerald-700">
                      Rp {rt.totalSavings.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="bg-emerald-100 p-1.5 sm:p-2 rounded-lg">
                    <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {canManageRT(rt) && (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(rt)}
                    className="flex-1 rounded-lg sm:rounded-xl hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                    disabled={loading}
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="text-xs sm:text-sm">Edit</span>
                  </Button>
                  {user?.role === 'admin' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(rt)}
                      className="rounded-lg sm:rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                      disabled={loading}
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State - Mobile Optimized */}
      {!loading && rtList.length === 0 && (
        <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6 sm:p-12 text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Users className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-2 text-slate-800">Belum Ada Data RT</h3>
            <p className="text-sm sm:text-base text-slate-600 mb-6 sm:mb-8 max-w-md mx-auto">
              Mulai dengan menambahkan RT pertama untuk sistem bank sampah RW Anda
            </p>
            {user?.role === 'admin' && (
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 sm:px-8 py-2 sm:py-3"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Tambah RT Pertama
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
