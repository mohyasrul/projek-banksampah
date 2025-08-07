/**
 * WasteDeposit Component
 * Input setoran sampah dengan integrasi penuh ke sistem tabungan
 * - Form input setoran sampah dari RT
 * - Kalkulasi otomatis nilai sampah
 * - Integrasi dengan sistem tabungan (auto-credit ke RT)
 * - Real-time updates ke semua komponen terkait
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, Scale, DollarSign, Calculator, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { databaseService, RT, WasteDeposit as WasteDepositType } from "@/services/databaseService";
import { useAuth } from "@/contexts/AuthContext";

interface WasteType {
  id: string;
  name: string;
  pricePerKg: number;
  unit: string;
}

export const WasteDeposit = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rtList, setRTList] = useState<RT[]>([]);
  const [recentDeposits, setRecentDeposits] = useState<WasteDepositType[]>([]);
  
  const [formData, setFormData] = useState({
    rt: "",
    wasteType: "",
    weight: "",
    customPrice: "",
    date: new Date().toISOString().split('T')[0]
  });

  // Load data saat component mount
  useEffect(() => {
    loadRTList();
    loadRecentDeposits();
  }, []);

  const loadRTList = async () => {
    try {
      const data = await databaseService.getAllRTs();
      setRTList(data);
    } catch (error) {
      console.error('Error loading RT list:', error);
    }
  };

  const loadRecentDeposits = async () => {
    try {
      // Get deposits for all RTs (admin) or specific RT (operator)
      let deposits: WasteDepositType[] = [];
      
      if (user?.role === 'admin') {
        // Admin can see all deposits - use new getAllWasteDeposits method
        deposits = await databaseService.getAllWasteDeposits();
      } else if (user?.rtNumber) {
        // Operator can only see their RT's deposits
        deposits = await databaseService.getWasteDepositsByRT(user.rtNumber);
      }
      
      // Sort by date descending (already sorted in the service, but just in case)
      const sorted = deposits.sort((a, b) => new Date(b.depositDate).getTime() - new Date(a.depositDate).getTime());
      setRecentDeposits(sorted);
    } catch (error) {
      console.error('Error loading deposits:', error);
    }
  };

  // Calculate today's summary
  const today = new Date();
  const todayDeposits = recentDeposits.filter(deposit => 
    new Date(deposit.depositDate).toDateString() === today.toDateString()
  );
  const todayTotalWeight = todayDeposits.reduce((sum, deposit) => sum + deposit.totalWeight, 0);
  const todayTotalValue = todayDeposits.reduce((sum, deposit) => sum + deposit.totalAmount, 0);
  const todayUniqueRTs = new Set(todayDeposits.map(deposit => deposit.rtNumber)).size;
  
  // Waste types configuration
  const wasteTypes: WasteType[] = [
    { id: "plastik", name: "Plastik", pricePerKg: 5000, unit: "kg" },
    { id: "kertas", name: "Kertas", pricePerKg: 3000, unit: "kg" },
    { id: "logam", name: "Logam", pricePerKg: 8000, unit: "kg" },
    { id: "kaca", name: "Kaca", pricePerKg: 2000, unit: "kg" },
    { id: "kardus", name: "Kardus", pricePerKg: 2500, unit: "kg" }
  ];

  const selectedWasteType = wasteTypes.find(type => type.id === formData.wasteType);
  const currentPrice = formData.customPrice ? parseFloat(formData.customPrice) : selectedWasteType?.pricePerKg || 0;
  const weight = parseFloat(formData.weight) || 0;
  const totalValue = weight * currentPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rt || !formData.wasteType || !formData.weight || weight <= 0) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field dengan benar",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      // Generate a member number for RT-level deposits (instead of SYSTEM)
      const memberNumber = `RT${formData.rt}-COLLECTIVE`;

      // Create waste deposit data according to WasteDeposit interface
      const wasteDepositData: Omit<WasteDepositType, 'id' | 'createdAt'> = {
        memberNumber: memberNumber, // Use RT collective member
        rtNumber: formData.rt,
        depositDate: new Date(formData.date),
        wasteTypes: [{
          type: selectedWasteType?.name || "",
          weight: weight,
          pricePerKg: currentPrice,
          total: totalValue
        }],
        totalWeight: weight,
        totalAmount: totalValue,
        notes: `Setoran ${selectedWasteType?.name} seberat ${weight} kg`,
        processedBy: user?.uid || "system"
      };

      // Save to Firebase - this will automatically update RT total savings
      await databaseService.createWasteDeposit(wasteDepositData);
      
      // Reload recent deposits
      await loadRecentDeposits();
      
      toast({
        title: "Setoran Berhasil!",
        description: `RT ${formData.rt} berhasil menyetor ${weight} kg ${selectedWasteType?.name}. Total nilai Rp ${totalValue.toLocaleString('id-ID')} telah ditambahkan ke tabungan RT.`,
      });

      // Reset form
      setFormData({
        rt: "",
        wasteType: "",
        weight: "",
        customPrice: "",
        date: new Date().toISOString().split('T')[0]
      });

    } catch (error: any) {
      console.error('Error saving waste deposit:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal menyimpan setoran sampah",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-3 sm:p-6 space-y-4 sm:space-y-6 pb-24">
      <div className="px1">
        <h1 className="text-lg sm:text-xl font-semibold text-slate-700 mb-1">
          Setoran Sampah
        </h1>
      </div>
      {/* Modern Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-20 h-20 sm:w-32 sm:h-32 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-white/20">
                <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-green-100 text-sm sm:text-lg">
                  Catat setoran sampah dan kelola tabungan otomatis
                </p>
              </div>
            </div>
            {user && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/30 self-start">
                <p className="text-xs sm:text-sm text-green-100">
                  {user.fullName} • {user.role === 'admin' ? 'Administrator' : 'Operator'}
                </p>
              </div>
            )}
          </div>
          
          {/* Today's Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm">Total Setoran Hari Ini</p>
                  <p className="text-lg sm:text-2xl font-bold">{todayTotalWeight.toFixed(1)} kg</p>
                </div>
                <Scale className="h-6 w-6 sm:h-8 sm:w-8 text-green-200 flex-shrink-0" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm">RT Berpartisipasi</p>
                  <p className="text-lg sm:text-2xl font-bold">{todayUniqueRTs} RT</p>
                </div>
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-200 flex-shrink-0" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-xs sm:text-sm">Total Nilai</p>
                  <p className="text-lg sm:text-2xl font-bold">Rp {todayTotalValue.toLocaleString('id-ID')}</p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-200 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Input Form - Enhanced */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
            <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg font-bold text-slate-800">
                <Scale className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <span>Form Setoran Sampah</span>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-600">
                Masukkan detail setoran sampah dari RT
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6 pt-0">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium text-slate-700">Tanggal Setoran</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="pl-10 h-10 sm:h-11 rounded-lg border-slate-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rt" className="text-sm font-medium text-slate-700">Pilih RT</Label>
                    <Select value={formData.rt} onValueChange={(value) => setFormData({ ...formData, rt: value })}>
                      <SelectTrigger className="h-10 sm:h-11 rounded-lg border-slate-200 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="Pilih RT yang menyetor" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-slate-200 rounded-lg shadow-lg">
                        {rtList.map((rt) => (
                          <SelectItem key={rt.id} value={rt.rtNumber} className="hover:bg-green-50">
                            <div className="flex items-center justify-between w-full">
                              <span>RT {rt.rtNumber}</span>
                              <span className="text-xs text-slate-500 ml-2">{rt.rtLeader}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wasteType" className="text-sm font-medium text-slate-700">Jenis Sampah</Label>
                    <Select value={formData.wasteType} onValueChange={(value) => setFormData({ ...formData, wasteType: value, customPrice: "" })}>
                      <SelectTrigger className="h-10 sm:h-11 rounded-lg border-slate-200 focus:border-green-500 focus:ring-green-500">
                        <SelectValue placeholder="Pilih jenis sampah" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-slate-200 rounded-lg shadow-lg">
                        {wasteTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id} className="hover:bg-green-50">
                            <div className="flex justify-between items-center w-full">
                              <span className="font-medium">{type.name}</span>
                              <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-700 border-green-200">
                                Rp {type.pricePerKg.toLocaleString('id-ID')}/kg
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-sm font-medium text-slate-700">Berat Sampah (kg)</Label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        className="pl-10 h-10 sm:h-11 rounded-lg border-slate-200 focus:border-green-500 focus:ring-green-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customPrice" className="text-sm font-medium text-slate-700">Harga per kg (Opsional)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="customPrice"
                      type="number"
                      placeholder={selectedWasteType ? `Default: Rp ${selectedWasteType.pricePerKg.toLocaleString('id-ID')}` : "Masukkan harga custom"}
                      value={formData.customPrice}
                      onChange={(e) => setFormData({ ...formData, customPrice: e.target.value })}
                      className="pl-10 h-10 sm:h-11 rounded-lg border-slate-200 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Kosongkan untuk menggunakan harga default</p>
                </div>

                {/* Enhanced Calculation Preview */}
                {selectedWasteType && weight > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-green-200">
                    <div className="flex items-center space-x-2 text-sm font-semibold text-green-800 mb-3">
                      <Calculator className="h-4 w-4" />
                      <span>Perhitungan Otomatis</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                        <p className="text-xs text-slate-500 mb-1">Berat</p>
                        <p className="font-bold text-sm sm:text-base text-slate-800">{weight} kg</p>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                        <p className="text-xs text-slate-500 mb-1">Harga/kg</p>
                        <p className="font-bold text-sm sm:text-base text-slate-800">Rp {currentPrice.toLocaleString('id-ID')}</p>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg">
                        <p className="text-xs text-green-100 mb-1">Total Nilai</p>
                        <p className="font-bold text-sm sm:text-base">Rp {totalValue.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 sm:h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300" 
                  size="lg" 
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Catat Setoran Sampah</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Enhanced Summary Card */}
          <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
            <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-800 flex items-center">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                Ringkasan Hari Ini
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-600">
                {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <span className="ml-2 text-sm text-slate-600">Memuat data...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Scale className="h-4 w-4 text-slate-600" />
                      <span className="text-sm text-slate-600">Total Setoran</span>
                    </div>
                    <span className="font-bold text-sm text-slate-800">{todayTotalWeight.toFixed(1)} kg</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-600">RT Aktif</span>
                    </div>
                    <span className="font-bold text-sm text-blue-700">{todayUniqueRTs} RT</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600 font-medium">Total Nilai</span>
                    </div>
                    <span className="font-bold text-sm text-green-700">Rp {todayTotalValue.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced Recent Deposits */}
          <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
            <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-800 flex items-center">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-emerald-600" />
                Setoran Terbaru
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-slate-600">
                5 setoran terakhir
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                    <span className="ml-2 text-sm text-slate-600">Memuat data...</span>
                  </div>
                ) : recentDeposits.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-slate-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                      <Scale className="h-6 w-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium mb-1">Belum Ada Setoran</p>
                    <p className="text-xs text-slate-400">Setoran akan muncul di sini</p>
                  </div>
                ) : (
                  recentDeposits.slice(0, 5).map((deposit, index) => (
                    <div key={deposit.id} className="p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-100 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <div className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded">
                              RT {deposit.rtNumber}
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              #{index + 1}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-600 mb-1 truncate">
                            <span className="font-medium">{deposit.totalWeight} kg</span> {deposit.wasteTypes.map(w => w.type).join(', ')}
                          </p>
                          <p className="text-xs text-slate-400">
                            {new Date(deposit.depositDate).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="font-bold text-sm text-green-600">
                            +Rp {deposit.totalAmount.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
