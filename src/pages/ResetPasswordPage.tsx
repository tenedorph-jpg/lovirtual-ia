import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Sparkles, Check } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    }
  };

  if (!isRecovery) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-[hsl(200,100%,97%)]">
        <div className="text-center p-8">
          <p className="text-muted-foreground">Enlace inválido o expirado.</p>
          <Button variant="link" onClick={() => navigate('/')} className="text-primary mt-4">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-[hsl(200,100%,97%)]">
      <div className="w-full max-w-md p-8 lovirtual-card bg-card/90 backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl lovirtual-gradient-bg mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Nueva Contraseña</h2>
          <p className="text-muted-foreground">Ingresa tu nueva contraseña</p>
        </div>

        {success ? (
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-foreground font-medium">¡Contraseña actualizada!</p>
            <p className="text-sm text-muted-foreground">Redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">Nueva contraseña</label>
              </div>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-card"
                disabled={isLoading}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <label className="text-sm font-medium text-foreground">Confirmar contraseña</label>
              </div>
              <Input
                type="password"
                placeholder="Repite la contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 bg-card"
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
              className="w-full h-12 lovirtual-gradient-bg text-primary-foreground font-semibold"
              disabled={!password || !confirmPassword || isLoading}
            >
              {isLoading ? 'Actualizando...' : 'Actualizar contraseña'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
