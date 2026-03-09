import React, { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { CheckCircle, Lock, Play, Clock } from 'lucide-react';
import type { Level2Module } from '@/data/level2Data';
import QuizModal from './QuizModal';
import AIEvaluationSimulator from './AIEvaluationSimulator';

interface Props {
  modules: Level2Module[];
  completedModules: number[];
}

const Level2Accordion: React.FC<Props> = ({ modules, completedModules }) => {
  const [quizOpen, setQuizOpen] = useState(false);
  const [activeQuizModule, setActiveQuizModule] = useState<Level2Module | null>(null);

  const getStatus = (mod: Level2Module): 'completed' | 'available' | 'locked' => {
    if (completedModules.includes(mod.id)) return 'completed';
    if (mod.id === 1 || completedModules.includes(mod.id - 1)) return 'available';
    return 'locked';
  };

  return (
    <>
      <Accordion type="single" collapsible className="space-y-3">
        {modules.map((mod) => {
          const status = getStatus(mod);
          const isLocked = status === 'locked';

          return (
            <AccordionItem
              key={mod.id}
              value={`l2-module-${mod.id}`}
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
                    <div>
                      <h4 className="font-semibold text-foreground text-base">{mod.title}</h4>
                      {mod.type === 'evaluation' && (
                        <span className="text-xs text-warning font-medium">Evaluación con IA</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1 hidden sm:flex flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {mod.duration}
                  </span>
                </div>
              </AccordionTrigger>

              <AccordionContent className="px-5 pb-5">
                {isLocked ? (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 border border-border">
                    <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      Completa el módulo anterior para desbloquear.
                    </p>
                  </div>
                ) : mod.type === 'evaluation' && mod.evaluationData ? (
                  <AIEvaluationSimulator data={mod.evaluationData} />
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
                    {mod.quiz && (
                      <div className="pt-2">
                        <Button
                          size="sm"
                          className="lovirtual-gradient-bg text-white"
                          onClick={() => {
                            setActiveQuizModule(mod);
                            setQuizOpen(true);
                          }}
                        >
                          Realizar Quiz del Módulo
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {activeQuizModule?.quiz && (
        <QuizModal
          open={quizOpen}
          onOpenChange={setQuizOpen}
          moduleTitle={activeQuizModule.title}
          quiz={activeQuizModule.quiz}
        />
      )}
    </>
  );
};

export default Level2Accordion;
