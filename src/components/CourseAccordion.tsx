import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CheckCircle, Lock, Play, Clock } from 'lucide-react';

interface ModuleLesson {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  status: 'unlocked' | 'locked';
  lessons: string[];
}

const accordionModules: ModuleLesson[] = [
  {
    id: 1,
    title: "Módulo 1: El Arte del Prompt",
    subtitle: "De buscador a razonador",
    duration: "45 min",
    status: "unlocked",
    lessons: [
      "Anatomía del Prompt Perfecto: Fórmula de Rol + Contexto + Tarea + Formato.",
      "Técnicas de Razonamiento: Zero-shot, Few-shot y Chain of Thought (Cadena de pensamiento).",
      "Ingeniería Inversa: Cómo pedirle a la IA que cree el prompt ideal para ti.",
      "Ejercicio Práctico: Refinando un prompt básico hasta obtener un resultado profesional.",
    ],
  },
  {
    id: 2,
    title: "Módulo 2: Limitaciones y Real Time",
    subtitle: "ChatGPT vs Gemini",
    duration: "40 min",
    status: "locked",
    lessons: [
      "El gran problema de la IA: Alucinaciones y cómo detectarlas.",
      "Ventanas de Contexto: Entendiendo la 'memoria' a corto y largo plazo de la IA.",
      "Navegación en Tiempo Real: Búsqueda web integrada vs. bases de conocimiento.",
      "Modo Voz (Voice Mode): Entrenando la fluidez comunicativa con IA en tiempo real.",
    ],
  },
  {
    id: 3,
    title: "Módulo 3: IA Generativa de Imágenes",
    subtitle: "Microsoft Designer y DALL-E 3",
    duration: "50 min",
    status: "locked",
    lessons: [
      "El lenguaje visual: Cómo describir estilos, iluminación, ángulos y texturas.",
      "Microsoft Designer: Creación rápida de assets para redes sociales y presentaciones.",
      "DALL-E 3 dentro de ChatGPT: Mantenimiento de coherencia de personajes y estilos.",
      "Ética y Derechos de Autor: Qué puedes hacer y qué no con imágenes de IA.",
    ],
  },
  {
    id: 4,
    title: "Módulo 4: Presentaciones Automáticas",
    subtitle: "Gamma App",
    duration: "45 min",
    status: "locked",
    lessons: [
      "Estructuración desde el prompt: Cómo pedir un 'outline' antes de diseñar.",
      "Personalización y Branding: Adaptando colores y tipografías a tu marca.",
      "Edición iterativa: Modificando diapositivas específicas con comandos de texto.",
      "Exportación y métricas: Presentar desde la web o llevarlo a PDF/PPT.",
    ],
  },
  {
    id: 5,
    title: "Módulo 5: Asistente de Reuniones",
    subtitle: "Fathom y Notion",
    duration: "40 min",
    status: "locked",
    lessons: [
      "Configuración de Fathom: Integración con Zoom, Meet y Teams.",
      "Transcripción y Resúmenes: Extracción automática de Action Items (Tareas).",
      "Creación del Tracker en Notion: Diseñando una base de datos para minutas.",
      "Automatización: Cómo mandar el resumen a Notion sin fricción.",
    ],
  },
  {
    id: 6,
    title: "Módulo 6: Tu Segundo Cerebro",
    subtitle: "NotebookLM y RAG",
    duration: "55 min",
    status: "locked",
    lessons: [
      "¿Qué es RAG?: Generación Aumentada por Recuperación en términos simples.",
      "Alimentando a NotebookLM: Mejores prácticas para subir PDFs y documentos.",
      "Interacción con fuentes: Citaciones automáticas y cruce de información.",
      "Audio Overview: Generando debates en audio a partir de tus documentos.",
    ],
  },
  {
    id: 7,
    title: "Módulo 7: Investigación Profunda",
    subtitle: "Perplexity AI",
    duration: "45 min",
    status: "locked",
    lessons: [
      "Más allá de Google: Motor de búsqueda vs. un motor de respuestas.",
      "Uso de 'Colecciones' e 'Hilos': Organizando tu investigación por proyectos.",
      "Pro Search y Filtros: Búsqueda académica, YouTube y análisis financiero.",
      "Verificación de Fuentes: Cómo evitar sesgos leyendo referencias.",
    ],
  },
  {
    id: 8,
    title: "Módulo 8: Programando en Lenguaje Natural",
    subtitle: "Apps Script con IA",
    duration: "60 min",
    status: "locked",
    lessons: [
      "Conceptos Básicos de Lógica: Variable, función y bucle (sin saber código).",
      "Automatización con Google Sheets y Gmail: Macros dictadas por IA.",
      "El flujo de trabajo: Copiar, pegar, probar y pedirle a la IA que arregle errores.",
      "Proyecto Práctico: Envío masivo de correos leyendo datos de una celda.",
    ],
  },
  {
    id: 9,
    title: "Módulo 9: Era del Software 2.0",
    subtitle: "Lovable - Introducción",
    duration: "50 min",
    status: "locked",
    lessons: [
      "De la idea a la interfaz: Cómo describir una aplicación web (UI/UX).",
      "Arquitectura Básica: Componentes, colores y estructura sin tocar código.",
      "Primeros pasos en Lovable: Prompt inicial y entendimiento del entorno.",
      "Iteración visual: Corrigiendo márgenes, botones y textos hablando con el chat.",
    ],
  },
  {
    id: 10,
    title: "Módulo 10: Lógica e Iteración",
    subtitle: "Lovable - Avanzado",
    duration: "65 min",
    status: "locked",
    lessons: [
      "Simulando Bases de Datos: Crear datos de prueba (Mock JSON).",
      "Estado y Dinamismo: Haciendo que los botones funcionen.",
      "Interfaces complejas: Creando Dashboards de administración.",
      "Resolución de conflictos: Qué hacer cuando la IA 'rompe' la página.",
    ],
  },
];

