const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface EvaluationRequest {
  // Multiple choice (final exam)
  questions?: QuizQuestion[];
  selectedAnswers?: Record<number, number>;
  // Open-ended (module 10 evaluation)
  caseStudy?: string;
  studentResponse?: string;
  // Common
  studentName: string;
  examType: "final" | "module10";
  moduleTitle?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: "API key no configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { questions, selectedAnswers, caseStudy, studentResponse, studentName, examType, moduleTitle }: EvaluationRequest =
      await req.json();

    let prompt: string;
    let rawScore: number;

    if (examType === "module10" && caseStudy && studentResponse) {
      // Open-ended evaluation: Module 10 case study
      rawScore = 0; // Claude will assign the score
      prompt = `Eres el evaluador académico de la Academia LoVirtual, especializada en formación de IA para profesionales latinoamericanos.

Debes evaluar la respuesta de ${studentName} al siguiente caso práctico del Módulo 10.

CASO PRÁCTICO:
${caseStudy}

RESPUESTA DEL ESTUDIANTE:
${studentResponse}

CRITERIOS DE EVALUACIÓN (puntúa del 0 al 100):
1. Claridad del rol asignado a la IA (¿define quién es la IA?)
2. Contexto suficiente (¿explica la situación con detalle?)
3. Tono de voz solicitado (¿especifica cómo debe sonar el texto?)
4. Objetivo claro (¿qué debe lograr exactamente el correo/texto?)
5. Restricciones útiles (¿longitud, formato, qué evitar?)

Umbral de aprobación: 70 puntos.

Responde ÚNICAMENTE con este JSON (sin markdown, sin texto extra):
{
  "approved": true/false,
  "score": número del 0 al 100,
  "verdict": "APROBADO" o "NO APROBADO",
  "feedback": "feedback personalizado y motivador para ${studentName}, máximo 3 oraciones",
  "details": ["fortaleza o área de mejora 1", "fortaleza o área de mejora 2"]
}`;
    } else {
      // Multiple choice evaluation: final exam
      const qs = questions ?? [];
      const sa = selectedAnswers ?? {};

      let correctCount = 0;
      const questionsSummary = qs.map((q, i) => {
        const studentAnswerIndex = sa[q.id];
        const studentAnswer = q.options[studentAnswerIndex] ?? "No respondida";
        const correctAnswer = q.options[q.correctAnswer];
        const isCorrect = studentAnswerIndex === q.correctAnswer;
        if (isCorrect) correctCount++;

        return `Pregunta ${i + 1}: ${q.question}
  Respuesta del estudiante: ${String.fromCharCode(65 + studentAnswerIndex)}. ${studentAnswer} ${isCorrect ? "✓ CORRECTA" : "✗ INCORRECTA"}
  ${!isCorrect ? `Respuesta correcta: ${String.fromCharCode(65 + q.correctAnswer)}. ${correctAnswer}` : ""}`;
      }).join("\n\n");

      rawScore = Math.round((correctCount / qs.length) * 100);
      const examName = moduleTitle
        ? `Quiz del módulo "${moduleTitle}"`
        : "Examen Final del curso de Inteligencia Artificial y Herramientas Digitales";

      prompt = `Eres el evaluador académico de la Academia LoVirtual, especializada en formación de IA para profesionales latinoamericanos.

Debes revisar el siguiente ${examName} completado por ${studentName}.

CONTEXTO IMPORTANTE: Estas son preguntas de opción múltiple sobre conceptos teóricos. Las preguntas pueden mencionar herramientas como imágenes, PDFs, audios o archivos, pero tú solo estás evaluando si el estudiante eligió la respuesta correcta. NO menciones que no puedes leer archivos ni imágenes — eso no aplica aquí. Solo evalúa las respuestas seleccionadas.

RESULTADOS:
${questionsSummary}

Puntaje: ${correctCount}/${qs.length} (${rawScore}%)
Umbral de aprobación: 70%

INSTRUCCIONES:
1. Analiza las respuestas incorrectas para entender qué conceptos el estudiante no dominó
2. Emite tu veredicto: APROBADO o NO APROBADO (basado en el 70% mínimo)
3. Da un feedback personalizado y motivador en español, máximo 3 oraciones
4. Lista 1-2 áreas de mejora si no aprobó, o 1-2 fortalezas si aprobó
5. NUNCA menciones limitaciones de archivos, imágenes o PDFs en tu respuesta

Responde ÚNICAMENTE con este JSON (sin markdown, sin texto extra):
{
  "approved": true/false,
  "score": ${rawScore},
  "verdict": "APROBADO" o "NO APROBADO",
  "feedback": "mensaje personalizado para ${studentName}",
  "details": ["punto 1", "punto 2"]
}`;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 512,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic API error: ${err}`);
    }

    const claudeResponse = await response.json();
    const rawContent = claudeResponse.content[0].text.trim();

    // Parse Claude's JSON response
    let evaluation;
    try {
      evaluation = JSON.parse(rawContent);
    } catch {
      // Fallback: extract JSON from response if it contains extra text
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : {
        approved: rawScore >= 70,
        score: rawScore,
        verdict: rawScore >= 70 ? "APROBADO" : "NO APROBADO",
        feedback: rawScore >= 70
          ? `¡Felicitaciones, ${studentName}! Has demostrado un sólido dominio del material.`
          : `${studentName}, sigue practicando. Necesitas repasar algunos conceptos clave.`,
        details: [],
      };
    }

    return new Response(JSON.stringify(evaluation), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
