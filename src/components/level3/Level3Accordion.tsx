import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Lock, Upload, Clock, Award } from 'lucide-react';
import FileUpload, { EvaluationResult, ExistingFile } from './FileUpload';
import { level3Modules } from '@/data/level3Data';
import { generateCertificatePDF } from '@/lib/generateCertificate';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const Level3Accordion: React.FC = () => {
  const { user, studentProgress, completeModule, markCertificateGenerated } = useAuth();
  const [assignments, setAssignments] = useState<Record<number, ExistingFile[]>>({});
  const [showCertificate, setShowCertificate] = useState<{ totalScore: number; avg: number } | null>(null);

  const completedModules = studentProgress?.completed_modules ?? [];

  const fetchAssignments = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('assignments')
      .select('id, module_id, file_name, file_path, status, grade, feedback')
      .eq('user_id', user.id)
      .gte('module_id', 201)
      .lte('module_id', 210)
      .order('created_at', { ascending: true });

    if (data) {
      const map: Record<number, ExistingFile[]> = {};
      data.forEach(a => {
        if (!map[a.module_id]) map[a.module_id] = [];
        map[a.module_id].push({
          id: a.id,
          file_name: a.file_name,
          file_path: a.file_path,
          status: a.status,
          grade: a.grade,
          feedback: a.feedback,
        });
      });
      setAssignments(map);

      // Check certificate eligibility - need at least one graded & passed file per module
      const allModulesPassed = level3Modules.every(mod => {
        const files = map[mod.id] || [];
        return files.some(f => f.status === 'graded' && (f.grade || 0) >= 7);
      });

      if (allModulesPassed) {
        // Use best grade per module
        const totalScore = level3Modules.reduce((sum, mod) => {
          const files = map[mod.id] || [];
          const bestGrade = Math.max(...files.filter(f => f.status === 'graded').map(f => f.grade || 0));
          return sum + bestGrade;
        }, 0);
        const avg = Math.round((totalScore / 10) * 10) / 10;
        setShowCertificate({ totalScore, avg });
      }
    }
  }, [user]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const getModuleStatus = (moduleId: number): 'completed' | 'available' | 'locked' => {
    const files = assignments[moduleId] || [];
    const hasPassed = files.some(f => f.status === 'graded' && (f.grade || 0) >= 7);
    if (hasPassed) return 'completed';
    if (completedModules.includes(moduleId)) return 'completed';
    if (moduleId === 201) return 'available';
    // Previous module must have a passing grade or be completed
    const prevFiles = assignments[moduleId - 1] || [];
    const prevPassed = prevFiles.some(f => f.status === 'graded' && (f.grade || 0) >= 7);
    if (prevPassed || completedModules.includes(moduleId - 1)) return 'available';
    return 'locked';
  };

  const getBestGrade = (moduleId: number): number | null => {
    const files = assignments[moduleId] || [];
    const graded = files.filter(f => f.status === 'graded' && f.grade != null);
    if (graded.length === 0) return null;
    return Math.max(...graded.map(f => f.grade!));
  };

  const getModuleStatusLabel = (moduleId: number): React.ReactNode => {
    const files = assignments[moduleId] || [];
    const bestGrade = getBestGrade(moduleId);
    if (bestGrade !== null) {
      return (
        <span className={`text-xs font-medium ml-2 ${bestGrade >= 7 ? 'text-success' : 'text-destructive'}`}>
          ✓ Mejor nota: {bestGrade}/10
        </span>
      );
    }
    if (files.some(f => f.status === 'evaluating')) {
      return <span className="text-xs font-medium ml-2 text-accent">⏳ Evaluando...</span>;
    }
    if (files.some(f => f.status === 'submitted')) {
      return <span className="text-xs text-primary font-medium ml-2">✓ Enviado ({files.length} archivo{files.length > 1 ? 's' : ''})</span>;
    }
    return null;
  };

  const handleUploadSuccess = async (moduleId: number, result?: EvaluationResult) => {
    await completeModule(moduleId);
    await fetchAssignments();

    if (result?.certificateEligible && result.totalScore) {
      setShowCertificate({ totalScore: result.totalScore, avg: result.averageGrade || result.totalScore / 10 });
      toast({
        title: '🎓 ¡Felicitaciones!',
        description: `Has completado el Nivel 3 con una calificación de ${result.totalScore}/100. ¡Tu certificado está listo!`,
      });
    }
  };

  const handleGenerateCertificate = async () => {
    if (!showCertificate || !user) return;
    const profileData = await supabase.from('profiles').select('full_name').eq('user_id', user.id).single();
    const name = profileData.data?.full_name || 'Estudiante';
    await generateCertificatePDF(name, showCertificate.totalScore, 'level3');
    await markCertificateGenerated();
    toast({ title: '📄 Certificado generado', description: 'El PDF se ha descargado.' });
  };

  return (
    <div className="space-y-6">
      {showCertificate && (
        <div className="p-6 rounded-xl border-2 border-success/40 bg-success/5">
          <div className="flex items-center gap-3 mb-3">
            <Award className="w-8 h-8 text-success" />
            <div>
              <h3 className="text-lg font-bold text-foreground">🎓 ¡Felicidades! Nivel 3 Completado</h3>
              <p className="text-sm text-muted-foreground">
                Calificación Final: <span className="font-bold text-success text-lg">{showCertificate.totalScore}/100</span>
                <span className="ml-2 text-xs">(Promedio: {showCertificate.avg}/10)</span>
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Has completado todos los módulos del Nivel 3: Dominio Práctico con una calificación aprobatoria. ¡Descarga tu certificado!
          </p>
          <Button onClick={handleGenerateCertificate} className="gap-2 lovirtual-gradient-bg text-white">
            <Award className="w-4 h-4" />
            Descargar Certificado Nivel 3
          </Button>
        </div>
      )}

      <Accordion type="single" collapsible className="space-y-3">
        {level3Modules.map((mod) => {
          const status = getModuleStatus(mod.id);
          const isLocked = status === 'locked';
          const isCompleted = status === 'completed';
          const moduleFiles = assignments[mod.id] || [];

          return (
            <AccordionItem
              key={mod.id}
              value={`module-${mod.id}`}
              disabled={isLocked}
              className={`border rounded-xl overflow-hidden transition-all ${
                isCompleted
                  ? 'border-primary/30 bg-primary/5'
                  : isLocked
                  ? 'border-border/50 opacity-60'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <AccordionTrigger className="px-5 py-4 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                  ) : isLocked ? (
                    <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <Upload className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold text-foreground">{mod.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{mod.duration}</span>
                      {getModuleStatusLabel(mod.id)}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-5">
                <p className="text-muted-foreground mb-4">{mod.description}</p>
                <div className="mb-5">
                  <h4 className="font-semibold text-foreground mb-2">Instrucciones:</h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
                    {mod.instructions.map((inst, i) => (
                      <li key={i}>{inst}</li>
                    ))}
                  </ol>
                </div>
                <FileUpload
                  moduleId={mod.id}
                  acceptedFormats={mod.acceptedFormats}
                  onUploadSuccess={(result) => handleUploadSuccess(mod.id, result)}
                  existingFiles={moduleFiles}
                />
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
};

export default Level3Accordion;
