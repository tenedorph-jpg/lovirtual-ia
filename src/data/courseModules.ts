export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Module {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
  duration: string;
  description: string;
  content: {
    concept: string;
    keyPoints: string[];
    practicalExample: string;
    tools?: string[];
  };
  quiz: QuizQuestion[];
}

export const courseModules: Module[] = [
  {
    id: 1,
    title: "El Arte del Prompt",
    subtitle: "De buscador a razonador",
    icon: "✨",
    duration: "45 min",
    description: "Domina la técnica de comunicación efectiva con modelos de IA. Aprende a estructurar tus solicitudes para obtener respuestas precisas y útiles.",
    content: {
      concept: "La diferencia entre un usuario promedio y un experto en IA radica en cómo formulan sus solicitudes. Los prompts bien estructurados transforman una herramienta genérica en un asistente especializado que entiende exactamente lo que necesitas.",
      keyPoints: [
        "La fórmula del prompt perfecto: Rol + Contexto + Tarea + Formato",
        "Asignar un rol específico aumenta la precisión de las respuestas hasta un 40%",
        "El contexto elimina ambigüedades y reduce respuestas irrelevantes",
        "Especificar el formato de salida ahorra tiempo de edición posterior",
        "La iteración es clave: refina tus prompts basándote en los resultados"
      ],
      practicalExample: "❌ Malo: 'Haz un correo'\n\n✅ Bueno: 'Eres un experto en atención al cliente de una empresa de tecnología. Un cliente llamado Juan se queja porque su pedido #4521 no llegó a tiempo. Redacta un correo de disculpa profesional que ofrezca una solución (reenvío express gratuito) y un cupón del 15% para su próxima compra. Tono empático pero profesional. Máximo 150 palabras.'"
    },
    quiz: [
      {
        id: 1,
        question: "¿Cuál es la fórmula recomendada para estructurar un prompt efectivo?",
        options: [
          "Pregunta + Respuesta esperada",
          "Rol + Contexto + Tarea + Formato",
          "Título + Descripción + Conclusión",
          "Inicio + Desarrollo + Cierre"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "¿Qué beneficio principal tiene asignar un ROL específico a la IA?",
        options: [
          "Hace que la respuesta sea más larga",
          "Reduce el tiempo de procesamiento",
          "Aumenta la precisión y enfoque de la respuesta",
          "Permite usar menos palabras en el prompt"
        ],
        correctAnswer: 2
      },
      {
        id: 3,
        question: "¿Por qué es importante especificar el FORMATO de salida deseado?",
        options: [
          "Para que la IA trabaje más rápido",
          "Porque es obligatorio en todas las IAs",
          "Para ahorrar tiempo de edición posterior",
          "Para que el prompt sea más corto"
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 2,
    title: "Limitaciones y Real Time",
    subtitle: "ChatGPT vs Gemini",
    icon: "🔄",
    duration: "40 min",
    description: "Comprende las diferencias fundamentales entre los principales modelos de IA y cuándo usar cada uno según tus necesidades de información actualizada.",
    content: {
      concept: "Cada modelo de IA tiene una 'fecha de corte' de conocimiento. ChatGPT (versión gratuita) puede tener información desactualizada, mientras que Gemini tiene acceso a información en tiempo real a través de la integración con Google Search.",
      keyPoints: [
        "ChatGPT tiene fechas de corte de conocimiento que limitan información actual",
        "Gemini accede a Google Search para datos en tiempo real",
        "Para vuelos, hoteles y noticias actuales, Gemini es la opción superior",
        "La verificación de fuentes es OBLIGATORIA en ambos casos",
        "Combinar ambas herramientas maximiza tu productividad"
      ],
      practicalExample: "Caso de uso: Necesitas información sobre vuelos a Madrid para la próxima semana.\n\n❌ ChatGPT: 'No tengo acceso a información de vuelos en tiempo real...'\n\n✅ Gemini: Puede buscar vuelos actuales, comparar precios y darte opciones reales con enlaces verificables.",
      tools: ["ChatGPT", "Gemini", "Google Search"]
    },
    quiz: [
      {
        id: 1,
        question: "¿Qué significa 'fecha de corte' en un modelo de IA?",
        options: [
          "La fecha en que el modelo deja de funcionar",
          "El límite hasta donde el modelo tiene conocimiento entrenado",
          "La fecha de vencimiento de la suscripción",
          "El tiempo máximo de una conversación"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "¿Cuál modelo es más adecuado para buscar vuelos y hoteles actuales?",
        options: [
          "ChatGPT porque es más popular",
          "Ambos son igual de efectivos",
          "Gemini por su acceso a información en tiempo real",
          "Ninguno puede hacer esto"
        ],
        correctAnswer: 2
      },
      {
        id: 3,
        question: "¿Por qué la verificación de fuentes es obligatoria al usar IA?",
        options: [
          "Porque las IAs siempre mienten",
          "Porque pueden generar información incorrecta o desactualizada",
          "Porque es un requisito legal",
          "Solo es necesario para temas científicos"
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 3,
    title: "IA Generativa de Imágenes",
    subtitle: "Microsoft Designer y DALL-E 3",
    icon: "🎨",
    duration: "50 min",
    description: "Aprende a crear imágenes profesionales con IA para presentaciones, marketing y contenido visual de alta calidad.",
    content: {
      concept: "Microsoft Designer utiliza DALL-E 3 (vía Bing) para generar imágenes a partir de descripciones textuales. La clave está en ser extremadamente descriptivo con el estilo, iluminación y composición deseada.",
      keyPoints: [
        "DALL-E 3 es accesible gratuitamente a través de Microsoft Designer/Bing",
        "Las descripciones detalladas producen mejores resultados",
        "Incluye: Estilo artístico + Iluminación + Sujeto + Composición + Mood",
        "Ideal para portadas, mockups y material de marketing",
        "Respeta las políticas de uso: no genera rostros de personas reales"
      ],
      practicalExample: "Prompt para portada de curso:\n\n'Ilustración digital profesional de una persona trabajando en una laptop moderna, rodeada de iconos flotantes de inteligencia artificial en tonos azules y cyan. Estilo minimalista corporativo, iluminación suave difusa, fondo gradiente de azul oscuro a claro. Composición centrada, aspecto ratio 16:9, alta resolución, estilo similar a ilustraciones de Stripe o Notion.'",
      tools: ["Microsoft Designer", "Bing Image Creator", "DALL-E 3"]
    },
    quiz: [
      {
        id: 1,
        question: "¿Qué motor de IA utiliza Microsoft Designer para generar imágenes?",
        options: [
          "Midjourney",
          "Stable Diffusion",
          "DALL-E 3",
          "Leonardo AI"
        ],
        correctAnswer: 2
      },
      {
        id: 2,
        question: "¿Qué elementos debe incluir un buen prompt para generar imágenes?",
        options: [
          "Solo el objeto principal",
          "Estilo, iluminación, sujeto, composición y mood",
          "Únicamente el color deseado",
          "El nombre del artista a imitar"
        ],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "¿Para qué uso profesional es ideal la generación de imágenes con IA?",
        options: [
          "Reemplazar fotografías de productos reales",
          "Crear retratos de personas específicas",
          "Portadas, mockups y material de marketing",
          "Documentos legales con firmas"
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 4,
    title: "Presentaciones Automáticas",
    subtitle: "Gamma App",
    icon: "📊",
    duration: "45 min",
    description: "Elimina el síndrome del lienzo en blanco. Crea presentaciones profesionales en minutos usando IA como tu asistente de diseño.",
    content: {
      concept: "Gamma revoluciona la creación de presentaciones: tú aportas las ideas y el contenido, la IA se encarga del diseño y estructura. Tu rol cambia de 'diseñador' a 'editor y curador' de contenido.",
      keyPoints: [
        "Gamma genera presentaciones completas desde un título o notas básicas",
        "Regla 80/20: La IA hace el 80% del trabajo, tú curas el 20% restante",
        "Soporta múltiples formatos: presentaciones, documentos, páginas web",
        "Edición en tiempo real con sugerencias de IA",
        "Exportación a PowerPoint, PDF y enlaces compartibles"
      ],
      practicalExample: "Flujo de trabajo en Gamma:\n\n1. Escribe un título: 'Estrategia Digital 2024 para LoVirtual'\n2. Agrega notas clave: '5 pilares, enfoque en automatización, métricas de éxito'\n3. Gamma genera 10-12 slides con diseño profesional\n4. Tu trabajo: revisar datos, ajustar textos, personalizar con tu marca\n5. Exporta o comparte directamente",
      tools: ["Gamma.app"]
    },
    quiz: [
      {
        id: 1,
        question: "¿Cuál es el concepto principal detrás de Gamma App?",
        options: [
          "Reemplazar completamente a PowerPoint",
          "Eliminar el síndrome del lienzo en blanco con asistencia de IA",
          "Crear solo presentaciones animadas",
          "Diseñar exclusivamente para redes sociales"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "Según la Regla 80/20 en Gamma, ¿cuál es tu rol principal?",
        options: [
          "Diseñar cada slide desde cero",
          "Solo escribir el título",
          "Editar y curar el contenido generado por la IA",
          "Programar las animaciones"
        ],
        correctAnswer: 2
      },
      {
        id: 3,
        question: "¿Qué formatos de exportación soporta Gamma?",
        options: [
          "Solo PDF",
          "Solo enlaces web",
          "PowerPoint, PDF y enlaces compartibles",
          "Únicamente formato propietario de Gamma"
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 5,
    title: "Asistente de Reuniones",
    subtitle: "Fathom y Notion",
    icon: "🎙️",
    duration: "40 min",
    description: "Transforma tus reuniones en acciones concretas. Aprende a usar asistentes de IA que transcriben, resumen y extraen tareas automáticamente.",
    content: {
      concept: "El objetivo no es solo grabar reuniones, sino GESTIONARLAS de manera inteligente. Los asistentes de IA como Fathom extraen automáticamente los puntos de acción, decisiones clave y resúmenes ejecutivos.",
      keyPoints: [
        "Fathom se integra directamente con Zoom y Google Meet",
        "Transcripción automática con identificación de hablantes",
        "Extracción automática de Action Items (tareas pendientes)",
        "Resúmenes ejecutivos generados por IA",
        "Configuración de permisos: los participantes deben ser notificados"
      ],
      practicalExample: "Output típico de Fathom después de una reunión de 1 hora:\n\n📝 Transcripción completa: 15 páginas\n📋 Resumen ejecutivo: 5 bullet points\n✅ Action Items:\n  - Juan: Enviar propuesta revisada (deadline: viernes)\n  - María: Programar demo con cliente\n  - Equipo: Revisar métricas Q3\n🔑 Decisiones clave: 3 acuerdos documentados",
      tools: ["Fathom", "Notion AI", "Zoom", "Google Meet"]
    },
    quiz: [
      {
        id: 1,
        question: "¿Cuál es el objetivo principal de usar asistentes de reuniones con IA?",
        options: [
          "Grabar todo sin permiso de los participantes",
          "Gestionar reuniones y extraer acciones concretas automáticamente",
          "Reemplazar la presencia humana en reuniones",
          "Solo tomar notas básicas"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "¿Qué son los 'Action Items' en el contexto de asistentes de reuniones?",
        options: [
          "Los temas discutidos en la reunión",
          "Las tareas pendientes asignadas a participantes",
          "Los archivos compartidos",
          "Las grabaciones de video"
        ],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "¿Por qué es importante configurar permisos al usar Fathom?",
        options: [
          "Para que la grabación tenga mejor calidad",
          "Porque los participantes deben ser notificados de la grabación",
          "Para reducir el costo del servicio",
          "Solo es necesario en reuniones con más de 10 personas"
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 6,
    title: "Tu Segundo Cerebro",
    subtitle: "NotebookLM y RAG",
    icon: "🧠",
    duration: "55 min",
    description: "Crea un asistente personalizado que SOLO conoce tu información. Aprende sobre RAG (Retrieval-Augmented Generation) y cómo aplicarlo a tus documentos.",
    content: {
      concept: "NotebookLM de Google utiliza tecnología RAG (Grounding) que limita las respuestas de la IA EXCLUSIVAMENTE a la información contenida en TUS documentos. No hay alucinaciones porque no inventa: solo cita lo que existe.",
      keyPoints: [
        "RAG = Retrieval-Augmented Generation (Generación Aumentada por Recuperación)",
        "La IA solo responde basándose en tus documentos subidos",
        "Cada respuesta incluye citas verificables con clic directo a la fuente",
        "Función 'Audio Overview': convierte documentos en podcasts de aprendizaje pasivo",
        "Ideal para manuales corporativos, contratos y bases de conocimiento"
      ],
      practicalExample: "Caso LoVirtual:\n\nSubes: Manual de procedimientos (50 páginas) + Contratos de clientes (10 docs)\n\nPreguntas a NotebookLM:\n'¿Cuál es el procedimiento para solicitar vacaciones?'\n\nRespuesta: 'Según el Manual de Procedimientos (página 23), el empleado debe...' [Clic para ir directamente a la página 23 del PDF]\n\n🎧 Bonus: Genera un podcast de 15 minutos resumiendo todo el manual.",
      tools: ["NotebookLM", "Google AI"]
    },
    quiz: [
      {
        id: 1,
        question: "¿Qué significa RAG en el contexto de NotebookLM?",
        options: [
          "Random Answer Generator",
          "Retrieval-Augmented Generation",
          "Real-time AI Graphics",
          "Rapid Application Gateway"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "¿Cuál es la ventaja principal del 'grounding' en NotebookLM?",
        options: [
          "Respuestas más rápidas",
          "La IA solo responde con información de tus documentos, evitando alucinaciones",
          "Permite generar imágenes",
          "Traduce automáticamente a otros idiomas"
        ],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "¿Qué es la función 'Audio Overview' de NotebookLM?",
        options: [
          "Grabación de reuniones",
          "Conversión de documentos en podcasts de aprendizaje",
          "Lectura robótica de PDFs",
          "Transcripción de audios"
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 7,
    title: "Investigación Profunda",
    subtitle: "Perplexity AI",
    icon: "🔍",
    duration: "45 min",
    description: "Supera las limitaciones de los buscadores tradicionales. Obtén respuestas sintetizadas con fuentes académicas y periodísticas verificables.",
    content: {
      concept: "Perplexity es un motor de RESPUESTAS, no de enlaces. En lugar de darte 10 páginas para revisar, sintetiza la información de múltiples fuentes y te da una respuesta directa con citas verificables [1][2][3].",
      keyPoints: [
        "Motor de respuestas sintetizadas vs. buscador tradicional de enlaces",
        "Cada afirmación tiene citas numeradas verificables [1][2][3]",
        "Copilot integrado para refinar y profundizar búsquedas",
        "Respuestas en formato listo para enviar o presentar",
        "Acceso a fuentes académicas, periodísticas y documentos técnicos"
      ],
      practicalExample: "Pregunta en Perplexity:\n'¿Cuáles son las mejores prácticas para implementar IA en PYMES latinoamericanas?'\n\nRespuesta:\nSegún un estudio del BID [1], las PYMES que implementan IA reportan un aumento del 23% en productividad. McKinsey [2] recomienda comenzar con automatización de procesos repetitivos. La CEPAL [3] destaca que el 67% de empresas exitosas empezaron con chatbots de atención al cliente...\n\n[1] bid.org/estudio-ia-pymes\n[2] mckinsey.com/ai-latam\n[3] cepal.org/transformacion-digital",
      tools: ["Perplexity AI", "Perplexity Copilot"]
    },
    quiz: [
      {
        id: 1,
        question: "¿Cuál es la diferencia principal entre Perplexity y un buscador tradicional?",
        options: [
          "Perplexity es más lento pero más preciso",
          "Perplexity sintetiza respuestas en lugar de dar enlaces",
          "Perplexity solo busca en Wikipedia",
          "No hay diferencia significativa"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "¿Qué representan los números [1][2][3] en las respuestas de Perplexity?",
        options: [
          "Nivel de importancia de la información",
          "Citas numeradas que enlazan a las fuentes verificables",
          "Orden cronológico de los eventos",
          "Puntuación de relevancia"
        ],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "¿Para qué sirve el Copilot integrado en Perplexity?",
        options: [
          "Para traducir las respuestas",
          "Para refinar y profundizar las búsquedas",
          "Para generar imágenes",
          "Para programar recordatorios"
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: 8,
    title: "Programando en Lenguaje Natural",
    subtitle: "Apps Script con IA",
    icon: "⚡",
    duration: "60 min",
    description: "Automatiza Google Sheets, Gmail y Drive sin saber programar. Describe lo que necesitas en español y la IA escribe el código por ti.",
    content: {
      concept: "El nuevo paradigma es: Lógica → Prompt → Ejecución. No necesitas saber sintaxis de JavaScript, solo necesitas describir claramente QUÉ quieres automatizar y la IA genera el código de Apps Script.",
      keyPoints: [
        "Apps Script es el lenguaje de automatización de Google Workspace",
        "Paradigma: describe la lógica en español, la IA escribe el código",
        "Automatiza: Google Sheets, Gmail, Calendar, Drive, Forms",
        "Comprende permisos: qué accesos requiere cada script",
        "Configura Triggers (disparadores): por tiempo, al editar, al abrir"
      ],
      practicalExample: "Prompt a ChatGPT:\n\n'Crea un script de Apps Script que:\n1. Revise la columna B de mi hoja 'Ventas' cada lunes a las 8am\n2. Encuentre celdas con valor mayor a $10,000\n3. Envíe un email a gerencia@lovirtual.com con el resumen de esas ventas\n4. Marque esas filas en color verde'\n\nResultado: Código listo para copiar y pegar en el editor de Apps Script, con instrucciones de cómo configurar el Trigger semanal.",
      tools: ["Google Apps Script", "ChatGPT/Gemini", "Google Sheets", "Gmail"]
    },
    quiz: [
      {
        id: 1,
        question: "¿Cuál es el nuevo paradigma de programación con IA?",
        options: [
          "Código → Compilación → Ejecución",
          "Lógica → Prompt → Ejecución",
          "Diseño → Desarrollo → Pruebas",
          "Planificación → Implementación → Mantenimiento"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "¿Qué son los 'Triggers' en Apps Script?",
        options: [
          "Errores en el código",
          "Disparadores que ejecutan scripts automáticamente",
          "Variables especiales",
          "Comentarios en el código"
        ],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "¿Qué aplicaciones de Google se pueden automatizar con Apps Script?",
        options: [
          "Solo Google Sheets",
          "Solo Gmail y Calendar",
          "Sheets, Gmail, Calendar, Drive, Forms y más",
          "Solo aplicaciones de pago"
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 9,
    title: "Era del Software 2.0",
    subtitle: "Lovable - Introducción",
    icon: "🚀",
    duration: "50 min",
    description: "Bienvenido a la era del Text-to-Software. Tu nuevo rol es ser Product Manager: describes la aplicación y la IA la construye.",
    content: {
      concept: "Lovable representa la democratización del desarrollo de software. Ya no necesitas ser programador para crear aplicaciones web funcionales. Tu rol evoluciona de 'usuario' a 'Product Manager' que describe visualmente lo que necesita.",
      keyPoints: [
        "Text-to-Software: describe tu app y Lovable la construye",
        "Tu rol es de Product Manager, no de programador",
        "Aprende a describir UI visualmente: Navbar, Hero, Grid, Cards, Footer",
        "Diferencia entre el Prompt (lo que describes) y el Preview (lo que ves)",
        "Lovable genera código React real, profesional y desplegable"
      ],
      practicalExample: "Prompt inicial en Lovable:\n\n'Crea una landing page para LoVirtual, una empresa de capacitación corporativa:\n- Navbar con logo a la izquierda y botones Inicio, Cursos, Contacto a la derecha\n- Hero section con título grande 'Transforma tu Equipo', subtítulo y botón CTA azul\n- Grid de 3 cards mostrando nuestros servicios principales\n- Footer con redes sociales y datos de contacto\n- Colores: azul corporativo #01507d, fondo blanco, acentos en #0198CF'",
      tools: ["Lovable.dev"]
    },
    quiz: [
      {
        id: 1,
        question: "¿Qué significa Text-to-Software?",
        options: [
          "Convertir texto en documentos PDF",
          "Describir una aplicación en lenguaje natural y que la IA la construya",
          "Traducir código a diferentes idiomas",
          "Escribir manuales de software"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "¿Cuál es tu rol principal al usar Lovable?",
        options: [
          "Programador",
          "Diseñador gráfico",
          "Product Manager que describe lo que necesita",
          "Administrador de servidores"
        ],
        correctAnswer: 2
      },
      {
        id: 3,
        question: "¿Qué tipo de código genera Lovable?",
        options: [
          "HTML básico únicamente",
          "WordPress templates",
          "Código React real, profesional y desplegable",
          "Solo prototipos sin funcionalidad"
        ],
        correctAnswer: 2
      }
    ]
  },
  {
    id: 10,
    title: "Lógica e Iteración",
    subtitle: "Lovable - Avanzado",
    icon: "🔧",
    duration: "65 min",
    description: "Domina el arte de la iteración. Aprende a corregir errores hablando con la IA y a crear aplicaciones con lógica de negocio real.",
    content: {
      concept: "Nada sale perfecto a la primera, y eso está bien. El poder de Lovable está en la iteración: describes el problema, la IA lo corrige. El debugging se convierte en una conversación natural.",
      keyPoints: [
        "Iteración: el proceso de mejora continua mediante conversación",
        "Debugging conversacional: 'El botón no suma' → la IA entiende y corrige",
        "Persistencia de datos: almacenar información entre sesiones",
        "Lógica condicional: si X entonces Y",
        "Validaciones: asegurar que los datos ingresados sean correctos"
      ],
      practicalExample: "Caso Práctico - Calculadora de Nómina LoVirtual:\n\nIteración 1: 'Crea una calculadora de nómina con campos para salario base y horas extra'\n\nIteración 2: 'El botón calcular no funciona, muestra NaN' → IA corrige\n\nIteración 3: 'Agrega validación: las horas extra no pueden ser negativas'\n\nIteración 4: 'Si el empleado tiene más de 5 años, aplica bono de antigüedad del 3%'\n\nIteración 5: 'Guarda el historial de cálculos en una tabla debajo'\n\nResultado: Aplicación funcional con lógica de negocio real.",
      tools: ["Lovable.dev"]
    },
    quiz: [
      {
        id: 1,
        question: "¿Qué significa 'iterar' en el contexto de desarrollo con IA?",
        options: [
          "Copiar el código a otro proyecto",
          "Proceso de mejora continua mediante conversación con la IA",
          "Eliminar el proyecto y empezar de nuevo",
          "Exportar la aplicación"
        ],
        correctAnswer: 1
      },
      {
        id: 2,
        question: "¿Cómo se hace 'debugging' en Lovable?",
        options: [
          "Revisando línea por línea el código",
          "Describiendo el problema en lenguaje natural a la IA",
          "Contratando un programador",
          "Reiniciando el navegador"
        ],
        correctAnswer: 1
      },
      {
        id: 3,
        question: "¿Qué significa 'persistencia de datos' en una aplicación?",
        options: [
          "Que la aplicación carga muy rápido",
          "Que los datos se guardan y mantienen entre sesiones",
          "Que no se pueden borrar archivos",
          "Que la aplicación funciona sin internet"
        ],
        correctAnswer: 1
      }
    ]
  }
];

export const finalExamQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "La fórmula del prompt perfecto es:",
    options: [
      "Pregunta + Respuesta",
      "Rol + Contexto + Tarea + Formato",
      "Título + Cuerpo + Firma",
      "Input + Output"
    ],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "¿Qué modelo de IA es mejor para buscar información en tiempo real como vuelos?",
    options: [
      "ChatGPT básico",
      "DALL-E",
      "Gemini con Google Search",
      "Midjourney"
    ],
    correctAnswer: 2
  },
  {
    id: 3,
    question: "Microsoft Designer utiliza qué motor de generación de imágenes:",
    options: [
      "Stable Diffusion",
      "Midjourney",
      "DALL-E 3",
      "Leonardo AI"
    ],
    correctAnswer: 2
  },
  {
    id: 4,
    question: "En Gamma App, tu rol principal es:",
    options: [
      "Diseñar cada slide manualmente",
      "Programar las animaciones",
      "Editar y curar el contenido generado por la IA",
      "Solo escribir títulos"
    ],
    correctAnswer: 2
  },
  {
    id: 5,
    question: "Los 'Action Items' en Fathom son:",
    options: [
      "Grabaciones de video",
      "Tareas pendientes extraídas automáticamente",
      "Archivos compartidos",
      "Plantillas de reunión"
    ],
    correctAnswer: 1
  },
  {
    id: 6,
    question: "¿Qué tecnología usa NotebookLM para evitar alucinaciones?",
    options: [
      "Machine Learning básico",
      "RAG (Retrieval-Augmented Generation)",
      "Blockchain",
      "Realidad Virtual"
    ],
    correctAnswer: 1
  },
  {
    id: 7,
    question: "Las citas [1][2][3] en Perplexity representan:",
    options: [
      "Nivel de importancia",
      "Fuentes verificables enlazadas",
      "Número de palabras",
      "Fecha de publicación"
    ],
    correctAnswer: 1
  },
  {
    id: 8,
    question: "Los Triggers en Apps Script son:",
    options: [
      "Errores de código",
      "Disparadores automáticos de scripts",
      "Variables globales",
      "Funciones matemáticas"
    ],
    correctAnswer: 1
  },
  {
    id: 9,
    question: "En Lovable, tu rol principal es:",
    options: [
      "Programador frontend",
      "Diseñador UX/UI",
      "Product Manager que describe requerimientos",
      "Administrador de base de datos"
    ],
    correctAnswer: 2
  },
  {
    id: 10,
    question: "El debugging en Lovable se hace mediante:",
    options: [
      "Revisión de código línea por línea",
      "Conversación en lenguaje natural con la IA",
      "Herramientas de desarrollo del navegador únicamente",
      "Contactando soporte técnico"
    ],
    correctAnswer: 1
  }
];
