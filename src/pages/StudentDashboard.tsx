import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { courseModules } from '@/data/courseModules';
import BadgesDisplay from '@/components/BadgesDisplay';
import {
  LogOut,
  Sparkles,
  BookOpen,
  Trophy,
  Clock,
  Lock,
  Award,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import CourseAccordion from '@/components/CourseAccordion';

const StudentDashboard: React.FC = () => {
  const { currentStudent, logout } = useAuth();
  const navigate = useNavigate();

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

        {/* Modules Grid */}
        <h3 className="text-xl font-bold text-foreground mb-4">Contenido del Curso</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {courseModules.map((module) => {
            const status = getModuleStatus(module.id);
            const score = currentStudent.quizScores[module.id];

            return (
              <div
                key={module.id}
                className={`module-card ${status === 'locked' ? 'opacity-60' : ''}`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{module.icon}</span>
                    {status === 'completed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        {score}%
                      </span>
                    )}
                    {status === 'locked' && (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Módulo {module.id}: {module.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">{module.subtitle}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {module.duration}
                    </span>
                    <Button
                      size="sm"
                      variant={status === 'completed' ? 'outline' : 'default'}
                      disabled={status === 'locked'}
                      onClick={() => navigate(`/module/${module.id}`)}
                      className={status !== 'locked' ? 'gap-1' : ''}
                    >
                      {status === 'locked' ? (
                        'Bloqueado'
                      ) : status === 'completed' ? (
                        'Revisar'
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          Comenzar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Final Exam Section */}
        <div className="lovirtual-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-warning/10">
                <Trophy className="w-8 h-8 text-warning" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Examen Final y Certificación</h3>
                <p className="text-muted-foreground">
                  Completa los 10 módulos para desbloquear el examen final
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
      </main>
    </div>
  );
};

export default StudentDashboard;
