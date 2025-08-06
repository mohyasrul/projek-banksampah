import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Eye, 
  Download,
  TrendingUp,
  DollarSign,
  History,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RTSavings {
  id: string;
  rt: string;
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  transactionCount: number;
  lastTransaction: string;
}

interface Transaction {
  id: string;
  rt: string;
  type: "deposit" | "withdrawal";
  amount: number;
  description: string;
  date: string;
  balance: number;
}

export const Savings = () => {
  const { toast } = useToast();
  const [selectedRT, setSelectedRT] = useState("");
  const [withdrawalAmount, setWithdrawalAmount] = useState("");
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  
  // Data akan diambil dari API atau database
  const [rtSavings, setRTSavings] = useState<RTSavings[]>([]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const totalSavings = rtSavings.reduce((sum, rt) => sum + rt.balance, 0);
  const totalDeposits = rtSavings.reduce((sum, rt) => sum + rt.totalDeposits, 0);
  const totalWithdrawals = rtSavings.reduce((sum, rt) => sum + rt.totalWithdrawals, 0);

  const selectedRTData = rtSavings.find(rt => rt.rt === selectedRT);

  const handleWithdrawal = () => {
    const amount = parseFloat(withdrawalAmount);
    
    if (!selectedRT || !amount || amount <= 0) {
      toast({
        title: "Error",
        description: "Pilih RT dan masukkan jumlah penarikan yang valid",
        variant: "destructive"
      });
      return;
    }

    if (!selectedRTData || amount > selectedRTData.balance) {
      toast({
        title: "Error", 
        description: "Saldo tidak mencukupi untuk penarikan ini",
        variant: "destructive"
      });
      return;
    }

    // Update RT balance
    setRTSavings(rtSavings.map(rt => 
      rt.rt === selectedRT 
        ? { 
            ...rt, 
            balance: rt.balance - amount,
            totalWithdrawals: rt.totalWithdrawals + amount,
            transactionCount: rt.transactionCount + 1,
            lastTransaction: new Date().toISOString().split('T')[0]
          }
        : rt
    ));

    // Add transaction record
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      rt: selectedRT,
      type: "withdrawal",
      amount: amount,
      description: "Penarikan tabungan",
      date: new Date().toISOString(),
      balance: selectedRTData.balance - amount
    };

    setTransactions([newTransaction, ...transactions]);

    toast({
      title: "Penarikan Berhasil!",
      description: `${selectedRT} berhasil menarik Rp ${amount.toLocaleString('id-ID')}`,
    });

    setWithdrawalAmount("");
    setSelectedRT("");
    setIsWithdrawDialogOpen(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 sm:pb-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Manajemen Tabungan</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Kelola tabungan RT dan riwayat transaksi</p>
        </div>
        
        <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <ArrowDownRight className="mr-2 h-4 w-4" />
              Penarikan
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90vw] max-w-[380px] max-h-[80vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300 rounded-xl">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-base sm:text-lg font-semibold">Penarikan Tabungan</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                Proses penarikan tabungan RT
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 py-1">
              <div className="space-y-2">
                <Label htmlFor="rt-select" className="text-xs sm:text-sm font-medium">Pilih RT</Label>
                <select 
                  id="rt-select"
                  className="w-full h-8 sm:h-9 px-3 py-1 text-xs sm:text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={selectedRT}
                  onChange={(e) => setSelectedRT(e.target.value)}
                >
                  <option value="">Pilih RT</option>
                  {rtSavings.map((rt) => (
                    <option key={rt.id} value={rt.rt}>
                      {rt.rt} - Saldo: Rp {rt.balance.toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedRTData && (
                <div className="bg-gradient-to-r from-success/10 to-success/5 border border-success/20 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-success-foreground">Saldo Tersedia</p>
                      <p className="text-lg sm:text-xl font-bold text-success">Rp {selectedRTData.balance.toLocaleString('id-ID')}</p>
                    </div>
                    <Wallet className="h-6 w-6 sm:h-7 sm:w-7 text-success" />
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2 text-xs text-muted-foreground">
                    <div>
                      <p className="text-xs">Total Setoran</p>
                      <p className="font-medium text-xs">Rp {selectedRTData.totalDeposits.toLocaleString('id-ID')}</p>
                    </div>
                    <div>
                      <p className="text-xs">Total Penarikan</p>
                      <p className="font-medium text-xs">Rp {selectedRTData.totalWithdrawals.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="withdrawal-amount" className="text-xs sm:text-sm font-medium">Jumlah Penarikan</Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    id="withdrawal-amount"
                    type="number"
                    placeholder="0"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="pl-8 h-8 sm:h-9 text-xs sm:text-sm rounded-lg"
                    min="0"
                    max={selectedRTData?.balance || 0}
                  />
                </div>
                {selectedRTData && withdrawalAmount && parseFloat(withdrawalAmount) > selectedRTData.balance && (
                  <p className="text-xs text-destructive">Jumlah melebihi saldo tersedia</p>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-3">
                <Button 
                  onClick={handleWithdrawal} 
                  className="h-8 sm:h-9 flex-1 text-xs sm:text-sm rounded-lg"
                  disabled={!selectedRT || !withdrawalAmount || (selectedRTData && parseFloat(withdrawalAmount) > selectedRTData.balance)}
                >
                  Proses Penarikan
                </Button>
                <Button 
                  variant="outline" 
                  className="h-8 sm:h-9 flex-1 sm:flex-none text-xs sm:text-sm rounded-lg"
                  onClick={() => {
                    setIsWithdrawDialogOpen(false);
                    setSelectedRT("");
                    setWithdrawalAmount("");
                  }}
                >
                  Batal
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tabungan</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Rp {totalSavings.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">Saldo keseluruhan RW</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Setoran</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalDeposits.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">Akumulasi setoran sampah</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Penarikan</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp {totalWithdrawals.toLocaleString('id-ID')}</div>
            <p className="text-xs text-muted-foreground">Total yang sudah ditarik</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RT Savings List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Tabungan per RT</span>
            </CardTitle>
            <CardDescription>Saldo dan aktivitas setiap RT</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rtSavings.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Belum ada data tabungan RT</p>
              ) : (
                rtSavings.map((rt) => (
                <div key={rt.id} className="flex items-center justify-between p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors">
                  <div>
                    <p className="font-medium">{rt.rt}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                      <span>{rt.transactionCount} transaksi</span>
                      <span>Terakhir: {new Date(rt.lastTransaction).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-success">Rp {rt.balance.toLocaleString('id-ID')}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center">
                        <ArrowUpRight className="h-3 w-3 mr-1 text-success" />
                        {rt.totalDeposits.toLocaleString('id-ID')}
                      </span>
                      <span className="flex items-center">
                        <ArrowDownRight className="h-3 w-3 mr-1 text-warning" />
                        {rt.totalWithdrawals.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              )))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Riwayat Transaksi</span>
            </CardTitle>
            <CardDescription>Aktivitas terbaru tabungan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Belum ada riwayat transaksi</p>
              ) : (
                transactions.slice(0, 8).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border-l-4 border-l-primary/20 bg-accent/20 rounded-r-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'deposit' 
                        ? 'bg-success/10' 
                        : 'bg-warning/10'
                    }`}>
                      {transaction.type === 'deposit' ? (
                        <ArrowUpRight className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.rt}</p>
                      <p className="text-xs text-muted-foreground">{transaction.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium text-sm ${
                      transaction.type === 'deposit' ? 'text-success' : 'text-warning'
                    }`}>
                      {transaction.type === 'deposit' ? '+' : '-'}Rp {transaction.amount.toLocaleString('id-ID')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Saldo: Rp {transaction.balance.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              )))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};