"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";

// --- SUB-COMPONENTES ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-gray-200 bg-gray-50/50 backdrop-blur-sm transition-colors focus-within:border-brand/70 focus-within:bg-brand/5 focus-within:ring-2 focus-within:ring-brand/10">
    {children}
  </div>
);

interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial; delay: string }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-white/80 backdrop-blur-xl border border-gray-100 p-5 w-72 shadow-lg shadow-gray-100/50`}>
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl border border-gray-100" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-semibold text-black">{testimonial.name}</p>
      <p className="text-xs text-gray-400 font-light">{testimonial.handle}</p>
      <p className="mt-1.5 text-gray-600 font-light text-xs leading-relaxed">{testimonial.text}</p>
    </div>
  </div>
);

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    name: "Ana Silva",
    handle: "@saboresdaana",
    text: "O novo design das nossas embalagens feito pela Vink triplicou as postagens dos clientes no Instagram!"
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
    name: "Bruno Costa",
    handle: "@bruno_burgers",
    text: "Mudar nosso branding com a Vink foi o divisor de águas. Nosso delivery agora tem cara de franquia!"
  }
];

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, signInWithSocial } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn(email.trim(), password);

    if (error) {
      setError("E-mail ou senha incorretos.");
      setLoading(false);
    } else {
      if (email.trim().toLowerCase() === "vinkimpressos@gmail.com") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithSocial("google");
    } catch (err: any) {
      setError(err.message || "Erro ao entrar com o Google.");
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-sans w-[100dvw] bg-white relative overflow-hidden text-gray-900 selection:bg-brand selection:text-white">
      {/* Background Sparkles Effect */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <SparklesComp
          density={80}
          direction="bottom"
          speed={0.4}
          color="#15cb98"
          className="absolute inset-0 h-full w-full"
        />
      </div>

      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 p-2.5 text-gray-500 hover:text-white hover:bg-black transition-all bg-white rounded-full shadow-md border border-gray-100 z-50 flex items-center justify-center"
      >
        <ArrowLeft size={18} />
      </Link>

      {/* Left column: Sign-In Form */}
      <section className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Link href="/" className="mb-4 w-fit block animate-element animate-delay-100">
                <img src="https://i.imgur.com/aS2efN8.png" alt="Vink" className="h-6 md:h-7 w-auto object-contain" />
              </Link>
              <h1 className="animate-element animate-delay-100 text-3xl font-semibold tracking-tight text-gray-900 leading-tight">
                Bem-vindo de volta
              </h1>
              <p className="animate-element animate-delay-200 text-sm text-gray-600 font-light mt-1">
                Não tem uma conta?{" "}
                <Link href="/cadastro" className="font-semibold text-brand hover:underline hover:text-brand-dark transition-colors">
                  Cadastre-se grátis
                </Link>
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="animate-element animate-delay-100 bg-red-50 text-red-600 text-sm p-3.5 rounded-2xl text-center border border-red-100 font-light">
                  {error}
                </div>
              )}

              <div className="animate-element animate-delay-300">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Endereço de E-mail</label>
                <GlassInputWrapper>
                  <div className="relative flex items-center">
                    <Mail size={16} className="text-gray-400 absolute left-4" />
                    <input 
                      name="email" 
                      type="email" 
                      placeholder="seu@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-transparent text-sm p-4 pl-12 rounded-2xl focus:outline-none text-black font-light placeholder:text-gray-400" 
                    />
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Sua Senha</label>
                <GlassInputWrapper>
                  <div className="relative flex items-center">
                    <Lock size={16} className="text-gray-400 absolute left-4" />
                    <input 
                      name="password" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Sua senha" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-transparent text-sm p-4 pl-12 pr-12 rounded-2xl focus:outline-none text-black font-light placeholder:text-gray-400" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-4 flex items-center">
                      {showPassword ? <EyeOff className="w-5 h-5 text-gray-400 hover:text-black transition-colors" /> : <Eye className="w-5 h-5 text-gray-400 hover:text-black transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500 flex items-center justify-between text-xs sm:text-sm">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" name="rememberMe" className="custom-checkbox" />
                  <span className="text-gray-600 font-light select-none">Manter conectado</span>
                </label>
                <Link href="/recuperar-senha" className="hover:underline text-brand font-medium hover:text-brand-dark transition-colors">
                  Esqueceu a senha?
                </Link>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="animate-element animate-delay-600 w-full rounded-2xl bg-brand text-white py-4 font-semibold hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-brand/10 transition-all disabled:opacity-75 disabled:cursor-not-allowed relative overflow-hidden z-10 before:content-[''] before:absolute before:left-1/2 before:bottom-0 before:z-0 before:h-0 before:w-0 before:-translate-x-1/2 before:translate-y-1/2 before:rounded-full before:transition-all before:duration-500 before:ease-out hover:before:h-[600px] hover:before:w-[600px] before:bg-[#10a379]"
              >
                <span className="relative z-10">
                  {loading ? "Entrando..." : "Entrar na Conta"}
                </span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Right column: Hero Image + Testimonials */}
      <section className="hidden md:block flex-1 relative p-4 z-10">
        <div 
          className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center shadow-2xl" 
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop)` }}
        >
          {/* Overlay to darken image slightly for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 rounded-3xl"></div>
        </div>
        
        {sampleTestimonials.length > 0 && (
          <div className="absolute bottom-10 left-0 right-0 flex gap-4 px-8 w-full justify-center flex-wrap">
            <TestimonialCard testimonial={sampleTestimonials[0]} delay="animate-delay-1000" />
            {sampleTestimonials[1] && <div className="hidden lg:flex"><TestimonialCard testimonial={sampleTestimonials[1]} delay="animate-delay-1200" /></div>}
          </div>
        )}
      </section>
    </div>
  );
}
