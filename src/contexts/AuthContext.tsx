import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Student {
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
}

interface AuthState {
  isAuthenticated: boolean;
  role: 'admin' | 'student' | null;
  currentStudent: Student | null;
}

interface AuthContextType extends AuthState {
  loading: boolean;
  login: (code: string) => { success: boolean; message: string };
  logout: () => void;
  students: Student[];
  generateAccessCode: (name: string, email: string) => string;
  updateStudentProgress: (moduleId: number, score: number) => void;
  updateStudentName: (name: string) => void;
  completeModule: (moduleId: number) => void;
  setFinalExamScore: (score: number) => void;
  markCertificateGenerated: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CODE = 'ADMIN-KEY-2026';
const STORAGE_KEY = 'lovirtual_auth';
const STUDENTS_KEY = 'lovirtual_students';

const generateCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'LV-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Initial sample students for demo
const initialStudents: Student[] = [
  {
    id: '1',
    code: 'LV-DEMO2024',
    name: 'María García',
    email: 'maria@example.com',
    progress: 70,
    averageScore: 85,
    completedModules: [1, 2, 3, 4, 5, 6, 7],
    quizScores: { 1: 90, 2: 80, 3: 85, 4: 90, 5: 80, 6: 85, 7: 85 },
    enrolledAt: '2024-01-15',
    lastActive: '2024-01-20',
    timeSpentMinutes: 480,
    certificateGenerated: false,
  },
  {
    id: '2',
    code: 'LV-TEST2024',
    name: 'Carlos Rodríguez',
    email: 'carlos@example.com',
    progress: 40,
    averageScore: 78,
    completedModules: [1, 2, 3, 4],
    quizScores: { 1: 75, 2: 80, 3: 75, 4: 82 },
    enrolledAt: '2024-01-10',
    lastActive: '2024-01-18',
    timeSpentMinutes: 320,
    certificateGenerated: false,
  },
  {
    id: '3',
    code: 'LV-ALPHA123',
    name: 'Ana Martínez',
    email: 'ana@example.com',
    progress: 100,
    averageScore: 92,
    completedModules: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    quizScores: { 1: 95, 2: 90, 3: 92, 4: 88, 5: 95, 6: 90, 7: 93, 8: 92, 9: 95, 10: 90 },
    enrolledAt: '2024-01-05',
    lastActive: '2024-01-20',
    timeSpentMinutes: 720,
    certificateGenerated: true,
    finalExamScore: 94,
  },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    currentStudent: null,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem(STORAGE_KEY);
    const savedStudents = localStorage.getItem(STUDENTS_KEY);

    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    } else {
      setStudents(initialStudents);
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(initialStudents));
    }

    if (savedAuth) {
      const parsed = JSON.parse(savedAuth);
      // Re-validate the session
      if (parsed.role === 'admin') {
        setAuthState(parsed);
      } else if (parsed.role === 'student' && parsed.currentStudent) {
        const currentStudents = savedStudents ? JSON.parse(savedStudents) : initialStudents;
        const student = currentStudents.find((s: Student) => s.code === parsed.currentStudent.code);
        if (student) {
          setAuthState({ ...parsed, currentStudent: student });
        }
      }
    }
  }, []);

  // Save students to localStorage whenever they change
  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
    }
  }, [students]);

  // Save auth state
  useEffect(() => {
    if (authState.isAuthenticated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    }
  }, [authState]);

  const login = (code: string): { success: boolean; message: string } => {
    const trimmedCode = code.trim().toUpperCase();

    if (trimmedCode === ADMIN_CODE) {
      setAuthState({
        isAuthenticated: true,
        role: 'admin',
        currentStudent: null,
      });
      return { success: true, message: 'Bienvenido, Administrador' };
    }

    const student = students.find(s => s.code.toUpperCase() === trimmedCode);
    if (student) {
      const updatedStudent = {
        ...student,
        lastActive: new Date().toISOString().split('T')[0],
      };
      setStudents(prev => prev.map(s => s.id === student.id ? updatedStudent : s));
      setAuthState({
        isAuthenticated: true,
        role: 'student',
        currentStudent: updatedStudent,
      });
      return { success: true, message: `Bienvenido/a, ${student.name}` };
    }

    return { success: false, message: 'Código de acceso inválido' };
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      role: null,
      currentStudent: null,
    });
    localStorage.removeItem(STORAGE_KEY);
  };

  const generateAccessCode = (name: string, email: string): string => {
    const newCode = generateCode();
    const newStudent: Student = {
      id: Date.now().toString(),
      code: newCode,
      name,
      email,
      progress: 0,
      averageScore: 0,
      completedModules: [],
      quizScores: {},
      enrolledAt: new Date().toISOString().split('T')[0],
      lastActive: new Date().toISOString().split('T')[0],
      timeSpentMinutes: 0,
      certificateGenerated: false,
    };
    setStudents(prev => [...prev, newStudent]);
    return newCode;
  };

  const updateStudentProgress = (moduleId: number, score: number) => {
    if (!authState.currentStudent) return;

    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id === authState.currentStudent?.id) {
          const newQuizScores = { ...s.quizScores, [moduleId]: score };
          const completedCount = Object.keys(newQuizScores).length;
          const totalScore = Object.values(newQuizScores).reduce((a, b) => a + b, 0);
          const avgScore = Math.round(totalScore / completedCount);
          const progress = Math.round((completedCount / 10) * 100);

          return {
            ...s,
            quizScores: newQuizScores,
            averageScore: avgScore,
            progress,
            timeSpentMinutes: s.timeSpentMinutes + 15,
          };
        }
        return s;
      });

      const currentStudent = updated.find(s => s.id === authState.currentStudent?.id);
      if (currentStudent) {
        setAuthState(prev => ({ ...prev, currentStudent }));
      }

      return updated;
    });
  };

  const updateStudentName = (name: string) => {
    if (!authState.currentStudent) return;

    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id === authState.currentStudent?.id) {
          return { ...s, name };
        }
        return s;
      });

      const currentStudent = updated.find(s => s.id === authState.currentStudent?.id);
      if (currentStudent) {
        setAuthState(prev => ({ ...prev, currentStudent }));
      }

      return updated;
    });
  };

  const completeModule = (moduleId: number) => {
    if (!authState.currentStudent) return;

    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id === authState.currentStudent?.id) {
          if (!s.completedModules.includes(moduleId)) {
            return {
              ...s,
              completedModules: [...s.completedModules, moduleId],
            };
          }
        }
        return s;
      });

      const currentStudent = updated.find(s => s.id === authState.currentStudent?.id);
      if (currentStudent) {
        setAuthState(prev => ({ ...prev, currentStudent }));
      }

      return updated;
    });
  };

  const setFinalExamScore = (score: number) => {
    if (!authState.currentStudent) return;

    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id === authState.currentStudent?.id) {
          return { ...s, finalExamScore: score, progress: 100 };
        }
        return s;
      });

      const currentStudent = updated.find(s => s.id === authState.currentStudent?.id);
      if (currentStudent) {
        setAuthState(prev => ({ ...prev, currentStudent }));
      }

      return updated;
    });
  };

  const markCertificateGenerated = () => {
    if (!authState.currentStudent) return;

    setStudents(prev => {
      const updated = prev.map(s => {
        if (s.id === authState.currentStudent?.id) {
          return { ...s, certificateGenerated: true };
        }
        return s;
      });

      const currentStudent = updated.find(s => s.id === authState.currentStudent?.id);
      if (currentStudent) {
        setAuthState(prev => ({ ...prev, currentStudent }));
      }

      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        students,
        generateAccessCode,
        updateStudentProgress,
        updateStudentName,
        completeModule,
        setFinalExamScore,
        markCertificateGenerated,
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
