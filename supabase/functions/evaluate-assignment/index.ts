import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { unzipSync } from "https://esm.sh/fflate@0.8.2";
import * as XLSX from "https://esm.sh/xlsx@0.18.5";

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
const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "avi", "mkv", "webm", "wmv", "m4v"]);
const AUDIO_EXTENSIONS = new Set(["mp3", "wav", "ogg", "m4a", "aac", "flac", "opus"]);

function getFileExtension(name: string): string {
  return (name.split(".").pop() || "").toLowerCase();
}

// ============================================================
// TEXT EXTRACTION: DOCX
// A .docx is a ZIP containing word/document.xml with the text.
// We unzip it with fflate, find document.xml, and strip XML tags.
// ============================================================
function extractDocxText(buffer: ArrayBuffer): string {
  try {
    const unzipped = unzipSync(new Uint8Array(buffer));

    // Find the main document XML
    let docXml: Uint8Array | null = null;
    for (const [filename, data] of Object.entries(unzipped)) {
      if (filename === "word/document.xml" || filename.endsWith("/document.xml")) {
        docXml = data;
        break;
      }
    }

    if (!docXml) {
      console.error("DOCX: word/document.xml not found in ZIP entries:", Object.keys(unzipped));
      return "";
    }

    const xmlString = new TextDecoder("utf-8").decode(docXml);

    // Extract text from <w:t> tags (Word paragraph text nodes)
    const textParts: string[] = [];
    // Match <w:t ...>content</w:t> and <w:t>content</w:t>
    const regex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let match;
    while ((match = regex.exec(xmlString)) !== null) {
      textParts.push(match[1]);
    }

    // Also handle paragraph breaks: each <w:p> is a new paragraph
    // Re-parse grouping by paragraphs for better readability
    const paragraphs: string[] = [];
    const paraRegex = /<w:p[^>]*>([\s\S]*?)<\/w:p>/g;
    let paraMatch;
    while ((paraMatch = paraRegex.exec(xmlString)) !== null) {
      const paraContent = paraMatch[1];
      const paraTexts: string[] = [];
      const tRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
      let tMatch;
      while ((tMatch = tRegex.exec(paraContent)) !== null) {
        paraTexts.push(tMatch[1]);
      }
      if (paraTexts.length > 0) {
        paragraphs.push(paraTexts.join(""));
      }
    }

    const result = paragraphs.length > 0 ? paragraphs.join("\n") : textParts.join(" ");
    console.log(`DOCX extraction: got ${result.length} chars from ${paragraphs.length} paragraphs`);
    return result;
  } catch (e) {
    console.error("DOCX extraction error:", e);
    return "";
  }
}

