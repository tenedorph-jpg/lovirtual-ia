export const mockAdminData = {
  metricas: {
    totalInscritos: 133,
    totalFinalizados: 129,
    distribucionPerfiles: [
      { perfil: "Asistente Virtual", cantidad: 65, fill: "#0ea5e9" },
      { perfil: "Atención / Ventas", cantidad: 42, fill: "#0284c7" },
      { perfil: "Administrativo", cantidad: 15, fill: "#10b981" },
      { perfil: "Admin. Bilingüe", cantidad: 11, fill: "#f59e0b" },
    ],
    tiempoFinalizacionPromedio: [
      { perfil: "Asistente Virtual", horas: 3.5 },
      { perfil: "Atención / Ventas", horas: 4.2 },
      { perfil: "Administrativo", horas: 2.8 },
      { perfil: "Admin. Bilingüe", horas: 3.1 },
    ],
  },
  estudiantes: [
    { id: 1, nombre: "María Rivero", email: "mariav17x@gmail.com", perfil: "admin_bilingue", progreso: 100, puntuacion: "100%", actividad: "2026-03-07", certificado: "Generado" },
    { id: 2, nombre: "Vanessa Casique", email: "ventas@lovirtual.com", perfil: "admin", progreso: 100, puntuacion: "95%", actividad: "2026-03-07", certificado: "Generado" },
    { id: 3, nombre: "Juan Castillo", email: "juancastillo@lovirtual.net", perfil: "admin", progreso: 20, puntuacion: "-%", actividad: "2026-03-06", certificado: "Pendiente" },
    { id: 4, nombre: "Katherine Alfonzo", email: "katherinedv@gmail.com", perfil: "atencion_ventas", progreso: 100, puntuacion: "100%", actividad: "2026-03-07", certificado: "Generado" },
  ],
};

export const PROFILE_LABELS: Record<string, string> = {
  admin: "Administrativo",
  contable: "Contable",
  cm: "Community Manager",
  diseno: "Diseño",
  atencion_ventas: "Atención al Cliente / Ventas",
  admin_bilingue: "Administrativo Bilingüe",
};
