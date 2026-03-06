import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, ArrowRight, Sparkles, Brain, Zap, Target, TrendingUp, Mail } from 'lucide-react';
import ForgotPasswordDialog from '@/components/ForgotPasswordDialog';
import ThemeToggle from '@/components/ThemeToggle';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await signIn(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const features = [
    { icon: Brain, text: 'Automatiza tareas con IA' },
    { icon: Zap, text: 'Crea contenido de alto impacto' },
    { icon: Target, text: 'Analiza datos estratégicamente' },
    { icon: TrendingUp, text: 'Destaca en el mercado' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted to-[hsl(200,100%,97%)]">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <main className="flex-1 flex items-center">
        <div className="container mx-auto px-4 py-8 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left Column */}
            <div className="text-left order-1 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary">Academia LoVirtual</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary leading-tight mb-6">
                Especialización en{' '}
                <span className="lovirtual-gradient-text">Inteligencia Artificial</span>
              </h1>
              <p className="text-lg md:text-xl text-secondary leading-relaxed mb-8 max-w-xl">
                Transforma tu carrera como Asistente Virtual con el poder de la IA. 
                Aprende a automatizar tareas, crear contenido de alto impacto, 
                analizar datos y tomar decisiones estratégicas. Domina herramientas 
                clave para destacar en un mercado competitivo y convertirte en un 
                aliado indispensable para tus clientes.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-card/80 border border-border shadow-sm">
                    <div className="p-1.5 rounded-md bg-accent/10">
                      <feature.icon className="w-4 h-4 text-accent" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Login Card */}
            <div className="flex items-center justify-center order-2 animate-scale-in">
              <div className="w-full max-w-md">
                <div className="lovirtual-card p-8 bg-card/90 backdrop-blur-sm">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl lovirtual-gradient-bg mb-4 shadow-lg">
                      <Sparkles className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Acceso al Curso</h2>
                    <p className="text-muted-foreground">Ingresa tus credenciales para continuar</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <label className="text-sm font-medium text-foreground">Email</label>
                      </div>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 bg-card"
                        autoFocus
                        disabled={isLoading}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <label className="text-sm font-medium text-foreground">Contraseña</label>
                      </div>
                      <Input
                        type="password"
                        placeholder="Tu contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 bg-card"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="flex justify-end">
                      <ForgotPasswordDialog />
                    </div>

                    {error && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-center">
                        <p className="text-sm text-destructive font-medium">{error}</p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-12 lovirtual-gradient-bg text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
                      disabled={!email.trim() || !password.trim() || isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
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

                  <p className="text-center text-sm text-muted-foreground mt-6">
                    ¿No tienes cuenta?{' '}
                    <Link to="/signup" className="text-primary font-semibold hover:underline">
                      Regístrate aquí
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 border-t border-border/50 bg-card/50">
        <p className="text-sm text-muted-foreground text-center">
          2026 Academia LoVirtual. Todos los derechos reservados. Aprendiendo con Inteligencia Artificial.
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;
