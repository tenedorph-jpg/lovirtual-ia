import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Download, Loader2, FileText } from 'lucide-react';
import { level3Modules } from '@/data/level3Data';

interface GradeModalProps {
  assignment: {
    id: string;
    student_name: string;
    module_id: number;
    file_name: string;
    file_path: string;
    grade: number | null;
    feedback: string | null;
    created_at: string;
  };
  onClose: () => void;
  onSaved: () => void;
}

const MODULE_TITLES: Record<number, string> = {};
level3Modules.forEach(m => { MODULE_TITLES[m.id] = m.title; });

const GradeModal: React.FC<GradeModalProps> = ({ assignment, onClose, onSaved }) => {
  const [grade, setGrade] = useState<string>(assignment.grade?.toString() || '');
  const [feedback, setFeedback] = useState(assignment.feedback || '');
  const [saving, setSaving] = useState(false);

  const handleDownload = async () => {
    const { data, error } = await supabase.storage.from('assignments').download(assignment.file_path);
    if (error || !data) return;
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = assignment.file_name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (!grade) {
      toast({ title: 'Selecciona una calificación', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from('assignments').update({
        grade: parseInt(grade),
        feedback: feedback.trim() || null,
        status: 'graded',
      }).eq('id', assignment.id);

      if (error) throw error;
      toast({ title: '¡Calificación guardada!' });
      onSaved();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Evaluar Entregable
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estudiante:</span>
              <span className="font-medium text-foreground">{assignment.student_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Módulo:</span>
              <span className="font-medium text-foreground text-right max-w-[60%] truncate">{MODULE_TITLES[assignment.module_id] || `Módulo ${assignment.module_id}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fecha:</span>
              <span className="font-medium text-foreground">{new Date(assignment.created_at).toLocaleDateString('es-ES')}</span>
            </div>
          </div>

          <Button variant="outline" className="w-full gap-2" onClick={handleDownload}>
            <Download className="w-4 h-4" />
            Descargar: {assignment.file_name}
          </Button>

          <div>
            <label className="text-sm font-medium text-foreground">Calificación (1-10)</label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Selecciona calificación" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <SelectItem key={n} value={n.toString()}>{n} {n >= 6 ? '✓ Aprobado' : '✗ Reprobado'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Feedback del Administrador</label>
            <Textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Escribe comentarios sobre la entrega..."
              className="mt-1 min-h-[100px]"
            />
          </div>

          <Button className="w-full lovirtual-gradient-bg text-white gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : 'Guardar Calificación'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GradeModal;
