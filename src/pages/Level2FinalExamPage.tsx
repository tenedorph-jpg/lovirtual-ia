import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { level2FinalExamQuestions } from '@/data/level2Data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';
import { generateCertificatePDF } from '@/lib/generateCertificate';
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle, Trophy,
  Award, Download, MessageCircle, Brain, Loader2,
} from 'lucide-react';

interface AIEvaluation {
  approved: boolean;
  score: number;
  verdict: string;
  feedback: string;
  details: string[];
}

const Level2FinalExamPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentStudent, setFinalExamScore, markCertificateGenerated, updateStudentName } = useAuth();

  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [studentName, setStudentName] = useState(currentStudent?.name || '');
  const [nameConfirmed, setNameConfirmed] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [aiEval, setAiEval] = useState<AIEvaluation | null>(null);

  if (!currentStudent) {
    navigate('/');
    return null;
  }

  // If certificate already generated show it
  if (currentStudent.certificateGenerated && currentStudent.finalExamScore) {
    return (
      <Level2CertificateView
        studentName={currentStudent.name}
        score={currentStudent.finalExamScore}
        onBack={() => navigate('/level-2')}
      />
    );
  }

  const questions = level2FinalExamQuestions;

  const handleSelectAnswer = (questionId: number, answerIndex: number) => {
    if (!examSubmitted) setSelectedAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach(q => { if (selectedAnswers[q.id] === q.correctAnswer) correct++; });
    return Math.round((correct / questions.length) * 100);
  };

  const handleSubmitExam = async () => {
    setIsEvaluating(true);
    setExamSubmitted(true);

    let evaluation: AIEvaluation | null = null;
    try {
      const { data, error } = await supabase.functions.invoke('evaluate-exam', {
        body: {
          questions,
          selectedAnswers,
          studentName,
          examType: 'level2-final',
        },
      });
      if (!error && data) evaluation = data as AIEvaluation;
    } catch {
      // fallback
    }

    if (!evaluation) {
      const rawScore = calculateScore();
      evaluation = {
        approved: rawScore >= 70,
        score: rawScore,
        verdict: rawScore >= 70 ? 'APROBADO' : 'NO APROBADO',
        feedback: rawScore >= 70
          ? `¡Felicitaciones, ${studentName}! Has dominado el Nivel 2 de IA.`
          : `${studentName}, necesitas repasar algunos conceptos del Nivel 2.`,
        details: [],
      };
    }

    setAiEval(evaluation);
    setIsEvaluating(false);
    setShowResults(true);
    setFinalExamScore(evaluation.score);
  };

  const handleConfirmName = () => {
    if (studentName.trim()) { updateStudentName(studentName.trim()); setNameConfirmed(true); }
  };

  const allQuestionsAnswered = questions.every(q => selectedAnswers[q.id] !== undefined);
  const score = aiEval?.score ?? calculateScore();
  const passed = aiEval ? aiEval.approved : score >= 70;

  // ── Pre-exam screen ──
  if (!examStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="lovirtual-card max-w-xl w-full text-center animate-fade-in">
          <div className="p-4 rounded-full bg-warning/10 inline-flex mb-6">
            <Trophy className="w-16 h-16 text-warning" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Examen Final — Nivel 2</h1>
          <p className="text-sm text-primary font-semibold mb-4">Implementación y Automatización</p>
          <p className="text-muted-foreground mb-6">
            Este examen cubre todos los módulos del Nivel 2. Consta de {questions.length} preguntas
            y necesitas un mínimo de 70% para aprobar y obtener tu certificado.
          </p>
          {!nameConfirmed ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2 text-left">Confirma tu nombre para el certificado:</label>
              <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Tu nombre completo" className="mb-3" />
              <Button onClick={handleConfirmName} disabled={!studentName.trim()} className="w-full">Confirmar Nombre</Button>
            </div>
          ) : (
            <>
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">Certificado a nombre de:</p>
                <p className="font-bold text-foreground text-lg">{studentName}</p>
              </div>
              <div className="space-y-3 text-left mb-8">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"><CheckCircle className="w-5 h-5 text-success" /><span className="text-foreground">{questions.length} preguntas de selección múltiple</span></div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"><CheckCircle className="w-5 h-5 text-success" /><span className="text-foreground">70% mínimo para aprobar</span></div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"><CheckCircle className="w-5 h-5 text-success" /><span className="text-foreground">Certificado PDF descargable</span></div>
              </div>
              <Button size="lg" onClick={() => setExamStarted(true)} className="w-full lovirtual-gradient-bg text-white">Comenzar Examen</Button>
            </>
          )}
          <Button variant="ghost" onClick={() => navigate('/level-2')} className="mt-4">Volver a Nivel 2</Button>
        </div>
      </div>
    );
  }

  // ── Exam + Results ──
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><Trophy className="w-5 h-5 text-warning" /><span className="font-semibold text-foreground">Examen Final — Nivel 2</span></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Pregunta {currentQuestion + 1} de {questions.length}</span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {!showResults ? (
          <div className="space-y-6 animate-fade-in">
            <div className="lovirtual-card">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full lovirtual-gradient-bg text-white font-bold text-lg">{currentQuestion + 1}</span>
                <span className="text-sm text-muted-foreground">de {questions.length}</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-6">{questions[currentQuestion].question}</h3>
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, index) => (
                  <button key={index} onClick={() => handleSelectAnswer(questions[currentQuestion].id, index)}
                    className={`quiz-option w-full text-left ${selectedAnswers[questions[currentQuestion].id] === index ? 'selected' : ''}`}>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-current text-sm font-semibold">{String.fromCharCode(65 + index)}</span>
                      <span>{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentQuestion(prev => prev - 1)} disabled={currentQuestion === 0} className="gap-2"><ArrowLeft className="w-4 h-4" />Anterior</Button>
              {currentQuestion < questions.length - 1 ? (
                <Button onClick={() => setCurrentQuestion(prev => prev + 1)} disabled={selectedAnswers[questions[currentQuestion].id] === undefined} className="gap-2">Siguiente<ArrowRight className="w-4 h-4" /></Button>
              ) : (
                <Button onClick={handleSubmitExam} disabled={!allQuestionsAnswered || isEvaluating} className="lovirtual-gradient-bg text-white gap-2">
                  {isEvaluating ? <><Loader2 className="w-4 h-4 animate-spin" />Evaluando...</> : <><CheckCircle className="w-4 h-4" />Finalizar Examen</>}
                </Button>
              )}
            </div>
            <div className="flex justify-center gap-2 pt-4 flex-wrap">
              {questions.map((_, index) => (
                <button key={index} onClick={() => setCurrentQuestion(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${index === currentQuestion ? 'lovirtual-gradient-bg' : selectedAnswers[questions[index].id] !== undefined ? 'bg-success' : 'bg-muted'}`} />
              ))}
            </div>
          </div>
        ) : isEvaluating ? (
          <div className="text-center animate-fade-in py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
              <Brain className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">La IA está revisando tu examen</h3>
            <p className="text-muted-foreground mb-6">Analizando tus respuestas del Nivel 2...</p>
            <div className="flex justify-center gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center animate-scale-in">
            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${passed ? 'bg-success/10' : 'bg-destructive/10'}`}>
              {passed ? <Trophy className="w-12 h-12 text-success" /> : <XCircle className="w-12 h-12 text-destructive" />}
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-2">{passed ? '¡Felicitaciones!' : 'No aprobaste'}</h3>
            <p className="text-xl text-muted-foreground mb-2">Tu puntuación: <span className="font-bold text-foreground">{score}%</span></p>

            {aiEval && (
              <div className={`my-6 p-5 rounded-xl border-2 text-left max-w-xl mx-auto ${passed ? 'border-success/40 bg-success/5' : 'border-destructive/40 bg-destructive/5'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-semibold text-foreground text-sm">Evaluación de IA</span>
                  <span className={`ml-auto text-xs font-bold px-2 py-1 rounded-full ${passed ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                    {aiEval.verdict}
                  </span>
                </div>
                <p className="text-foreground text-sm leading-relaxed mb-3">{aiEval.feedback}</p>
                {aiEval.details.length > 0 && (
                  <ul className="space-y-1">
                    {aiEval.details.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className={`mt-0.5 flex-shrink-0 ${passed ? 'text-success' : 'text-warning'}`}>{passed ? '★' : '→'}</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <p className="text-muted-foreground mb-8">{passed ? 'Has completado el Nivel 2. ¡Tu certificado está listo!' : 'Necesitas al menos 70% para aprobar.'}</p>
            {passed ? (
              <Button size="lg" onClick={() => { markCertificateGenerated(); navigate('/level-2/final-exam'); }} className="lovirtual-gradient-bg text-white gap-2"><Award className="w-5 h-5" />Ver Mi Certificado</Button>
            ) : (
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => navigate('/level-2')}>Revisar Módulos</Button>
                <Button onClick={() => { setExamStarted(false); setShowResults(false); setExamSubmitted(false); setSelectedAnswers({}); setCurrentQuestion(0); setAiEval(null); }}>Intentar de Nuevo</Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// ── Certificate View for Level 2 ──
const Level2CertificateView: React.FC<{
  studentName: string;
  score: number;
  onBack: () => void;
}> = ({ studentName, score, onBack }) => {
  const currentDate = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const certId = `CERT-N2-${Date.now()}-${Math.floor(Math.random() * 100)}`;
  const courseName = 'Nivel 2: Implementación y Automatización con IA';

  const generatePDF = () => generateCertificatePDF(studentName, score);

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola, soy ${studentName}. He finalizado exitosamente el Nivel 2 (Implementación y Automatización) con una calificación de ${score}%. Adjunto mi certificado.`
    );
    window.open(`https://wa.me/17875898071?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Volver a Nivel 2</Button>
          <ThemeToggle />
        </div>

        {/* Certificate Preview */}
        <div className="bg-card rounded-xl border border-border shadow-xl mb-6 overflow-hidden">
          <div className="bg-white p-3 sm:p-5" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            <div className="border-[3px] border-[#01507d] p-[3px]">
              <div className="border border-[#b8983d] p-[2px]">
                <div className="border border-[#01507d]/20 p-5 sm:p-8">

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 border-t border-[#b8983d]" />
                    <p className="text-[#c9a227] tracking-[0.35em] text-xs font-sans font-bold whitespace-nowrap">
                      A C A D E M I A &nbsp; L O V I R T U A L
                    </p>
                    <div className="flex-1 border-t border-[#b8983d]" />
                  </div>

                  <h1 className="text-center text-4xl sm:text-5xl md:text-[3.5rem] font-bold text-[#01507d] mb-1 leading-none tracking-wide">
                    CERTIFICADO
                  </h1>
                  <p className="text-center text-xs sm:text-sm tracking-[0.5em] text-gray-500 mb-3 font-sans">
                    DE FINALIZACIÓN — NIVEL 2
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 border-t border-[#b8983d]" />
                    <div className="w-2 h-2 bg-[#b8983d] rotate-45 flex-shrink-0" />
                    <div className="flex-1 border-t border-[#b8983d]" />
                  </div>

                  <p className="text-center text-[10px] sm:text-xs text-gray-400 italic mb-3 font-sans tracking-widest uppercase">
                    Se certifica que
                  </p>

                  <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-bold italic text-[#026E9D] mb-1 leading-tight">
                    {studentName}
                  </h2>
                  <div className="flex flex-col items-center gap-[3px] mb-4">
                    <div className="border-t-2 border-[#b8983d]" style={{ width: 'min(18rem, 80%)' }} />
                    <div className="border-t border-[#b8983d]/50" style={{ width: 'min(14rem, 65%)' }} />
                  </div>

                  <p className="text-center text-xs sm:text-sm text-gray-500 max-w-lg mx-auto mb-3 font-sans leading-relaxed">
                    Ha completado satisfactoriamente todos los módulos, actividades prácticas
                    y evaluaciones del programa de formación:
                  </p>

                  <div className="flex justify-center mb-2">
                    <div className="border border-[#01507d]/30 bg-[#edf3fa] rounded px-4 py-2">
                      <p className="text-[#01507d] font-bold text-xs sm:text-sm font-sans text-center">{courseName}</p>
                    </div>
                  </div>

                  <p className="text-center text-xs text-gray-400 mb-4 font-sans">
                    Calificación obtenida:{' '}
                    <span className="font-bold text-[#c9a227]">{score}%</span>
                  </p>

                  <div className="flex items-center gap-2 mb-5">
                    <div className="flex-1 border-t border-gray-200" />
                    <div className="w-1.5 h-1.5 bg-gray-200 rotate-45 flex-shrink-0" />
                    <div className="flex-1 border-t border-gray-200" />
                  </div>

                  <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
                    <div className="text-center">
                      <div className="border-t border-[#01507d] pt-2 mx-1 sm:mx-3">
                        <p className="text-[8px] sm:text-[10px] font-sans text-gray-400 uppercase tracking-wider">Fecha de Emisión</p>
                        <p className="text-[10px] sm:text-xs font-sans text-gray-600 font-medium mt-1">{currentDate}</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <img src="/sello.jpeg" alt="Sello oficial LoVirtual" className="w-24 h-24 sm:w-28 sm:h-28 object-contain" style={{ mixBlendMode: 'multiply' }} />
                    </div>
                    <div className="text-center">
                      <div className="flex items-end justify-center mb-1" style={{ height: '4rem' }}>
                        <img src="/firma.png" alt="Firma Dirección Académica" className="w-36 sm:w-44 h-14 object-contain" style={{ mixBlendMode: 'multiply' }} />
                      </div>
                      <div className="border-t border-[#01507d] pt-2 mx-1 sm:mx-3">
                        <p className="text-[8px] sm:text-[10px] font-sans text-gray-400 uppercase tracking-wider">Dirección Académica</p>
                        <p className="text-[10px] sm:text-xs font-sans text-gray-600 font-medium mt-1">Academia LoVirtual</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-right text-[8px] font-sans text-gray-300 mt-1 mr-1">
              ID: {certId} &nbsp;|&nbsp; Autenticado por Academia LoVirtual LLC
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button size="lg" onClick={generatePDF} className="lovirtual-gradient-bg text-white gap-2 h-14">
            <Download className="w-5 h-5" />
            Descargar Certificado PDF
          </Button>
          <Button size="lg" variant="outline" onClick={handleWhatsApp}
            className="gap-2 h-14 border-2 border-success text-success hover:bg-success hover:text-white">
            <MessageCircle className="w-5 h-5" />
            📲 Confirmar Finalización a Gerencia
          </Button>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-6">¡Felicitaciones por completar el Nivel 2!</p>
      </div>
    </div>
  );
};

export default Level2FinalExamPage;
