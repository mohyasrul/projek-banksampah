import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Users, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RT {
  id: string;
  nomor: string;
  ketuaRT: string;
  jumlahKK: number;
  alamat: string;
  kontak?: string;
  saldo: number;
  totalTransaksi: number;
}

export const RTManagement = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingRT, setEditingRT] = useState<RT | null>(null);
  
  // Data akan diambil dari API atau database
  const [rtList, setRTList] = useState<RT[]>([]);

  const [formData, setFormData] = useState({
    nomor: "",
    ketuaRT: "",
    jumlahKK: "",
    alamat: "",
    kontak: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nomor || !formData.ketuaRT || !formData.jumlahKK || !formData.alamat) {
      toast({
        title: "Error",
        description: "Mohon lengkapi semua field yang wajib diisi",
        variant: "destructive"
      });
      return;
    }

    const newRT: RT = {
      id: Date.now().toString(),
      nomor: formData.nomor,
      ketuaRT: formData.ketuaRT,
      jumlahKK: parseInt(formData.jumlahKK),
      alamat: formData.alamat,
      kontak: formData.kontak,
      saldo: 0,
      totalTransaksi: 0
    };

    if (editingRT) {
      setRTList(rtList.map(rt => rt.id === editingRT.id ? { ...newRT, id: editingRT.id, saldo: editingRT.saldo, totalTransaksi: editingRT.totalTransaksi } : rt));
      toast({
        title: "Berhasil",
        description: "Data RT berhasil diperbarui"
      });
      setEditingRT(null);
    } else {
      setRTList([...rtList, newRT]);
      toast({
        title: "Berhasil", 
        description: "RT baru berhasil ditambahkan"
      });
    }

    setFormData({ nomor: "", ketuaRT: "", jumlahKK: "", alamat: "", kontak: "" });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (rt: RT) => {
    setEditingRT(rt);
    setFormData({
      nomor: rt.nomor,
      ketuaRT: rt.ketuaRT,
      jumlahKK: rt.jumlahKK.toString(),
      alamat: rt.alamat,
      kontak: rt.kontak || ""
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setRTList(rtList.filter(rt => rt.id !== id));
    toast({
      title: "Berhasil",
      description: "Data RT berhasil dihapus"
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 sm:pb-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Manajemen RT</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Kelola data Rukun Tetangga dalam RW</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah RT
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90vw] max-w-[380px] max-h-[80vh] overflow-y-auto animate-in fade-in-0 zoom-in-95 duration-300 rounded-xl">
            <DialogHeader className="pb-3">
              <DialogTitle className="text-base sm:text-lg font-semibold">{editingRT ? "Edit Data RT" : "Tambah RT Baru"}</DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                {editingRT ? "Perbarui informasi RT" : "Masukkan data RT yang akan didaftarkan"}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-3 py-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="nomor" className="text-xs sm:text-sm font-medium">Nomor RT *</Label>
                  <Input
                    id="nomor"
                    placeholder="RT 01"
                    value={formData.nomor}
                    onChange={(e) => setFormData({ ...formData, nomor: e.target.value })}
                    className="h-8 sm:h-9 text-xs sm:text-sm rounded-lg"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="jumlahKK" className="text-xs sm:text-sm font-medium">Jumlah KK *</Label>
                  <Input
                    id="jumlahKK"
                    type="number"
                    placeholder="45"
                    value={formData.jumlahKK}
                    onChange={(e) => setFormData({ ...formData, jumlahKK: e.target.value })}
                    className="h-8 sm:h-9 text-xs sm:text-sm rounded-lg"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="ketuaRT" className="text-xs sm:text-sm font-medium">Ketua RT *</Label>
                <Input
                  id="ketuaRT"
                  placeholder="Nama Ketua RT"
                  value={formData.ketuaRT}
                  onChange={(e) => setFormData({ ...formData, ketuaRT: e.target.value })}
                  className="h-8 sm:h-9 text-xs sm:text-sm rounded-lg"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="alamat" className="text-xs sm:text-sm font-medium">Alamat *</Label>
                <Input
                  id="alamat"
                  placeholder="Jl. Contoh No. 1-15"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="h-8 sm:h-9 text-xs sm:text-sm rounded-lg"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="kontak" className="text-xs sm:text-sm font-medium">Kontak (Opsional)</Label>
                <Input
                  id="kontak"
                  placeholder="081234567890"
                  value={formData.kontak}
                  onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                  className="h-8 sm:h-9 text-xs sm:text-sm rounded-lg"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 pt-3">
                <Button type="submit" className="h-8 sm:h-9 flex-1 text-xs sm:text-sm rounded-lg">
                  {editingRT ? "Perbarui" : "Tambah"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-8 sm:h-9 flex-1 sm:flex-none text-xs sm:text-sm rounded-lg"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingRT(null);
                    setFormData({ nomor: "", ketuaRT: "", jumlahKK: "", alamat: "", kontak: "" });
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rtList.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">Belum ada data RT. Klik "Tambah RT" untuk memulai.</p>
          </div>
        ) : (
          rtList.map((rt) => (
          <Card key={rt.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{rt.nomor}</CardTitle>
                  <CardDescription>{rt.ketuaRT}</CardDescription>
                </div>
                <Badge variant="secondary">
                  {rt.totalTransaksi} transaksi
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{rt.jumlahKK} KK</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{rt.alamat}</span>
              </div>
              
              {rt.kontak && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{rt.kontak}</span>
                </div>
              )}
              
              <div className="pt-2 border-t">
                <p className="text-sm font-medium">
                  Saldo Tabungan: <span className="text-success">Rp {rt.saldo.toLocaleString('id-ID')}</span>
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(rt)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(rt.id)}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Hapus
                </Button>
              </div>
            </CardContent>
          </Card>
        )))}
      </div>
    </div>
  );
};