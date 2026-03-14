import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Sparkles, ArrowLeft, Trophy, Lock, Award } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LearningPathCards from '@/components/level2/LearningPathCards';
import StudentProgressPanel from '@/components/level2/StudentProgressPanel';
import Level2Accordion from '@/components/level2/Level2Accordion';
import { learningPath, level2Modules } from '@/data/level2Data';

const Level2Page: React.FC = () => {
  const { currentStudent, logout, studentProgress, completeModule, updateStudentProgress } = useAuth();
  const navigate = useNavigate();

  if (!currentStudent) {
    navigate('/dashboard');
    return null;
  }

  const completedModules = studentProgress?.completed_modules ?? [];
  const totalLevel2Modules = level2Modules.length;
  const level2ModuleIds = new Set(level2Modules.map(m => m.id));
  const completedLevel2Count = completedModules.filter(id => level2ModuleIds.has(id)).length;
  const level2ProgressPercentage = Math.round((completedLevel2Count / totalLevel2Modules) * 100);
  const allLevel2Completed = completedLevel2Count === totalLevel2Modules;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleModuleComplete = async (moduleId: number, score?: number) => {
    try {
      await completeModule(moduleId);
      if (score !== undefined) {
        await updateStudentProgress(moduleId, score);
      }
    } catch (error) {
      console.error('Error completing module:', error);
    }
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
              <p className="text-sm text-muted-foreground">Ruta de Aprendizaje</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Button>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <StudentProgressPanel
          name={currentStudent.name}
          globalLevel={2}
          totalLevels={learningPath.length}
          progressPercentage={level2ProgressPercentage}
          badges={completedModules.length > 0 ? ["Nivel 1 Completado"] : []}
        />

        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">Ruta de Aprendizaje</h3>
          <LearningPathCards levels={learningPath} onContinue={() => {}} />
        </div>

        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">
            Nivel 2: Implementación y Automatización
          </h3>
          <Level2Accordion
            modules={level2Modules}
            completedModules={completedModules}
            onModuleComplete={handleModuleComplete}
          />
        </div>

        {/* Final Exam & Certificate CTA */}
        <div className="lovirtual-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-warning/10">
                <Trophy className="w-8 h-8 text-warning" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Examen Final y Certificación — Nivel 2</h3>
                <p className="text-muted-foreground">
                  Completa los {totalLevel2Modules} módulos para desbloquear el examen final
                </p>
              </div>
            </div>
            <Button
              size="lg"
              disabled={!allLevel2Completed}
              onClick={() => navigate('/level-2/final-exam')}
              className={allLevel2Completed ? 'lovirtual-gradient-bg text-white animate-pulse-glow' : ''}
            >
              {allLevel2Completed ? (
                currentStudent?.certificateGenerated ? (
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
                  {completedLevel2Count}/{totalLevel2Modules} Módulos
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Level2Page;
