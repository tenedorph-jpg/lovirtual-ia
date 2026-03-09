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
  educationalContent?: string[];
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
    educationalContent: [
      "Bienvenido al Nivel 2. Para dominar verdaderamente la Inteligencia Artificial, debemos pasar de hacer preguntas simples a construir flujos de trabajo estructurados.",
      "Una de las técnicas más poderosas es el 'Prompt Chaining' (Encadenamiento de Prompts). Esto significa que en lugar de pedirle a la IA que haga una tarea masiva en un solo paso, divides la tarea en pequeños pasos secuenciales. La salida del primer prompt se convierte en el contexto o la entrada del segundo prompt.",
      "Además, es fundamental dominar el 'System Prompt'. Esta es la instrucción maestra que le da una personalidad, reglas estrictas y un marco de referencia a la IA antes de que interactúe con el usuario final. Lee este material atentamente antes de proceder al quiz.",
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
    educationalContent: [
      "Crear un GPT personalizado (Custom GPT) te permite tener un asistente virtual entrenado específicamente para tus necesidades corporativas o personales.",
      "La verdadera magia de un Agente de IA no está solo en sus instrucciones, sino en su Base de Conocimiento (Knowledge Base). Al subir documentos PDF, hojas de cálculo o manuales de procedimientos corporativos, la IA priorizará esa información privada por encima de lo que sabe de internet, reduciendo drásticamente las alucinaciones.",
      "Recuerda que debes ser muy claro en la configuración: define un tono de voz y establece qué debe responder si el usuario le pregunta algo fuera de los documentos proporcionados.",
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
    educationalContent: [
      "En el mundo empresarial, los datos son el activo más valioso, pero solo si están limpios y organizados. La IA puede ayudarte a detectar valores duplicados, corregir formatos inconsistentes y rellenar campos vacíos en segundos, tareas que manualmente tomarían horas.",
      "Una vez que tus datos están limpios, puedes pedirle a la IA que genere gráficos y visualizaciones directamente desde archivos CSV o tablas de Excel. Herramientas como ChatGPT con Code Interpreter o Claude pueden crear gráficos de barras, líneas de tendencia y diagramas de pastel con un solo prompt bien estructurado.",
      "El paso final es la generación de reportes ejecutivos. Un buen prompt puede transformar una tabla de datos crudos en un resumen narrativo con conclusiones clave, recomendaciones y próximos pasos. Dominar esta habilidad te convierte en alguien que no solo presenta datos, sino que cuenta historias con ellos.",
    ],
    quiz: {
      question: "¿Cuál es el beneficio principal de limpiar datos antes de analizarlos con IA?",
      options: ["Que los gráficos se vean más bonitos", "Que los resultados sean precisos y confiables", "Que el proceso sea más lento pero seguro", "Que se reduzca el tamaño del archivo"],
      correctAnswer: "Que los resultados sean precisos y confiables",
    },
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
    educationalContent: [
      "La automatización sin código (No-Code Automation) permite crear flujos de trabajo complejos sin escribir una sola línea de programación. Plataformas como Zapier y Make (antes Integromat) actúan como puentes entre tus aplicaciones favoritas, ejecutando acciones automáticas cuando se cumple una condición.",
      "Por ejemplo, puedes crear un flujo donde cada vez que recibes un correo en Gmail con un archivo adjunto, automáticamente se guarde en Google Drive, se extraiga el texto con IA y se agregue un resumen a una base de datos en Notion. Todo sin intervención humana.",
      "Los asistentes virtuales automatizados son el siguiente nivel: combinando WhatsApp Business, OpenAI y Make, puedes crear un chatbot que responda preguntas frecuentes de clientes, agende citas y escale casos complejos a un humano. La clave está en diseñar el flujo conversacional antes de implementarlo.",
    ],
    quiz: {
      question: "¿Qué herramienta actúa como puente entre aplicaciones para crear flujos automáticos sin código?",
      options: ["Google Docs", "Zapier / Make", "Microsoft Paint", "WordPress"],
      correctAnswer: "Zapier / Make",
    },
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
    educationalContent: [
      "La creación de video con IA ha democratizado la producción audiovisual. Herramientas como HeyGen permiten generar videos con avatares realistas que hablan en múltiples idiomas, ideal para capacitaciones corporativas, tutoriales de producto o contenido de marketing sin necesidad de cámaras ni actores.",
      "La sincronización labial (lip-sync) con IA es una tecnología que ajusta los movimientos de la boca de un avatar o persona real para que coincidan perfectamente con un audio nuevo. Combinado con la clonación de voz, puedes crear un video donde 'tú' hablas en japonés, aunque nunca hayas estudiado ese idioma.",
      "Para la post-producción, CapCut integra funciones de IA como la eliminación automática de silencios, subtítulos generados automáticamente y efectos de transición inteligentes. El flujo completo —desde el guion generado por IA hasta el video final editado— puede completarse en menos de una hora.",
    ],
    quiz: {
      question: "¿Qué tecnología permite que un avatar mueva los labios de forma sincronizada con un audio nuevo?",
      options: ["Rendering 3D manual", "Lip-sync con IA", "Edición fotograma a fotograma", "Captura de movimiento con sensores"],
      correctAnswer: "Lip-sync con IA",
    },
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
    educationalContent: [
      "El copywriting con IA no se trata de pedirle al modelo que 'escriba algo bonito'. Se trata de darle un framework probado y dejar que lo ejecute con precisión. Los dos frameworks más efectivos son PAS (Problema → Agitación → Solución) y AIDA (Atención → Interés → Deseo → Acción).",
      "Para generar hilos de redes sociales o secuencias de correos electrónicos, la clave es proporcionarle a la IA el contexto del público objetivo, el tono deseado y el objetivo de conversión. Un prompt como 'Actúa como un copywriter experto en B2B SaaS. Escribe una secuencia de 5 correos usando el framework AIDA para vender un CRM a directores de ventas' produce resultados significativamente mejores que 'Escribe correos de venta'.",
      "El mayor error al usar IA para redacción es no humanizar el resultado. Los textos generados tienden a usar frases genéricas y estructuras predecibles. Tu trabajo es inyectar anécdotas reales, datos específicos de tu industria y un tono conversacional que rompa el patrón robótico. La IA es tu borrador inicial, no tu versión final.",
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
    educationalContent: [
      "Notion AI transforma tu espacio de trabajo de una simple herramienta de organización a un asistente de productividad inteligente. Puede resumir documentos largos, generar planes de acción a partir de notas de reuniones y autocompletar campos en bases de datos basándose en patrones existentes.",
      "Una de las funciones más poderosas es la generación automática de minutas. Después de una reunión, puedes pegar las notas crudas y pedirle a la IA que extraiga: decisiones tomadas, tareas asignadas (con responsable y fecha límite) y temas pendientes. Esto elimina la ambigüedad post-reunión que tantos proyectos sufren.",
      "La asignación inteligente de tareas va un paso más allá: analizando el historial de carga de trabajo del equipo, las habilidades de cada miembro y los plazos del proyecto, la IA puede sugerir la distribución óptima de nuevas tareas. Aunque la decisión final es humana, tener una recomendación basada en datos mejora significativamente la planificación.",
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
    educationalContent: [
      "Una API (Interfaz de Programación de Aplicaciones) es simplemente una forma estandarizada en que dos programas se comunican entre sí. Piensa en ella como un mesero en un restaurante: tú (tu aplicación) haces un pedido, el mesero (la API) lo lleva a la cocina (el servidor) y te trae la respuesta. No necesitas saber cocinar; solo necesitas saber pedir.",
      "Google Apps Script te permite llamar a la API de OpenAI directamente desde Google Sheets. Esto significa que puedes crear una función personalizada donde escribes un prompt en una celda y la respuesta de la IA aparece automáticamente en otra celda. Imagina clasificar cientos de comentarios de clientes, generar descripciones de productos o traducir contenido, todo desde tu hoja de cálculo.",
      "La clave técnica es entender tres conceptos: el endpoint (la URL a la que envías tu petición), el método HTTP (GET para obtener datos, POST para enviar datos) y la autenticación (tu API key que identifica quién eres). Con Apps Script, todo esto se maneja con la función UrlFetchApp.fetch(), y la IA misma puede ayudarte a escribir el código.",
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
    educationalContent: [
      "Toda aplicación moderna tiene dos partes: el Frontend (lo que el usuario ve y toca) y el Backend (donde se almacenan los datos y se ejecuta la lógica del negocio). Lovable te permite construir el frontend completo con IA, pero para que tu aplicación sea realmente funcional, necesitas conectarla a datos reales.",
      "Supabase es una plataforma de backend que te permite crear tablas de datos, gestionar usuarios y establecer reglas de seguridad sin necesidad de configurar servidores. Piensa en ello como una hoja de cálculo superpotente que vive en la nube y a la que tu aplicación puede acceder en tiempo real.",
      "Lo fascinante de combinar Lovable con datos reales es que la IA puede generar interfaces completas —tablas, formularios, dashboards— directamente a partir de la estructura de tus datos. Describes lo que necesitas, y la IA crea componentes React funcionales que leen y escriben en tu base de datos automáticamente.",
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
