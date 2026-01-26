export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (student: StudentProgress) => boolean;
  category: 'progress' | 'excellence' | 'special';
}

export interface StudentProgress {
  completedModules: number[];
  quizScores: Record<number, number>;
  averageScore: number;
  progress: number;
  certificateGenerated: boolean;
  finalExamScore?: number;
}

export const badges: Badge[] = [
  // Progress Badges
  {
    id: 'first_step',
    name: 'Primer Paso',
    description: 'Completa tu primer módulo',
    icon: '🚀',
    category: 'progress',
    requirement: (s) => s.completedModules.length >= 1,
  },
  {
    id: 'halfway',
    name: 'A Medio Camino',
    description: 'Completa 5 módulos',
    icon: '⭐',
    category: 'progress',
    requirement: (s) => s.completedModules.length >= 5,
  },
  {
    id: 'course_master',
    name: 'Maestro del Curso',
    description: 'Completa los 10 módulos',
    icon: '👑',
    category: 'progress',
    requirement: (s) => s.completedModules.length >= 10,
  },
  {
    id: 'quick_learner',
    name: 'Aprendiz Veloz',
    description: 'Completa 3 módulos consecutivos',
    icon: '⚡',
    category: 'progress',
    requirement: (s) => s.completedModules.length >= 3,
  },

  // Excellence Badges
  {
    id: 'perfect_score',
    name: 'Puntuación Perfecta',
    description: 'Obtén 100% en cualquier quiz',
    icon: '💯',
    category: 'excellence',
    requirement: (s) => Object.values(s.quizScores).some(score => score === 100),
  },
  {
    id: 'consistent',
    name: 'Consistente',
    description: 'Mantén un promedio de 80% o más',
    icon: '📈',
    category: 'excellence',
    requirement: (s) => s.averageScore >= 80 && s.completedModules.length >= 3,
  },
  {
    id: 'excellence',
    name: 'Excelencia',
    description: 'Promedio de 90% o más en al menos 5 módulos',
    icon: '🏆',
    category: 'excellence',
    requirement: (s) => s.averageScore >= 90 && s.completedModules.length >= 5,
  },
  {
    id: 'all_star',
    name: 'All-Star',
    description: 'Obtén 80% o más en todos los quizzes',
    icon: '🌟',
    category: 'excellence',
    requirement: (s) => {
      const scores = Object.values(s.quizScores);
      return scores.length >= 5 && scores.every(score => score >= 80);
    },
  },

  // Special Badges
  {
    id: 'prompt_master',
    name: 'Maestro del Prompt',
    description: 'Obtén 90%+ en el Módulo 1 (El Arte del Prompt)',
    icon: '✨',
    category: 'special',
    requirement: (s) => (s.quizScores[1] || 0) >= 90,
  },
  {
    id: 'ai_explorer',
    name: 'Explorador de IA',
    description: 'Completa los módulos de ChatGPT, Gemini y Perplexity',
    icon: '🔍',
    category: 'special',
    requirement: (s) => [2, 7].every(id => s.completedModules.includes(id)),
  },
  {
    id: 'creator',
    name: 'Creador Digital',
    description: 'Completa los módulos de Designer y Gamma',
    icon: '🎨',
    category: 'special',
    requirement: (s) => [3, 4].every(id => s.completedModules.includes(id)),
  },
  {
    id: 'coder',
    name: 'Programador Natural',
    description: 'Completa los módulos de Apps Script y Lovable',
    icon: '💻',
    category: 'special',
    requirement: (s) => [8, 9, 10].every(id => s.completedModules.includes(id)),
  },
  {
    id: 'certified',
    name: 'Certificado',
    description: 'Obtén tu certificado oficial',
    icon: '🎓',
    category: 'special',
    requirement: (s) => s.certificateGenerated,
  },
  {
    id: 'final_excellence',
    name: 'Examen Sobresaliente',
    description: 'Obtén 90% o más en el examen final',
    icon: '🏅',
    category: 'special',
    requirement: (s) => (s.finalExamScore || 0) >= 90,
  },
];

export const getEarnedBadges = (student: StudentProgress): Badge[] => {
  return badges.filter(badge => badge.requirement(student));
};

export const getBadgesByCategory = (earnedBadges: Badge[]) => {
  return {
    progress: earnedBadges.filter(b => b.category === 'progress'),
    excellence: earnedBadges.filter(b => b.category === 'excellence'),
    special: earnedBadges.filter(b => b.category === 'special'),
  };
};
