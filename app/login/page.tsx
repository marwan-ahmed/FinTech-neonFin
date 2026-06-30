'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const plan = params.get('plan');
      if (plan) {
        setIsSignUp(true);
        if (['monthly', 'yearly', 'lifetime'].includes(plan)) {
          setSelectedPlan(plan);
        }
      }
    }
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp && password !== confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const auth = getFirebaseAuth();
      const isDummyAuth = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || auth.app.options.apiKey === 'DUMMY_KEY_FOR_DEV';

      let userCredential;
      if (isDummyAuth) {
        // Mock user credential for local development testing
        userCredential = {
          user: {
            uid: 'mock-uid-' + email.split('@')[0],
            email: email,
            displayName: fullName || email.split('@')[0],
            getIdToken: async (forceRefresh?: boolean) => 'mock-id-token:' + email,
          }
        };
      } else {
        if (isSignUp) {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, { displayName: fullName });
        } else {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        }
      }
      
      const idToken = await userCredential.user.getIdToken(true);
      await createSession(
        idToken,
        isSignUp
          ? {
              fullName,
              phoneNumber,
              selectedPlan,
              planPrice: selectedPlan === 'monthly' ? 50000 : selectedPlan === 'yearly' ? 350000 : 750000
            }
          : undefined
      );
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (
    idToken: string,
    profileData?: { fullName: string; phoneNumber: string; selectedPlan: string; planPrice: number }
  ) => {
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken, ...profileData }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.role === 'superadmin') {
        window.location.href = '/super-admin';
      } else {
        window.location.href = '/dashboard';
      }
    } else {
      const data = await res.json().catch(() => ({ error: 'Failed to create session on the server.' }));
      setError(data.error || 'Failed to create session on the server.');
    }
  };

  const handleAuthError = (err: any) => {
    console.error('Login error:', err);
    if (err.code === 'auth/configuration-not-found' || err.code === 'auth/invalid-api-key') {
      setError('Firebase is not configured. Please add valid Firebase credentials to the AI Studio Secrets panel.');
    } else if (err.code === 'auth/unauthorized-domain') {
      setError(`This domain is not authorized for OAuth operations. Please add the current domain to your Firebase Console -> Authentication -> Settings -> Authorized domains.`);
    } else if (err.code === 'auth/invalid-credential') {
      setError('Invalid email or password.');
    } else if (err.code === 'auth/email-already-in-use') {
      setError('Email is already registered. Please sign in instead.');
    } else {
      setError(err.message || 'An error occurred during authentication.');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const auth = getFirebaseAuth();
      const isDummyAuth = !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || auth.app.options.apiKey === 'DUMMY_KEY_FOR_DEV';

      let idToken;
      if (isDummyAuth) {
        idToken = 'mock-id-token:google-mock@system.io';
      } else {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        idToken = await userCredential.user.getIdToken();
      }
      await createSession(idToken);
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-1 w-full items-center justify-center px-4 py-12 overflow-hidden">
      {/* ── خلفية متحركة مضيئة ── */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-30%] right-[-20%] h-[500px] w-[500px] rounded-full bg-[#10b981]/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[400px] w-[400px] rounded-full bg-[#3b82f6]/8 blur-[100px] animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-[20%] left-[30%] h-[300px] w-[300px] rounded-full bg-[#10b981]/5 blur-[80px] animate-pulse" style={{animationDelay: '2s'}} />
      </div>

      {/* ── بطاقة تسجيل الدخول ── */}
      <div className="w-full max-w-sm rounded-2xl border border-[#262626] bg-[#141414]/80 backdrop-blur-xl p-8 shadow-[0_25px_50px_rgba(0,0,0,0.5)] animate-fade-in-up">
        
        {/* رأس البطاقة — الشعار */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="flex items-center gap-2.5 mb-6 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#10b981] rotate-45 shadow-[0_0_24px_rgba(16,185,129,0.4)] transition-shadow duration-500 group-hover:shadow-[0_0_32px_rgba(16,185,129,0.6)]">
              <div className="h-5 w-5 bg-black rotate-[-45deg]"></div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#ededed]">
              نيون <span className="text-[#10b981]">فين</span>
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#ededed]">{isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</h2>
          <p className="mt-2 text-xs uppercase tracking-widest text-[#737373]">
            {isSignUp ? 'سجّل بياناتك للبدء' : 'التحقق من الهوية'}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/30 p-3 text-sm text-[#ef4444] animate-fade-in-down">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 mb-6">
          {isSignUp && (
            <>
              <div className="animate-fade-in-up" style={{animationDelay: '50ms'}}>
                <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-[#737373]">الاسم الكامل</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-lg border border-[#262626] bg-[#0f0f0f] px-4 py-2.5 text-sm text-[#ededed] focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] outline-none transition-all duration-200" 
                  placeholder="محمد أحمد"
                  required={isSignUp}
                />
              </div>
              <div className="animate-fade-in-up" style={{animationDelay: '100ms'}}>
                <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-[#737373]">رقم الهاتف</label>
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full rounded-lg border border-[#262626] bg-[#0f0f0f] px-4 py-2.5 text-sm text-[#ededed] focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] outline-none transition-all duration-200 text-left" 
                  dir="ltr"
                  placeholder="07xxxxxxxx"
                  required={isSignUp}
                />
              </div>
              <div className="animate-fade-in-up" style={{animationDelay: '120ms'}}>
                <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-[#737373]">الخطة المطلوبة</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full rounded-lg border border-[#262626] bg-[#0f0f0f] px-4 py-2.5 text-sm text-[#ededed] focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] outline-none transition-all duration-200"
                  required={isSignUp}
                >
                  <option value="monthly">اشتراك شهري (50,000 د.ع / شهرياً)</option>
                  <option value="yearly">اشتراك سنوي (350,000 د.ع / سنوياً)</option>
                  <option value="lifetime">اشتراك مدى الحياة (750,000 د.ع / دفعة واحدة)</option>
                </select>
              </div>
            </>
          )}
          <div className="animate-fade-in-up" style={{animationDelay: isSignUp ? '150ms' : '50ms'}}>
            <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-[#737373]" htmlFor="email">البريد الإلكتروني</label>
            <input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#262626] bg-[#0f0f0f] px-4 py-2.5 text-sm text-[#ededed] focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] outline-none transition-all duration-200 text-left" 
              dir="ltr"
              placeholder="user@system.io"
              required
            />
          </div>
          <div className="animate-fade-in-up" style={{animationDelay: isSignUp ? '200ms' : '100ms'}}>
            <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-[#737373]" htmlFor="password">كلمة المرور</label>
            <div className="relative">
              <input 
                id="password" 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#262626] bg-[#0f0f0f] px-4 pl-10 py-2.5 text-sm text-[#ededed] focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] outline-none transition-all duration-200 text-left"
                dir="ltr"
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#10b981] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {isSignUp && (
            <div className="animate-fade-in-up" style={{animationDelay: '250ms'}}>
              <label className="mb-1.5 block text-[10px] uppercase tracking-widest text-[#737373]">تأكيد كلمة المرور</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#262626] bg-[#0f0f0f] px-4 pl-10 py-2.5 text-sm text-[#ededed] focus:border-[#10b981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] outline-none transition-all duration-200 text-left"
                  dir="ltr"
                  placeholder="••••••••"
                  required={isSignUp}
                />
                <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#10b981] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg bg-[#10b981] px-4 py-3 text-sm font-bold text-black transition-all duration-200 hover:bg-[#34d399] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isSignUp ? 'إنشاء حساب' : 'دخول آمن')}
          </button>
        </form>

        <div className="relative mb-6 flex items-center py-2">
          <div className="flex-grow border-t border-[#262626]"></div>
          <span className="mx-4 flex-shrink-0 text-[10px] uppercase tracking-widest text-[#737373]">أو</span>
          <div className="flex-grow border-t border-[#262626]"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-[#262626] bg-[#0f0f0f] px-4 py-3 text-sm font-bold text-[#ededed] transition-all duration-200 hover:bg-[#1a1a1a] hover:border-[#404040] focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          <span>المتابعة باستخدام جوجل</span>
        </button>

        <div className="mt-6 text-center">
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[11px] text-[#737373] hover:text-[#10b981] transition-colors uppercase tracking-widest"
          >
            {isSignUp ? 'تمتلك حساب؟ سجل دخولك' : 'لاتملك حساب؟ انشاء حساب الان'}
          </button>
        </div>
      </div>
    </div>
  );
}
