import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Lock, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AdminLoginPage = ({ setIsAdmin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if email is in admin list
      const ADMIN_EMAILS = [
        'admin@smaitabubakar.sch.id',
        'research@smaitabubakar.sch.id',
        'kelas11c@smaitabubakar.sch.id',
        'admin@mp.id' // Email admin yang digunakan user
      ];

      if (ADMIN_EMAILS.includes(user.email)) {
        setIsAdmin(true);
        toast.success('Login admin berhasil');
        navigate('/admin/dashboard');
      } else {
        toast.error('Email tidak memiliki akses admin');
        // Sign out the user since they're not admin
        await auth.signOut();
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Email atau password salah');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-academic-secondary to-academic-primary flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Button
          data-testid="back-to-home-admin"
          onClick={() => navigate('/')}
          variant="ghost"
          className="mb-4 text-white hover:bg-white/10 academic-transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>

        <Card className="p-8 bg-white/95 backdrop-blur-sm border-academic-border academic-card-hover">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-br from-academic-primary to-academic-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 academic-transition">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-academic-foreground mb-2 academic-heading">Admin Login</h2>
            <p className="text-slate-600 academic-body">Masukkan email dan password untuk mengakses dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Admin</Label>
              <Input
                data-testid="admin-email-input"
                id="email"
                type="email"
                placeholder="Masukkan email admin"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                data-testid="admin-password-input"
                id="password"
                type="password"
                placeholder="Masukkan password admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <Button
              data-testid="admin-login-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-academic-primary to-academic-secondary hover:from-academic-primary/90 hover:to-academic-secondary/90 academic-transition"
            >
              {loading ? 'Memverifikasi...' : 'Login'}
            </Button>
          </form>

          <p className="text-xs text-slate-500 text-center mt-4 academic-body">
           Login Admin Disini
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginPage;