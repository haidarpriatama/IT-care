import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, User, Mail, Lock, Phone, Building } from 'lucide-react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    role: 'karyawan'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/register', formData);
      navigate('/login', { state: { message: 'Registrasi berhasil! Silakan login.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Registrasi gagal. Coba lagi nanti.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 font-sans">
      <div className="w-full max-w-[450px] space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm">
            IT
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Daftar IT Care</h1>
          <p className="text-xs text-muted-foreground">Buat akun untuk mulai mengajukan tiket bantuan IT.</p>
        </div>

        <Card className="border-border shadow-md rounded-xl bg-card">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="py-2.5 rounded-lg border-destructive/50 bg-destructive/5 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-medium ml-1.5">{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold text-foreground ml-0.5">Nama Lengkap</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                    <Input 
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                      disabled={isLoading}
                      className="h-10 text-sm bg-background pl-10 border-border/60 focus:border-primary/50 transition-all rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-foreground ml-0.5">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                    <Input 
                      id="email"
                      name="email"
                      type="email" 
                      placeholder="nama@perusahaan.com"
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                      disabled={isLoading}
                      className="h-10 text-sm bg-background pl-10 border-border/60 focus:border-primary/50 transition-all rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-foreground ml-0.5">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                  <Input 
                    id="password"
                    name="password"
                    type="password" 
                    placeholder="Minimal 6 karakter"
                    value={formData.password} 
                    onChange={handleChange} 
                    required 
                    minLength={6}
                    disabled={isLoading}
                    className="h-10 text-sm bg-background pl-10 border-border/60 focus:border-primary/50 transition-all rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="department" className="text-xs font-semibold text-foreground ml-0.5">Departemen</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                    <Input 
                      id="department"
                      name="department"
                      placeholder="HR, IT, Finance"
                      value={formData.department} 
                      onChange={handleChange} 
                      required 
                      disabled={isLoading}
                      className="h-10 text-sm bg-background pl-10 border-border/60 focus:border-primary/50 transition-all rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs font-semibold text-foreground ml-0.5">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(val) => setFormData({ ...formData, role: val })}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="role" className="h-10 text-sm bg-background border-border/60 focus:border-primary/50 rounded-lg">
                      <SelectValue placeholder="Pilih Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="karyawan">Karyawan</SelectItem>
                      <SelectItem value="teknisi">Teknisi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-foreground ml-0.5">Nomor Telepon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                  <Input 
                    id="phone"
                    name="phone"
                    placeholder="0812..."
                    value={formData.phone} 
                    onChange={handleChange} 
                    disabled={isLoading}
                    className="h-10 text-sm bg-background pl-10 border-border/60 focus:border-primary/50 transition-all rounded-lg"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-10 font-semibold text-sm rounded-lg shadow-sm mt-2" disabled={isLoading}>
                {isLoading ? "Mendaftarkan..." : "Buat Akun Baru"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col border-t border-border/60 p-5 bg-muted/10 rounded-b-xl">
            <div className="text-[13px] text-center text-muted-foreground">
              Sudah memiliki akun?{' '}
              <Link to="/login" className="font-bold text-primary hover:underline transition-all">
                Masuk sekarang
              </Link>
            </div>
          </CardFooter>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground/60 pt-2">
          &copy; 2026 IT Care Helpdesk System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;
