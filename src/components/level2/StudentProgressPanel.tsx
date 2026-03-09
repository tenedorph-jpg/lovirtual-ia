import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Award, User } from 'lucide-react';

interface Props {
  name: string;
  globalLevel: number;
  totalLevels: number;
  progressPercentage: number;
  badges: string[];
}

const StudentProgressPanel: React.FC<Props> = ({
  name,
  globalLevel,
  totalLevels,
  progressPercentage,
  badges,
}) => {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col md:flex-row items-center gap-5">
      {/* Avatar */}
      <div className="w-14 h-14 rounded-full lovirtual-gradient-bg flex items-center justify-center flex-shrink-0">
        <User className="w-7 h-7 text-white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 text-center md:text-left">
        <h2 className="text-lg font-bold text-foreground truncate">{name}</h2>
        <p className="text-sm text-muted-foreground">
          Nivel Actual: <span className="font-semibold text-primary">{globalLevel}</span> de {totalLevels}
        </p>
        <Progress value={progressPercentage} className="mt-2 h-2.5" />
        <p className="text-xs text-muted-foreground mt-1">{progressPercentage}% del programa completado</p>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center md:justify-end flex-shrink-0">
          {badges.map((badge) => (
            <span
              key={badge}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 text-warning text-xs font-semibold"
            >
              <Award className="w-3.5 h-3.5" />
              {badge}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentProgressPanel;
