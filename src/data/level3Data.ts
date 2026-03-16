export interface Level3Module {
  id: number;
  title: string;
  duration: string;
  description: string;
  instructions: string[];
  acceptedFormats: string;
}

const STANDARD_FORMATS = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.mp3,.wav,.mp4,.mov,.zip,.rar";

export const level3Modules: Level3Module[] = [
  {
    id: 201,
    title: "Módulo 1: Redacción Estratégica de Contenido",
    duration: "60 min",
    description: "Usa herramientas de IA para crear contenido estratégico de alta calidad para redes sociales, blogs o email marketing.",
    instructions: [
      "Elige una marca real o ficticia y define su tono de comunicación.",
      "Usa una herramienta de IA para generar al menos 5 piezas de contenido (posts, emails, artículos).",
      "Edita y refina el contenido generado para que sea publicable.",
      "Sube un documento PDF o Word con el contenido final y una breve reflexión sobre el proceso.",
    ],
    acceptedFormats: STANDARD_FORMATS,
  },
  {
    id: 202,
    title: "Módulo 2: Generación de Imágenes para Marcas",
    duration: "60 min",
    description: "Crea un set de imágenes profesionales usando herramientas de IA generativa de imágenes.",
    instructions: [
      "Define un brief creativo para una marca (logo, banner, publicación).",
      "Genera al menos 4 imágenes usando herramientas como DALL-E, Midjourney o similares.",
      "Documenta los prompts utilizados y por qué elegiste cada uno.",
      "Sube un archivo ZIP o PDF con las imágenes finales y los prompts.",
    ],
    acceptedFormats: STANDARD_FORMATS,
  },
  {
    id: 203,
    title: "Módulo 3: Transcripción y Minutas de Reuniones",
    duration: "45 min",
    description: "Transcribe una reunión o audio y genera una minuta ejecutiva con puntos clave y acciones.",
    instructions: [
      "Graba o utiliza un audio de ejemplo de una reunión (mínimo 5 minutos).",
      "Usa una herramienta de IA para transcribir el audio.",
      "Genera una minuta ejecutiva con: resumen, puntos clave, acuerdos y próximos pasos.",
      "Sube el documento final (PDF o Word) y opcionalmente el audio original.",
    ],
    acceptedFormats: STANDARD_FORMATS,
  },
  {
    id: 204,
    title: "Módulo 4: Análisis y Limpieza de Datos",
    duration: "60 min",
    description: "Utiliza IA para limpiar, analizar y visualizar un conjunto de datos reales o simulados.",
    instructions: [
      "Descarga o crea un dataset con al menos 100 registros (puede ser de ventas, clientes, inventario).",
      "Usa herramientas de IA para limpiar datos duplicados, vacíos o erróneos.",
      "Genera al menos 3 visualizaciones o insights a partir de los datos limpios.",
      "Sube un archivo Excel con los datos procesados y un PDF con las conclusiones.",
    ],
    acceptedFormats: STANDARD_FORMATS,
  },
  {
    id: 205,
    title: "Módulo 5: Creación de Presentaciones de Impacto",
    duration: "45 min",
    description: "Diseña una presentación profesional usando herramientas de IA para estructura, contenido y diseño.",
    instructions: [
      "Elige un tema de negocio relevante (pitch de ventas, reporte trimestral, propuesta).",
      "Usa IA para generar la estructura, el contenido de cada diapositiva y sugerencias de diseño.",
      "Crea la presentación final con al menos 10 diapositivas.",
      "Sube la presentación en formato PDF o el archivo comprimido.",
    ],
    acceptedFormats: STANDARD_FORMATS,
  },
  {
    id: 206,
    title: "Módulo 6: Locución Corporativa (Texto a Voz)",
    duration: "45 min",
    description: "Genera audio profesional a partir de texto usando herramientas de Text-to-Speech con IA.",
    instructions: [
      "Escribe un guión corporativo de al menos 2 minutos (bienvenida, tutorial, anuncio).",
      "Usa una herramienta de TTS para generar el audio con voz natural.",
      "Exporta el audio en formato MP3.",
      "Sube el guión (PDF/Word) y el audio (MP3) en un archivo ZIP.",
    ],
    acceptedFormats: STANDARD_FORMATS,
  },
  {
    id: 207,
    title: "Módulo 7: Edición de Video Automatizada",
    duration: "60 min",
    description: "Crea o edita un video corto usando herramientas de IA para edición automática.",
    instructions: [
      "Graba o selecciona clips de video en bruto (mínimo 1 minuto total).",
      "Usa herramientas de IA para editar: cortes automáticos, subtítulos, transiciones.",
      "Exporta un video final de máximo 3 minutos.",
      "Sube el video final (MP4) o un ZIP con el video y una descripción del proceso.",
    ],
    acceptedFormats: STANDARD_FORMATS,
  },
  {
    id: 208,
    title: "Módulo 8: Investigación Rápida de Mercado",
    duration: "60 min",
    description: "Realiza una investigación de mercado express usando IA para recopilar y sintetizar información.",
    instructions: [
      "Elige un nicho de mercado o industria para investigar.",
      "Usa IA para identificar: competidores, tendencias, audiencia objetivo y oportunidades.",
      "Crea un reporte ejecutivo de máximo 5 páginas con hallazgos y recomendaciones.",
      "Sube el reporte en formato PDF.",
    ],
    acceptedFormats: STANDARD_FORMATS,
  },
  {
    id: 209,
    title: "Módulo 9: Prompt Engineering (Chatbots)",
    duration: "60 min",
    description: "Diseña un chatbot funcional con un system prompt detallado y pruebas documentadas.",
    instructions: [
      "Define el caso de uso del chatbot (atención al cliente, ventas, soporte técnico).",
      "Escribe un system prompt completo con: personalidad, reglas, límites y ejemplos.",
      "Documenta al menos 10 conversaciones de prueba con diferentes escenarios.",
      "Sube un PDF con el system prompt, las conversaciones y un análisis de mejoras.",
    ],
    acceptedFormats: STANDARD_FORMATS,
  },
  {
    id: 210,
    title: "Módulo 10: Proyecto Final (Flujo Integrado)",
    duration: "90 min",
    description: "Integra todas las habilidades aprendidas en un proyecto final que demuestre dominio práctico de IA.",
    instructions: [
      "Elige un proyecto que combine al menos 3 de las habilidades de los módulos anteriores.",
      "Desarrolla el proyecto completo documentando cada herramienta y técnica utilizada.",
      "Incluye: objetivos, proceso, resultados y reflexión sobre el aprendizaje.",
      "Sube un archivo ZIP con todos los entregables y un PDF resumen del proyecto.",
    ],
    acceptedFormats: STANDARD_FORMATS,
  },
];
