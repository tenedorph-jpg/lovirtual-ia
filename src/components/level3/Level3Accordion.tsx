import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle, Lock, Upload, Clock } from 'lucide-react';
import FileUpload from './FileUpload';
import { level3Modules } from '@/data/level3Data';

const Level3Accordion: React.FC = () => {
  const { user, studentProgress, completeModule } = useAuth();
  const [assignments, setAssignments] = useState<Record<number, { id: string; file_name: string; file_path: string; status: string; grade: number | null; feedback: string | null }>>({});

  const completedModules = studentProgress?.completed_modules ?? [];

  const fetchAssignments = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('assignments')
      .select('id, module_id, file_name, file_path, status')
      .eq('user_id', user.id)
      .gte('module_id', 201)
      .lte('module_id', 210);

    if (data) {
      const map: Record<number, { id: string; file_name: string; file_path: string; status: string }> = {};
      data.forEach(a => {
        map[a.module_id] = { id: a.id, file_name: a.file_name, file_path: a.file_path, status: a.status };
      });
      setAssignments(map);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const getModuleStatus = (moduleId: number): 'completed' | 'available' | 'locked' => {
    if (completedModules.includes(moduleId)) return 'completed';
    if (moduleId === 201 || completedModules.includes(moduleId - 1)) return 'available';
    return 'locked';
  };

  const handleUploadSuccess = async (moduleId: number) => {
    await completeModule(moduleId);
    await fetchAssignments();
  };

  return (
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
                    {isCompleted && <span className="text-xs text-primary font-medium ml-2">✓ Enviado</span>}
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
                onUploadSuccess={() => handleUploadSuccess(mod.id)}
                existingFile={assignment || null}
              />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};

export default Level3Accordion;
