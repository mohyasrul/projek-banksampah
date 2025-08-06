import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download,
  Calendar,
  Filter
} from "lucide-react";

export const Reports = () => {
  // Data akan diambil dari API atau database
  const monthlyStats = {
    totalWeight: 0,
    totalValue: 0,
    totalTransactions: 0,
    activeRTs: 0
  };

  const wasteTypeData = [];
  const rtRanking = [];
  const dailyTrend = [];

  return (
    <div className="space-y-4 sm:space-y-8 pb-12 sm:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Laporan</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Analisis dan statistik tabungan hijau</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none">
            <Download className="mr-2 h-4 w-4" />
            Ekspor
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg flex items-center">
            <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Periode Laporan
          </CardTitle>
          <CardDescription className="text-sm">Pilih rentang tanggal untuk analisis</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1">
              <Label htmlFor="startDate" className="text-sm font-medium">Tanggal Mulai</Label>
              <Input 
                id="startDate" 
                type="date" 
                className="mt-1 h-10 sm:h-11"
              />
            </div>
            <div className="flex-1">
              <Label htmlFor="endDate" className="text-sm font-medium">Tanggal Akhir</Label>
              <Input 
                id="endDate" 
                type="date" 
                className="mt-1 h-10 sm:h-11"
              />
            </div>
            <Button className="h-10 sm:h-11">Terapkan Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Berat Sampah</CardTitle>
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{monthlyStats.totalWeight} kg</div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Nilai</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">Rp {monthlyStats.totalValue.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Transaksi</CardTitle>
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{monthlyStats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium">RT Aktif</CardTitle>
            <PieChart className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{monthlyStats.activeRTs}</div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Waste Type Distribution */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Distribusi Jenis Sampah</CardTitle>
            <CardDescription className="text-sm">Persentase berdasarkan berat</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-4">
              {wasteTypeData.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">Belum ada data distribusi sampah</p>
              ) : (
                wasteTypeData.map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-sm">{item.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{item.weight} kg</p>
                      <p className="text-xs text-muted-foreground">{item.percentage}% dari total</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* RT Ranking */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Peringkat RT</CardTitle>
            <CardDescription className="text-sm">Berdasarkan total setoran bulan ini</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-4">
              {rtRanking.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">Belum ada data peringkat RT</p>
              ) : (
                rtRanking.map((rt, index) => (
                  <div key={rt.rtNumber} className="flex items-center justify-between p-2 sm:p-3 bg-accent/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant={index < 3 ? "default" : "secondary"} className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium text-sm">{rt.rtNumber}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{rt.weight} kg</p>
                      <p className="text-xs text-success">Rp {rt.value.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend Chart */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base sm:text-lg">Tren Harian</CardTitle>
          <CardDescription className="text-sm">Grafik setoran harian bulan ini</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="h-60 sm:h-80 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            {dailyTrend.length === 0 ? (
              <div className="text-center">
                <BarChart3 className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground text-sm">Belum ada data tren harian</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Grafik akan muncul setelah ada transaksi</p>
              </div>
            ) : (
              <div className="w-full">
                {/* Chart placeholder - bisa diganti dengan library chart seperti Recharts */}
                <div className="flex items-end justify-center space-x-2 h-48 sm:h-64">
                  {dailyTrend.map((data, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="bg-primary rounded-t-sm w-6 sm:w-8"
                        style={{ height: `${(data.value / Math.max(...dailyTrend.map(d => d.value))) * 200}px` }}
                      />
                      <span className="text-xs mt-2">{data.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
