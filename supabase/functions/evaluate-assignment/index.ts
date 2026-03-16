import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as pdfjsLib from "https://esm.sh/pdfjs-dist@4.0.379/build/pdf.mjs";
import { unzipSync } from "https://esm.sh/fflate@0.8.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODULE_CONTEXT: Record<number, string> = {
  201: "Redacción Estratégica de Contenido: El estudiante debía usar IA para crear al menos 5 piezas de contenido (posts, emails, artículos) para una marca, editarlas y entregar un PDF/Word con el contenido final y una reflexión.",
  202: "Generación de Imágenes para Marcas: El estudiante debía crear un brief creativo, generar al menos 4 imágenes con IA (DALL-E, Midjourney), documentar los prompts y entregar un ZIP/PDF.",
  203: "Transcripción y Minutas de Reuniones: El estudiante debía transcribir un audio de reunión (mín. 5 min) con IA y generar una minuta ejecutiva con resumen, puntos clave, acuerdos y próximos pasos.",
  204: "Análisis y Limpieza de Datos: El estudiante debía limpiar un dataset de 100+ registros con IA, generar 3+ visualizaciones/insights y entregar un Excel con datos procesados y PDF con conclusiones.",
  205: "Creación de Presentaciones de Impacto: El estudiante debía crear una presentación de 10+ diapositivas usando IA para estructura, contenido y diseño sobre un tema de negocio.",
  206: "Locución Corporativa (Texto a Voz): El estudiante debía escribir un guión de 2+ min, generar audio con TTS de IA y entregar el guión y audio en ZIP.",
  207: "Edición de Video Automatizada: El estudiante debía editar clips de video con IA (cortes, subtítulos, transiciones) y exportar un video final de máx. 3 minutos.",
  208: "Investigación Rápida de Mercado: El estudiante debía investigar un nicho usando IA, identificar competidores, tendencias y oportunidades, y crear un reporte ejecutivo de máx. 5 páginas.",
  209: "Prompt Engineering (Chatbots): El estudiante debía diseñar un chatbot con system prompt completo, documentar 10+ conversaciones de prueba y analizar mejoras.",
  210: "Proyecto Final Integrado: El estudiante debía crear un proyecto combinando 3+ habilidades de módulos anteriores, documentando herramientas, objetivos, proceso, resultados y reflexión.",
};

const IMAGE_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "gif"]);
const IMAGE_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

/** Extract text from a PDF ArrayBuffer using pdf.js */
async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  try {
    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    const pages: string[] = [];
    const maxPages = Math.min(doc.numPages, 20);
    for (let i = 1; i <= maxPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((item: any) => item.str).join(" ");
      pages.push(text);
    }
    return pages.join("\n\n");
  } catch (e) {
    console.error("PDF extraction error:", e);
    return "";
  }
}

function getFileExtension(name: string): string {
  return (name.split(".").pop() || "").toLowerCase();
}

/** Extract contents from a ZIP buffer. Returns text snippets and base64-encoded images. */
function extractZipContents(buffer: ArrayBuffer): {
  textSnippets: string[];
  images: { media_type: string; data: string; name: string }[];
  fileList: string[];
} {
  const textSnippets: string[] = [];
  const images: { media_type: string; data: string; name: string }[] = [];
  const fileList: string[] = [];

  try {
    const unzipped = unzipSync(new Uint8Array(buffer));

    for (const [filename, fileData] of Object.entries(unzipped)) {
      // Skip directories and hidden/system files
      if (filename.endsWith("/") || filename.startsWith("__MACOSX") || filename.startsWith(".")) continue;
      fileList.push(filename);

      const ext = getFileExtension(filename);

      if (IMAGE_EXTENSIONS.has(ext) && images.length < 10) {
        // Convert image to base64 for Claude vision
        const base64 = btoa(String.fromCharCode(...fileData));
        images.push({
          media_type: IMAGE_MIME[ext] || "image/png",
          data: base64,
          name: filename,
        });
      } else if (["txt", "md", "csv"].includes(ext)) {
        const text = new TextDecoder().decode(fileData);
        textSnippets.push(`--- ${filename} ---\n${text.substring(0, 2000)}`);
      } else if (ext === "pdf") {
        // We can't easily parse PDF inside ZIP synchronously, note it
        textSnippets.push(`[Archivo PDF encontrado dentro del ZIP: ${filename}]`);
      }
    }
  } catch (e) {
    console.error("ZIP extraction error:", e);
    return { textSnippets: ["[ERROR: No se pudo descomprimir el archivo ZIP. El archivo puede estar corrupto.]"], images: [], fileList: [] };
  }

  return { textSnippets, images, fileList };
}

