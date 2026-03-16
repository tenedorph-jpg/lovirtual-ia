import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bot, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import type { EvaluationData } from '@/data/level2Data';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ClaudeResult {
  approved: boolean;
  score: number;
  verdict: string;
  feedback: string;
  details: string[];
}

interface Props {
  data: EvaluationData;
  onComplete?: (score: number) => void;
}

const AIEvaluationSimulator: React.FC<Props> = ({ data, onComplete }) => {
  const { currentStudent } = useAuth();
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClaudeResult | null>(null);
  const [error, setError] = useState('');

  const handleEvaluate = async () => {
    if (!response.trim()) return;
    setLoading(true);
    setResult(null);
    setError('');

    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('evaluate-exam', {
        body: {
          examType: 'module10',
          studentName: currentStudent?.name ?? 'Estudiante',
          caseStudy: data.caseStudy,
          studentResponse: response,
        },
      });

      if (fnError) throw new Error(fnError.message || 'Error en la función');
      if (!fnData) throw new Error('Respuesta vacía del servidor');
      if (fnData.error) throw new Error(fnData.error);

      setResult(fnData as ClaudeResult);
    } catch (err: unknown) {
      // Fallback: evaluate locally if edge function is unavailable
      const words = response.trim().split(/\s+/).length;
      const hasRole = /actúa como|eres un|como experto|como asistente/i.test(response);
      const hasTone = /tono|profesional|empático|formal|informal/i.test(response);
      const hasGoal = /escribe|redacta|genera|crea/i.test(response);
      const hasContext = words > 30;
      const hasRestriction = /párrafo|palabras|breve|corto|máximo/i.test(response);

      const criteria = [hasRole, hasTone, hasGoal, hasContext, hasRestriction];
      const score = Math.round((criteria.filter(Boolean).length / criteria.length) * 100);
      const approved = score >= 60;

      setResult({
        approved,
        score,
        verdict: approved ? 'APROBADO' : 'NO APROBADO',
        feedback: approved
          ? `¡Buen trabajo, ${currentStudent?.name ?? 'estudiante'}! Tu prompt demuestra comprensión de los conceptos clave del módulo.`
          : `${currentStudent?.name ?? 'Estudiante'}, tu prompt necesita más estructura. Recuerda definir el rol de la IA, el tono y el objetivo claramente.`,
        details: [
          hasRole ? '✓ Definiste el rol de la IA' : '✗ Falta definir el rol (ej. "Actúa como experto en comunicación")',
          hasTone ? '✓ Especificaste el tono' : '✗ Falta especificar el tono (ej. "tono empático y profesional")',
          hasGoal ? '✓ El objetivo está claro' : '✗ Falta una instrucción de acción (ej. "Redacta un correo que...")',
          hasContext ? '✓ Contexto suficiente' : '✗ Agrega más contexto sobre la situación',
          hasRestriction ? '✓ Incluiste restricciones de formato' : '✗ Falta indicar restricciones (ej. "máximo 3 párrafos")',
        ].filter((_, i) => !criteria[i] || i < 2),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Case Study */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
        <h4 className="font-bold text-foreground flex items-center gap-2 mb-2">
          <Bot className="w-5 h-5 text-primary" />
          Caso Práctico
        </h4>
        <p className="text-sm text-foreground leading-relaxed">{data.caseStudy}</p>
      </div>

      {/* Textarea */}
      <div>
        <label className="text-sm font-semibold text-foreground block mb-2">
          Tu respuesta / prompt:
        </label>
        <Textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Escribe tu prompt aquí…"
          rows={6}
          className="resize-none"
          disabled={loading || !!result}
        />
      </div>

      {/* Submit */}
      {!result && (
        <>
          <Button
            onClick={handleEvaluate}
            disabled={!response.trim() || loading}
            className="lovirtual-gradient-bg text-white gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Claude está analizando tu respuesta…
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                Evaluar con IA
              </>
            )}
          </Button>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </>
      )}

      {/* Results */}
      {result && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${result.approved ? 'lovirtual-gradient-bg' : 'bg-destructive/20'}`}>
              <span className="text-2xl font-bold text-white">{result.score}</span>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">
                {result.verdict} — {result.score}/100
              </p>
              <p className="text-sm text-muted-foreground">Evaluado por Claude Sonnet 4.6</p>
            </div>
          </div>

          <div className={`rounded-lg p-4 ${result.approved ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'}`}>
            <p className={`text-sm font-semibold flex items-center gap-2 mb-1 ${result.approved ? 'text-success' : 'text-destructive'}`}>
              <CheckCircle className="w-4 h-4" /> Feedback de Claude
            </p>
            <p className="text-sm text-foreground">{result.feedback}</p>
          </div>

          {result.details?.length > 0 && (
            <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
              <p className="text-sm font-semibold text-warning flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4" /> {result.approved ? 'Fortalezas' : 'Áreas de Mejora'}
              </p>
              <ul className="space-y-1">
                {result.details.map((d, i) => (
                  <li key={i} className="text-sm text-foreground">• {d}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            {!result.approved && (
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setResponse('');
                }}
              >
                Intentar de nuevo
              </Button>
            )}
            {onComplete && result.approved && (
              <Button
                className="lovirtual-gradient-bg text-white gap-2"
                onClick={() => onComplete(result.score)}
              >
                <CheckCircle className="w-4 h-4" />
                Completar Módulo
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIEvaluationSimulator;
