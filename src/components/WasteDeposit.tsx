import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarDays, Scale, DollarSign, Calculator, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WasteType {
  id: string;
  name: string;
  pricePerKg: number;
  unit: string;
}

interface DepositTransaction {
  id: string;
  date: string;
  rt: string;
  wasteType: string;
  weight: number;
  pricePerKg: number;
  totalValue: number;
}

export const WasteDeposit = () => {
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    rt: "",
    wasteType: "",
    weight: "",
    customPrice: "",
    date: new Date().toISOString().split('T')[0]
  });

  const [recentDeposits, setRecentDeposits] = useState<DepositTransaction[]>([]);

  // Data RT akan diambil dari API atau database
  const rtList = [
    "RT 001",
    "RT 002", 
    "RT 003",
    "RT 004",
    "RT 005"
  ];
  
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

  // Calculate today's summary
  const todayDeposits = recentDeposits.filter(deposit => 
    deposit.date === new Date().toISOString().split('T')[0]
  );
  const todayTotalWeight = todayDeposits.reduce((sum, deposit) => sum + deposit.weight, 0);
  const todayTotalValue = todayDeposits.reduce((sum, deposit) => sum + deposit.totalValue, 0);
  const todayUniqueRTs = new Set(todayDeposits.map(deposit => deposit.rt)).size;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.rt || !formData.wasteType || !formData.weight || weight <= 0) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field dengan benar",
        variant: "destructive"
      });
      return;
    }

    const newDeposit: DepositTransaction = {
      id: Date.now().toString(),
      date: formData.date,
      rt: formData.rt,
      wasteType: selectedWasteType?.name || "",
      weight: weight,
      pricePerKg: currentPrice,
      totalValue: totalValue
    };

    setRecentDeposits([newDeposit, ...recentDeposits]);
    
    toast({
      title: "Setoran Berhasil!",
      description: `${formData.rt} berhasil menyetor ${weight} kg ${selectedWasteType?.name}. Tabungan bertambah Rp ${totalValue.toLocaleString('id-ID')}`,
    });

    // Reset form
    setFormData({
      rt: "",
      wasteType: "",
      weight: "",
      customPrice: "",
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 sm:pb-0">
      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold">Input Setoran Sampah</h2>
        <p className="text-muted-foreground text-sm sm:text-base">Catat setoran sampah dari RT dan kelola tabungan otomatis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                <Scale className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Form Setoran Sampah</span>
              </CardTitle>
              <CardDescription className="text-sm">Masukkan detail setoran sampah dari RT</CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6 pt-0">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-sm font-medium">Tanggal Setoran</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="pl-10 h-10 sm:h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rt" className="text-sm font-medium">Pilih RT</Label>
                    <Select value={formData.rt} onValueChange={(value) => setFormData({ ...formData, rt: value })}>
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Pilih RT yang menyetor" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {rtList.map((rt) => (
                          <SelectItem key={rt} value={rt}>{rt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wasteType" className="text-sm font-medium">Jenis Sampah</Label>
                    <Select value={formData.wasteType} onValueChange={(value) => setFormData({ ...formData, wasteType: value, customPrice: "" })}>
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Pilih jenis sampah" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {wasteTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex justify-between items-center w-full">
                              <span>{type.name}</span>
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Rp {type.pricePerKg.toLocaleString('id-ID')}/kg
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-sm font-medium">Berat Sampah (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="h-10 sm:h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customPrice" className="text-sm font-medium">Harga per kg (Opsional)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="customPrice"
                      type="number"
                      placeholder={selectedWasteType ? `Default: Rp ${selectedWasteType.pricePerKg.toLocaleString('id-ID')}` : "Masukkan harga custom"}
                      value={formData.customPrice}
                      onChange={(e) => setFormData({ ...formData, customPrice: e.target.value })}
                      className="pl-10 h-10 sm:h-11"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Kosongkan untuk menggunakan harga default</p>
                </div>

                {/* Calculation Preview */}
                {selectedWasteType && weight > 0 && (
                  <div className="bg-accent/30 p-3 sm:p-4 rounded-lg space-y-2">
                    <div className="flex items-center space-x-2 text-sm font-medium">
                      <Calculator className="h-4 w-4" />
                      <span>Perhitungan Otomatis</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs">Berat</p>
                        <p className="font-medium">{weight} kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Harga/kg</p>
                        <p className="font-medium">Rp {currentPrice.toLocaleString('id-ID')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs">Total Nilai</p>
                        <p className="font-bold text-success">Rp {totalValue.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full h-11 sm:h-12" size="lg">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  <span className="text-sm sm:text-base">Catat Setoran</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Summary & Recent Deposits */}
        <div className="space-y-4 sm:space-y-6">
          {/* Today's Summary */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Ringkasan Hari Ini</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Setoran</span>
                <span className="font-medium text-sm">{todayTotalWeight.toFixed(1)} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Jumlah RT</span>
                <span className="font-medium text-sm">{todayUniqueRTs} RT</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Nilai</span>
                <span className="font-bold text-success text-sm">Rp {todayTotalValue.toLocaleString('id-ID')}</span>
              </div>
            </CardContent>
          </Card>

          {/* Recent Deposits */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Setoran Terbaru</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3">
                {recentDeposits.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4 text-sm">Belum ada setoran hari ini</p>
                ) : (
                  recentDeposits.slice(0, 5).map((deposit) => (
                  <div key={deposit.id} className="flex justify-between items-start p-2 sm:p-3 bg-accent/30 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{deposit.rt}</p>
                      <p className="text-xs text-muted-foreground">
                        {deposit.weight} kg {deposit.wasteType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(deposit.date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-success">
                        +Rp {deposit.totalValue.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                )))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};