// ============================================================
// TEXT EXTRACTION: PDF
// Use a lightweight approach: extract text streams from PDF.
// Parse the raw PDF bytes looking for text content.
// ============================================================
function extractPdfTextRaw(buffer: ArrayBuffer): string {
  try {
    const bytes = new Uint8Array(buffer);
    const raw = new TextDecoder("latin1").decode(bytes);

    const textParts: string[] = [];

    // Strategy 1: Extract text between BT (Begin Text) and ET (End Text) operators
    const btEtRegex = /BT\s([\s\S]*?)ET/g;
    let match;
    while ((match = btEtRegex.exec(raw)) !== null) {
      const block = match[1];
      // Extract strings in parentheses: Tj and ' operators
      const strRegex = /\(([^)]*)\)/g;
      let strMatch;
      while ((strMatch = strRegex.exec(block)) !== null) {
        const decoded = strMatch[1]
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\r")
          .replace(/\\t/g, "\t")
          .replace(/\\\\/g, "\\")
          .replace(/\\([()])/g, "$1");
        if (decoded.trim()) {
          textParts.push(decoded);
        }
      }
      // Also extract hex strings <hexdata> used with TJ
      const hexRegex = /<([0-9A-Fa-f]+)>/g;
      let hexMatch;
      while ((hexMatch = hexRegex.exec(block)) !== null) {
        const hex = hexMatch[1];
        if (hex.length > 4) {
          // Try to decode as UTF-16BE (common in PDFs)
          let decoded = "";
          for (let i = 0; i < hex.length; i += 4) {
            const code = parseInt(hex.substring(i, i + 4), 16);
            if (code > 31 && code < 65535) {
              decoded += String.fromCharCode(code);
            }
          }
          if (decoded.trim()) textParts.push(decoded);
        }
      }
    }

    // Strategy 2: Look for stream content with readable text
    if (textParts.length === 0) {
      // Try to find FlateDecode streams — we can't decompress without zlib, 
      // but we can look for uncompressed text
      const plainTextRegex = /stream\r?\n([\x20-\x7E\r\n]{50,})\r?\nendstream/g;
      while ((match = plainTextRegex.exec(raw)) !== null) {
        const content = match[1].trim();
        if (content.length > 20) {
          textParts.push(content);
        }
      }
    }

    const result = textParts.join(" ").replace(/\s+/g, " ").trim();
    console.log(`PDF raw extraction: got ${result.length} chars from ${textParts.length} text parts`);
    return result;
  } catch (e) {
    console.error("PDF raw extraction error:", e);
    return "";
  }
}

// ============================================================
// ZIP EXTRACTION
// ============================================================
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
      if (filename.endsWith("/") || filename.startsWith("__MACOSX") || filename.startsWith(".")) continue;
      fileList.push(filename);

      const ext = getFileExtension(filename);

      if (IMAGE_EXTENSIONS.has(ext) && images.length < 10) {
        const base64 = uint8ArrayToBase64(fileData);
        images.push({
          media_type: IMAGE_MIME[ext] || "image/png",
          data: base64,
          name: filename,
        });
      } else if (["txt", "md", "csv"].includes(ext)) {
        const text = new TextDecoder().decode(fileData);
        textSnippets.push(`--- ${filename} ---\n${text.substring(0, 2000)}`);
      } else if (ext === "pdf") {
        const pdfText = extractPdfTextRaw(fileData.buffer as ArrayBuffer);
        if (pdfText.length > 0) {
          textSnippets.push(`--- ${filename} (PDF) ---\n${pdfText.substring(0, 2000)}`);
        } else {
          textSnippets.push(`[PDF dentro del ZIP: ${filename} — no se pudo extraer texto, posible PDF escaneado]`);
        }
      } else if (ext === "docx") {
        const docxText = extractDocxText(fileData.buffer as ArrayBuffer);
        if (docxText.length > 0) {
          textSnippets.push(`--- ${filename} (DOCX) ---\n${docxText.substring(0, 2000)}`);
        } else {
          textSnippets.push(`[DOCX dentro del ZIP: ${filename} — no se pudo extraer texto]`);
        }
      } else if (["xls", "xlsx"].includes(ext)) {
        try {
          const workbook = XLSX.read(fileData, { type: "array" });
          const xlsParts: string[] = [];
          for (const sheetName of workbook.SheetNames) {
            const sheet = workbook.Sheets[sheetName];
            const csv = XLSX.utils.sheet_to_csv(sheet);
            if (csv.trim()) xlsParts.push(`Hoja: ${sheetName}\n${csv}`);
          }
          const xlsText = xlsParts.join("\n\n");
          if (xlsText.trim()) {
            textSnippets.push(`--- ${filename} (Excel) ---\n${xlsText.substring(0, 2000)}`);
          } else {
            textSnippets.push(`[Excel dentro del ZIP: ${filename} — sin datos legibles]`);
          }
        } catch {
          textSnippets.push(`[Excel dentro del ZIP: ${filename} — no se pudo leer]`);
        }
      } else if (VIDEO_EXTENSIONS.has(ext)) {
        const sizeMB = Math.round(fileData.length / (1024 * 1024) * 10) / 10;
        textSnippets.push(`[Video dentro del ZIP: ${filename} — ${sizeMB} MB entregado]`);
      } else if (AUDIO_EXTENSIONS.has(ext)) {
        const sizeMB = Math.round(fileData.length / (1024 * 1024) * 10) / 10;
        const estMin = Math.round((sizeMB / 1.5) * 10) / 10;
        textSnippets.push(`[Audio dentro del ZIP: ${filename} — ${sizeMB} MB (~${estMin} min estimado) entregado]`);
      }
    }
  } catch (e) {
    console.error("ZIP extraction error:", e);
    return { textSnippets: ["[ERROR: No se pudo descomprimir el archivo ZIP. El archivo puede estar corrupto.]"], images: [], fileList: [] };
  }

  return { textSnippets, images, fileList };
}

