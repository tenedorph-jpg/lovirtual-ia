import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Quiz } from '@/data/level2Data';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  moduleTitle: string;
  quiz: Quiz;
}

const QuizModal: React.FC<Props> = ({ open, onOpenChange, moduleTitle, quiz }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = selected === quiz.correctAnswer;

  const handleSelect = (option: string) => {
    if (submitted) return;
    setSelected(option);
  };

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
  };

  const handleClose = () => {
    setSelected(null);
    setSubmitted(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">Quiz — {moduleTitle}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-foreground font-medium mt-2">{quiz.question}</p>

        <div className="mt-4 space-y-2">
          {quiz.options.map((opt) => {
            let optionClass =
              'border border-border rounded-lg px-4 py-3 text-sm cursor-pointer transition-all hover:border-primary/50';

            if (submitted) {
              if (opt === quiz.correctAnswer) {
                optionClass =
                  'border-2 border-success bg-success/10 rounded-lg px-4 py-3 text-sm font-semibold text-success';
              } else if (opt === selected) {
                optionClass =
                  'border-2 border-destructive bg-destructive/10 rounded-lg px-4 py-3 text-sm font-semibold text-destructive';
              } else {
                optionClass =
                  'border border-border rounded-lg px-4 py-3 text-sm opacity-50';
              }
            } else if (opt === selected) {
              optionClass =
                'border-2 border-primary bg-primary/10 rounded-lg px-4 py-3 text-sm font-semibold text-primary';
            }

            return (
              <div key={opt} className={optionClass} onClick={() => handleSelect(opt)}>
                {opt}
              </div>
            );
          })}
        </div>

        {submitted && (
          <div
            className={`mt-4 flex items-center gap-2 p-3 rounded-lg text-sm font-medium ${
              isCorrect ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            }`}
          >
            {isCorrect ? (
              <>
                <CheckCircle className="w-5 h-5" /> ¡Correcto! Excelente trabajo.
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" /> Incorrecto. La respuesta correcta es:{' '}
                <strong>{quiz.correctAnswer}</strong>
              </>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          {!submitted ? (
            <Button onClick={handleSubmit} disabled={!selected} className="lovirtual-gradient-bg text-white">
              Enviar Respuesta
            </Button>
          ) : (
            <Button onClick={handleClose} variant="outline">
              Cerrar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuizModal;
