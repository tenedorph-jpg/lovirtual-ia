import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PROFILE_LABELS } from '@/data/mockAdminData';

const COLORS = [
  "#0ea5e9", "#0284c7", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899",
];

// Level 1 uses module IDs 1-10, Level 2 uses 101-110
const LEVEL_MODULE_RANGES: Record<string, { min: number; max: number; total: number }> = {
  nivel1: { min: 1, max: 10, total: 10 },
  nivel2: { min: 101, max: 110, total: 10 },
  nivel3: { min: 201, max: 210, total: 10 },
};

export interface RealStudent {
  id: string;
  nombre: string;
  perfil: string;
  progreso: number;
  puntuacion: string;
  actividad: string;
  certificado: string;
}

export interface RealCourseData {
  kpis: { inscritos: number; finalizados: number; tasa: string; pendientes: number };
  distribucion: { perfil: string; cantidad: number; fill: string }[];
  tiempoPromedio: { perfil: string; horas: number }[];
  puntuacionPromedio: { perfil: string; puntuacion: number }[];
  errores: { perfil: string; tasa: string }[];
  estudiantes: RealStudent[];
  loading: boolean;
}

export function useAdminStudents(level: string = 'nivel1') {
  const [allData, setAllData] = useState<{
    profiles: any[];
    progress: any[];
    adminIds: Set<string>;
  }>({ profiles: [], progress: [], adminIds: new Set() });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profilesRes, progressRes, rolesRes] = await Promise.all([
          supabase.from('profiles').select('*'),
          supabase.from('student_progress').select('*'),
          supabase.from('user_roles').select('user_id').eq('role', 'admin'),
        ]);

        if (profilesRes.error) throw profilesRes.error;
        if (progressRes.error) throw progressRes.error;

        const adminIds = new Set((rolesRes.data || []).map(r => r.user_id));

        setAllData({
          profiles: profilesRes.data || [],
          progress: progressRes.data || [],
          adminIds,
        });
      } catch (err) {
        console.error('Error fetching admin students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const computed = useMemo(() => {
    const { profiles, progress, adminIds } = allData;
    const range = LEVEL_MODULE_RANGES[level] || LEVEL_MODULE_RANGES.nivel1;

    const progressMap = new Map(progress.map(p => [p.user_id, p]));

    // Build student list filtered by level
    const students: RealStudent[] = [];

    for (const p of profiles) {
      if (adminIds.has(p.user_id)) continue;

      const sp = progressMap.get(p.user_id);
      if (!sp) continue;

      const completedModules: number[] = sp.completed_modules || [];
      const levelModules = completedModules.filter(
        (m: number) => m >= range.min && m <= range.max
      );

      // Student belongs to this level if they have at least one completed module in range
      if (levelModules.length === 0) continue;

      // Calculate level-specific progress
      const levelProgress = Math.round((levelModules.length / range.total) * 100);

      // Calculate level-specific score from quiz_scores
      const quizScores = sp.quiz_scores || {};
      const levelScoreEntries = Object.entries(quizScores).filter(([key]) => {
        const moduleId = parseInt(key);
        return moduleId >= range.min && moduleId <= range.max;
      });
      const avgScore = levelScoreEntries.length > 0
        ? Math.round(levelScoreEntries.reduce((sum, [, val]) => sum + (typeof val === 'number' ? val : 0), 0) / levelScoreEntries.length)
        : 0;

      const isComplete = levelModules.length >= range.total;
      const updatedAt = sp.updated_at || p.updated_at;

      students.push({
        id: p.id,
        nombre: p.full_name || p.email,
        perfil: p.lovirtual_role,
        progreso: levelProgress,
        puntuacion: avgScore > 0 ? `${avgScore}%` : '-%',
        actividad: updatedAt ? new Date(updatedAt).toLocaleDateString('es-ES') : '-',
        certificado: isComplete ? 'Generado' : 'Pendiente',
      });
    }

    // KPIs
    const total = students.length;
    const finalizados = students.filter(s => s.certificado === 'Generado').length;
    const pendientes = total - finalizados;
    const tasa = total > 0 ? `${Math.round((finalizados / total) * 100)}%` : '0%';

    // Distribution by profile
    const profileCounts: Record<string, number> = {};
    students.forEach(s => {
      const label = PROFILE_LABELS[s.perfil] || s.perfil;
      profileCounts[label] = (profileCounts[label] || 0) + 1;
    });

    const distribucion = Object.entries(profileCounts).map(([perfil, cantidad], i) => ({
      perfil,
      cantidad,
      fill: COLORS[i % COLORS.length],
    }));

    return {
      kpis: { inscritos: total, finalizados, tasa, pendientes },
      distribucion,
      estudiantes: students,
      loading,
    };
  }, [allData, level, loading]);

  return computed;
}
