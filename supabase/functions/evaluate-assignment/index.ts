import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as pdfjsLib from "https://esm.sh/pdfjs-dist@4.0.379/build/pdf.mjs";

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

/** Extract text from a PDF ArrayBuffer using pdf.js */
async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  try {
    const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    const pages: string[] = [];
    const maxPages = Math.min(doc.numPages, 20); // limit to 20 pages
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

    // Extract file content based on format
    let fileContentSnippet = "";
    const ext = (assignment.file_name as string).split(".").pop()?.toLowerCase() || "";

    try {
      const { data: fileData } = await supabase.storage
        .from("assignments")
        .download(assignment.file_path as string);

      if (fileData) {
        if (ext === "pdf") {
          const buffer = await fileData.arrayBuffer();
          const extracted = await extractPdfText(buffer);
          fileContentSnippet = extracted.substring(0, 4000);
        } else if (["txt", "md", "csv"].includes(ext)) {
          const text = await fileData.text();
          fileContentSnippet = text.substring(0, 4000);
        } else if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext)) {
          // Binary Office formats — provide metadata-only evaluation
          fileContentSnippet = `[Archivo Office .${ext} recibido — evaluación basada en metadatos y contexto del módulo]`;
        } else {
          fileContentSnippet = `[Archivo .${ext} recibido — tipo binario/multimedia, evaluación basada en metadatos]`;
        }
      }
    } catch {
      // Can't read file, proceed with metadata only
    }

    // Fetch student name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", assignment.user_id)
      .single();

    const studentName = profile?.full_name || "Estudiante";

    const prompt = `Eres el evaluador académico de la Academia LoVirtual. Debes calificar el entregable práctico de un estudiante del Nivel 3: Dominio Práctico y Creación de Entregables con IA.

CONTEXTO DEL MÓDULO:
${moduleContext}

DATOS DE LA ENTREGA:
- Estudiante: ${studentName}
- Archivo: ${assignment.file_name}
- Formato: .${ext}
- Tamaño: ${Math.round((assignment.file_size as number) / 1024)} KB
- Fecha de envío: ${assignment.created_at}
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
- Sé justo pero alentador
- Si el contenido extraído es relevante para el módulo, evalúa con base en la calidad del texto
- Si no se pudo extraer contenido (archivo binario/multimedia), evalúa favorablemente si el formato y tamaño son coherentes con la tarea
- Si el formato del archivo no coincide con lo esperado, refleja eso en la nota

Responde ÚNICAMENTE con este JSON (sin markdown):
{
  "grade": <número del 1 al 10>,
  "feedback": "<feedback constructivo en español>"
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
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
      evaluation = jsonMatch
        ? JSON.parse(jsonMatch[0])
        : { grade: 7, feedback: "Entrega recibida correctamente. Buen trabajo con las herramientas de IA." };
    }

    evaluation.grade = Math.max(1, Math.min(10, Math.round(evaluation.grade)));

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

    let averageGrade: number | null = null;
    let certificateEligible = false;

    if (allAssignments && allAssignments.length === 10) {
      const allPassed = allAssignments.every((a) => (a.grade || 0) >= 7);
      if (allPassed) {
        const total = allAssignments.reduce((sum, a) => sum + (a.grade || 0), 0);
        averageGrade = Math.round((total / 10) * 10) / 10;
        certificateEligible = true;

        await supabase
          .from("student_progress")
          .update({
            final_exam_score: Math.round(averageGrade * 10),
          })
          .eq("user_id", assignment.user_id);
      }
    }

    return new Response(
      JSON.stringify({
        grade: evaluation.grade,
        feedback: evaluation.feedback,
        allGraded: allAssignments?.length === 10,
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
