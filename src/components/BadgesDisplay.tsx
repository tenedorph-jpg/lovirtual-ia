import React, { useState } from 'react';
import { Badge as BadgeType, badges, getEarnedBadges, getBadgesByCategory, StudentProgress } from '@/data/badges';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Award, Lock } from 'lucide-react';

interface BadgesDisplayProps {
  student: StudentProgress;
  compact?: boolean;
}

const BadgeItem: React.FC<{ badge: BadgeType; earned: boolean; showDetails?: boolean }> = ({ 
  badge, 
  earned, 
  showDetails = false 
}) => {
  return (
    <div
      className={`relative flex flex-col items-center p-3 rounded-xl transition-all ${
        earned
          ? 'bg-gradient-to-br from-warning/10 to-warning/5 border-2 border-warning/30'
          : 'bg-muted/30 border-2 border-dashed border-muted-foreground/20 opacity-50'
      }`}
    >
      <div className={`text-3xl mb-2 ${!earned && 'grayscale'}`}>
        {earned ? badge.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
      </div>
      <p className={`text-xs font-semibold text-center ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
        {badge.name}
      </p>
      {showDetails && (
        <p className="text-xs text-muted-foreground text-center mt-1">
          {badge.description}
        </p>
      )}
      {earned && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  );
};

const BadgesDisplay: React.FC<BadgesDisplayProps> = ({ student, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const earnedBadges = getEarnedBadges(student);
  const categorizedBadges = getBadgesByCategory(earnedBadges);
  const earnedIds = new Set(earnedBadges.map(b => b.id));

  if (compact) {
    // Compact view for dashboard
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className="stat-card w-full text-left hover:border-warning/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning/10">
                <Award className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Insignias</p>
                <p className="text-2xl font-bold text-foreground">
                  {earnedBadges.length}/{badges.length}
                </p>
              </div>
              <div className="flex -space-x-2">
                {earnedBadges.slice(0, 4).map(badge => (
                  <span
                    key={badge.id}
                    className="w-8 h-8 rounded-full bg-warning/10 border-2 border-card flex items-center justify-center text-lg"
                  >
                    {badge.icon}
                  </span>
                ))}
                {earnedBadges.length > 4 && (
                  <span className="w-8 h-8 rounded-full bg-muted border-2 border-card flex items-center justify-center text-xs font-bold text-muted-foreground">
                    +{earnedBadges.length - 4}
                  </span>
                )}
              </div>
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-warning" />
              Mis Insignias ({earnedBadges.length}/{badges.length})
            </DialogTitle>
          </DialogHeader>
          <BadgesGrid earnedIds={earnedIds} />
        </DialogContent>
      </Dialog>
    );
  }

  return <BadgesGrid earnedIds={earnedIds} />;
};

const BadgesGrid: React.FC<{ earnedIds: Set<string> }> = ({ earnedIds }) => {
  const progressBadges = badges.filter(b => b.category === 'progress');
  const excellenceBadges = badges.filter(b => b.category === 'excellence');
  const specialBadges = badges.filter(b => b.category === 'special');

  return (
    <div className="space-y-6 pt-4">
      {/* Progress Badges */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <span className="text-lg">🚀</span> Progreso
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {progressBadges.map(badge => (
            <BadgeItem
              key={badge.id}
              badge={badge}
              earned={earnedIds.has(badge.id)}
              showDetails
            />
          ))}
        </div>
      </div>

      {/* Excellence Badges */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <span className="text-lg">🏆</span> Excelencia
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {excellenceBadges.map(badge => (
            <BadgeItem
              key={badge.id}
              badge={badge}
              earned={earnedIds.has(badge.id)}
              showDetails
            />
          ))}
        </div>
      </div>

      {/* Special Badges */}
      <div>
        <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          <span className="text-lg">✨</span> Especiales
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {specialBadges.map(badge => (
            <BadgeItem
              key={badge.id}
              badge={badge}
              earned={earnedIds.has(badge.id)}
              showDetails
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BadgesDisplay;
