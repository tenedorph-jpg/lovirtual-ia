import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { courseModules } from '@/data/courseModules';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { generateCertificatePDF } from '@/lib/generateCertificate';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  BookOpen,
  Lightbulb,
  Target,
  Wrench,
  HelpCircle,
  Sparkles,
  Brain,
  Loader2,
  Download,
} from 'lucide-react';

interface ClaudeEvaluation {
  approved: boolean;
  score: number;
  verdict: string;
  feedback: string;
  details: string[];
}

const ModulePage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { currentStudent, updateStudentProgress, completeModule } = useAuth();

  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [claudeEval, setClaudeEval] = useState<ClaudeEvaluation | null>(null);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);

  const module = courseModules.find(m => m.id === parseInt(moduleId || '0'));

  const isModule10 = module?.id === 10;

  if (!module || !currentStudent) {
    navigate('/dashboard');
    return null;
  }

  const handleSelectAnswer = (questionId: number, answerIndex: number) => {
    if (!quizSubmitted) {
      setSelectedAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
    }
  };

  const calculateScore = () => {
    let correct = 0;
    module.quiz.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / module.quiz.length) * 100);
  };

  const handleSubmitQuiz = async () => {
    setQuizSubmitted(true);

    if (isModule10) {
      // Module 10: use Claude for evaluation
      setIsEvaluating(true);
      let evaluation: ClaudeEvaluation | null = null;
      try {
        const { data, error } = await supabase.functions.invoke('evaluate-exam', {
          body: {
            questions: module.quiz,
            selectedAnswers,
            studentName: currentStudent?.name ?? 'Estudiante',
            examType: 'module10',
            moduleTitle: module.title,
          },
        });
        if (!error && data) evaluation = data as ClaudeEvaluation;
      } catch {
        // fallback below
      }

      if (!evaluation) {
        const rawScore = calculateScore();
        evaluation = {
          approved: rawScore >= 70,
          score: rawScore,
          verdict: rawScore >= 70 ? 'APROBADO' : 'NO APROBADO',
          feedback: rawScore >= 70
            ? `¡Excelente trabajo, ${currentStudent?.name}! Dominas el módulo.`
            : `${currentStudent?.name}, repasa el contenido e inténtalo de nuevo.`,
          details: [],
        };
      }

      setClaudeEval(evaluation);
      setIsEvaluating(false);
      setShowResults(true);
      updateStudentProgress(module.id, evaluation.score);
      if (evaluation.approved) completeModule(module.id);
    } else {
      // Other modules: standard evaluation
      const score = calculateScore();
      setShowResults(true);
      updateStudentProgress(module.id, score);
      if (score >= 70) completeModule(module.id);
    }
  };

  const allQuestionsAnswered = module.quiz.every(q => selectedAnswers[q.id] !== undefined);
  const score = claudeEval?.score ?? calculateScore();
  const passed = claudeEval ? claudeEval.approved : score >= 70;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Volver al Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Módulo {module.id} de 10</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {!showQuiz ? (
          // Content View
          <div className="space-y-8 animate-fade-in">
            {/* Module Header */}
            <div className="text-center">
              <span className="text-6xl mb-4 block">{module.icon}</span>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Módulo {module.id}: {module.title}
              </h1>
              <p className="text-xl text-muted-foreground">{module.subtitle}</p>
            </div>

            {/* Description Card */}
            <div className="lovirtual-card">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Descripción</h3>
                  <p className="text-muted-foreground">{module.description}</p>
                </div>
              </div>
            </div>

            {/* Concept */}
            <div className="lovirtual-card">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Lightbulb className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Concepto Clave</h3>
                  <p className="text-foreground leading-relaxed">{module.content.concept}</p>
                </div>
              </div>
            </div>

            {/* Key Points */}
            <div className="lovirtual-card">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <Target className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-3">Puntos Clave</h3>
                  <ul className="space-y-2">
                    {module.content.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Practical Example */}
            <div className="lovirtual-card bg-muted/30">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Sparkles className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-3">Ejemplo Práctico</h3>
                  <pre className="whitespace-pre-wrap text-foreground text-sm bg-card p-4 rounded-lg border border-border overflow-x-auto">
                    {module.content.practicalExample}
                  </pre>
                </div>
              </div>
            </div>

            {/* Tools */}
            {module.content.tools && (
              <div className="lovirtual-card">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-secondary/10">
                    <Wrench className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Herramientas</h3>
                    <div className="flex flex-wrap gap-2">
                      {module.content.tools.map((tool, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Start Quiz Button */}
            <div className="text-center pt-4">
              <Button
                size="lg"
                onClick={() => setShowQuiz(true)}
                className="lovirtual-gradient-bg text-white gap-2"
              >
                <HelpCircle className="w-5 h-5" />
                Comenzar Quiz del Módulo
              </Button>
            </div>
          </div>
        ) : (
          // Quiz View
          <div className="space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Quiz: {module.title}
              </h2>
              <p className="text-muted-foreground">
                Responde las 3 preguntas para completar el módulo
              </p>
            </div>

            {!showResults ? (
              <>
                {/* Question */}
                <div className="lovirtual-card">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full lovirtual-gradient-bg text-white font-bold">
                      {currentQuestion + 1}
                    </span>
                    <span className="text-sm text-muted-foreground">de {module.quiz.length}</span>
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-6">
                    {module.quiz[currentQuestion].question}
                  </h3>

                  <div className="space-y-3">
                    {module.quiz[currentQuestion].options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleSelectAnswer(module.quiz[currentQuestion].id, index)}
                        className={`quiz-option w-full text-left ${
                          selectedAnswers[module.quiz[currentQuestion].id] === index ? 'selected' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-current text-sm font-semibold">
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span>{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestion(prev => prev - 1)}
                    disabled={currentQuestion === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Anterior
                  </Button>

                  {currentQuestion < module.quiz.length - 1 ? (
                    <Button
                      onClick={() => setCurrentQuestion(prev => prev + 1)}
                      disabled={selectedAnswers[module.quiz[currentQuestion].id] === undefined}
                      className="gap-2"
                    >
                      Siguiente
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmitQuiz}
                      disabled={!allQuestionsAnswered || isEvaluating}
                      className="lovirtual-gradient-bg text-white gap-2"
                    >
                      {isEvaluating ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Evaluando...</>
                      ) : (
                        <><CheckCircle className="w-4 h-4" />Enviar Respuestas</>
                      )}
                    </Button>
                  )}
                </div>

                {/* Progress dots */}
                <div className="flex justify-center gap-2 pt-4">
                  {module.quiz.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentQuestion
                          ? 'lovirtual-gradient-bg'
                          : selectedAnswers[module.quiz[index].id] !== undefined
                          ? 'bg-success'
                          : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </>
            ) : isEvaluating ? (
              // Claude evaluating screen (Module 10 only)
              <div className="text-center animate-fade-in py-12">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                  <Brain className="w-10 h-10 text-primary animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Claude está revisando tu quiz</h3>
                <p className="text-muted-foreground text-sm mb-4">Analizando tu comprensión del módulo...</p>
                <div className="flex justify-center gap-1">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            ) : (
              // Results View
              <div className="text-center animate-scale-in">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${
                  passed ? 'bg-success/10' : 'bg-destructive/10'
                }`}>
                  {passed ? (
                    <CheckCircle className="w-12 h-12 text-success" />
                  ) : (
                    <XCircle className="w-12 h-12 text-destructive" />
                  )}
                </div>

                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {passed ? '¡Excelente trabajo!' : 'Sigue practicando'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Tu puntuación: <span className="font-bold text-foreground">{score}%</span>
                </p>

                {/* Claude AI Evaluation Card — Module 10 only */}
                {isModule10 && claudeEval && (
                  <div className={`my-4 p-4 rounded-xl border-2 text-left max-w-lg mx-auto ${passed ? 'border-success/40 bg-success/5' : 'border-destructive/40 bg-destructive/5'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-semibold text-foreground text-sm">Evaluación de Claude AI</span>
                      <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${passed ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                        {claudeEval.verdict}
                      </span>
                    </div>
                    <p className="text-foreground text-sm leading-relaxed mb-2">{claudeEval.feedback}</p>
                    {claudeEval.details.length > 0 && (
                      <ul className="space-y-1">
                        {claudeEval.details.map((d, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <span className={`mt-0.5 flex-shrink-0 ${passed ? 'text-success' : 'text-warning'}`}>
                              {passed ? '★' : '→'}
                            </span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Certificate download button — Module 10 only */}
                {isModule10 && passed && (
                  <Button
                    size="lg"
                    onClick={async () => {
                      setIsGeneratingCert(true);
                      await generateCertificatePDF(currentStudent?.name ?? 'Estudiante', score);
                      setIsGeneratingCert(false);
                    }}
                    disabled={isGeneratingCert}
                    className="lovirtual-gradient-bg text-white gap-2 mt-2 mb-4"
                  >
                    {isGeneratingCert ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Generando certificado...</>
                    ) : (
                      <><Download className="w-4 h-4" />Descargar Certificado</>
                    )}
                  </Button>
                )}

                <p className="text-sm text-muted-foreground mb-8">
                  {passed
                    ? 'Has completado este módulo exitosamente.'
                    : 'Necesitas al menos 70% para aprobar. Revisa el contenido y vuelve a intentarlo.'}
                </p>

                {/* Answer Review */}
                <div className="lovirtual-card text-left mb-6">
                  <h4 className="font-semibold text-foreground mb-4">Revisión de Respuestas</h4>
                  <div className="space-y-4">
                    {module.quiz.map((q, index) => {
                      const isCorrect = selectedAnswers[q.id] === q.correctAnswer;
                      return (
                        <div
                          key={q.id}
                          className={`p-4 rounded-lg border ${
                            isCorrect ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'
                          }`}
                        >
                          <div className="flex items-start gap-2 mb-2">
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                            ) : (
                              <XCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                            )}
                            <p className="font-medium text-foreground">{q.question}</p>
                          </div>
                          <p className="text-sm text-muted-foreground ml-7">
                            Tu respuesta: {q.options[selectedAnswers[q.id]]}
                          </p>
                          {!isCorrect && (
                            <p className="text-sm text-success ml-7 mt-1">
                              Correcta: {q.options[q.correctAnswer]}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  {!passed && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowQuiz(false);
                        setShowResults(false);
                        setQuizSubmitted(false);
                        setSelectedAnswers({});
                        setCurrentQuestion(0);
                        setClaudeEval(null);
                      }}
                    >
                      Revisar Contenido
                    </Button>
                  )}
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className={passed ? 'lovirtual-gradient-bg text-white' : ''}
                  >
                    Volver al Dashboard
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ModulePage;
