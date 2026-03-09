export interface Quiz {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface EvaluationData {
  caseStudy: string;
  simulatedFeedback: {
    score: number;
    strengths: string;
    improvements: string;
  };
}

export interface Level2Module {
  id: number;
  title: string;
  duration: string;
  status: 'unlocked' | 'locked';
  lessons: string[];
  quiz?: Quiz;
  type?: 'evaluation';
  evaluationData?: EvaluationData;
}

export interface LearningPathLevel {
  level: number;
  title: string;
  status: 'completed' | 'unlocked' | 'locked';
}

export interface StudentInfo {
  name: string;
  globalLevel: number;
  progressPercentage: number;
  badges: string[];
}

export const studentInfo: StudentInfo = {
  name: "Estudiante LoVirtual",
  globalLevel: 2,
  progressPercentage: 20,
  badges: ["Nivel 1 Completado"],
};

export const learningPath: LearningPathLevel[] = [
  { level: 1, title: "Fundamentos de IA", status: "completed" },
  { level: 2, title: "Implementación y Automatización", status: "unlocked" },
  { level: 3, title: "Sistemas AI Avanzados", status: "locked" },
  { level: 4, title: "Optimización y Escala", status: "locked" },
  { level: 5, title: "Especialista LoVirtual", status: "locked" },
];

export const level2Modules: Level2Module[] = [
  {
    id: 1,
    title: "Módulo 1: Prompting Avanzado",
    duration: "45 min",
    status: "unlocked",
    lessons: [
      "Encadenamiento de prompts (Prompt Chaining).",
      "Diseño de System Prompts efectivos.",
      "Manejo de variables y Few-Shot avanzado.",
    ],
    quiz: {
      question: "¿Qué técnica implica usar la salida de un prompt como entrada para el siguiente?",
      options: ["Zero-Shot", "Prompt Chaining", "Fine-tuning", "RAG"],
      correctAnswer: "Prompt Chaining",
    },
  },
  {
    id: 2,
    title: "Módulo 2: Tu Propio Agente AI",
    duration: "50 min",
    status: "locked",
    lessons: [
      "Creación de GPTs personalizados.",
      "Alimentación de bases de conocimiento privadas.",
      "Definición de tono e instrucciones estrictas.",
    ],
    quiz: {
      question: "¿Para qué sirve subir un PDF a un GPT personalizado?",
      options: [
        "Para que cambie su avatar",
        "Para darle contexto o base de conocimiento exclusiva",
        "Para acelerar su tiempo de respuesta",
        "Para conectarlo a internet",
      ],
      correctAnswer: "Para darle contexto o base de conocimiento exclusiva",
    },
  },
  {
    id: 3,
    title: "Módulo 3: Análisis de Datos Express",
    duration: "60 min",
    status: "locked",
    lessons: [
      "Limpieza de datos con IA.",
      "Creación de gráficos a partir de CSVs.",
      "Generación de reportes ejecutivos.",
    ],
  },
  {
    id: 4,
    title: "Módulo 4: Automatización Sin Código",
    duration: "55 min",
    status: "locked",
    lessons: [
      "Introducción a Zapier y Make.",
      "Conectando Gmail, Notion y OpenAI.",
      "Casos de uso para asistentes virtuales.",
    ],
  },
  {
    id: 5,
    title: "Módulo 5: Creación de Video y Avatares",
    duration: "40 min",
    status: "locked",
    lessons: [
      "Herramientas de generación de avatares (HeyGen).",
      "Sincronización labial y clonación de voz.",
      "Edición rápida con IA en CapCut.",
    ],
  },
  {
    id: 6,
    title: "Módulo 6: Redacción Estratégica (Copywriting)",
    duration: "45 min",
    status: "locked",
    lessons: [
      "Frameworks PAS y AIDA con IA.",
      "Generación de hilos y secuencias de correos.",
      "Evitar el tono 'robótico'.",
    ],
  },
  {
    id: 7,
    title: "Módulo 7: Gestión de Proyectos Mejorada",
    duration: "40 min",
    status: "locked",
    lessons: [
      "Uso de Notion AI.",
      "Autocompletado de bases de datos y minutas.",
      "Asignación inteligente de tareas.",
    ],
  },
  {
    id: 8,
    title: "Módulo 8: Apps Script Nivel 2",
    duration: "65 min",
    status: "locked",
    lessons: [
      "Conceptos básicos de APIs.",
      "Llamadas a la API de OpenAI desde Google Sheets.",
      "Funciones personalizadas con IA.",
    ],
  },
  {
    id: 9,
    title: "Módulo 9: Lovable y Datos Reales",
    duration: "60 min",
    status: "locked",
    lessons: [
      "Entendiendo el Frontend vs Backend.",
      "Introducción a Supabase (Tablas básicas).",
      "Cómo la IA genera interfaces a partir de datos.",
    ],
  },
  {
    id: 10,
    title: "Módulo 10: Simulador de Casos Reales (Evaluación Final)",
    duration: "45 min",
    status: "locked",
    type: "evaluation",
    lessons: [],
    evaluationData: {
      caseStudy:
        "Un cliente está muy molesto porque su reporte mensual llegó con datos incorrectos. Redacta un prompt para que la IA genere un correo de disculpa profesional, ofreciendo una solución en 24 horas sin sonar desesperado.",
      simulatedFeedback: {
        score: 88,
        strengths: "Excelente definición del rol y contexto claro sobre el problema.",
        improvements: "Faltó especificarle a la IA la longitud exacta del correo deseado.",
      },
    },
  },
];
