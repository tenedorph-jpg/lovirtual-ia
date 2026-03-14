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
    id: 101,
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
    id: 102,
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
    id: 103,
    title: "Módulo 3: Análisis de Datos Express",
    duration: "60 min",
    status: "locked",
    lessons: [
      "Limpieza de datos con IA.",
      "Creación de gráficos a partir de CSVs.",
      "Generación de reportes ejecutivos.",
    ],
    educationalContent: [
      "La Inteligencia Artificial no solo sirve para generar texto, también es un analista de datos excepcional. Con la función de 'Advanced Data Analysis' (Análisis de datos avanzado) de ChatGPT, puedes subir archivos enteros como Excel o CSV.",
      "En lugar de pasar horas usando fórmulas de Excel, puedes pedirle a la IA en lenguaje natural: 'Limpia esta base de datos quitando los duplicados, encuentra cuál fue el producto más vendido en el último trimestre y genérame un gráfico de barras con los resultados'.",
      "La clave aquí es estructurar bien tus datos antes de subirlos. Un archivo limpio (sin celdas combinadas ni títulos extraños) permitirá que la IA interprete la información sin errores y te entregue reportes ejecutivos listos para presentar.",
    ],
    quiz: {
      question: "¿Qué formato de archivo es el más recomendado y ligero para subir bases de datos planas a ChatGPT?",
      options: ["PDF", "CSV (Valores separados por comas)", "JPEG", "DOCX"],
      correctAnswer: "CSV (Valores separados por comas)",
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
      "El verdadero nivel de un profesional digital actual no se mide por lo rápido que trabaja, sino por cuánto puede automatizar. Herramientas 'No-Code' (Sin código) como Zapier o Make funcionan como puentes invisibles entre tus aplicaciones.",
      "Toda automatización tiene dos partes fundamentales: Un 'Trigger' (Disparador), que es el evento que inicia todo (por ejemplo, 'Cuando recibo un correo nuevo con la etiqueta Factura'), y una 'Action' (Acción), que es lo que ocurre después.",
      "Al integrar la IA en este flujo, podemos hacer cosas mágicas. Por ejemplo: 'Si llega un correo de queja (Trigger), envíalo a ChatGPT para que analice el tono y redacte una respuesta (Action 1), y luego guárdalo en Notion (Action 2)'.",
    ],
    quiz: {
      question: "En el mundo de las automatizaciones (como Make o Zapier), ¿cómo se le llama al evento inicial que arranca el flujo de trabajo?",
      options: ["API", "Action (Acción)", "Trigger (Disparador)", "Webhook"],
      correctAnswer: "Trigger (Disparador)",
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
      "La barrera para crear contenido en video ha desaparecido. Hoy en día, herramientas como HeyGen o Synthesia te permiten generar voceros virtuales ultra realistas simplemente escribiendo un texto.",
      "Estos avatares de IA sincronizan perfectamente el movimiento de los labios (lip-sync) con el audio generado, e incluso clonan tu propia voz y tu rostro si así lo deseas, ahorrando horas de grabación y edición.",
      "Para complementar esto, aplicaciones como CapCut han integrado IA para eliminar silencios, agregar subtítulos dinámicos de forma automática y aplicar efectos visuales en segundos, haciendo que el flujo de producción sea extremadamente rápido.",
    ],
    quiz: {
      question: "¿Cuál de las siguientes herramientas es especialista en la creación de avatares/voceros virtuales con sincronización labial?",
      options: ["Midjourney", "HeyGen", "Notion", "Fathom"],
      correctAnswer: "HeyGen",
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
      "Pedirle a la IA que 'escriba un post para Instagram' suele generar textos robóticos, llenos de emojis innecesarios y palabras como '¡Descubre el poder de...!'. Para evitar esto, debemos usar frameworks de Copywriting.",
      "Uno de los frameworks más efectivos es el PAS: Problema (tocas el punto de dolor del cliente), Agitación (explicas por qué ese problema es grave) y Solución (presentas tu producto).",
      "Otro clásico es AIDA: Atención, Interés, Deseo y Acción. Cuando le pides a la IA que redacte un texto estructurándolo estrictamente bajo estos modelos y le das un 'tono de voz' específico (ej. directo, profesional y sin clichés), los resultados son dignos de una agencia de publicidad.",
    ],
    quiz: {
      question: "¿Qué significan las siglas del famoso framework de copywriting AIDA?",
      options: ["Análisis, Identificación, Datos, Aprobación", "Atención, Interés, Deseo, Acción", "Agitación, Impulso, Demanda, Acción", "Alcance, Interacción, Dinamismo, Audiencia"],
      correctAnswer: "Atención, Interés, Deseo, Acción",
    },
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
      "La gestión de proyectos ya no consiste solo en crear listas de tareas. Herramientas como Notion han integrado Inteligencia Artificial directamente en sus bases de datos.",
      "Con Notion AI, puedes crear columnas que se llenan solas. Por ejemplo, si tienes una base de datos con las notas de una reunión, la IA puede leer esas notas y rellenar automáticamente una columna con un 'Resumen Ejecutivo' y otra con los 'Action Items' (tareas asignadas a cada persona).",
      "Esto convierte a tu espacio de trabajo en un asistente activo que organiza la información por ti, permitiéndote enfocarte en la estrategia y no en la organización manual de los datos.",
    ],
    quiz: {
      question: "¿Cuál es una de las funciones más potentes de la IA integrada dentro de las bases de datos de Notion?",
      options: ["Crear videos automáticos", "Autocompletar propiedades y extraer resúmenes automáticamente", "Diseñar logos", "Enviar correos masivos"],
      correctAnswer: "Autocompletar propiedades y extraer resúmenes automáticamente",
    },
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
      "Para llevar tus habilidades al nivel experto, debes aprender a conectar sistemas directamente mediante código. Google Apps Script es un lenguaje basado en JavaScript que vive dentro de tus documentos de Google.",
      "Usando Apps Script, puedes conectar una simple hoja de Google Sheets con el 'cerebro' de OpenAI a través de su API (Interfaz de Programación de Aplicaciones).",
      "Para que esta conexión sea segura y funcione, necesitas una 'API Key' (Clave secreta), que es como la contraseña que le dice a OpenAI que tú estás autorizado para usar sus servicios desde tu hoja de cálculo. Una vez conectado, las celdas de tu Excel pueden generar texto inteligentemente de forma masiva.",
    ],
    quiz: {
      question: "¿Qué elemento es indispensable para conectar tu código de Google Apps Script con los servicios de OpenAI de forma autorizada?",
      options: ["Un correo de Gmail premium", "La API Key (Clave de API)", "Un framework AIDA", "Un archivo PDF"],
      correctAnswer: "La API Key (Clave de API)",
    },
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
      "Hasta ahora hemos creado interfaces visuales increíbles con Lovable. A esta parte visual e interactiva con la que interactúa el usuario se le conoce como 'Frontend'.",
      "Sin embargo, para que los usuarios puedan guardar su progreso, registrarse y almacenar información real a lo largo del tiempo, necesitamos un 'Backend' (la lógica detrás de escena) y una 'Base de Datos'.",
      "Herramientas modernas como Supabase funcionan como el Backend perfecto para plataformas creadas con IA. Al conectar Lovable con Supabase, pasamos de tener un diseño bonito a tener una aplicación de software 100% funcional y escalable.",
    ],
    quiz: {
      question: "En el desarrollo de aplicaciones web con herramientas como Lovable, ¿qué rol cumple un servicio como Supabase?",
      options: ["Es un generador de imágenes", "Funciona como el Backend y Base de Datos", "Es el motor que crea el diseño visual (Frontend)", "Sirve para editar videos"],
      correctAnswer: "Funciona como el Backend y Base de Datos",
    },
  },
  {
    id: 10,
    title: "Módulo 10: Simulador de Casos Reales (Evaluación Final)",
    duration: "45 min",
    status: "locked",
    type: "evaluation",
    lessons: [],
    educationalContent: [
      "¡Felicidades por llegar hasta aquí! Has dominado desde la estructuración de prompts avanzados hasta la lógica de automatizaciones y bases de datos.",
      "Para aprobar el Nivel 2, no responderás una pregunta de opción múltiple. Te enfrentarás a un simulador donde la IA evaluará tu capacidad para resolver un problema real de un cliente corporativo.",
      "Lee atentamente el caso de estudio a continuación. Usa todos los conocimientos adquiridos sobre rol, contexto, tono de voz y objetivos claros para redactar tu respuesta en la caja de texto. Cuando estés listo, presiona el botón para que la IA evalúe tu estrategia.",
    ],
    evaluationData: {
      caseStudy:
        "CASO PRÁCTICO: Un cliente muy importante está sumamente molesto porque el reporte de métricas mensuales se entregó tarde y con errores en los datos financieros. Tu objetivo es redactar el PROMPT EXACTO que usarías en ChatGPT para que te genere un correo de disculpa profesional, ofreciendo una revisión completa en 24 horas. El correo debe sonar empático, asumir la responsabilidad sin sonar desesperado y usar un tono corporativo.",
      simulatedFeedback: {
        score: 90,
        strengths: "Has definido un excelente contexto y el tono solicitado es perfecto para manejar crisis.",
        improvements: "Recuerda siempre pedirle a la IA restricciones de longitud (ej. 'Que no supere los 3 párrafos') para evitar correos demasiado largos que el cliente no leerá.",
      },
    },
  },
];