interface CourseAccordionProps {
  completedModules: number[];
  quizScores: Record<number, number>;
}

const CourseAccordion: React.FC<CourseAccordionProps> = ({ completedModules, quizScores }) => {
  const navigate = useNavigate();

  const getModuleStatus = (mod: ModuleLesson): 'completed' | 'available' | 'locked' => {
    if (completedModules.includes(mod.id)) return 'completed';
    if (mod.id === 1 || completedModules.includes(mod.id - 1)) return 'available';
    return 'locked';
  };

  return (
    <Accordion type="single" collapsible className="space-y-3">
      {accordionModules.map((mod) => {
        const status = getModuleStatus(mod);
        const score = quizScores[mod.id];
        const isLocked = status === 'locked';

        return (
          <AccordionItem
            key={mod.id}
            value={`module-${mod.id}`}
            className={`rounded-xl border border-border bg-card overflow-hidden transition-opacity ${
              isLocked ? 'opacity-50' : ''
            }`}
            disabled={isLocked}
          >
            <AccordionTrigger
              className={`px-5 py-4 hover:no-underline ${isLocked ? 'cursor-not-allowed' : ''}`}
              disabled={isLocked}
            >
              <div className="flex items-center justify-between w-full mr-4">
                <div className="flex items-center gap-4 text-left">
                  {/* Status icon */}
                  <div className="flex-shrink-0">
                    {status === 'completed' ? (
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-success" />
                      </div>
                    ) : status === 'locked' ? (
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full lovirtual-gradient-bg flex items-center justify-center">
                        <Play className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Title & subtitle */}
                  <div>
                    <h4 className="font-semibold text-foreground text-base">{mod.title}</h4>
                    <p className="text-sm text-muted-foreground">{mod.subtitle}</p>
                  </div>
                </div>

                {/* Right side: duration + score/button */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-muted-foreground flex items-center gap-1 hidden sm:flex">
                    <Clock className="w-3 h-3" />
                    {mod.duration}
                  </span>
                  {status === 'completed' && score !== undefined && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      {score}%
                    </span>
                  )}
                  {status === 'locked' && (
                    <span className="text-xs text-muted-foreground font-medium hidden sm:block">Bloqueado</span>
                  )}
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-5 pb-5">
              {isLocked ? (
                <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 border border-border">
                  <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Completa el módulo anterior para desbloquear estas lecciones.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h5 className="text-sm font-semibold text-foreground uppercase tracking-wider">
                    Temario
                  </h5>
                  <ul className="space-y-2.5">
                    {mod.lessons.map((lesson, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground leading-relaxed">{lesson}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      onClick={() => navigate(`/module/${mod.id}`)}
                      className={status === 'completed' ? '' : 'lovirtual-gradient-bg text-white'}
                      variant={status === 'completed' ? 'outline' : 'default'}
                    >
                      {status === 'completed' ? 'Revisar módulo' : 'Comenzar módulo'}
                    </Button>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default CourseAccordion;
