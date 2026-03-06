import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { finalExamQuestions } from '@/data/courseModules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { jsPDF } from 'jspdf';
import ThemeToggle from '@/components/ThemeToggle';
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle, Trophy,
  Award, Download, MessageCircle, Sparkles,
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
    if (!examSubmitted) setSelectedAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  const calculateScore = () => {
    let correct = 0;
    finalExamQuestions.forEach(q => { if (selectedAnswers[q.id] === q.correctAnswer) correct++; });
    return Math.round((correct / finalExamQuestions.length) * 100);
  };

  const handleSubmitExam = () => {
    const score = calculateScore();
    setExamSubmitted(true);
    setShowResults(true);
    setFinalExamScore(score);
  };

  const handleConfirmName = () => {
    if (studentName.trim()) { updateStudentName(studentName.trim()); setNameConfirmed(true); }
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
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"><CheckCircle className="w-5 h-5 text-success" /><span className="text-foreground">10 preguntas de selección múltiple</span></div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"><CheckCircle className="w-5 h-5 text-success" /><span className="text-foreground">70% mínimo para aprobar</span></div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"><CheckCircle className="w-5 h-5 text-success" /><span className="text-foreground">Certificado PDF descargable</span></div>
              </div>
              <Button size="lg" onClick={() => setExamStarted(true)} className="w-full lovirtual-gradient-bg text-white">Comenzar Examen</Button>
            </>
          )}
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mt-4">Volver al Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2"><Trophy className="w-5 h-5 text-warning" /><span className="font-semibold text-foreground">Examen Final</span></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Pregunta {currentQuestion + 1} de {finalExamQuestions.length}</span>
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
                <span className="text-sm text-muted-foreground">de {finalExamQuestions.length}</span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-6">{finalExamQuestions[currentQuestion].question}</h3>
              <div className="space-y-3">
                {finalExamQuestions[currentQuestion].options.map((option, index) => (
                  <button key={index} onClick={() => handleSelectAnswer(finalExamQuestions[currentQuestion].id, index)}
                    className={`quiz-option w-full text-left ${selectedAnswers[finalExamQuestions[currentQuestion].id] === index ? 'selected' : ''}`}>
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
              {currentQuestion < finalExamQuestions.length - 1 ? (
                <Button onClick={() => setCurrentQuestion(prev => prev + 1)} disabled={selectedAnswers[finalExamQuestions[currentQuestion].id] === undefined} className="gap-2">Siguiente<ArrowRight className="w-4 h-4" /></Button>
              ) : (
                <Button onClick={handleSubmitExam} disabled={!allQuestionsAnswered} className="lovirtual-gradient-bg text-white gap-2"><CheckCircle className="w-4 h-4" />Finalizar Examen</Button>
              )}
            </div>
            <div className="flex justify-center gap-2 pt-4 flex-wrap">
              {finalExamQuestions.map((_, index) => (
                <button key={index} onClick={() => setCurrentQuestion(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${index === currentQuestion ? 'lovirtual-gradient-bg' : selectedAnswers[finalExamQuestions[index].id] !== undefined ? 'bg-success' : 'bg-muted'}`} />
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
            <p className="text-muted-foreground mb-8">{passed ? 'Has completado exitosamente el curso. ¡Tu certificado está listo!' : 'Necesitas al menos 70% para aprobar.'}</p>
            {passed ? (
              <Button size="lg" onClick={() => { markCertificateGenerated(); navigate('/final-exam'); }} className="lovirtual-gradient-bg text-white gap-2"><Award className="w-5 h-5" />Ver Mi Certificado</Button>
            ) : (
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>Revisar Módulos</Button>
                <Button onClick={() => { setExamStarted(false); setShowResults(false); setExamSubmitted(false); setSelectedAnswers({}); setCurrentQuestion(0); }}>Intentar de Nuevo</Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

// ========== REDESIGNED CERTIFICATE ==========
const CertificateView: React.FC<{
  studentName: string;
  score: number;
  onBack: () => void;
}> = ({ studentName, score, onBack }) => {
  const currentDate = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const certId = `CERT-${Date.now()}-${Math.floor(Math.random() * 100)}`;
  const courseName = 'Inteligencia Artificial y Herramientas Digitales: De Usuario a Creador';

  const generatePDF = () => {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const w = pdf.internal.pageSize.getWidth();
    const h = pdf.internal.pageSize.getHeight();

    // White background
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, w, h, 'F');

    // Outer border
    pdf.setDrawColor(1, 80, 125);
    pdf.setLineWidth(2);
    pdf.rect(8, 8, w - 16, h - 16, 'S');

    // Inner border
    pdf.setDrawColor(1, 152, 207);
    pdf.setLineWidth(0.8);
    pdf.rect(12, 12, w - 24, h - 24, 'S');

    // "ACADEMIA LOVIRTUAL" top
    pdf.setTextColor(1, 152, 207);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('ACADEMIA LOVIRTUAL', w / 2, 30, { align: 'center' });

    // "CERTIFICADO"
    pdf.setTextColor(1, 80, 125);
    pdf.setFontSize(42);
    pdf.setFont('times', 'bold');
    pdf.text('CERTIFICADO', w / 2, 52, { align: 'center' });

    // "DE FINALIZACIÓN"
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    const subTitle = 'D E   F I N A L I Z A C I Ó N';
    pdf.text(subTitle, w / 2, 62, { align: 'center' });

    // "SE CERTIFICA QUE"
    pdf.setFontSize(11);
    pdf.setTextColor(120, 120, 120);
    pdf.text('SE CERTIFICA QUE', w / 2, 78, { align: 'center' });

    // Student Name (italic blue)
    pdf.setFontSize(30);
    pdf.setFont('times', 'bolditalic');
    pdf.setTextColor(1, 110, 157);
    pdf.text(studentName, w / 2, 95, { align: 'center' });

    // Decorative line under name
    const nameWidth = pdf.getTextWidth(studentName);
    const lineStartX = (w - nameWidth) / 2 - 10;
    const lineEndX = (w + nameWidth) / 2 + 10;
    pdf.setDrawColor(1, 152, 207);
    pdf.setLineWidth(0.5);
    pdf.line(lineStartX, 99, lineEndX, 99);

    // Description text
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    const desc = 'Ha completado satisfactoriamente todos los módulos, actividades prácticas';
    const desc2 = 'y evaluaciones del programa de formación:';
    pdf.text(desc, w / 2, 112, { align: 'center' });
    pdf.text(desc2, w / 2, 118, { align: 'center' });

    // Course name in pill
    pdf.setFillColor(240, 245, 250);
    const pillW = 200;
    const pillH = 12;
    const pillX = (w - pillW) / 2;
    const pillY = 124;
    pdf.roundedRect(pillX, pillY, pillW, pillH, 4, 4, 'F');
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(1, 80, 125);
    pdf.text(courseName, w / 2, pillY + 8, { align: 'center' });

    // Score
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Calificación obtenida: ${score}%`, w / 2, 148, { align: 'center' });

    // Footer section: 3 columns
    const footerY = 165;

    // Left: Date
    pdf.setDrawColor(1, 80, 125);
    pdf.setLineWidth(0.5);
    pdf.line(30, footerY, 90, footerY);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('FECHA DE EMISIÓN', 60, footerY + 5, { align: 'center' });
    pdf.setFontSize(10);
    pdf.setTextColor(50, 50, 50);
    pdf.text(currentDate, 60, footerY + 11, { align: 'center' });

    // Center: Seal
    pdf.setDrawColor(1, 80, 125);
    pdf.setLineWidth(1.5);
    pdf.circle(w / 2, footerY + 2, 14, 'S');
    pdf.setDrawColor(1, 152, 207);
    pdf.setLineWidth(0.5);
    pdf.circle(w / 2, footerY + 2, 11, 'S');
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(1, 80, 125);
    pdf.text('SELLO', w / 2, footerY - 1, { align: 'center' });
    pdf.text('LoVirtual', w / 2, footerY + 3, { align: 'center' });
    pdf.text('LLC', w / 2, footerY + 7, { align: 'center' });

    // Right: Signature
    pdf.setDrawColor(1, 80, 125);
    pdf.setLineWidth(0.5);
    pdf.line(w - 90, footerY, w - 30, footerY);
    // Simulate signature with a curve
    pdf.setDrawColor(30, 30, 80);
    pdf.setLineWidth(0.8);
    const sigCx = w - 60;
    // Simple signature simulation
    pdf.line(sigCx - 15, footerY - 8, sigCx - 5, footerY - 14);
    pdf.line(sigCx - 5, footerY - 14, sigCx + 5, footerY - 6);
    pdf.line(sigCx + 5, footerY - 6, sigCx + 15, footerY - 12);
    pdf.line(sigCx + 15, footerY - 12, sigCx + 20, footerY - 5);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    pdf.text('DIRECCIÓN ACADÉMICA', sigCx, footerY + 5, { align: 'center' });
    pdf.setFontSize(8);
    pdf.text('Academia LoVirtual', sigCx, footerY + 10, { align: 'center' });

    // Bottom right: Cert ID
    pdf.setFontSize(6);
    pdf.setTextColor(180, 180, 180);
    pdf.text(`ID: ${certId}`, w - 15, h - 15, { align: 'right' });

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
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" />Volver al Dashboard</Button>
          <ThemeToggle />
        </div>

        {/* Certificate Preview — white card that contrasts in dark mode */}
        <div className="bg-card rounded-xl border border-border shadow-lg mb-6 overflow-hidden">
          {/* Certificate inner with forced white background */}
          <div className="bg-white p-3 sm:p-6">
            <div className="border-2 border-[#01507d] p-2">
              <div className="border border-[#0198CF] p-6 sm:p-10 text-center">
                {/* Top title */}
                <p className="text-sm sm:text-base tracking-[0.3em] text-[#0198CF] mb-4 font-medium">
                  ACADEMIA LOVIRTUAL
                </p>

                {/* CERTIFICADO */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#01507d] mb-1" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                  CERTIFICADO
                </h1>

                {/* DE FINALIZACIÓN */}
                <p className="text-sm sm:text-base tracking-[0.4em] text-gray-500 mb-8">
                  DE FINALIZACIÓN
                </p>

                {/* SE CERTIFICA QUE */}
                <p className="text-xs sm:text-sm text-gray-400 mb-4 uppercase tracking-wider">
                  Se certifica que
                </p>

                {/* Student Name */}
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold italic text-[#026E9D] mb-2" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                  {studentName}
                </h2>
                <div className="w-64 mx-auto border-b border-[#0198CF] mb-6" />

                {/* Description */}
                <p className="text-sm text-gray-500 max-w-lg mx-auto mb-6 leading-relaxed">
                  Ha completado satisfactoriamente todos los módulos, actividades prácticas
                  y evaluaciones del programa de formación:
                </p>

                {/* Course Name Pill */}
                <div className="inline-block bg-[#f0f5fa] rounded-full px-6 py-3 mb-6">
                  <p className="text-sm sm:text-base font-semibold text-[#01507d]">{courseName}</p>
                </div>

                <p className="text-sm text-gray-400 mb-10">Calificación obtenida: {score}%</p>

                {/* Footer: 3 columns */}
                <div className="grid grid-cols-3 items-end gap-4 mt-4">
                  {/* Left: Date */}
                  <div className="text-center">
                    <div className="border-t border-[#01507d] pt-2 mx-4">
                      <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Fecha de Emisión</p>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">{currentDate}</p>
                    </div>
                  </div>

                  {/* Center: Seal */}
                  <div className="flex justify-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3px] border-[#01507d] flex items-center justify-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[#0198CF] flex flex-col items-center justify-center">
                        <p className="text-[8px] sm:text-[10px] font-bold text-[#01507d] tracking-wider">SELLO</p>
                        <p className="text-[10px] sm:text-xs font-bold text-[#01507d]">LoVirtual</p>
                        <p className="text-[8px] sm:text-[10px] text-[#01507d]">LLC</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Signature */}
                  <div className="text-center">
                    {/* Large signature area */}
                    <div className="h-16 sm:h-20 flex items-end justify-center mb-1">
                      <svg viewBox="0 0 200 60" className="w-40 sm:w-52 h-14 sm:h-18">
                        <path d="M20,45 C30,20 50,15 70,30 C90,45 100,15 120,20 C140,25 150,40 170,15 C175,10 180,25 185,20"
                          fill="none" stroke="#1e1e50" strokeWidth="2" strokeLinecap="round" />
                        <path d="M60,42 L140,42" fill="none" stroke="#1e1e50" strokeWidth="0.5" />
                      </svg>
                    </div>
                    <div className="border-t border-[#01507d] pt-2 mx-4">
                      <p className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Dirección Académica</p>
                      <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1">Academia LoVirtual</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Cert ID - bottom right */}
            <p className="text-right text-[9px] text-gray-300 mt-2 mr-2">ID: {certId}</p>
          </div>
        </div>

        {/* Action Buttons */}
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
        <p className="text-center text-sm text-muted-foreground mt-6">¡Felicitaciones por completar el curso! Comparte tu logro.</p>
      </div>
    </div>
  );
};

export default FinalExamPage;
