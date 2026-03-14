import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bot, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { EvaluationData } from '@/data/level2Data';

interface Props {
  data: EvaluationData;
  onComplete?: (score: number) => void;
}

const AIEvaluationSimulator: React.FC<Props> = ({ data, onComplete }) => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<EvaluationData['simulatedFeedback'] | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleEvaluate = () => {
    if (!response.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(data.simulatedFeedback);
      setLoading(false);
    }, 2500);
  };

  const handleComplete = async () => {
    if (!result || !onComplete || saving || completed) return;
    setSaving(true);
    try {
      await onComplete(result.score);
      setCompleted(true);
      toast({ title: '¡Módulo completado!', description: 'Tu progreso ha sido guardado exitosamente.' });
    } catch (error) {
      console.error('Error completing evaluation:', error);
      toast({ title: 'Error', description: 'No se pudo guardar tu progreso. Intenta nuevamente.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
        <h4 className="font-bold text-foreground flex items-center gap-2 mb-2">
          <Bot className="w-5 h-5 text-primary" />
          Caso Práctico
        </h4>
        <p className="text-sm text-foreground leading-relaxed">{data.caseStudy}</p>
      </div>

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

      {!result && (
        <Button
          onClick={handleEvaluate}
          disabled={!response.trim() || loading}
          className="lovirtual-gradient-bg text-white gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              La IA está analizando tu respuesta…
            </>
          ) : (
            <>
              <Bot className="w-4 h-4" />
              Evaluar con IA
            </>
          )}
        </Button>
      )}

      {result && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full lovirtual-gradient-bg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{result.score}</span>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">Puntuación: {result.score}/100</p>
              <p className="text-sm text-muted-foreground">Evaluación completada</p>
            </div>
          </div>

          <div className="rounded-lg bg-success/10 border border-success/20 p-4">
            <p className="text-sm font-semibold text-success flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4" /> Puntos Fuertes
            </p>
            <p className="text-sm text-foreground">{result.strengths}</p>
          </div>

          <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
            <p className="text-sm font-semibold text-warning flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4" /> Áreas de Mejora
            </p>
            <p className="text-sm text-foreground">{result.improvements}</p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {!completed && (
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setResponse('');
                }}
                disabled={saving}
              >
                Intentar de nuevo
              </Button>
            )}
            {onComplete && !completed && (
              <Button
                className="lovirtual-gradient-bg text-white gap-2"
                onClick={handleComplete}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando…
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Completar Módulo
                  </>
                )}
              </Button>
            )}
            {completed && (
              <p className="text-sm text-success font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Módulo completado y guardado
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIEvaluationSimulator;