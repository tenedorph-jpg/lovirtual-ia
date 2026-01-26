import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { finalExamQuestions } from '@/data/courseModules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { jsPDF } from 'jspdf';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  XCircle,
  Trophy,
  Award,
  Download,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

const FinalExamPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentStudent, setFinalExamScore, markCertificateGenerated, updateStudentName } = useAuth();

  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [studentName, setStudentName] = useState(currentStudent?.name || '');
  const [nameConfirmed, setNameConfirmed] = useState(false);

  if (!currentStudent) {
    navigate('/');
    return null;
  }

  // If already has certificate, show certificate view
  if (currentStudent.certificateGenerated && currentStudent.finalExamScore) {
    return (
      <CertificateView
        studentName={currentStudent.name}
        score={currentStudent.finalExamScore}
        onBack={() => navigate('/dashboard')}
      />
    );
  }

  const handleSelectAnswer = (questionId: number, answerIndex: number) => {
    if (!examSubmitted) {
      setSelectedAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
    }
  };

  const calculateScore = () => {
    let correct = 0;
    finalExamQuestions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / finalExamQuestions.length) * 100);
  };

  const handleSubmitExam = () => {
    const score = calculateScore();
    setExamSubmitted(true);
    setShowResults(true);
    setFinalExamScore(score);
  };

  const handleConfirmName = () => {
    if (studentName.trim()) {
      updateStudentName(studentName.trim());
      setNameConfirmed(true);
    }
  };

  const allQuestionsAnswered = finalExamQuestions.every(q => selectedAnswers[q.id] !== undefined);
  const score = calculateScore();
  const passed = score >= 70;

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="lovirtual-card max-w-xl w-full text-center animate-fade-in">
          <div className="p-4 rounded-full bg-warning/10 inline-flex mb-6">
            <Trophy className="w-16 h-16 text-warning" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Examen Final</h1>
          <p className="text-muted-foreground mb-6">
            Este examen consolida los conocimientos de los 10 módulos del curso.
            Consta de 10 preguntas y necesitas un mínimo de 70% para aprobar y obtener tu certificado.
          </p>
          
          {!nameConfirmed ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-2 text-left">
                Confirma tu nombre para el certificado:
              </label>
              <Input
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Tu nombre completo"
                className="mb-3"
              />
              <Button
                onClick={handleConfirmName}
                disabled={!studentName.trim()}
                className="w-full"
              >
                Confirmar Nombre
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">Certificado a nombre de:</p>
                <p className="font-bold text-foreground text-lg">{studentName}</p>
              </div>
              <div className="space-y-3 text-left mb-8">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-foreground">10 preguntas de selección múltiple</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-foreground">70% mínimo para aprobar</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-foreground">Certificado PDF descargable</span>
                </div>
              </div>
              <Button
                size="lg"
                onClick={() => setExamStarted(true)}
                className="w-full lovirtual-gradient-bg text-white"
              >
                Comenzar Examen
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mt-4"
          >
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-warning" />
            <span className="font-semibold text-foreground">Examen Final</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Pregunta {currentQuestion + 1} de {finalExamQuestions.length}
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {!showResults ? (
          <div className="space-y-6 animate-fade-in">
            {/* Question */}
            <div className="lovirtual-card">
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full lovirtual-gradient-bg text-white font-bold text-lg">
                  {currentQuestion + 1}
                </span>
                <span className="text-sm text-muted-foreground">de {finalExamQuestions.length}</span>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-6">
                {finalExamQuestions[currentQuestion].question}
              </h3>

              <div className="space-y-3">
                {finalExamQuestions[currentQuestion].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelectAnswer(finalExamQuestions[currentQuestion].id, index)}
                    className={`quiz-option w-full text-left ${
                      selectedAnswers[finalExamQuestions[currentQuestion].id] === index ? 'selected' : ''
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

              {currentQuestion < finalExamQuestions.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  disabled={selectedAnswers[finalExamQuestions[currentQuestion].id] === undefined}
                  className="gap-2"
                >
                  Siguiente
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitExam}
                  disabled={!allQuestionsAnswered}
                  className="lovirtual-gradient-bg text-white gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Finalizar Examen
                </Button>
              )}
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 pt-4 flex-wrap">
              {finalExamQuestions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentQuestion
                      ? 'lovirtual-gradient-bg'
                      : selectedAnswers[finalExamQuestions[index].id] !== undefined
                      ? 'bg-success'
                      : 'bg-muted'
                  }`}
                />
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
                <Trophy className="w-12 h-12 text-success" />
              ) : (
                <XCircle className="w-12 h-12 text-destructive" />
              )}
            </div>

            <h3 className="text-3xl font-bold text-foreground mb-2">
              {passed ? '¡Felicitaciones!' : 'No aprobaste'}
            </h3>
            <p className="text-xl text-muted-foreground mb-2">
              Tu puntuación: <span className="font-bold text-foreground">{score}%</span>
            </p>
            <p className="text-muted-foreground mb-8">
              {passed
                ? 'Has completado exitosamente el curso. ¡Tu certificado está listo!'
                : 'Necesitas al menos 70% para aprobar. Revisa los módulos y vuelve a intentarlo.'}
            </p>

            {passed ? (
              <div className="space-y-4">
                <Button
                  size="lg"
                  onClick={() => {
                    markCertificateGenerated();
                    navigate('/final-exam');
                  }}
                  className="lovirtual-gradient-bg text-white gap-2"
                >
                  <Award className="w-5 h-5" />
                  Ver Mi Certificado
                </Button>
              </div>
            ) : (
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Revisar Módulos
                </Button>
                <Button
                  onClick={() => {
                    setExamStarted(false);
                    setShowResults(false);
                    setExamSubmitted(false);
                    setSelectedAnswers({});
                    setCurrentQuestion(0);
                  }}
                >
                  Intentar de Nuevo
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// Certificate View Component
const CertificateView: React.FC<{
  studentName: string;
  score: number;
  onBack: () => void;
}> = ({ studentName, score, onBack }) => {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const verificationCode = `LV-${Date.now().toString(36).toUpperCase()}`;

  const generatePDF = () => {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();

    // Background gradient (simulated with rectangles)
    pdf.setFillColor(1, 80, 125); // #01507d
    pdf.rect(0, 0, width, height, 'F');

    // Inner white area
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(15, 15, width - 30, height - 30, 5, 5, 'F');

    // Border accent
    pdf.setDrawColor(1, 152, 207); // #0198CF
    pdf.setLineWidth(2);
    pdf.roundedRect(20, 20, width - 40, height - 40, 3, 3, 'S');

    // Logo placeholder (circle with text)
    pdf.setFillColor(1, 80, 125);
    pdf.circle(width / 2, 45, 15, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LV', width / 2, 48, { align: 'center' });

    // Title
    pdf.setTextColor(1, 80, 125);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CERTIFICADO DE FINALIZACIÓN', width / 2, 75, { align: 'center' });

    // Subtitle
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('LoVirtual Academy certifica que', width / 2, 90, { align: 'center' });

    // Student Name
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(1, 110, 157); // #026E9D
    pdf.text(studentName.toUpperCase(), width / 2, 110, { align: 'center' });

    // Course Name
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('ha completado satisfactoriamente el curso', width / 2, 125, { align: 'center' });

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(1, 80, 125);
    pdf.text('Inteligencia Artificial y Herramientas Digitales:', width / 2, 140, { align: 'center' });
    pdf.text('De Usuario a Creador', width / 2, 150, { align: 'center' });

    // Score
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Calificación: ${score}%`, width / 2, 165, { align: 'center' });

    // Date
    pdf.text(currentDate, width / 2, 175, { align: 'center' });

    // QR Code placeholder (square with text)
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(width - 55, height - 55, 30, 30, 'S');
    pdf.setFontSize(6);
    pdf.setTextColor(150, 150, 150);
    pdf.text('QR VERIFICACIÓN', width - 40, height - 27, { align: 'center' });

    // Verification code
    pdf.setFontSize(8);
    pdf.text(`Código: ${verificationCode}`, width - 40, height - 20, { align: 'center' });

    // Footer
    pdf.setFontSize(10);
    pdf.setTextColor(1, 80, 125);
    pdf.text('www.lovirtual.com', width / 2, height - 25, { align: 'center' });

    pdf.save(`Certificado_${studentName.replace(/\s+/g, '_')}_LoVirtual.pdf`);
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hola, soy ${studentName}. He finalizado exitosamente el examen del curso de IA con una calificación de ${score}%. Adjunto mi certificado.`
    );
    window.open(`https://wa.me/17875898071?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-4xl">
        <Button variant="ghost" onClick={onBack} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </Button>

        {/* Certificate Preview */}
        <div className="lovirtual-card mb-6 overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-secondary p-4">
            <div className="bg-white rounded-lg p-8 text-center">
              {/* Logo */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full lovirtual-gradient-bg mb-4">
                <Sparkles className="w-10 h-10 text-white" />
              </div>

              <h1 className="text-3xl font-bold text-primary mb-2">
                CERTIFICADO DE FINALIZACIÓN
              </h1>
              <p className="text-muted-foreground mb-6">LoVirtual Academy certifica que</p>

              <h2 className="text-4xl font-bold text-secondary mb-4">
                {studentName.toUpperCase()}
              </h2>

              <p className="text-muted-foreground mb-2">ha completado satisfactoriamente el curso</p>
              <h3 className="text-xl font-bold text-primary mb-1">
                Inteligencia Artificial y Herramientas Digitales:
              </h3>
              <h4 className="text-lg text-primary mb-6">De Usuario a Creador</h4>

              <div className="flex items-center justify-center gap-8 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Calificación</p>
                  <p className="text-2xl font-bold text-success">{score}%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="text-lg font-semibold text-foreground">{currentDate}</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Award className="w-4 h-4" />
                <span>Código de verificación: {verificationCode}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            size="lg"
            onClick={generatePDF}
            className="lovirtual-gradient-bg text-white gap-2 h-14"
          >
            <Download className="w-5 h-5" />
            Descargar Certificado PDF
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={handleWhatsApp}
            className="gap-2 h-14 border-2 border-success text-success hover:bg-success hover:text-white"
          >
            <MessageCircle className="w-5 h-5" />
            📲 Confirmar Finalización a Gerencia
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¡Felicitaciones por completar el curso! Comparte tu logro.
        </p>
      </div>
    </div>
  );
};

export default FinalExamPage;
