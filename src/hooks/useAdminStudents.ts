import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PROFILE_LABELS } from '@/data/mockAdminData';

const COLORS = [
  "#0ea5e9", "#0284c7", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899",
];

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
  estudiantes: RealStudent[];
  loading: boolean;
}

export function useAdminStudents() {
  const [students, setStudents] = useState<RealStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch profiles (excluding admins from user_roles)
        const { data: profiles, error: pErr } = await supabase
          .from('profiles')
          .select('*');

        if (pErr) throw pErr;

        // Fetch all student progress
        const { data: progress, error: sErr } = await supabase
          .from('student_progress')
          .select('*');

        if (sErr) throw sErr;

        // Fetch admin user_ids to exclude them from student list
        const { data: adminRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'admin');

        const adminIds = new Set((adminRoles || []).map(r => r.user_id));

        // Build progress map
        const progressMap = new Map(
          (progress || []).map(p => [p.user_id, p])
        );

        // Merge profiles with progress, excluding admins
        const merged: RealStudent[] = (profiles || [])
          .filter(p => !adminIds.has(p.user_id))
          .map(p => {
            const sp = progressMap.get(p.user_id);
            const prog = sp?.progress ?? 0;
            const score = sp?.average_score ?? 0;
            const certGen = sp?.certificate_generated ?? false;
            const updatedAt = sp?.updated_at || p.updated_at;

            return {
              id: p.id,
              nombre: p.full_name || p.email,
              perfil: p.lovirtual_role,
              progreso: prog,
              puntuacion: score > 0 ? `${score}%` : '-%',
              actividad: updatedAt ? new Date(updatedAt).toLocaleDateString('es-ES') : '-',
              certificado: certGen ? 'Generado' : 'Pendiente',
            };
          });

        setStudents(merged);
      } catch (err) {
        console.error('Error fetching admin students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const computed = useMemo(() => {
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
  }, [students, loading]);

  return computed;
}
