import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, ArrowRight, Sparkles, Brain, Zap, Target, TrendingUp } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    const result = login(accessCode);
    setIsLoading(false);

    if (result.success) {
      if (accessCode.toUpperCase() === 'ADMIN-KEY-2026') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
      setAccessCode('');
    }
  };

  const features = [
    { icon: Brain, text: 'Automatiza tareas con IA' },
    { icon: Zap, text: 'Crea contenido de alto impacto' },
    { icon: Target, text: 'Analiza datos estratégicamente' },
    { icon: TrendingUp, text: 'Destaca en el mercado' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-slate-50 to-[#F0F9FF]">
      {/* Main Content - Split Screen */}
      <main className="flex-1 flex items-center">
        <div className="container mx-auto px-4 py-8 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            {/* Left Column - Text & Motivation */}
            <div className="text-left order-1 lg:order-1 animate-fade-in">
              {/* Logo Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary">Academia LoVirtual</span>
              </div>

              {/* Main Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#01507d] leading-tight mb-6">
                Especialización en{' '}
                <span className="lovirtual-gradient-text">Inteligencia Artificial</span>
              </h1>

              {/* Motivational Paragraph */}
              <p className="text-lg md:text-xl text-[#026E9D] leading-relaxed mb-8 max-w-xl">
                Transforma tu carrera como Asistente Virtual con el poder de la IA. 
                Aprende a automatizar tareas, crear contenido de alto impacto, 
                analizar datos y tomar decisiones estratégicas. Domina herramientas 
                clave para destacar en un mercado competitivo y convertirte en un 
                aliado indispensable para tus clientes.
              </p>

              {/* Feature Pills */}
              <div className="grid grid-cols-2 gap-3 max-w-md">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-3 rounded-lg bg-white/80 border border-border shadow-sm"
                  >
                    <div className="p-1.5 rounded-md bg-accent/10">
                      <feature.icon className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Login Card */}
            <div className="flex items-center justify-center order-2 lg:order-2 animate-scale-in">
              <div className="w-full max-w-md">
                <div className="lovirtual-card p-8 bg-white/90 backdrop-blur-sm">
                  {/* Card Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl lovirtual-gradient-bg mb-4 shadow-lg">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Acceso al Curso</h2>
                    <p className="text-muted-foreground">Ingresa tu código para continuar</p>
                  </div>

                  {/* Login Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <label className="text-sm font-medium text-foreground">
                          Código de Acceso
                        </label>
                      </div>
                      <Input
                        type="text"
                        placeholder="Ej: LV-XXXXXXXX"
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                        className="h-12 text-center font-mono text-lg tracking-wider uppercase bg-white"
                        autoFocus
                        disabled={isLoading}
                      />
                    </div>

                    {error && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-center">
                        <p className="text-sm text-destructive font-medium">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 lovirtual-gradient-bg text-white font-semibold text-base hover:opacity-90 transition-opacity"
                      disabled={!accessCode.trim() || isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verificando...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Entrar
                          <ArrowRight className="w-5 h-5" />
                        </span>
                      )}
                    </Button>
                  </form>

                  {/* Help Text */}
                  <p className="text-center text-xs text-muted-foreground mt-6">
                    ¿No tienes código? Contacta al administrador del curso.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fixed Footer */}
      <footer className="py-4 border-t border-border/50 bg-white/50">
        <p className="text-sm text-muted-foreground text-center">
          2026 Academia LoVirtual. Todos los derechos reservados. Aprendiendo con Inteligencia Artificial.
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
