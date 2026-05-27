"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft } from "lucide-react";
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

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop",
    name: "Clara Mendes",
    handle: "@clarapastisserie",
    text: "O cardápio estratégico desenhado pela Vink aumentou as vendas dos nossos doces finos em 45%!"
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
    name: "Lucas Rocha",
    handle: "@lucas_cafes",
    text: "A experiência unboxing das nossas caixas virou febre local. O cliente filma e divulga nossa marca de graça!"
  }
];

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { signUp } = useAuth();
  const router = useRouter();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove invalid chars
    if (value.length > 11) value = value.slice(0, 11);

    // Mask (XX) XXXXX-XXXX
    if (value.length > 10) {
      value = value.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (value.length > 5) {
      value = value.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (value.length > 2) {
      value = value.replace(/^(\d\d)(\d{0,5}).*/, "($1) $2");
    } else {
      value = value.replace(/^(\d*)/, "($1");
    }

    setPhone(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { data, error } = await signUp(email.trim(), password, name);

    if (error) {
      setError(error.message || "Erro ao criar conta.");
      setLoading(false);
    } else {
      alert("Conta criada com sucesso!");

      if (email.trim().toLowerCase() === "vinkimpressos@gmail.com") {
        router.push("/admin");
      } else {
        router.push("/");
      }
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

      {/* Left column: Sign-Up Form */}
      <section className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10 overflow-y-auto">
        <div className="w-full max-w-md my-auto py-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Link href="/" className="mb-2 w-fit block animate-element animate-delay-100">
                <img src="/logo.png" alt="Vink" className="h-6 md:h-7 w-auto object-contain" />
              </Link>
              <h1 className="animate-element animate-delay-100 text-3xl font-semibold tracking-tight text-gray-900 leading-tight">
                Crie sua conta
              </h1>
              <p className="animate-element animate-delay-200 text-sm text-gray-600 font-light mt-1">
                Já é cliente?{" "}
                <Link href="/login" className="font-semibold text-brand hover:underline hover:text-brand-dark transition-colors">
                  Faça login
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
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Nome Completo</label>
                <GlassInputWrapper>
                  <div className="relative flex items-center">
                    <User size={16} className="text-gray-400 absolute left-4" />
                    <input 
                      name="name" 
                      type="text" 
                      placeholder="Seu nome completo" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-transparent text-sm p-3.5 pl-12 rounded-2xl focus:outline-none text-black font-light placeholder:text-gray-400" 
                    />
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
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
                      className="w-full bg-transparent text-sm p-3.5 pl-12 rounded-2xl focus:outline-none text-black font-light placeholder:text-gray-400" 
                    />
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-500">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Telefone / WhatsApp</label>
                <GlassInputWrapper>
                  <div className="relative flex items-center">
                    <Phone size={16} className="text-gray-400 absolute left-4" />
                    <input 
                      name="phone" 
                      type="tel" 
                      placeholder="(00) 00000-0000" 
                      value={phone}
                      onChange={handlePhoneChange}
                      maxLength={15}
                      className="w-full bg-transparent text-sm p-3.5 pl-12 rounded-2xl focus:outline-none text-black font-light placeholder:text-gray-400" 
                    />
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-600">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Sua Senha</label>
                <GlassInputWrapper>
                  <div className="relative flex items-center">
                    <Lock size={16} className="text-gray-400 absolute left-4" />
                    <input 
                      name="password" 
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Mínimo de 8 caracteres" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-transparent text-sm p-3.5 pl-12 pr-12 rounded-2xl focus:outline-none text-black font-light placeholder:text-gray-400" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-4 flex items-center">
                      {showPassword ? <EyeOff className="w-5 h-5 text-gray-400 hover:text-black transition-colors" /> : <Eye className="w-5 h-5 text-gray-400 hover:text-black transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="animate-element animate-delay-700 w-full rounded-2xl bg-brand text-white py-4 font-semibold hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-brand/10 transition-all disabled:opacity-75 disabled:cursor-not-allowed relative overflow-hidden z-10 before:content-[''] before:absolute before:left-1/2 before:bottom-0 before:z-0 before:h-0 before:w-0 before:-translate-x-1/2 before:translate-y-1/2 before:rounded-full before:transition-all before:duration-500 before:ease-out hover:before:h-[600px] hover:before:w-[600px] before:bg-[#10a379]"
              >
                <span className="relative z-10">
                  {loading ? "Criando Conta..." : "Criar Conta Grátis"}
                </span>
              </button>
            </form>

            <p className="animate-element animate-delay-900 text-center text-xs text-gray-400 font-light mt-4 leading-relaxed">
              Ao se cadastrar, você concorda com nossos <Link href="/termos-de-uso" className="underline hover:text-gray-600">Termos de Uso</Link> e <Link href="/politica-de-privacidade" className="underline hover:text-gray-600">Política de Privacidade</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Right column: Hero Image + Testimonials */}
      <section className="hidden md:block flex-1 relative p-4 z-10">
        <div 
          className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center shadow-2xl" 
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1541807084-5c52b6b3adef?q=80&w=1200&auto=format&fit=crop)` }}
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
