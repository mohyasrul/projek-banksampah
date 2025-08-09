/**
 * Savings Component - Mobile Optimized
 * Manages savings from waste deposits with withdrawal functionality
 * Features: RT savings overview, recent transactions, mobile-friendly floating action button
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/services/databaseService';
import { 
  Wallet, 
  Home, 
  TrendingUp, 
  BarChart, 
  CreditCard,
  Minus,
  Users,
  Plus
} from 'lucide-react';

interface RTSavings {
  rtNumber: string;
  totalSavings: number;
  memberCount: number;
}

interface Transaction {
  id: string;
  memberNumber: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string;
  date: string;
}

export default function Savings() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [rtList, setRtList] = useState<RTSavings[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  // Withdrawal dialog state
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    rtNumber: '',
    amount: '',
    description: ''
  });

  // Calculate summary
  const summary = {
    totalSavings: rtList.reduce((sum, rt) => sum + rt.totalSavings, 0),
    totalRTs: rtList.length,
    activeRTs: rtList.filter(rt => rt.totalSavings > 0).length,
    averageSavings: rtList.length > 0 ? rtList.reduce((sum, rt) => sum + rt.totalSavings, 0) / rtList.length : 0
  };

  // Filter RTs based on search and filter type
  const filteredRTs = rtList.filter(rt => {
    const matchesSearch = rt.rtNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'positive') return matchesSearch && rt.totalSavings > 0;
    if (filterType === 'zero') return matchesSearch && rt.totalSavings === 0;
    
    return matchesSearch;
  });

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load RT savings data
      const rtsData = await databaseService.getAllRTs();
      const savingsData = await Promise.all(
        rtsData.map(async (rt) => {
          // Calculate total savings for RT by getting collective member savings
          const collectiveMember = await databaseService.getMember(`RT${rt.rtNumber}-COLLECTIVE`);
          return {
            rtNumber: rt.rtNumber,
            totalSavings: collectiveMember?.totalSavings || 0,
            memberCount: rt.activeMembers || 0
          };
        })
      );
      
      setRtList(savingsData);
      
      // Load recent transactions (last 10)
      const transactions = await databaseService.getAllSavingsTransactions(10);
      setRecentTransactions(transactions.map(t => ({
        id: t.id || '',
        memberNumber: t.memberNumber,
        amount: t.amount,
        type: t.type,
        description: t.description,
        date: t.date.toISOString()
      })));
      
    } catch (error) {
      console.error('Error loading savings data:', error);
      toast({
        title: "Error",
        description: "Gagal memuat data tabungan",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTransactionColor = (type: string) => {
    return type === 'deposit' ? 'text-green-600' : 'text-red-600';
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!withdrawForm.rtNumber || !withdrawForm.amount || !withdrawForm.description) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(withdrawForm.amount);
    if (amount <= 0) {
      toast({
        title: "Error", 
        description: "Jumlah penarikan harus lebih dari 0",
        variant: "destructive"
      });
      return;
    }

    // Cek saldo RT
    const selectedRT = rtList.find(rt => rt.rtNumber === withdrawForm.rtNumber);
    if (!selectedRT || selectedRT.totalSavings < amount) {
      toast({
        title: "Error",
        description: "Saldo tidak mencukupi untuk penarikan",
        variant: "destructive"
      });
      return;
    }

    try {
      setWithdrawLoading(true);
      
      // Create withdrawal transaction
      await databaseService.createWithdrawal(
        `RT${withdrawForm.rtNumber}-COLLECTIVE`, // memberNumber
        amount,
        withdrawForm.description,
        user?.uid || "system"
      );

      toast({
        title: "Penarikan Berhasil",
        description: `Penarikan Rp ${amount.toLocaleString('id-ID')} untuk RT ${withdrawForm.rtNumber} berhasil`,
      });

      // Reset form and reload data
      setWithdrawForm({ rtNumber: "", amount: "", description: "" });
      setIsWithdrawDialogOpen(false);
      await loadData();

    } catch (error: any) {
      console.error('Error creating withdrawal:', error);
      toast({
        title: "Error",
        description: error.message || "Gagal melakukan penarikan",
        variant: "destructive"
      });
    } finally {
      setWithdrawLoading(false);
    }
  };

  // Filter RT yang bisa ditarik (hanya yang punya saldo > 0)
  const availableRTsForWithdraw = rtList.filter(rt => rt.totalSavings > 0);

  return (
    <>
      {/* Modern Layout with Background */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-3 sm:p-6 space-y-4 sm:space-y-6 pb-24">
        <h1 className="text-lg sm:text-xl font-semibold text-slate-700 mb-1">
          Kelola Tabungan
        </h1>
        {/* Modern Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-20 h-20 sm:w-32 sm:h-32 bg-white/5 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-white/20">
                  <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-purple-100 text-sm sm:text-lg">
                    Lihat dan kelola tabungan dari RT
                  </p>
                </div>
              </div>
              
              {/* Search and Filter - Hero Style */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <div className="relative">
                  <Input
                    placeholder="Cari RT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-48 bg-white/20 border-white/30 text-white placeholder:text-purple-200 backdrop-blur-sm rounded-lg"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-36 bg-white/20 border-white/30 text-white backdrop-blur-sm rounded-lg">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-slate-200 rounded-lg shadow-lg">
                    <SelectItem value="all">Semua RT</SelectItem>
                    <SelectItem value="positive">Saldo Positif</SelectItem>
                    <SelectItem value="zero">Saldo Kosong</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Summary Cards in Hero */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm">Total Tabungan</p>
                    <p className="text-lg sm:text-2xl font-bold">
                      Rp {summary.totalSavings.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <Wallet className="h-6 w-6 sm:h-8 sm:w-8 text-purple-200 flex-shrink-0" />
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm">Total RT</p>
                    <p className="text-lg sm:text-2xl font-bold">{summary.totalRTs}</p>
                  </div>
                  <Home className="h-6 w-6 sm:h-8 sm:w-8 text-purple-200 flex-shrink-0" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm">RT Aktif</p>
                    <p className="text-lg sm:text-2xl font-bold">{summary.activeRTs}</p>
                  </div>
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-200 flex-shrink-0" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm">Rata-rata</p>
                    <p className="text-lg sm:text-2xl font-bold">
                      Rp {summary.averageSavings.toLocaleString('id-ID')}
                    </p>
                  </div>
                  <BarChart className="h-6 w-6 sm:h-8 sm:w-8 text-purple-200 flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RT List - Enhanced Mobile Design */}
        <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-slate-50 to-gray-50">
            <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 flex items-center">
              <Home className="h-5 w-5 mr-2 text-blue-600" />
              Daftar RT & Tabungan
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-600">
              {filteredRTs.length} RT dari {summary.totalRTs} total RT
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-3 animate-pulse">
                    <Skeleton className="h-12 w-12 rounded-full bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24 bg-slate-200" />
                      <Skeleton className="h-3 w-32 bg-slate-200" />
                    </div>
                    <Skeleton className="h-6 w-24 bg-slate-200" />
                  </div>
                ))}
              </div>
            ) : filteredRTs.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-600 mb-2">Tidak Ada Data RT</h3>
                <p className="text-sm text-slate-500">Tidak ada RT yang cocok dengan filter yang dipilih</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRTs.map((rt) => (
                  <div 
                    key={rt.rtNumber} 
                    className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg sm:rounded-xl border border-slate-100 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <Home className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-sm sm:text-base text-slate-800">RT {rt.rtNumber}</p>
                        <p className="text-xs sm:text-sm text-slate-500 flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {rt.memberCount} Anggota
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm sm:text-base ${
                        rt.totalSavings > 0 ? 'text-green-600' : 'text-slate-400'
                      }`}>
                        Rp {rt.totalSavings.toLocaleString('id-ID')}
                      </p>
                      {rt.totalSavings > 0 && (
                        <div className="w-2 h-2 bg-green-500 rounded-full ml-auto mt-1"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions - Enhanced Design */}
        <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-emerald-50 to-teal-50">
            <CardTitle className="text-lg sm:text-xl font-bold text-slate-800 flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-emerald-600" />
              Transaksi Terbaru
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-slate-600">
              {recentTransactions.length} transaksi terakhir
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="bg-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-600 mb-2">Belum Ada Transaksi</h3>
                <p className="text-sm text-slate-500">Transaksi akan muncul di sini setelah ada aktivitas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg sm:rounded-xl border border-slate-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg ${
                        transaction.type === 'deposit' 
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                          : 'bg-gradient-to-br from-red-500 to-pink-600'
                      }`}>
                        {transaction.type === 'deposit' ? (
                          <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        ) : (
                          <Minus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-bold text-sm sm:text-base text-slate-800 truncate">
                            {transaction.memberNumber}
                          </p>
                          <div className={`w-2 h-2 rounded-full ${
                            transaction.type === 'deposit' ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 truncate mb-1">
                          {transaction.description}
                        </p>
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
                      <p className={`font-bold text-sm sm:text-base ${getTransactionColor(transaction.type)}`}>
                        {transaction.type === 'deposit' ? '+' : '-'}Rp {transaction.amount.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Floating Action Button */}
      <div className="fixed bottom-24 right-4 sm:right-6 z-40">
        <div className="flex flex-col items-end space-y-2">
          {/* Tooltip atau Label */}
          {!loading && availableRTsForWithdraw.length > 0 && (
            <div className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-lg transform translate-x-2 hidden sm:block">
              Tarik Tabungan
            </div>
          )}
          
          <Button
            onClick={() => {
              if (availableRTsForWithdraw.length === 0) {
                toast({
                  title: "Tidak Ada RT Tersedia",
                  description: "Tidak ada RT dengan saldo positif untuk penarikan",
                  variant: "destructive"
                });
                return;
              }
              setIsWithdrawDialogOpen(true);
            }}
            size="sm"
            className={`w-12 h-12 rounded-full shadow-lg text-white transition-all duration-300 hover:scale-110 ${
              availableRTsForWithdraw.length === 0 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
            }`}
          >
            <Plus className="h-5 w-5" />
          </Button>
          
          {/* Counter badge */}
          {availableRTsForWithdraw.length > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
              {availableRTsForWithdraw.length}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Withdrawal Dialog */}
      <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
        <DialogContent className="mx-4 max-w-md rounded-2xl border-0 shadow-2xl">
          <DialogHeader className="text-center space-y-3 p-6 pb-4">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <Plus className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-800">
              Penarikan Tabungan
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-slate-600">
              Pilih RT dan masukkan jumlah yang akan ditarik
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleWithdraw} className="space-y-4 sm:space-y-6 p-6 pt-0">
            <div className="space-y-2">
              <Label htmlFor="rtNumber" className="text-sm font-semibold text-slate-700">Pilih RT</Label>
              <Select
                value={withdrawForm.rtNumber}
                onValueChange={(value) => setWithdrawForm(prev => ({ ...prev, rtNumber: value }))}
              >
                <SelectTrigger className="rounded-xl border-slate-200 focus:border-green-500 focus:ring-green-500 h-12">
                  <SelectValue placeholder="Pilih RT yang akan ditarik" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-auto">
                  {availableRTsForWithdraw.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <p className="text-sm">Tidak ada RT dengan saldo positif</p>
                    </div>
                  ) : (
                    availableRTsForWithdraw.map((rt) => (
                      <SelectItem key={rt.rtNumber} value={rt.rtNumber} className="hover:bg-green-50">
                        <div className="flex flex-col items-start py-1">
                          <span className="font-medium">RT {rt.rtNumber}</span>
                          <span className="text-xs text-slate-500">
                            Saldo: Rp {rt.totalSavings.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-sm font-semibold text-slate-700">Jumlah Penarikan</Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="Masukkan jumlah penarikan"
                  value={withdrawForm.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Hanya izinkan angka positif
                    if (value === '' || (parseFloat(value) >= 0)) {
                      setWithdrawForm(prev => ({ ...prev, amount: value }));
                    }
                  }}
                  className="pl-10 rounded-xl border-slate-200 focus:border-green-500 focus:ring-green-500 h-12"
                  min="1000"
                  step="1000"
                  max={withdrawForm.rtNumber ? availableRTsForWithdraw.find(rt => rt.rtNumber === withdrawForm.rtNumber)?.totalSavings : undefined}
                />
              </div>
              {withdrawForm.rtNumber && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">
                    Saldo tersedia: Rp {availableRTsForWithdraw.find(rt => rt.rtNumber === withdrawForm.rtNumber)?.totalSavings.toLocaleString('id-ID')}
                  </span>
                  {withdrawForm.amount && parseFloat(withdrawForm.amount) > 0 && (
                    <span className={`font-medium ${
                      parseFloat(withdrawForm.amount) > (availableRTsForWithdraw.find(rt => rt.rtNumber === withdrawForm.rtNumber)?.totalSavings || 0)
                        ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {parseFloat(withdrawForm.amount) > (availableRTsForWithdraw.find(rt => rt.rtNumber === withdrawForm.rtNumber)?.totalSavings || 0)
                        ? 'Melebihi saldo!' : 'Valid'}
                    </span>
                  )}
                </div>
              )}
              
              {/* Quick Amount Buttons */}
              {withdrawForm.rtNumber && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {[10000, 25000, 50000, 100000].map((quickAmount) => {
                    const maxAmount = availableRTsForWithdraw.find(rt => rt.rtNumber === withdrawForm.rtNumber)?.totalSavings || 0;
                    const isDisabled = quickAmount > maxAmount;
                    return (
                      <Button
                        key={quickAmount}
                        type="button"
                        variant="outline"
                        size="sm"
                        className={`text-xs p-2 h-8 rounded-lg border transition-all ${
                          isDisabled 
                            ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300'
                        }`}
                        disabled={isDisabled}
                        onClick={() => setWithdrawForm(prev => ({ ...prev, amount: quickAmount.toString() }))}
                      >
                        {quickAmount >= 1000000 ? `${quickAmount/1000000}M` : `${quickAmount/1000}K`}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Keterangan</Label>
              <Input
                id="description"
                placeholder="Keterangan penarikan (contoh: Bayar sampah)"
                value={withdrawForm.description}
                onChange={(e) => setWithdrawForm(prev => ({ ...prev, description: e.target.value }))}
                className="rounded-xl border-slate-200 focus:border-green-500 focus:ring-green-500 h-12"
              />
            </div>

            {/* Enhanced Preview */}
            {withdrawForm.rtNumber && withdrawForm.amount && parseFloat(withdrawForm.amount) > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Jumlah Penarikan</p>
                    <p className="text-lg font-bold text-green-700">
                      Rp {parseFloat(withdrawForm.amount).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Plus className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsWithdrawDialogOpen(false);
                  setWithdrawForm({ rtNumber: "", amount: "", description: "" });
                }}
                className="flex-1 rounded-xl border-slate-200 hover:bg-slate-50 h-12"
                disabled={withdrawLoading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg h-12 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  withdrawLoading || 
                  !withdrawForm.rtNumber || 
                  !withdrawForm.amount || 
                  !withdrawForm.description ||
                  parseFloat(withdrawForm.amount) <= 0 ||
                  parseFloat(withdrawForm.amount) > (availableRTsForWithdraw.find(rt => rt.rtNumber === withdrawForm.rtNumber)?.totalSavings || 0)
                }
              >
                {withdrawLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </div>
                ) : (
                  'Tarik Saldo'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