/** Convert raw image bytes to base64 for Claude */
function imageToBase64(buffer: ArrayBuffer, ext: string): { media_type: string; data: string } | null {
  try {
    const data = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    return { media_type: IMAGE_MIME[ext] || "image/png", data };
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY no configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { assignmentId } = await req.json();

    if (!assignmentId) {
      return new Response(
        JSON.stringify({ error: "assignmentId requerido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: assignment, error: fetchErr } = await supabase
      .from("assignments")
      .select("*")
      .eq("id", assignmentId)
      .single();

    if (fetchErr || !assignment) {
      return new Response(
        JSON.stringify({ error: "Entrega no encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const moduleId = assignment.module_id as number;
    const moduleContext = MODULE_CONTEXT[moduleId] || `Módulo ${moduleId} del Nivel 3 de LoVirtual Academy.`;

    // Download file
    let fileContentSnippet = "";
    let extractedImages: { media_type: string; data: string; name: string }[] = [];
    let contentExtractionFailed = false;
    const ext = getFileExtension(assignment.file_name as string);

    try {
      const { data: fileData } = await supabase.storage
        .from("assignments")
        .download(assignment.file_path as string);

      if (fileData) {
        if (ext === "zip") {
          // ZIP: extract contents including images
          const buffer = await fileData.arrayBuffer();
          const { textSnippets, images, fileList } = extractZipContents(buffer);
          extractedImages = images;

          if (textSnippets.length === 0 && images.length === 0 && fileList.length === 0) {
            contentExtractionFailed = true;
            fileContentSnippet = "[ERROR: El archivo ZIP está vacío o no se pudo descomprimir.]";
          } else {
            fileContentSnippet = `ARCHIVOS EN EL ZIP (${fileList.length} archivos):\n${fileList.join("\n")}\n\n`;
            if (textSnippets.length > 0) {
              fileContentSnippet += `CONTENIDO DE TEXTO EXTRAÍDO:\n${textSnippets.join("\n\n").substring(0, 4000)}`;
            }
            if (images.length > 0) {
              fileContentSnippet += `\n\n[${images.length} imagen(es) extraída(s) del ZIP y enviadas para evaluación visual]`;
            }
            if (images.length === 0 && textSnippets.every(t => t.includes("ERROR"))) {
              contentExtractionFailed = true;
            }
          }
        } else if (ext === "pdf") {
          const buffer = await fileData.arrayBuffer();
          const extracted = await extractPdfText(buffer);
          if (extracted.trim().length === 0) {
            fileContentSnippet = "[No se pudo extraer texto del PDF. Puede ser un PDF escaneado o basado en imágenes.]";
            contentExtractionFailed = true;
          } else {
            fileContentSnippet = extracted.substring(0, 4000);
          }
        } else if (["txt", "md", "csv"].includes(ext)) {
          const text = await fileData.text();
          fileContentSnippet = text.substring(0, 4000);
        } else if (IMAGE_EXTENSIONS.has(ext)) {
          // Direct image upload — send as vision
          const buffer = await fileData.arrayBuffer();
          const img = imageToBase64(buffer, ext);
          if (img) {
            extractedImages.push({ ...img, name: assignment.file_name as string });
            fileContentSnippet = "[Imagen enviada para evaluación visual]";
          } else {
            contentExtractionFailed = true;
            fileContentSnippet = "[ERROR: No se pudo procesar la imagen.]";
          }
        } else if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext)) {
          fileContentSnippet = `[Archivo Office .${ext} recibido — evaluación basada en metadatos y contexto del módulo]`;
        } else {
          fileContentSnippet = `[Archivo .${ext} recibido — tipo binario/multimedia, NO se pudo leer el contenido]`;
          contentExtractionFailed = true;
        }
      } else {
        contentExtractionFailed = true;
        fileContentSnippet = "[ERROR: No se pudo descargar el archivo del almacenamiento.]";
      }
    } catch (e) {
      contentExtractionFailed = true;
      fileContentSnippet = `[ERROR: Fallo técnico al procesar el archivo: ${e instanceof Error ? e.message : "error desconocido"}]`;
    }

    // Fetch student name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", assignment.user_id)
      .single();

    const studentName = profile?.full_name || "Estudiante";

    const systemPrompt = `Eres el evaluador académico ESTRICTO de la Academia LoVirtual. Debes calificar entregables prácticos del Nivel 3.

REGLA CRÍTICA DE EVALUACIÓN:
Si por CUALQUIER razón técnica NO pudiste leer, ver o acceder al contenido real del archivo (ej: no se pudo descomprimir un ZIP, el archivo está corrupto, faltan las imágenes requeridas, el contenido extraído está vacío, o el formato no permite leer el contenido), ESTÁ ESTRICTAMENTE PROHIBIDO dar una nota aprobatoria (>= 7). En ese caso DEBES:
- Dar una calificación de 1/10
- Explicar claramente en el feedback qué problema técnico hubo
- Indicar al estudiante que vuelva a subir el archivo en un formato legible

Solo da notas aprobatorias (7-10) cuando hayas podido VERIFICAR y EVALUAR el contenido real del entregable.`;

    const userPrompt = `CONTEXTO DEL MÓDULO:
${moduleContext}

DATOS DE LA ENTREGA:
- Estudiante: ${studentName}
- Archivo: ${assignment.file_name}
- Formato: .${ext}
- Tamaño: ${Math.round((assignment.file_size as number) / 1024)} KB
- Fecha de envío: ${assignment.created_at}
- ¿Se pudo extraer contenido?: ${contentExtractionFailed ? "NO — hubo problemas técnicos" : "SÍ"}
${fileContentSnippet ? `\nCONTENIDO EXTRAÍDO DEL DOCUMENTO:\n${fileContentSnippet}` : "\n[No se pudo extraer contenido del archivo]"}

CRITERIOS DE EVALUACIÓN:
1. Cumplimiento de instrucciones (¿entregó lo solicitado?)
2. Uso efectivo de herramientas de IA
3. Calidad del resultado final
4. Documentación y reflexión del proceso
5. Formato y presentación profesional

INSTRUCCIONES:
- Asigna una calificación del 1 al 10 (7+ es aprobatorio)
- Proporciona feedback constructivo en español (máx 3 oraciones)
- RECUERDA: Si NO pudiste ver/leer el contenido real, la nota DEBE ser 1/10
- Si hay imágenes adjuntas, evalúalas visualmente con rigor

Responde ÚNICAMENTE con este JSON (sin markdown):
{
  "grade": <número del 1 al 10>,
  "feedback": "<feedback constructivo en español>"
}`;

    // Build Claude messages with multimodal support
    const contentParts: any[] = [{ type: "text", text: userPrompt }];

    // Add images for vision evaluation (max 10 images, each max ~5MB base64)
    for (const img of extractedImages.slice(0, 10)) {
      contentParts.push({
        type: "image",
        source: {
          type: "base64",
          media_type: img.media_type,
          data: img.data,
        },
      });
      contentParts.push({
        type: "text",
        text: `[Imagen: ${img.name}]`,
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: systemPrompt,
        messages: [{ role: "user", content: contentParts }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error: ${errText}`);
    }

    const claudeRes = await response.json();
    const rawContent = claudeRes.content[0].text.trim();

    let evaluation: { grade: number; feedback: string };
    try {
      evaluation = JSON.parse(rawContent);
    } catch {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        // If content extraction failed, default to failing grade
        evaluation = contentExtractionFailed
          ? { grade: 1, feedback: "No se pudo procesar tu archivo. Por favor, vuelve a subirlo en un formato compatible (PDF, imágenes, o ZIP con archivos legibles)." }
          : { grade: 7, feedback: "Entrega recibida correctamente. Buen trabajo con las herramientas de IA." };
      }
    }

    evaluation.grade = Math.max(1, Math.min(10, Math.round(evaluation.grade)));

    // Enforce: if extraction failed, cap grade at max 1
    if (contentExtractionFailed && evaluation.grade >= 7) {
      evaluation.grade = 1;
      evaluation.feedback = "No se pudo verificar el contenido de tu archivo. Por favor, vuelve a subirlo en un formato legible (PDF con texto, imágenes PNG/JPG, o ZIP con archivos válidos). " + evaluation.feedback;
    }

    const { error: updateErr } = await supabase
      .from("assignments")
      .update({
        grade: evaluation.grade,
        feedback: evaluation.feedback,
        status: "graded",
      })
      .eq("id", assignmentId);

    if (updateErr) throw new Error(`DB update error: ${updateErr.message}`);

    // Check if all 10 Level 3 modules are graded and passed
    const { data: allAssignments } = await supabase
      .from("assignments")
      .select("module_id, grade, status")
      .eq("user_id", assignment.user_id)
      .gte("module_id", 201)
      .lte("module_id", 210)
      .eq("status", "graded");

    let totalScore: number | null = null;
    let averageGrade: number | null = null;
    let certificateEligible = false;

    if (allAssignments && allAssignments.length === 10) {
      const allPassed = allAssignments.every((a) => (a.grade || 0) >= 7);
      if (allPassed) {
        const total = allAssignments.reduce((sum, a) => sum + (a.grade || 0), 0);
        totalScore = total;
        averageGrade = Math.round((total / 10) * 10) / 10;
        certificateEligible = true;

        await supabase
          .from("student_progress")
          .update({
            final_exam_score: totalScore,
            certificate_generated: false,
          })
          .eq("user_id", assignment.user_id);
      }
    }

    return new Response(
      JSON.stringify({
        grade: evaluation.grade,
        feedback: evaluation.feedback,
        allGraded: allAssignments?.length === 10,
        totalScore,
        averageGrade,
        certificateEligible,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("evaluate-assignment error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
