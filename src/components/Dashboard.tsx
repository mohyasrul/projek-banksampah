/**
 * Modern Dashboard Component - Enhanced UI
 * Bank Sampah RW Management Dashboard with improved design
 * Features: Advanced cards, charts preview, activity feed, quick actions
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  Activity,
  ChevronRight,
  PieChart,
  Recycle
} from "lucide-react";
import { databaseService } from "@/services/databaseService";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardStats {
  totalRT: number;
  totalMembers: number;
  totalSavings: number;
  totalTransactions: number;
}

interface RecentTransaction {
  id: string;
  memberNumber: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string;
  date: Date;
}

interface RTSavings {
  rtNumber: string;
  totalSavings: number;
  memberCount: number;
}

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalRT: 0,
    totalMembers: 0,
    totalSavings: 0,
    totalTransactions: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [rtSavings, setRtSavings] = useState<RTSavings[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Load RT data
      const rtList = await databaseService.getAllRTs();
      
      // Load recent transactions
      const transactions = await databaseService.getAllSavingsTransactions(5);
      const recentTxns = transactions.map(t => ({
        id: t.id || '',
        memberNumber: t.memberNumber,
        amount: t.amount,
        type: t.type,
        description: t.description,
        date: t.date
      }));
      setRecentTransactions(recentTxns);
      
      // Load RT savings data  
      const rtSavingsData = await Promise.all(
        rtList.map(async (rt) => {
          const collectiveMember = await databaseService.getMember(`RT${rt.rtNumber}-COLLECTIVE`);
          return {
            rtNumber: rt.rtNumber,
            totalSavings: collectiveMember?.totalSavings || 0,
            memberCount: rt.activeMembers || 0
          };
        })
      );
      setRtSavings(rtSavingsData);
      
      // Calculate statistics
      const totalRT = rtList.length;
      const totalMembers = rtList.reduce((sum, rt) => sum + rt.activeMembers, 0);
      const totalSavings = rtSavingsData.reduce((sum, rt) => sum + rt.totalSavings, 0);
      const totalTransactions = transactions.length;
      
      setStats({
        totalRT,
        totalMembers,
        totalSavings,
        totalTransactions
      });
      
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-3 sm:p-6 space-y-4 sm:space-y-6 pb-24">
      {/* Greeting Section */}
      <div className="px-1">
        <h1 className="text-lg sm:text-xl font-semibold text-slate-700 mb-1">
          Halo, {user?.fullName?.split(' ')[0]}! 👋
        </h1>
        <p className="text-sm sm:text-base text-slate-500">
          {user?.role === 'admin' ? 'Admin Sistem' : `RT ${user?.rtNumber}`}
        </p>
      </div>

      {/* Modern Hero Section - Mobile Optimized */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute -top-4 -right-4 w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-8 -left-8 w-20 h-20 sm:w-32 sm:h-32 bg-white/5 rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="bg-white/20 backdrop-blur-sm p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-white/20">
                <Recycle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-emerald-100 text-sm sm:text-lg leading-relaxed">
                  Kelola Bank Sampah RW dengan sistem digital yang modern
                </p>
              </div>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm self-start">
              <Activity className="h-3 w-3 mr-1" />
              <span className="text-xs sm:text-sm">Live</span>
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-emerald-100 text-xs sm:text-sm">Total Tabungan</p>
                  <p className="text-lg sm:text-2xl font-bold truncate">
                    Rp {loading ? '...' : stats.totalSavings.toLocaleString('id-ID')}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-200 flex-shrink-0" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs sm:text-sm">RT Aktif</p>
                  <p className="text-lg sm:text-2xl font-bold">{loading ? '...' : stats.totalRT}</p>
                </div>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-200 flex-shrink-0" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/20 sm:col-span-2 md:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-xs sm:text-sm">Total Anggota</p>
                  <p className="text-lg sm:text-2xl font-bold">{loading ? '...' : stats.totalMembers}</p>
                </div>
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-200 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Statistics Overview */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Performance Cards - Mobile Stack */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl overflow-hidden">
              <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg text-slate-700">Total Transaksi</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-500">Bulan ini</CardDescription>
                  </div>
                  <div className="p-2 sm:p-3 bg-blue-100 rounded-lg sm:rounded-xl">
                    <Activity className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {loading ? (
                  <div className="animate-pulse">
                    <div className="h-6 sm:h-8 bg-slate-200 rounded w-16 sm:w-20 mb-2"></div>
                    <div className="h-3 sm:h-4 bg-slate-200 rounded w-24 sm:w-32"></div>
                  </div>
                ) : (
                  <>
                    <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                      {stats.totalTransactions}
                    </div>
                    <div className="flex items-center text-xs sm:text-sm">
                      <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
                      <span className="text-green-600 font-medium">+12%</span>
                      <span className="text-slate-500 ml-1 hidden sm:inline">dari bulan lalu</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl sm:rounded-2xl overflow-hidden">
              <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg text-slate-700">Efisiensi</CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-slate-500">Performa sistem</CardDescription>
                  </div>
                  <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg sm:rounded-xl">
                    <Award className="h-4 w-4 sm:h-6 sm:w-6 text-emerald-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2 sm:mb-3">94%</div>
                <Progress value={94} className="h-1.5 sm:h-2 mb-1 sm:mb-2" />
                <p className="text-xs sm:text-sm text-slate-500">Tingkat kepuasan tinggi</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity - Mobile Optimized */}
          <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-slate-800">Aktivitas Terbaru</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Transaksi dan aktivitas sistem</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="rounded-lg sm:rounded-xl text-xs sm:text-sm p-2 sm:p-3">
                  <span className="hidden sm:inline">Lihat Semua</span>
                  <span className="sm:hidden">Semua</span>
                  <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {loading ? (
                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 sm:space-x-4 animate-pulse">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-200 rounded-lg sm:rounded-xl"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 sm:h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-2 sm:h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-4 sm:h-6 bg-slate-200 rounded w-16 sm:w-20"></div>
                    </div>
                  ))}
                </div>
              ) : recentTransactions.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="p-3 sm:p-4 bg-slate-100 rounded-xl sm:rounded-2xl w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4">
                    <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-slate-600 mb-1 sm:mb-2">Belum Ada Aktivitas</h3>
                  <p className="text-xs sm:text-sm text-slate-500">Transaksi akan muncul di sini</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {recentTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-lg sm:rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className={`p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0 ${
                          transaction.type === 'deposit' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? (
                            <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 sm:h-5 sm:w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base text-slate-800 truncate">{transaction.memberNumber}</p>
                          <p className="text-xs sm:text-sm text-slate-500 truncate">{transaction.description}</p>
                          <p className="text-xs text-slate-400">
                            {transaction.date.toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <p className={`font-bold text-xs sm:text-sm ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
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

        {/* Right Sidebar - Mobile Optimized */}
        <div className="space-y-4 sm:space-y-6">
          {/* Top RT Performance */}
          <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-800 flex items-center">
                <PieChart className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                Top RT Performance
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">RT dengan tabungan tertinggi</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {loading ? (
                <div className="space-y-3 sm:space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between animate-pulse">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-slate-200 rounded-full"></div>
                        <div className="space-y-1">
                          <div className="h-3 sm:h-4 bg-slate-200 rounded w-12 sm:w-16"></div>
                          <div className="h-2 sm:h-3 bg-slate-200 rounded w-8 sm:w-12"></div>
                        </div>
                      </div>
                      <div className="h-3 sm:h-4 bg-slate-200 rounded w-16 sm:w-20"></div>
                    </div>
                  ))}
                </div>
              ) : rtSavings.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <div className="p-2 sm:p-3 bg-slate-100 rounded-lg sm:rounded-xl w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3">
                    <Users className="h-4 w-4 sm:h-6 sm:w-6 text-slate-400" />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500">Belum ada data RT</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {rtSavings
                    .sort((a, b) => b.totalSavings - a.totalSavings)
                    .slice(0, 5)
                    .map((rt, index) => (
                    <div key={rt.rtNumber} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-xs sm:text-sm text-slate-700">RT {rt.rtNumber}</p>
                          <p className="text-xs text-slate-500">{rt.memberCount} anggota</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-xs sm:text-sm text-green-600">
                          Rp {rt.totalSavings.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calendar Widget - Mobile Optimized */}
          <Card className="border-0 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg font-bold text-slate-800 flex items-center">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
                Agenda Hari Ini
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-blue-50 rounded-lg sm:rounded-xl">
                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-700 truncate">Pengumpulan Sampah</p>
                    <p className="text-xs text-slate-500">09:00 - 11:00</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-green-50 rounded-lg sm:rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-700 truncate">Laporan Mingguan</p>
                    <p className="text-xs text-slate-500">14:00 - 15:00</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 bg-orange-50 rounded-lg sm:rounded-xl">
                  <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-slate-700 truncate">Rapat Koordinasi</p>
                    <p className="text-xs text-slate-500">16:00 - 17:00</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
