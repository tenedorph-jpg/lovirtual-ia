import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type LovirtualRole = Database['public']['Enums']['lovirtual_role'];

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  lovirtual_role: LovirtualRole;
}

export interface StudentProgress {
  user_id: string;
  completed_modules: number[];
  quiz_scores: Record<string, number>;
  average_score: number;
  progress: number;
  time_spent_minutes: number;
  certificate_generated: boolean;
  final_exam_score: number | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  studentProgress: StudentProgress | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string, role: LovirtualRole) => Promise<{ success: boolean; message: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  updateStudentProgress: (moduleId: number, score: number) => Promise<void>;
  completeModule: (moduleId: number) => Promise<void>;
  setFinalExamScore: (score: number) => Promise<void>;
  markCertificateGenerated: () => Promise<void>;
  markLevel2Completed: () => Promise<void>;
  updateStudentName: (name: string) => Promise<void>;
  // Legacy compat for pages
  currentStudent: LegacyStudent | null;
  role: 'admin' | 'student' | null;
  logout: () => Promise<void>;
  students: LegacyStudent[];
  generateAccessCode: (name: string, email: string) => string;
}

// Legacy student shape for backward compat with existing pages
export interface LegacyStudent {
  id: string;
  code: string;
  name: string;
  email: string;
  progress: number;
  averageScore: number;
  completedModules: number[];
  quizScores: Record<number, number>;
  enrolledAt: string;
  lastActive: string;
  timeSpentMinutes: number;
  certificateGenerated: boolean;
  finalExamScore?: number;
  level2Completed: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentProgress | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [allProgress, setAllProgress] = useState<any[]>([]);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data) setProfile(data as Profile);
    return data;
  };

  const fetchProgress = async (userId: string) => {
    const { data } = await supabase
      .from('student_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (data) {
      setStudentProgress({
        ...data,
        quiz_scores: (data.quiz_scores as Record<string, number>) || {},
      });
      return data;
    }
    // Auto-create record if missing
    const { data: created } = await supabase
      .from('student_progress')
      .insert({ user_id: userId })
      .select()
      .single();
    if (created) {
      setStudentProgress({
        ...created,
        quiz_scores: {},
      });
    }
    return created;
  };

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase.rpc('has_role', { _user_id: userId, _role: 'admin' });
    setIsAdmin(!!data);
    return !!data;
  };

  const fetchAllForAdmin = async () => {
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: progress } = await supabase.from('student_progress').select('*');
    if (profiles) setAllProfiles(profiles);
    if (progress) setAllProgress(progress);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        // Use setTimeout to avoid Supabase deadlock
        setTimeout(async () => {
          await fetchProfile(session.user.id);
          await fetchProgress(session.user.id);
          const admin = await checkAdmin(session.user.id);
          if (admin) await fetchAllForAdmin();
          setLoading(false);
        }, 0);
      } else {
        setUser(null);
        setProfile(null);
        setStudentProgress(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
        await fetchProgress(session.user.id);
        const admin = await checkAdmin(session.user.id);
        if (admin) await fetchAllForAdmin();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: LovirtualRole) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, lovirtual_role: role },
      },
    });
    if (error) return { success: false, message: error.message };
    return { success: true, message: `¡Bienvenido/a, ${fullName}!` };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return { success: false, message: 'Debes confirmar tu correo electrónico antes de ingresar. Revisa tu bandeja de entrada.' };
      }
      return { success: false, message: 'Correo o contraseña incorrectos. Verifica tus datos e intenta nuevamente.' };
    }
    return { success: true, message: '¡Bienvenido/a!' };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateStudentProgress = async (moduleId: number, score: number) => {
    if (!user || !studentProgress) return;
    const newQuizScores: Record<string, number> = { ...studentProgress.quiz_scores, [moduleId]: score };
    const completedCount = Object.keys(newQuizScores).length;
    const vals = Object.values(newQuizScores) as number[];
    const totalScore = vals.reduce((a, b) => a + b, 0);
    const avgScore = Math.round(totalScore / completedCount);
    const progress = Math.round((completedCount / 10) * 100);

    await supabase
      .from('student_progress')
      .update({
        quiz_scores: newQuizScores,
        average_score: avgScore,
        progress,
        time_spent_minutes: studentProgress.time_spent_minutes + 15,
      })
      .eq('user_id', user.id);

    setStudentProgress(prev => prev ? {
      ...prev,
      quiz_scores: newQuizScores,
      average_score: avgScore,
      progress,
      time_spent_minutes: prev.time_spent_minutes + 15,
    } : null);
  };

  const completeModule = async (moduleId: number) => {
    if (!user || !studentProgress) return;
    if (studentProgress.completed_modules.includes(moduleId)) return;
    const newModules = [...studentProgress.completed_modules, moduleId];
    await supabase
      .from('student_progress')
      .update({ completed_modules: newModules })
      .eq('user_id', user.id);
    setStudentProgress(prev => prev ? { ...prev, completed_modules: newModules } : null);
  };

  const setFinalExamScore = async (score: number) => {
    if (!user) return;
    await supabase
      .from('student_progress')
      .update({ final_exam_score: score, progress: 100 })
      .eq('user_id', user.id);
    setStudentProgress(prev => prev ? { ...prev, final_exam_score: score, progress: 100 } : null);
  };

  const markCertificateGenerated = async () => {
    if (!user) return;
    await supabase
      .from('student_progress')
      .update({ certificate_generated: true })
      .eq('user_id', user.id);
    setStudentProgress(prev => prev ? { ...prev, certificate_generated: true } : null);
  };

  const markLevel2Completed = async () => {
    // Level 2 completion is derived from completed modules (101-110), no extra DB field needed.
    // This is a no-op since setFinalExamScore already persists the score.
  };

  const updateStudentName = async (name: string) => {
    if (!user) return;
    await supabase
      .from('profiles')
      .update({ full_name: name })
      .eq('user_id', user.id);
    setProfile(prev => prev ? { ...prev, full_name: name } : null);
  };

  // Legacy compat: build currentStudent from profile + progress (use defaults if progress not yet loaded)
  const currentStudent: LegacyStudent | null = profile ? {
    id: profile.user_id,
    code: '',
    name: profile.full_name,
    email: profile.email,
    progress: studentProgress?.progress ?? 0,
    averageScore: studentProgress?.average_score ?? 0,
    completedModules: studentProgress?.completed_modules ?? [],
    quizScores: Object.fromEntries(
      Object.entries(studentProgress?.quiz_scores ?? {}).map(([k, v]) => [Number(k), v])
    ),
    enrolledAt: '',
    lastActive: '',
    timeSpentMinutes: studentProgress?.time_spent_minutes ?? 0,
    certificateGenerated: studentProgress?.certificate_generated ?? false,
    finalExamScore: studentProgress?.final_exam_score ?? undefined,
    level2Completed: (studentProgress?.completed_modules ?? []).filter(id => id >= 101 && id <= 110).length >= 10,
  } : null;

  // Legacy: build students list for admin
  const students: LegacyStudent[] = allProfiles.map(p => {
    const prog = allProgress.find(pr => pr.user_id === p.user_id);
    const qs = (prog?.quiz_scores as Record<string, number>) || {};
    return {
      id: p.user_id,
      code: p.lovirtual_role,
      name: p.full_name,
      email: p.email,
      progress: prog?.progress || 0,
      averageScore: prog?.average_score || 0,
      completedModules: prog?.completed_modules || [],
      quizScores: Object.fromEntries(Object.entries(qs).map(([k, v]) => [Number(k), v])),
      enrolledAt: p.created_at?.split('T')[0] || '',
      lastActive: prog?.updated_at?.split('T')[0] || '',
      timeSpentMinutes: prog?.time_spent_minutes || 0,
      certificateGenerated: prog?.certificate_generated || false,
      finalExamScore: prog?.final_exam_score ?? undefined,
    };
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        studentProgress,
        loading,
        isAuthenticated: !!user,
        isAdmin,
        signUp,
        signIn,
        signOut,
        updateStudentProgress,
        completeModule,
        setFinalExamScore,
        markCertificateGenerated,
        updateStudentName,
        currentStudent,
        role: !user ? null : isAdmin ? 'admin' : 'student',
        logout: signOut,
        students,
        generateAccessCode: () => '',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