export interface Level2ExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export const level2FinalExamQuestions: Level2ExamQuestion[] = [
  {
    id: 1,
    question: "¿Qué técnica implica usar la salida de un prompt como entrada para el siguiente, creando un flujo secuencial?",
    options: ["Zero-Shot Prompting", "Prompt Chaining (Encadenamiento)", "Fine-tuning del modelo", "RAG (Retrieval-Augmented Generation)"],
    correctAnswer: 1,
  },
  {
    id: 2,
    question: "Al crear un GPT personalizado, ¿qué ventaja principal ofrece subir documentos a la Base de Conocimiento?",
    options: [
      "Acelera la velocidad de respuesta del modelo",
      "La IA prioriza esa información privada y reduce alucinaciones",
      "Permite al GPT acceder a internet en tiempo real",
      "Cambia el avatar del asistente automáticamente",
    ],
    correctAnswer: 1,
  },
  {
    id: 3,
    question: "¿Cuál es el formato de archivo más recomendado y ligero para subir bases de datos planas a ChatGPT para análisis?",
    options: ["PDF", "DOCX", "CSV (Valores separados por comas)", "PPTX"],
    correctAnswer: 2,
  },
  {
    id: 4,
    question: "En el mundo de las automatizaciones (Zapier/Make), ¿cómo se le llama al evento inicial que arranca un flujo de trabajo?",
    options: ["Action (Acción)", "Webhook", "Trigger (Disparador)", "API Endpoint"],
    correctAnswer: 2,
  },
  {
    id: 5,
    question: "¿Qué herramienta es especialista en crear avatares/voceros virtuales con sincronización labial (lip-sync)?",
    options: ["Midjourney", "CapCut", "HeyGen", "Notion AI"],
    correctAnswer: 2,
  },
  {
    id: 6,
    question: "¿Qué significan las siglas del framework de copywriting AIDA?",
    options: [
      "Análisis, Identificación, Datos, Aprobación",
      "Alcance, Interacción, Dinamismo, Audiencia",
      "Atención, Interés, Deseo, Acción",
      "Agitación, Impulso, Demanda, Acción",
    ],
    correctAnswer: 2,
  },
  {
    id: 7,
    question: "¿Cuál es una función clave de Notion AI dentro de las bases de datos?",
    options: [
      "Crear videos automáticos",
      "Autocompletar propiedades y extraer resúmenes automáticamente",
      "Diseñar logos corporativos",
      "Enviar correos masivos",
    ],
    correctAnswer: 1,
  },
  {
    id: 8,
    question: "¿Qué elemento es indispensable para conectar Google Apps Script con los servicios de OpenAI?",
    options: ["Un correo de Gmail premium", "Un framework AIDA", "La API Key (Clave de API)", "Un archivo PDF"],
    correctAnswer: 2,
  },
  {
    id: 9,
    question: "En el desarrollo con herramientas como Lovable, ¿qué rol cumple un servicio como Supabase?",
    options: [
      "Es un generador de imágenes con IA",
      "Es el motor que crea el diseño visual (Frontend)",
      "Funciona como el Backend y Base de Datos",
      "Sirve para editar videos automáticamente",
    ],
    correctAnswer: 2,
  },
  {
    id: 10,
    question: "En el framework PAS de copywriting, ¿qué significa la 'A' (Agitación)?",
    options: [
      "Presentar la solución de forma directa",
      "Explicar por qué el problema es grave e intensificar el dolor",
      "Llamar la atención del lector con un titular impactante",
      "Agregar un llamado a la acción urgente",
    ],
    correctAnswer: 1,
  },
];
