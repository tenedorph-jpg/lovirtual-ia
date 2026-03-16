import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Sparkles, ArrowLeft, FolderUp } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import Level3Accordion from '@/components/level3/Level3Accordion';
import { level3Modules } from '@/data/level3Data';

const Level3Page: React.FC = () => {
  const { currentStudent, logout, studentProgress } = useAuth();
  const navigate = useNavigate();

  if (!currentStudent) {
    navigate('/dashboard');
    return null;
  }

  const completedModules = studentProgress?.completed_modules ?? [];
  const level3Ids = new Set(level3Modules.map(m => m.id));
  const completedLevel3 = completedModules.filter(id => level3Ids.has(id)).length;
  const progressPct = Math.round((completedLevel3 / level3Modules.length) * 100);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg lovirtual-gradient-bg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">LoVirtual Academy</h1>
              <p className="text-sm text-muted-foreground">Nivel 3 — Dominio Práctico</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 gap-2 text-muted-foreground">
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </Button>

        <div className="lovirtual-card mb-8 lovirtual-gradient-bg text-white">
          <div className="flex items-center gap-4 mb-3">
            <FolderUp className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Nivel 3: Dominio Práctico y Creación de Entregables con IA</h2>
              <p className="opacity-90 mt-1">100% práctico — sube tus entregables para cada módulo</p>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex-1 bg-white/20 rounded-full h-3">
              <div className="bg-white rounded-full h-3 transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="font-bold text-lg">{completedLevel3}/{level3Modules.length}</span>
          </div>
        </div>

        <Level3Accordion />
      </main>
    </div>
  );
};

export default Level3Page;
