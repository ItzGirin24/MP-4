import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { GraduationCap, ClipboardList, BarChart3, Lock, BookOpen, Users, Award, Microscope, Sparkles, TrendingUp, Shield, Target, ChevronDown, Star } from 'lucide-react';

// Admin emails yang diizinkan
const ADMIN_EMAILS = [
  'admin@smaitabubakar.sch.id',
  'research@smaitabubakar.sch.id',
  'kelas11c@smaitabubakar.sch.id',
  'admin@mp.id' // Email admin yang digunakan user
];
import { toast } from 'sonner';

const HomePage = ({ user }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setIsVisible(true);

    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Login berhasil!');
      navigate('/survey');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login gagal. Silakan coba lagi.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success('Logout berhasil');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-academic-muted via-white to-academic-muted/50 overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-academic-primary/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-academic-secondary/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-academic-accent/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-academic-primary/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Header */}
      <header className={`bg-white/95 backdrop-blur-lg border-b border-academic-border sticky top-0 z-50 academic-transition transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`bg-gradient-to-br from-academic-primary to-academic-secondary p-3 rounded-xl academic-transition hover:scale-105 transition-all duration-700 ${isVisible ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <div className={`transition-all duration-700 delay-200 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-bold text-academic-foreground academic-heading leading-tight">Survey Penelitian</h1>
                <p className="text-xs text-slate-600 academic-body hidden sm:block">SMAIT Abu Bakar Boarding School</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-academic-foreground academic-body">{user.displayName}</p>
                  <p className="text-xs text-slate-600">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  {user && ADMIN_EMAILS.includes(user.email) && (
                    <Button
                      onClick={() => navigate('/admin/dashboard')}
                      variant="outline"
                      size="sm"
                      className="bg-academic-primary/10 hover:bg-academic-primary/20 border-academic-primary text-academic-primary academic-transition"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  )}
                  <Button onClick={handleSignOut} variant="outline" size="sm" className="border-academic-border hover:bg-academic-muted academic-transition">
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <Button onClick={() => navigate('/admin/login')} variant="ghost" size="sm" className="text-academic-secondary hover:bg-academic-muted academic-transition">
                <Lock className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`inline-block mb-6 px-6 py-3 bg-academic-accent/10 text-academic-accent rounded-full text-sm font-semibold academic-body border border-academic-accent/20 transition-all duration-700 delay-300 ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'}`}>
           
            Metodologi Penelitian
          </div>
          <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-academic-foreground mb-6 leading-tight academic-heading transition-all duration-700 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            Dampak Game Online Terhadap{' '}
            <span className="bg-gradient-to-r from-academic-primary via-academic-secondary to-academic-accent bg-clip-text text-transparent animate-pulse">
              Remaja SMA
            </span>{' '}
            di DI.Yogyakarta
          </h1>
          <p className={`text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto academic-body transition-all duration-700 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            Kami mengundang Anda untuk berpartisipasi dalam penelitian kami. Jawaban Anda akan sangat membantu kami memahami fenomena game online di kalangan remaja.
          </p>
          
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center transition-all duration-700 delay-900 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            {user ? (
              <Button
                data-testid="start-survey-btn"
                onClick={() => navigate('/survey')}
                size="lg"
                className="bg-gradient-to-r from-academic-primary to-academic-secondary hover:from-academic-primary/90 hover:to-academic-secondary/90 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl academic-transition academic-card-hover transform hover:scale-105 active:scale-95 transition-all duration-300"
              >
                <ClipboardList className="w-5 h-5 mr-2 animate-pulse" />
                Mulai Survey
                <TrendingUp className="w-4 h-4 ml-2 animate-bounce" />
              </Button>
            ) : (
              <Button
                data-testid="google-signin-btn"
                onClick={handleGoogleSignIn}
                size="lg"
                className="bg-white hover:bg-academic-muted text-academic-foreground border-2 border-academic-border px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl academic-transition academic-card-hover transform hover:scale-105 active:scale-95 transition-all duration-300 group"
              >
                <svg className="w-5 h-5 mr-3 group-hover:animate-spin" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Masuk dengan Google
                <ChevronDown className="w-4 h-4 ml-2 group-hover:translate-y-1 transition-transform duration-300" />
              </Button>
            )}

            {/* Scroll Indicator */}
            <div className="mt-8 animate-bounce">
              <ChevronDown className="w-6 h-6 text-academic-primary mx-auto opacity-70" />
            </div>
          </div>
          
          <p className="mt-4 text-sm text-slate-500">
            Penelitian ini dilakukan oleh siswa Kelompok 4 MP XI-C SMAIT Abu Bakar Boarding School
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 relative">
        <div className="text-center mb-12">
          <h2 className={`text-3xl sm:text-4xl font-bold text-academic-foreground mb-4 academic-heading transition-all duration-700 delay-300 ${scrollY > 200 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            Mengapa Berpartisipasi?
          </h2>
          <p className={`text-lg text-slate-600 academic-body transition-all duration-700 delay-500 ${scrollY > 200 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            Bergabunglah dalam penelitian yang memberikan dampak positif
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className={`p-6 border-2 hover:border-academic-primary/30 academic-transition academic-card-hover bg-white/80 backdrop-blur-sm transform transition-all duration-700 delay-700 hover:scale-105 hover:shadow-2xl ${scrollY > 300 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="bg-academic-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 academic-transition group-hover:scale-110 transition-transform duration-300">
              <ClipboardList className="w-7 h-7 text-academic-primary animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-academic-foreground mb-2 academic-subheading">Survey Interaktif</h3>
            <p className="text-slate-600 academic-body">Pertanyaan yang mudah dipahami dan menarik untuk dijawab dengan interface modern</p>
            <div className="mt-4 flex items-center text-academic-primary">
              <Target className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Mudah Digunakan</span>
            </div>
          </Card>

          <Card className={`p-6 border-2 hover:border-academic-secondary/30 academic-transition academic-card-hover bg-white/80 backdrop-blur-sm transform transition-all duration-700 delay-900 hover:scale-105 hover:shadow-2xl ${scrollY > 300 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="bg-academic-secondary/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 academic-transition group-hover:scale-110 transition-transform duration-300">
              <Shield className="w-7 h-7 text-academic-secondary animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-academic-foreground mb-2 academic-subheading">Data Aman & Terjamin</h3>
            <p className="text-slate-600 academic-body">Jawaban Anda tersimpan dengan aman  dan terjaga kerahasiaannya</p>
            <div className="mt-4 flex items-center text-academic-secondary">
              <Lock className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Terenkripsi & Aman</span>
            </div>
          </Card>

          <Card className={`p-6 border-2 hover:border-academic-accent/30 academic-transition academic-card-hover bg-white/80 backdrop-blur-sm transform transition-all duration-700 delay-1100 hover:scale-105 hover:shadow-2xl ${scrollY > 300 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="bg-academic-accent/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 academic-transition group-hover:scale-110 transition-transform duration-300">
              <Award className="w-7 h-7 text-academic-accent animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-academic-foreground mb-2 academic-subheading">Kontribusi Nyata</h3>
            <p className="text-slate-600 academic-body">Data Anda membantu riset akademis yang bermanfaat untuk memahami fenomena game online</p>
            <div className="mt-4 flex items-center text-academic-accent">
              <Star className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Riset Bermanfaat</span>
            </div>
          </Card>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 opacity-20 animate-float">
          <BookOpen className="w-8 h-8 text-academic-primary" />
        </div>
        <div className="absolute bottom-10 right-10 opacity-20 animate-float" style={{ animationDelay: '2s' }}>
          <Microscope className="w-8 h-8 text-academic-secondary" />
        </div>
        <div className="absolute top-1/2 right-20 opacity-20 animate-float" style={{ animationDelay: '4s' }}>
          <Users className="w-6 h-6 text-academic-accent" />
        </div>
      </section>

      {/* Footer */}
      <footer className={`bg-academic-secondary text-white py-8 mt-16 transition-all duration-700 delay-1300 ${scrollY > 600 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-6 h-6 animate-pulse" />
            <span className="text-lg font-bold">SMAIT Abu Bakar Boarding School</span>
            <GraduationCap className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-sm academic-body mb-2">
            © 2025 Kulon Progo, Yogyakarta
          </p>
          <p className="text-xs text-white/70 academic-body">
            Penelitian: Dampak Game Online Terhadap Remaja SMA di DI.Yogyakarta
          </p>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/60">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              Kelompok 4 MP XI-C
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Microscope className="w-3 h-3" />
              Metodologi Penelitian
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
