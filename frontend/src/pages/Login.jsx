import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/utils/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal. Periksa kembali kredensial Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 font-sans">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm">
            IT
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">IT Care Helpdesk</h1>
          <p className="text-xs text-muted-foreground">Silakan masuk untuk mengelola tiket bantuan Anda.</p>
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
              
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground ml-0.5">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="nama@perusahaan.com"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    disabled={isLoading}
                    className="h-10 text-sm bg-background pl-10 border-border/60 focus:border-primary/50 transition-all rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-0.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-foreground">Password</Label>
                  <Link to="#" className="text-[11px] font-medium text-primary hover:underline">Lupa password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="••••••••"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    disabled={isLoading}
                    className="h-10 text-sm bg-background pl-10 border-border/60 focus:border-primary/50 transition-all rounded-lg"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-10 font-semibold text-sm rounded-lg shadow-sm mt-2" disabled={isLoading}>
                {isLoading ? "Memproses..." : "Masuk ke Akun"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col border-t border-border/60 p-5 bg-muted/10 rounded-b-xl">
            <div className="text-[13px] text-center text-muted-foreground">
              Belum punya akun?{' '}
              <Link to="/register" className="font-bold text-primary hover:underline transition-all">
                Daftar sekarang
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Demo Credentials Box */}
        <div className="p-4 rounded-xl border border-border bg-card/50 text-center">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Akun Demo (Admin)</p>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground font-mono">
            <span>User: admin@itcare.id</span>
            <span>Pass: password</span>
          </div>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/60 pt-2">
          &copy; 2026 IT Care Helpdesk System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
