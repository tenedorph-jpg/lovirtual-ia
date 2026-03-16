import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Lock, Upload, Clock, Award } from 'lucide-react';
import FileUpload, { EvaluationResult } from './FileUpload';
import { level3Modules } from '@/data/level3Data';
import { generateCertificatePDF } from '@/lib/generateCertificate';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const Level3Accordion: React.FC = () => {
  const { user, studentProgress, completeModule, markCertificateGenerated } = useAuth();
  const [assignments, setAssignments] = useState<Record<number, { id: string; file_name: string; file_path: string; status: string; grade: number | null; feedback: string | null }>>({});
  const [showCertificate, setShowCertificate] = useState<{ totalScore: number; avg: number } | null>(null);

  const completedModules = studentProgress?.completed_modules ?? [];

  const fetchAssignments = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('assignments')
      .select('id, module_id, file_name, file_path, status, grade, feedback')
      .eq('user_id', user.id)
      .gte('module_id', 201)
      .lte('module_id', 210);

    if (data) {
      const map: Record<number, { id: string; file_name: string; file_path: string; status: string; grade: number | null; feedback: string | null }> = {};
      data.forEach(a => {
        map[a.module_id] = { id: a.id, file_name: a.file_name, file_path: a.file_path, status: a.status, grade: a.grade, feedback: a.feedback };
      });
      setAssignments(map);

      // Check certificate eligibility
      const graded = data.filter(a => a.status === 'graded' && a.grade != null);
      if (graded.length === 10) {
        const allPassed = graded.every(a => (a.grade || 0) >= 7);
        if (allPassed) {
          const totalScore = graded.reduce((s, a) => s + (a.grade || 0), 0);
          const avg = Math.round((totalScore / 10) * 10) / 10;
          setShowCertificate({ totalScore, avg });
        }
      }
    }
  }, [user]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const getModuleStatus = (moduleId: number): 'completed' | 'available' | 'locked' => {
    const assignment = assignments[moduleId];
    // A module is completed if it has a graded assignment
    if (assignment?.status === 'graded') return 'completed';
    if (completedModules.includes(moduleId)) return 'completed';
    if (moduleId === 201) return 'available';
    // Previous module must be graded or completed
    const prevAssignment = assignments[moduleId - 1];
    if (prevAssignment?.status === 'graded' || completedModules.includes(moduleId - 1)) return 'available';
    return 'locked';
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
    const profile = await supabase.from('profiles').select('full_name').eq('user_id', user.id).single();
    const name = profile.data?.full_name || 'Estudiante';
    await generateCertificatePDF(name, showCertificate.avg * 10); // Convert to percentage
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
              <h3 className="text-lg font-bold text-foreground">🎓 ¡Nivel 3 Completado!</h3>
              <p className="text-sm text-muted-foreground">
                Promedio final: <span className="font-bold text-success">{showCertificate.avg}/10</span>
              </p>
            </div>
          </div>
          <Button onClick={handleGenerateCertificate} className="gap-2">
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
          const assignment = assignments[mod.id];

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
                      {assignment?.status === 'graded' && (
                        <span className={`text-xs font-medium ml-2 ${(assignment.grade || 0) >= 7 ? 'text-success' : 'text-destructive'}`}>
                          ✓ {assignment.grade}/10
                        </span>
                      )}
                      {assignment?.status === 'evaluating' && (
                        <span className="text-xs font-medium ml-2 text-accent">⏳ Evaluando...</span>
                      )}
                      {assignment?.status === 'submitted' && (
                        <span className="text-xs text-primary font-medium ml-2">✓ Enviado</span>
                      )}
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
                  existingFile={assignment || null}
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
