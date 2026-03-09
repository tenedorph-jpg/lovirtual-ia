import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Sparkles, ArrowLeft } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import LearningPathCards from '@/components/level2/LearningPathCards';
import StudentProgressPanel from '@/components/level2/StudentProgressPanel';
import Level2Accordion from '@/components/level2/Level2Accordion';
import { learningPath, level2Modules, studentInfo } from '@/data/level2Data';

const Level2Page: React.FC = () => {
  const { currentStudent, logout } = useAuth();
  const navigate = useNavigate();
  const [completedModules, setCompletedModules] = useState<number[]>([]);

  if (!currentStudent) {
    navigate('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleModuleComplete = (moduleId: number) => {
    setCompletedModules((prev) =>
      prev.includes(moduleId) ? prev : [...prev, moduleId]
    );
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
        {/* Student Progress Panel */}
        <StudentProgressPanel
          name={currentStudent.name}
          globalLevel={studentInfo.globalLevel}
          totalLevels={learningPath.length}
          progressPercentage={studentInfo.progressPercentage}
          badges={studentInfo.badges}
        />

        {/* Learning Path */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">Ruta de Aprendizaje</h3>
          <LearningPathCards levels={learningPath} onContinue={() => {}} />
        </div>

        {/* Level 2 Modules */}
        <div>
          <h3 className="text-xl font-bold text-foreground mb-4">
            Nivel 2: Implementación y Automatización
          </h3>
          <Level2Accordion modules={level2Modules} completedModules={[]} />
        </div>
      </main>
    </div>
  );
};

export default Level2Page;
