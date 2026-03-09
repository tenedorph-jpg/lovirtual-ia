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
  questions: QuizQuestion[];
  selectedAnswers: Record<number, number>;
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

    const { questions, selectedAnswers, studentName, examType, moduleTitle }: EvaluationRequest =
      await req.json();

    // Build the Q&A summary for Claude
    let correctCount = 0;
    const questionsSummary = questions.map((q, i) => {
      const studentAnswerIndex = selectedAnswers[q.id];
      const studentAnswer = q.options[studentAnswerIndex] ?? "No respondida";
      const correctAnswer = q.options[q.correctAnswer];
      const isCorrect = studentAnswerIndex === q.correctAnswer;
      if (isCorrect) correctCount++;

      return `Pregunta ${i + 1}: ${q.question}
  Respuesta del estudiante: ${String.fromCharCode(65 + studentAnswerIndex)}. ${studentAnswer} ${isCorrect ? "✓ CORRECTA" : "✗ INCORRECTA"}
  ${!isCorrect ? `Respuesta correcta: ${String.fromCharCode(65 + q.correctAnswer)}. ${correctAnswer}` : ""}`;
    }).join("\n\n");

    const rawScore = Math.round((correctCount / questions.length) * 100);
    const examName = examType === "final"
      ? "Examen Final del curso de Inteligencia Artificial y Herramientas Digitales"
      : `Quiz del Módulo 10: ${moduleTitle ?? "Lógica e Iteración"} - Lovable Avanzado`;

    const prompt = `Eres el evaluador académico de la Academia LoVirtual, especializada en formación de IA para profesionales latinoamericanos.

Debes revisar el siguiente ${examName} completado por ${studentName}.

RESULTADOS:
${questionsSummary}

Puntaje bruto: ${correctCount}/${questions.length} (${rawScore}%)
Umbral de aprobación: 70%

INSTRUCCIONES:
1. Analiza las respuestas incorrectas para entender qué conceptos el estudiante no dominó
2. Considera si el puntaje refleja la comprensión real del material
3. Emite tu veredicto: APROBADO o NO APROBADO (basado en el 70% mínimo)
4. Da un feedback personalizado y motivador en español, máximo 3 oraciones
5. Lista 1-3 áreas de mejora si no aprobó, o 1-2 fortalezas si aprobó

Responde ÚNICAMENTE con este JSON (sin markdown, sin texto extra):
{
  "approved": true/false,
  "score": ${rawScore},
  "verdict": "APROBADO" o "NO APROBADO",
  "feedback": "mensaje personalizado para ${studentName}",
  "details": ["punto 1", "punto 2"]
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
