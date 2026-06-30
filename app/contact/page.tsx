'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Send, MessageCircle, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setStatus('loading');
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        const data = await res.json().catch(() => ({ error: 'حدث خطأ غير متوقع أثناء إرسال الرسالة.' }));
        setError(data.error || 'حدث خطأ غير متوقع أثناء إرسال الرسالة.');
        setStatus('error');
      }
    } catch (err: any) {
      console.error('Failed to submit contact message:', err);
      setError('تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
      setStatus('error');
    }
  };

  return (
    <div className="bg-[#050505] text-[#ededed] min-h-screen selection:bg-[#10b981]/30 selection:text-[#10b981] overflow-x-hidden relative flex flex-col justify-between">
      
      {/* Background Decorative Blur Blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#10b981]/10 to-[#3b82f6]/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-[#8b5cf6]/5 to-[#10b981]/5 blur-[150px] pointer-events-none"></div>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24 relative z-10 w-full flex-1">
        
        {/* Breadcrumb */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs text-[#737373] hover:text-[#10b981] transition-colors mb-8 group"
        >
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          <span>العودة للرئيسية</span>
        </Link>

        {/* Header */}
        <div className="mb-12 animate-fade-in-down">
          <div className="inline-flex items-center gap-2 bg-[#10b981]/10 border border-[#10b981]/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#10b981] mb-4">
            <MessageCircle size={12} />
            <span>اتصل بنا</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            نحن هنا للإجابة على استفساراتكم
          </h1>
          <p className="text-sm md:text-base text-[#a3a3a3] mt-4 leading-relaxed max-w-xl">
            سواء كنت ترغب بالاستفسار عن خطط المنصة، الدعم الفني، أو طلب موعد مخصص، فإن فريق الدعم الفني متواجد لمساعدتك.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Info Panel - 5 cols */}
          <div className="lg:col-span-5 flex flex-col gap-6 animate-fade-in">
            
            {/* Cards Container */}
            <div className="bg-[#0c0c0c] border border-[#1f1f1f] rounded-2xl p-6 md:p-8 flex flex-col gap-6">
              
              <h2 className="text-xl font-bold text-white border-b border-[#1f1f1f] pb-4 mb-2">معلومات التواصل</h2>
              
              {/* Phone */}
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-[#10b981]/10 text-[#10b981]">
                  <Phone size={20} />
                </div>
                <div>
                  <span className="text-[10px] text-[#737373] block">الهاتف المباشر</span>
                  <a href="tel:07760776774" className="text-base font-bold text-white hover:text-[#10b981] transition-colors mt-1 block font-mono">
                    07760776774
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-[#10b981]/10 text-[#10b981]">
                  <Mail size={20} />
                </div>
                <div>
                  <span className="text-[10px] text-[#737373] block">البريد الإلكتروني</span>
                  <a href="mailto:main@neonfiniq.com" className="text-base font-bold text-white hover:text-[#10b981] transition-colors mt-1 block">
                    main@neonfiniq.com
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-xl bg-[#10b981]/10 text-[#10b981]">
                  <MapPin size={20} />
                </div>
                <div>
                  <span className="text-[10px] text-[#737373] block">العنوان والمقر</span>
                  <span className="text-base font-bold text-white mt-1 block">
                    العراق – صلاح الدين – سامراء
                  </span>
                </div>
              </div>

            </div>

            {/* WhatsApp Quick Link */}
            <a 
              href="https://wa.me/9647760776774"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between bg-[#10b981]/10 border border-[#10b981]/20 hover:border-[#10b981]/50 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-0.5 group shadow-[0_4px_20px_rgba(16,185,129,0.05)]"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-[#10b981] text-black">
                  <MessageCircle size={22} className="fill-black" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block group-hover:text-[#10b981] transition-colors">تواصل سريع عبر واتساب</span>
                  <span className="text-[11px] text-[#737373] block mt-0.5">رد فوري على مدار الساعة</span>
                </div>
              </div>
              <ArrowRight size={18} className="text-[#737373] group-hover:text-[#10b981] transition-colors rotate-180" />
            </a>

          </div>

          {/* Form Panel - 7 cols */}
          <div className="lg:col-span-7 bg-[#0c0c0c] border border-[#1f1f1f] rounded-2xl p-6 md:p-8 animate-fade-in" style={{animationDelay: '100ms'}}>
            
            <h2 className="text-xl font-bold text-white mb-6">أرسل لنا رسالة</h2>

            {status === 'success' ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-scale-in">
                <div className="w-16 h-16 rounded-full bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">تم إرسال رسالتك بنجاح!</h3>
                <p className="text-sm text-[#737373] max-w-sm leading-relaxed mb-6">
                  شكراً لتواصلك معنا. سنقوم بمراجعة طلبك والرد عليك عبر البريد الإلكتروني المرفق في أقرب وقت ممكن.
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="bg-[#141414] hover:bg-[#1f1f1f] text-[#ededed] border border-[#262626] font-bold py-2.5 px-6 rounded-xl text-sm transition-all"
                >
                  أرسل رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && (
                  <div className="text-xs text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 p-3.5 rounded-xl animate-fade-in">
                    {error}
                  </div>
                )}
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-[#a3a3a3]">الاسم الكامل</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="مثال: علي محمد"
                    className="w-full bg-[#121212] border border-[#1f1f1f] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10b981] transition-colors"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-[#a3a3a3]">البريد الإلكتروني</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="w-full bg-[#121212] border border-[#1f1f1f] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10b981] transition-colors"
                  />
                </div>

                {/* Message */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-xs font-semibold text-[#a3a3a3]">نص الرسالة</label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={5}
                    placeholder="اكتب استفسارك بالتفصيل هنا..."
                    className="w-full bg-[#121212] border border-[#1f1f1f] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10b981] transition-colors resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="mt-2 flex items-center justify-center gap-2 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] text-black font-bold py-3.5 rounded-xl transition-all duration-200 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 disabled:opacity-50 text-sm font-semibold"
                >
                  {status === 'loading' ? (
                    <span>جاري الإرسال...</span>
                  ) : (
                    <>
                      <span>إرسال الرسالة</span>
                      <Send size={16} className="rotate-180" />
                    </>
                  )}
                </button>

              </form>
            )}

          </div>

        </div>

      </main>

      {/* Footer copyright */}
      <footer className="w-full border-t border-[#1f1f1f] bg-[#050505] py-6 text-xs text-[#737373] relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} نيون فين. جميع الحقوق محفوظة لشركتنا المسجلة برقم 32185.</p>
          <Link href="/privacy" className="hover:text-[#10b981] transition-colors">
            سياسة الخصوصية
          </Link>
        </div>
      </footer>

    </div>
  );
}
