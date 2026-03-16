export const PROFILE_LABELS: Record<string, string> = {
  admin: "Administrativo",
  contable: "Contable",
  cm: "Community Manager",
  diseno: "Diseñador Gráfico",
  atencion_ventas: "Atención al Cliente / Ventas",
  admin_bilingue: "Administrativo Bilingüe",
};

const COLORS = [
  "#0ea5e9", "#0284c7", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899",
];

export interface CourseData {
  kpis: { inscritos: number; finalizados: number; tasa: string; pendientes: number };
  distribucion: { perfil: string; cantidad: number; fill: string }[];
  tiempoPromedio: { perfil: string; horas: number }[];
  puntuacionPromedio: { perfil: string; puntuacion: number }[];
  errores: { perfil: string; tasa: string }[];
  estudiantes: {
    id: number; nombre: string; perfil: string; progreso: number;
    puntuacion: string; actividad: string; certificado: string;
  }[];
}

export const cursosData: Record<string, CourseData> = {
  nivel1: {
    kpis: { inscritos: 133, finalizados: 126, tasa: "95%", pendientes: 7 },
    distribucion: [
      { perfil: "Atención al Cliente / Ventas", cantidad: 42, fill: COLORS[0] },
      { perfil: "Administrativo", cantidad: 35, fill: COLORS[1] },
      { perfil: "Contable", cantidad: 20, fill: COLORS[2] },
      { perfil: "Community Manager", cantidad: 15, fill: COLORS[3] },
      { perfil: "Administrativo Bilingüe", cantidad: 11, fill: COLORS[4] },
      { perfil: "Diseñador Gráfico", cantidad: 10, fill: COLORS[5] },
    ],
    tiempoPromedio: [
      { perfil: "Administrativo", horas: 3.2 },
      { perfil: "Contable", horas: 4.5 },
      { perfil: "Community Manager", horas: 2.8 },
      { perfil: "Atención / Ventas", horas: 4.2 },
      { perfil: "Admin. Bilingüe", horas: 3.1 },
      { perfil: "Diseñador Gráfico", horas: 3.8 },
    ],
    puntuacionPromedio: [
      { perfil: "Administrativo Bilingüe", puntuacion: 9.5 },
      { perfil: "Administrativo", puntuacion: 8.8 },
      { perfil: "Contable", puntuacion: 8.5 },
      { perfil: "Atención al Cliente / Ventas", puntuacion: 8.2 },
    ],
    errores: [
      { perfil: "Atención al Cliente / Ventas", tasa: "18%" },
      { perfil: "Contable", tasa: "14%" },
      { perfil: "Community Manager", tasa: "10%" },
      { perfil: "Administrativo", tasa: "8%" },
    ],
    estudiantes: [
      { id: 1, nombre: "Juan Castillo", perfil: "admin", progreso: 90, puntuacion: "100%", actividad: "2026-03-09", certificado: "Pendiente" },
      { id: 2, nombre: "María Rivero", perfil: "admin_bilingue", progreso: 100, puntuacion: "100%", actividad: "2026-03-07", certificado: "Generado" },
      { id: 3, nombre: "Betzabeth Arenas", perfil: "contable", progreso: 40, puntuacion: "100%", actividad: "2026-03-09", certificado: "Pendiente" },
      { id: 4, nombre: "Katherine Alfonzo", perfil: "atencion_ventas", progreso: 100, puntuacion: "100%", actividad: "2026-03-07", certificado: "Generado" },
      { id: 5, nombre: "Vanessa Casique", perfil: "admin", progreso: 100, puntuacion: "95%", actividad: "2026-03-07", certificado: "Generado" },
    ],
  },
  nivel2: {
    kpis: { inscritos: 0, finalizados: 0, tasa: "0%", pendientes: 0 },
    distribucion: [],
    tiempoPromedio: [],
    puntuacionPromedio: [],
    errores: [],
    estudiantes: [],
  },
};