/** Safe base64 encoding that handles large files without stack overflow */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

/** Convert raw image bytes to base64 for Claude */
function imageToBase64(buffer: ArrayBuffer, ext: string): { media_type: string; data: string } | null {
  try {
    const data = uint8ArrayToBase64(new Uint8Array(buffer));
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
          const buffer = await fileData.arrayBuffer();
          const { textSnippets, images, fileList } = extractZipContents(buffer);
          extractedImages = images;

          if (textSnippets.length === 0 && images.length === 0 && fileList.length === 0) {
            contentExtractionFailed = true;
            fileContentSnippet = "[ERROR: El archivo ZIP está vacío o no se pudo descomprimir.]";
          } else {
            fileContentSnippet = `ARCHIVOS EN EL ZIP (${fileList.length} archivos):\n${fileList.join("\n")}\n\n`;
            if (textSnippets.length > 0) {
              fileContentSnippet += `CONTENIDO DE TEXTO EXTRAÍDO:\n${textSnippets.join("\n\n").substring(0, 6000)}`;
            }
            if (images.length > 0) {
              fileContentSnippet += `\n\n[${images.length} imagen(es) extraída(s) del ZIP y enviadas para evaluación visual]`;
            }
            if (images.length === 0 && textSnippets.every(t => t.includes("ERROR") || t.includes("no se pudo"))) {
              contentExtractionFailed = true;
            }
          }
        } else if (ext === "pdf") {
          const buffer = await fileData.arrayBuffer();
          // Send PDF directly to Claude as a document block (native PDF support)
          const pdfBase64 = uint8ArrayToBase64(new Uint8Array(buffer));
          extractedImages.push({
            media_type: "application/pdf" as any,
            data: pdfBase64,
            name: assignment.file_name as string,
          });
          // Leave fileContentSnippet empty — the PDF is sent as a document block above
          fileContentSnippet = "";
        } else if (ext === "docx") {
          const buffer = await fileData.arrayBuffer();
          const extracted = extractDocxText(buffer);
          if (extracted.trim().length === 0) {
            fileContentSnippet = "[No se pudo extraer texto del archivo DOCX. El archivo puede estar corrupto o vacío.]";
            contentExtractionFailed = true;
          } else {
            fileContentSnippet = extracted.substring(0, 6000);
          }
        } else if (["txt", "md", "csv"].includes(ext)) {
          const text = await fileData.text();
          fileContentSnippet = text.substring(0, 6000);
        } else if (IMAGE_EXTENSIONS.has(ext)) {
          const buffer = await fileData.arrayBuffer();
          const img = imageToBase64(buffer, ext);
          if (img) {
            extractedImages.push({ ...img, name: assignment.file_name as string });
            fileContentSnippet = "[Imagen enviada para evaluación visual]";
          } else {
            contentExtractionFailed = true;
            fileContentSnippet = "[ERROR: No se pudo procesar la imagen.]";
          }
        } else if (["xls", "xlsx"].includes(ext)) {
          const buffer = await fileData.arrayBuffer();
          try {
            const workbook = XLSX.read(new Uint8Array(buffer), { type: "array" });
            const textParts: string[] = [];
            for (const sheetName of workbook.SheetNames) {
              const sheet = workbook.Sheets[sheetName];
              const csv = XLSX.utils.sheet_to_csv(sheet);
              if (csv.trim()) textParts.push(`--- Hoja: ${sheetName} ---\n${csv}`);
            }
            const extracted = textParts.join("\n\n");
            if (extracted.trim().length === 0) {
              fileContentSnippet = "[El archivo Excel está vacío o no contiene datos legibles.]";
              contentExtractionFailed = true;
            } else {
              fileContentSnippet = extracted.substring(0, 6000);
            }
          } catch (e) {
            fileContentSnippet = `[Error al leer el archivo Excel: ${e instanceof Error ? e.message : "error desconocido"}]`;
            contentExtractionFailed = true;
          }
        } else if (["ppt", "pptx"].includes(ext)) {
          fileContentSnippet = `[Archivo PowerPoint .${ext} recibido — formato no permite extracción de texto directa. Se evaluará con los metadatos disponibles.]`;
        } else if (VIDEO_EXTENSIONS.has(ext)) {
          const sizeMB = Math.round((assignment.file_size as number) / (1024 * 1024) * 10) / 10;
          const estMinutes = Math.round((sizeMB / 30) * 10) / 10; // ~30MB por minuto de video a calidad media
          fileContentSnippet = `[Video .${ext} entregado correctamente — Tamaño: ${sizeMB} MB (~${estMinutes} min estimado a calidad media). No es posible reproducir el video, pero el archivo fue recibido. Evalúa si el tamaño es razonable para el tipo de entrega y asigna una calificación justa basándote en que el estudiante SÍ entregó el archivo de video.]`;
        } else if (AUDIO_EXTENSIONS.has(ext)) {
          const sizeMB = Math.round((assignment.file_size as number) / (1024 * 1024) * 10) / 10;
          const estMinutes = Math.round((sizeMB / 1.5) * 10) / 10; // ~1.5MB por minuto de audio MP3 128kbps
          fileContentSnippet = `[Audio .${ext} entregado correctamente — Tamaño: ${sizeMB} MB (~${estMinutes} min estimado). No es posible reproducir el audio, pero el archivo fue recibido. Evalúa si el tamaño es razonable para el tipo de entrega y asigna una calificación justa.]`;
        } else if (ext === "doc") {
          contentExtractionFailed = true;
          fileContentSnippet = "[ERROR: Formato .doc (binario legacy) no soportado. El estudiante debe resubir en .docx o .pdf.]";
        } else {
          fileContentSnippet = `[Archivo .${ext} recibido — tipo no reconocido, no se pudo leer el contenido]`;
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

    // ============================================================
    // DEBUG: Log extracted text before sending to Claude
    // ============================================================
    console.log(`[evaluate-assignment] File: ${assignment.file_name}, Ext: .${ext}`);
    console.log(`[evaluate-assignment] Content extraction failed: ${contentExtractionFailed}`);
    console.log(`[evaluate-assignment] Extracted text preview (first 200 chars): ${fileContentSnippet.substring(0, 200)}`);
    console.log(`[evaluate-assignment] Images count: ${extractedImages.length}`);

    // ============================================================
    // GUARD: If no text and no images, return 400 immediately
    // ============================================================
    if (
      contentExtractionFailed &&
      extractedImages.length === 0
    ) {
      // Still update the assignment with failure info
      await supabase
        .from("assignments")
        .update({
          grade: 1,
          feedback: "No se pudo extraer el contenido de tu archivo. Por favor, vuelve a subirlo en formato .docx, .pdf (con texto, no escaneado), imágenes (.png/.jpg), o un .zip con archivos legibles.",
          status: "graded",
        })
        .eq("id", assignmentId);

      return new Response(
        JSON.stringify({
          grade: 1,
          feedback: "No se pudo extraer el contenido de tu archivo. Por favor, vuelve a subirlo en formato .docx, .pdf (con texto, no escaneado), imágenes (.png/.jpg), o un .zip con archivos legibles.",
          allGraded: false,
          totalScore: null,
          averageGrade: null,
          certificateEligible: false,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
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

Solo da notas aprobatorias (7-10) cuando hayas podido VERIFICAR y EVALUAR el contenido real del entregable.

EXCEPCIÓN PARA MULTIMEDIA: Si el entregable es un archivo de VIDEO (.mp4, .mov, etc.) o AUDIO (.mp3, .wav, etc.), es NORMAL que no puedas reproducirlo. En ese caso, evalúa basándote en: (1) que el archivo fue entregado, (2) que el tamaño es razonable para la tarea (un video de 3 min debería pesar varios MB), (3) el nombre del archivo. Puedes dar nota aprobatoria (7-8) si el tamaño sugiere una entrega legítima.`;

    const hasPdfAttached = extractedImages.some(f => f.media_type === "application/pdf");
    const hasImages = extractedImages.some(f => f.media_type !== "application/pdf");

    const contentSection = hasPdfAttached
      ? `\nARCHIVO ADJUNTO: El documento PDF completo está adjunto a este mensaje — léelo íntegramente para evaluar el entregable. Incluye todo el texto e imágenes del archivo.`
      : fileContentSnippet
        ? `\nCONTENIDO EXTRAÍDO DEL DOCUMENTO:\n${fileContentSnippet}`
        : `\n[No se pudo extraer contenido del archivo]`;

    const userPrompt = `CONTEXTO DEL MÓDULO:
${moduleContext}

DATOS DE LA ENTREGA:
- Estudiante: ${studentName}
- Archivo: ${assignment.file_name}
- Formato: .${ext}
- Tamaño: ${Math.round((assignment.file_size as number) / 1024)} KB
- Fecha de envío: ${assignment.created_at}
- ¿Se pudo extraer contenido?: ${contentExtractionFailed ? "NO — hubo problemas técnicos" : "SÍ"}
${contentSection}

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
- Si hay imágenes adjuntas o un PDF adjunto, evalúalos visualmente con rigor

Responde ÚNICAMENTE con este JSON (sin markdown):
{
  "grade": <número del 1 al 10>,
  "feedback": "<feedback constructivo en español>"
}`;

    // Build Claude messages — PDFs and images BEFORE text prompt (Anthropic best practice)
    const contentParts: any[] = [];

    // 1. PDF documents first
    for (const file of extractedImages.filter(f => f.media_type === "application/pdf")) {
      contentParts.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: file.data },
      });
    }

    // 2. Text prompt
    contentParts.push({ type: "text", text: userPrompt });

    // 3. Images after text
    for (const file of extractedImages.filter(f => f.media_type !== "application/pdf").slice(0, 10)) {
      contentParts.push({
        type: "image",
        source: { type: "base64", media_type: file.media_type, data: file.data },
      });
      contentParts.push({ type: "text", text: `[Imagen: ${file.name}]` });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "pdfs-2024-09-25",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 600,
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
        evaluation = contentExtractionFailed
          ? { grade: 1, feedback: "No se pudo procesar tu archivo. Por favor, vuelve a subirlo en un formato compatible (.docx, .pdf, imágenes, o ZIP con archivos legibles)." }
          : { grade: 7, feedback: "Entrega recibida correctamente. Buen trabajo con las herramientas de IA." };
      }
    }

    evaluation.grade = Math.max(1, Math.min(10, Math.round(evaluation.grade)));

    // Enforce: if extraction failed, cap grade at max 1
    if (contentExtractionFailed && evaluation.grade >= 7) {
      evaluation.grade = 1;
      evaluation.feedback = "No se pudo verificar el contenido de tu archivo. Por favor, vuelve a subirlo en un formato legible (.docx, .pdf con texto, imágenes PNG/JPG, o ZIP con archivos válidos). " + evaluation.feedback;
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
