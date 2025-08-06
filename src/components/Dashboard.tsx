import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Scale, 
  Wallet, 
  TrendingUp, 
  ArrowUpRight,
  ArrowDownRight,
  Leaf
} from "lucide-react";

export const Dashboard = () => {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-white/20 p-2 rounded-lg">
            <Leaf className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Selamat Datang!</h1>
            <p className="text-white/90 text-sm sm:text-base">Bank Sampah RW Dashboard</p>
          </div>
        </div>
        <p className="text-white/80 text-sm sm:text-base leading-relaxed">
          Kelola sistem tabungan sampah dengan mudah dan efisien
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-200 border-0 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {['Total RT', 'Total Sampah', 'Total Tabungan', 'Transaksi'][index]}
              </CardTitle>
              <div className="p-2 rounded-full bg-primary/10">
                {index === 0 && <Users className="h-4 w-4 text-primary" />}
                {index === 1 && <Scale className="h-4 w-4 text-primary" />}
                {index === 2 && <Wallet className="h-4 w-4 text-primary" />}
                {index === 3 && <TrendingUp className="h-4 w-4 text-primary" />}
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-foreground mb-2">-</div>
              <p className="text-xs text-muted-foreground mb-2 hidden sm:block">Belum ada data</p>
              <Badge variant="secondary" className="text-xs bg-muted/50 text-muted-foreground border-0">
                Menunggu data
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </div>
              Transaksi Terbaru
            </CardTitle>
            <CardDescription className="text-sm">Aktivitas terakhir</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-center py-8">
              <div className="p-3 bg-muted/30 rounded-full w-12 h-12 mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Belum ada transaksi</p>
              <p className="text-xs text-muted-foreground mt-1">Transaksi akan muncul di sini</p>
            </div>
          </CardContent>
        </Card>

        {/* RT Savings Overview */}
        <Card className="border-0 bg-gradient-to-br from-card to-card/50">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg flex items-center">
              <div className="p-2 bg-yellow-500/10 rounded-lg mr-3">
                <Wallet className="h-4 w-4 text-yellow-500" />
              </div>
              Tabungan RT
            </CardTitle>
            <CardDescription className="text-sm">Saldo per RT</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-center py-8">
              <div className="p-3 bg-muted/30 rounded-full w-12 h-12 mx-auto mb-3">
                <Wallet className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Belum ada data tabungan RT</p>
              <p className="text-xs text-muted-foreground mt-1">Data RT akan muncul di sini</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Footer */}
      <Card className="border-0 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-primary">0</p>
              <p className="text-sm text-muted-foreground mt-1">RT Terdaftar</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-success">0kg</p>
              <p className="text-sm text-muted-foreground mt-1">Sampah Terkumpul</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-yellow-600">0</p>
              <p className="text-sm text-muted-foreground mt-1">Transaksi</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600">Rp 0</p>
              <p className="text-sm text-muted-foreground mt-1">Total Tabungan</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
