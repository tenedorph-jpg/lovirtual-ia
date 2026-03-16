import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { courseModules } from '@/data/courseModules';
import { generateCertificatePDF } from '@/lib/generateCertificate';
import { toast } from '@/hooks/use-toast';
import BadgesDisplay from '@/components/BadgesDisplay';
import {
  LogOut,
  Sparkles,
  BookOpen,
  Clock,
  ChevronDown,
  Trophy,
  Lock,
  Award,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import CourseAccordion from '@/components/CourseAccordion';

const StudentDashboard: React.FC = () => {
  const { currentStudent, logout, user, studentProgress, markCertificateGenerated } = useAuth();
  const navigate = useNavigate();

  const [level1Open, setLevel1Open] = useState(false);
  const [level2Open, setLevel2Open] = useState(false);
  const [level3Open, setLevel3Open] = useState(false);
  const [level3CertReady, setLevel3CertReady] = useState<{ totalScore: number } | null>(null);

  // Check if Level 3 certificate is available
  const checkLevel3Cert = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('assignments')
      .select('module_id, grade, status')
      .eq('user_id', user.id)
      .gte('module_id', 201)
      .lte('module_id', 210)
      .eq('status', 'graded');
    if (data && data.length === 10) {
      const allPassed = data.every(a => (a.grade || 0) >= 7);
      if (allPassed) {
        const totalScore = data.reduce((s, a) => s + (a.grade || 0), 0);
        setLevel3CertReady({ totalScore });
      }
    }
  }, [user]);

  useEffect(() => { checkLevel3Cert(); }, [checkLevel3Cert]);

  if (!currentStudent) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const completedModules = currentStudent.completedModules.length;
  const totalModules = courseModules.length;
  const allModulesCompleted = completedModules === totalModules;

  // Level unlock logic
  const level1Completed = currentStudent.completedModules.filter(id => id >= 1 && id <= 10).length >= 10 && (currentStudent.finalExamScore ?? 0) >= 70;
  const level2Completed = currentStudent.completedModules.filter(id => id >= 101 && id <= 110).length >= 10;
  const level2Unlocked = level1Completed;
  const level3Unlocked = level2Completed;

  const getModuleStatus = (moduleId: number): 'completed' | 'available' | 'locked' => {
    if (currentStudent.completedModules.includes(moduleId)) {
      return 'completed';
    }
    // First module is always available, others need previous to be completed
    if (moduleId === 1 || currentStudent.completedModules.includes(moduleId - 1)) {
      return 'available';
    }
    return 'locked';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg lovirtual-gradient-bg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">LoVirtual Academy</h1>
              <p className="text-sm text-muted-foreground">Bienvenido/a, {currentStudent.name}</p>
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

      <main className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="lovirtual-card mb-8 lovirtual-gradient-bg text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Inteligencia Artificial y Herramientas Digitales
              </h2>
              <p className="opacity-90">De Usuario a Creador</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold">{currentStudent.progress}%</p>
                <p className="text-sm opacity-80">Progreso</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold">{currentStudent.averageScore || '-'}</p>
                <p className="text-sm opacity-80">Promedio</p>
              </div>
            </div>
          </div>
          <Progress
            value={currentStudent.progress}
            className="mt-4 h-3 bg-white/20"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Módulos Completados</p>
                <p className="text-2xl font-bold text-foreground">{completedModules}/{totalModules}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10">
                <Trophy className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Puntuación Promedio</p>
                <p className="text-2xl font-bold text-foreground">{currentStudent.averageScore || 0}%</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-accent/10">
                <Clock className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Estudiado</p>
                <p className="text-2xl font-bold text-foreground">{currentStudent.timeSpentMinutes} min</p>
              </div>
            </div>
          </div>

          {/* Badges Card - Interactive */}
          <BadgesDisplay
            student={{
              completedModules: currentStudent.completedModules,
              quizScores: currentStudent.quizScores,
              averageScore: currentStudent.averageScore,
              progress: currentStudent.progress,
              certificateGenerated: currentStudent.certificateGenerated,
              finalExamScore: currentStudent.finalExamScore,
            }}
            compact
          />
        </div>

        {/* Nivel 1 — collapsible */}
        <div className="mb-4">
          <button
            onClick={() => setLevel1Open(o => !o)}
            className="w-full flex items-center justify-between bg-card border border-border rounded-xl px-5 py-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-full lovirtual-gradient-bg flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                N1
              </div>
              <div>
                <h3 className="font-bold text-foreground">Nivel 1: Fundamentos de IA</h3>
                <p className="text-sm text-muted-foreground">{completedModules}/{totalModules} módulos completados</p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${level1Open ? 'rotate-180' : ''}`} />
          </button>
          {level1Open && (
            <div className="mt-3 space-y-4">
              <CourseAccordion
                completedModules={currentStudent.completedModules}
                quizScores={currentStudent.quizScores}
              />
              {/* Final Exam & Certificate CTA for Level 1 */}
              <div className="lovirtual-card">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-4 rounded-xl bg-warning/10">
                      <Trophy className="w-8 h-8 text-warning" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Examen Final y Certificación — Nivel 1</h3>
                      <p className="text-muted-foreground">
                        Completa los {totalModules} módulos para desbloquear el examen final
                      </p>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    disabled={!allModulesCompleted}
                    onClick={() => navigate('/final-exam')}
                    className={allModulesCompleted ? 'lovirtual-gradient-bg text-white animate-pulse-glow' : ''}
                  >
                    {allModulesCompleted ? (
                      currentStudent.certificateGenerated ? (
                        <>
                          <Award className="w-5 h-5 mr-2" />
                          Ver Certificado
                        </>
                      ) : (
                        <>
                          <Trophy className="w-5 h-5 mr-2" />
                          Tomar Examen Final
                        </>
                      )
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        {completedModules}/{totalModules} Módulos
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nivel 2 — collapsible */}
        <div className="mb-4">
          <button
            onClick={() => level2Unlocked && setLevel2Open(o => !o)}
            className={`w-full flex items-center justify-between bg-card border border-border rounded-xl px-5 py-4 transition-colors ${level2Unlocked ? 'hover:border-primary/50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
          >
            <div className="flex items-center gap-4 text-left">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${level2Unlocked ? 'lovirtual-gradient-bg text-white' : 'bg-muted text-muted-foreground'}`}>
                {level2Unlocked ? 'N2' : <Lock className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="font-bold text-foreground">Nivel 2: Implementación y Automatización</h3>
                <p className="text-sm text-muted-foreground">
                  {level2Unlocked ? 'Continúa tu ruta de aprendizaje con módulos avanzados' : 'Completa el Nivel 1 y aprueba su examen final para desbloquear'}
                </p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${level2Open ? 'rotate-180' : ''}`} />
          </button>
          {level2Open && level2Unlocked && (
            <div className="mt-3 lovirtual-card flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm">Accede a los módulos avanzados de Nivel 2 y continúa tu formación en IA.</p>
              <Button onClick={() => navigate('/level-2')} className="lovirtual-gradient-bg text-white gap-2 flex-shrink-0">
                <Sparkles className="w-4 h-4" />
                Ver Ruta de Aprendizaje
              </Button>
            </div>
          )}
        </div>

        {/* Nivel 3 — collapsible */}
        <div className="mb-8">
          <button
            onClick={() => level3Unlocked && setLevel3Open(o => !o)}
            className={`w-full flex items-center justify-between bg-card border border-border rounded-xl px-5 py-4 transition-colors ${level3Unlocked ? 'hover:border-primary/50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
          >
            <div className="flex items-center gap-4 text-left">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${level3Unlocked ? 'lovirtual-gradient-bg text-white' : 'bg-muted text-muted-foreground'}`}>
                {level3Unlocked ? 'N3' : <Lock className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="font-bold text-foreground">Nivel 3: Dominio Práctico y Entregables con IA</h3>
                <p className="text-sm text-muted-foreground">
                  {level3Unlocked ? '100% práctico — sube tus entregables para cada módulo' : 'Completa los 10 módulos del Nivel 2 para desbloquear'}
                </p>
              </div>
            </div>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${level3Open ? 'rotate-180' : ''}`} />
          </button>
          {level3Open && level3Unlocked && (
            <div className="mt-3 space-y-3">
              <div className="lovirtual-card flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="text-muted-foreground text-sm">Sube tus proyectos prácticos y demuestra tu dominio de herramientas de IA.</p>
                <Button onClick={() => navigate('/level-3')} className="lovirtual-gradient-bg text-white gap-2 flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                  Ver Entregables
                </Button>
              </div>
              {level3CertReady && (
                <div className="lovirtual-card border-2 border-success/40 bg-success/5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-4 rounded-xl bg-success/10">
                        <Award className="w-8 h-8 text-success" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">🎓 Certificado Nivel 3 Disponible</h3>
                        <p className="text-muted-foreground">
                          Calificación Final: <span className="font-bold text-success">{level3CertReady.totalScore}/100</span>
                        </p>
                      </div>
                    </div>
                    <Button
                      size="lg"
                      className="lovirtual-gradient-bg text-white gap-2"
                      onClick={async () => {
                        const name = currentStudent?.name || 'Estudiante';
                        await generateCertificatePDF(name, level3CertReady.totalScore, 'level3');
                        await markCertificateGenerated();
                        toast({ title: '📄 Certificado generado', description: 'El PDF se ha descargado.' });
                      }}
                    >
                      <Award className="w-5 h-5" />
                      Descargar Certificado
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
