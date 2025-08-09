/**
 * Reports Component
 * Laporan komprehensif sistem Bank Sampah RW
 * - Laporan setoran sampah dan tabungan dengan filter periode
 * - Breakdown per RT dengan statistik lengkap
 * - Export functionality (ready untuk PDF)
 * - Dashboard analytics untuk decision making
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Calendar, 
  Download, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Scale,
  Users,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { databaseService, RT, WasteDeposit, SavingsTransaction } from "@/services/databaseService";
import { useAuth } from "@/contexts/AuthContext";

export const Reports = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rtList, setRTList] = useState<RT[]>([]);
  const [wasteDeposits, setWasteDeposits] = useState<WasteDeposit[]>([]);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([]);

  // Date filters
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0], // First day of current month
    to: new Date().toISOString().split('T')[0] // Today
  });

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Load RT data
      const rtData = await databaseService.getAllRTs();
      setRTList(rtData);
      
      // Load waste deposits
      let wasteData: WasteDeposit[] = [];
      if (user?.role === 'admin') {
        wasteData = await databaseService.getAllWasteDeposits();
      } else if (user?.rtNumber) {
        wasteData = await databaseService.getWasteDepositsByRT(user.rtNumber);
      }
      setWasteDeposits(wasteData);
      
      // Load savings transactions
      let transactionData: SavingsTransaction[] = [];
      if (user?.role === 'admin') {
        transactionData = await databaseService.getAllSavingsTransactions();
      } else if (user?.rtNumber) {
        transactionData = await databaseService.getSavingsTransactionsByRT(user.rtNumber);
      }
      setSavingsTransactions(transactionData);
      
    } catch (error) {
      console.error('Error loading report data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data laporan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter data by date range
  const filteredWasteDeposits = wasteDeposits.filter(deposit => {
    const depositDate = new Date(deposit.depositDate).toISOString().split('T')[0];
    return depositDate >= dateRange.from && depositDate <= dateRange.to;
  });

  const filteredSavingsTransactions = savingsTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.date).toISOString().split('T')[0];
    return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
  });

  // Calculate statistics
  const totalRTs = rtList.length;
  const totalActiveMembers = rtList.reduce((sum, rt) => sum + rt.activeMembers, 0);
  const totalWasteWeight = filteredWasteDeposits.reduce((sum, deposit) => sum + deposit.totalWeight, 0);
  const totalWasteValue = filteredWasteDeposits.reduce((sum, deposit) => sum + deposit.totalAmount, 0);
  const totalSavingsDeposit = filteredSavingsTransactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSavingsWithdrawal = filteredSavingsTransactions
    .filter(t => t.type === 'withdrawal')
    .reduce((sum, t) => sum + t.amount, 0);
  const currentSavingsBalance = rtList.reduce((sum, rt) => sum + rt.totalSavings, 0);

  // Group data by RT for RT-wise report
  const rtReport = rtList.map(rt => {
    const rtWasteDeposits = filteredWasteDeposits.filter(d => d.rtNumber === rt.rtNumber);
    const rtTransactions = filteredSavingsTransactions.filter(t => t.rtNumber === rt.rtNumber);
    
    return {
      ...rt,
      periodWasteWeight: rtWasteDeposits.reduce((sum, d) => sum + d.totalWeight, 0),
      periodWasteValue: rtWasteDeposits.reduce((sum, d) => sum + d.totalAmount, 0),
      periodDeposits: rtTransactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0),
      periodWithdrawals: rtTransactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0),
      periodTransactions: rtTransactions.length
    };
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleExport = () => {
    // Simple CSV export (you can enhance this)
    toast({
      title: "Export",
      description: "Fitur export akan segera hadir",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-3 sm:p-6 space-y-4 sm:space-y-6 pb-24">
      <h1 className="text-lg sm:text-xl font-semibold text-slate-700 mb-1">
          Laporan
      </h1>
      {/* Modern Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-20 h-20 sm:w-32 sm:h-32 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-white/20">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-orange-100 text-sm sm:text-lg">
                  Laporan komprehensif setoran sampah dan tabungan
                </p>
              </div>
            </div>
            
            {user && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 border border-white/30 self-start">
                <p className="text-xs sm:text-sm text-orange-100">
                  {user.fullName} • {user.role === 'admin' ? 'Administrator' : `RT ${user.rtNumber}`}
                </p>
              </div>
            )}
          </div>
          
          {/* Export Button */}
          <div className="flex justify-end">
            <Button 
              onClick={handleExport} 
              className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Date Filter */}
      <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-slate-800">
            <Calendar className="h-5 w-5 text-blue-600" />
            Filter Periode Laporan
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-600">
            Pilih rentang tanggal untuk menghasilkan laporan
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Dari Tanggal</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Sampai Tanggal</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-11"
              />
            </div>
            <Button 
              onClick={loadReportData} 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg h-11 font-semibold"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Laporan
            </Button>
          </div>
          <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <p className="text-sm font-medium text-blue-800">
              📅 Periode Laporan: {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Summary Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-sm font-semibold text-slate-700">Total RT</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-slate-800">{totalRTs}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {totalActiveMembers} anggota aktif
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-sm font-semibold text-slate-700">Total Sampah</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Scale className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-slate-800">{totalWasteWeight.toFixed(1)} kg</div>
            <p className="text-xs sm:text-sm text-green-600 font-medium mt-1">
              Nilai: Rp {totalWasteValue.toLocaleString('id-ID')}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-sm font-semibold text-slate-700">Setoran Periode</CardTitle>
            <div className="p-2 bg-emerald-100 rounded-lg">
              <ArrowUpRight className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-600">Rp {totalSavingsDeposit.toLocaleString('id-ID')}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Periode laporan
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-br from-purple-50 to-indigo-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-sm font-semibold text-slate-700">Saldo Tabungan</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wallet className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600">Rp {currentSavingsBalance.toLocaleString('id-ID')}</div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Saldo saat ini
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced RT-wise Report */}
      <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-orange-50 to-red-50">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-slate-800">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            Laporan Detail per RT
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-slate-600">
            Ringkasan aktivitas dan saldo per RT periode {formatDate(dateRange.from)} - {formatDate(dateRange.to)}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-center">
                <Loader2 className="h-8 w-8 sm:h-12 sm:w-12 animate-spin mx-auto mb-3 sm:mb-4 text-orange-600" />
                <p className="text-sm sm:text-base text-slate-600">Memuat laporan...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {rtReport.map((rt, index) => (
                <div key={rt.id} className="bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-md transition-all duration-300">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-3 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center font-bold text-sm sm:text-base">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg sm:text-xl text-slate-800">RT {rt.rtNumber}</h4>
                        <p className="text-sm sm:text-base text-slate-600">{rt.rtLeader}</p>
                        <p className="text-xs sm:text-sm text-slate-500 flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {rt.activeMembers} anggota aktif
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={rt.totalSavings > 0 ? "default" : "secondary"}
                      className={`text-xs sm:text-sm px-3 py-1 ${rt.totalSavings > 0 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600'}`}
                    >
                      Saldo: Rp {rt.totalSavings.toLocaleString('id-ID')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-100 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <Scale className="h-4 w-4 text-green-600 mr-1" />
                        <p className="text-xs sm:text-sm font-medium text-slate-600">Sampah Periode</p>
                      </div>
                      <p className="font-bold text-sm sm:text-base text-slate-800">{rt.periodWasteWeight.toFixed(1)} kg</p>
                      <p className="text-xs text-green-600">Rp {rt.periodWasteValue.toLocaleString('id-ID')}</p>
                    </div>
                    
                    <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-100 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <ArrowUpRight className="h-4 w-4 text-emerald-600 mr-1" />
                        <p className="text-xs sm:text-sm font-medium text-slate-600">Setoran</p>
                      </div>
                      <p className="font-bold text-sm sm:text-base text-emerald-600">Rp {rt.periodDeposits.toLocaleString('id-ID')}</p>
                    </div>
                    
                    <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-100 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                        <p className="text-xs sm:text-sm font-medium text-slate-600">Penarikan</p>
                      </div>
                      <p className="font-bold text-sm sm:text-base text-red-600">Rp {rt.periodWithdrawals.toLocaleString('id-ID')}</p>
                    </div>
                    
                    <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-100 text-center">
                      <div className="flex items-center justify-center mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
                        <p className="text-xs sm:text-sm font-medium text-slate-600">Transaksi</p>
                      </div>
                      <p className="font-bold text-sm sm:text-base text-blue-600">{rt.periodTransactions}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {rtReport.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-600 mb-2">Belum Ada Data RT</h3>
                  <p className="text-sm text-slate-500">Data RT akan muncul di sini setelah ada aktivitas</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 flex items-center">
              <Scale className="h-5 w-5 mr-2 text-green-600" />
              Setoran Sampah Terbaru
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-600">
              10 setoran sampah terakhir dalam periode
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3">
              {filteredWasteDeposits.slice(0, 10).map((deposit, index) => (
                <div key={deposit.id} className="p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-100 hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-xs sm:text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm sm:text-base text-slate-800">RT {deposit.rtNumber}</p>
                        <p className="text-xs sm:text-sm text-slate-600 truncate">
                          <span className="font-medium">{deposit.totalWeight} kg</span> - {deposit.wasteTypes.map(w => w.type).join(', ')}
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
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="font-bold text-sm sm:text-base text-green-600">
                        Rp {deposit.totalAmount.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredWasteDeposits.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Scale className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-600 mb-2">Belum Ada Setoran</h3>
                  <p className="text-sm text-slate-500">Setoran sampah akan muncul di sini</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-purple-600" />
              Transaksi Tabungan Terbaru
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-600">
              10 transaksi tabungan terakhir dalam periode
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-3">
              {filteredSavingsTransactions.slice(0, 10).map((transaction, index) => (
                <div key={transaction.id} className="p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-100 hover:shadow-md transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-lg ${
                        transaction.type === 'deposit' 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                          : 'bg-gradient-to-br from-red-500 to-pink-600'
                      }`}>
                        {transaction.type === 'deposit' ? 
                          <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" /> : 
                          <ArrowDownRight className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-bold text-sm sm:text-base text-slate-800">RT {transaction.rtNumber}</p>
                          <Badge 
                            variant={transaction.type === 'deposit' ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {transaction.type === 'deposit' ? 'Setoran' : 'Penarikan'}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 truncate">{transaction.description}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(transaction.date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className={`font-bold text-sm sm:text-base ${transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'deposit' ? '+' : '-'}Rp {transaction.amount.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {filteredSavingsTransactions.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Wallet className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-600 mb-2">Belum Ada Transaksi</h3>
                  <p className="text-sm text-slate-500">Transaksi tabungan akan muncul di sini</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
