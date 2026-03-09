import React from 'react';
import { LearningPathLevel } from '@/data/level2Data';
import { CheckCircle, Lock, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  levels: LearningPathLevel[];
  onContinue: (level: number) => void;
}

const LearningPathCards: React.FC<Props> = ({ levels, onContinue }) => {
  return (
    <div className="relative">
      {/* Connecting line */}
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-border -translate-y-1/2 hidden lg:block" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {levels.map((lvl) => {
          const isCompleted = lvl.status === 'completed';
          const isUnlocked = lvl.status === 'unlocked';
          const isLocked = lvl.status === 'locked';

          return (
            <div
              key={lvl.level}
              className={`relative rounded-xl border p-5 transition-all flex flex-col items-center text-center gap-3 ${
                isCompleted
                  ? 'bg-success/10 border-success/30'
                  : isUnlocked
                  ? 'bg-primary/10 border-primary/40 shadow-lg ring-2 ring-primary/20'
                  : 'bg-muted/30 border-border opacity-60'
              }`}
            >
              {/* Icon */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-success/20'
                    : isUnlocked
                    ? 'lovirtual-gradient-bg'
                    : 'bg-muted'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-success" />
                ) : isUnlocked ? (
                  <Play className="w-6 h-6 text-white" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nivel {lvl.level}
              </span>
              <h4 className="text-sm font-bold text-foreground leading-tight">{lvl.title}</h4>

              {isCompleted && (
                <span className="text-xs font-medium text-success">100% Completado</span>
              )}
              {isUnlocked && (
                <Button
                  size="sm"
                  className="lovirtual-gradient-bg text-white mt-1"
                  onClick={() => onContinue(lvl.level)}
                >
                  Continuar
                </Button>
              )}
              {isLocked && (
                <span className="text-xs text-muted-foreground">Bloqueado</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LearningPathCards;
