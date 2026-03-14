import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Bot, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import type { EvaluationData } from '@/data/level2Data';

interface Props {
  data: EvaluationData;
  onComplete?: (score: number) => void;
}

const AIEvaluationSimulator: React.FC<Props> = ({ data, onComplete }) => {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EvaluationData['simulatedFeedback'] | null>(null);

  const handleEvaluate = () => {
    if (!response.trim()) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(data.simulatedFeedback);
      setLoading(false);
    }, 2500);
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

      {/* Results */}
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
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setResponse('');
              }}
            >
              Intentar de nuevo
            </Button>
            {onComplete && (
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
