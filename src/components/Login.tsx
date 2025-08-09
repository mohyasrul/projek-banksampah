import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { login, isAuthenticated, loading } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Show loading screen while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/logo-app-cropped.jpeg"
              alt="Logo Hijau Lestari"
              className="h-20 w-20 rounded-full shadow-lg object-cover border-4 border-white"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hijau Lestari</h1>
          <p className="text-gray-600">Sistem Manajemen Tabungan Sampah</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-semibold text-center">Masuk ke Sistem</CardTitle>
            <CardDescription className="text-center">
              Masukkan kredensial Anda untuk mengakses dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Masukkan email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    required
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all duration-200"
                disabled={loading || !email || !password}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Masuk
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Presentation Information */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-lg">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="font-semibold text-green-900 text-base">Dipersembahkan oleh:</h3>
              
              {/* Logos */}
              <div className="flex justify-center items-center gap-8">
                <div className="flex flex-col items-center">
                  <img
                    src="/logo-kampus.png"
                    alt="Logo Institut Teknologi Garut"
                    className="h-14 w-14 object-contain"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <img
                    src="/logo-kkn.png"
                    alt="Logo KKN"
                    className="h-14 w-14 object-contain"
                  />
                </div>
              </div>
              
              {/* Text Information */}
              <div className="text-sm text-green-800 space-y-1">
                <div className="font-semibold">Program Kuliah Kerja Nyata Tematik 2025</div>
                <div className="font-medium">Institut Teknologi Garut</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
