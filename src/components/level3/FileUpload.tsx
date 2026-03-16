import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Upload, FileCheck, Loader2, Trash2, CheckCircle, MessageSquare, Bot } from 'lucide-react';

interface FileUploadProps {
  moduleId: number;
  acceptedFormats: string;
  onUploadSuccess: (evaluationResult?: EvaluationResult) => void;
  existingFile?: { id: string; file_name: string; file_path: string; status: string; grade?: number | null; feedback?: string | null } | null;
}

export interface EvaluationResult {
  grade: number;
  feedback: string;
  allGraded: boolean;
  totalScore: number | null;
  averageGrade: number | null;
  certificateEligible: boolean;
}

const MAX_SIZE = 100 * 1024 * 1024;

const sanitizeFileName = (name: string): string => {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  let base = name.substring(0, name.lastIndexOf('.')) || name;
  base = base.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  base = base.replace(/ñ/g, 'n').replace(/Ñ/g, 'N');
  base = base.replace(/[^a-zA-Z0-9_-]/g, '-');
  base = base.replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `${base}.${ext}`;
};

const FileUpload: React.FC<FileUploadProps> = ({ moduleId, acceptedFormats, onUploadSuccess, existingFile }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!user) return;

    if (file.size > MAX_SIZE) {
      toast({ title: 'Archivo muy grande', description: 'El límite es 100MB.', variant: 'destructive' });
      return;
    }
    // Accept all file types — no format restriction

    setUploading(true);
    try {
      const sanitized = sanitizeFileName(file.name);
      const filePath = `${user.id}/${moduleId}/${Date.now()}_${sanitized}`;

      const { error: storageError } = await supabase.storage
        .from('assignments')
        .upload(filePath, file, { upsert: true });

      if (storageError) throw storageError;

      const { data: insertedData, error: dbError } = await supabase.from('assignments').insert({
        user_id: user.id,
        module_id: moduleId,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        status: 'evaluating',
      }).select('id').single();

      if (dbError) throw dbError;

      toast({ title: '¡Archivo subido!', description: 'Evaluando con IA... esto tomará unos segundos.' });
      setUploading(false);
      setEvaluating(true);

      // Trigger AI evaluation
      try {
        const { data: evalData, error: evalError } = await supabase.functions.invoke('evaluate-assignment', {
          body: { assignmentId: insertedData.id },
        });

        if (evalError) throw evalError;

        const result = evalData as EvaluationResult;
        toast({
          title: result.grade >= 7 ? '✅ ¡Aprobado!' : '📝 Evaluado',
          description: `Calificación: ${result.grade}/10`,
        });
        onUploadSuccess(result);
      } catch (evalErr: any) {
        console.error('Evaluation error:', evalErr);
        toast({
          title: 'Archivo subido',
          description: 'La evaluación automática no pudo completarse. Un administrador revisará tu entrega.',
        });
        // Update status back to submitted so admin can manually grade
        await supabase.from('assignments').update({ status: 'submitted' }).eq('id', insertedData.id);
        onUploadSuccess();
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast({ title: 'Error al subir', description: err.message || 'Intenta nuevamente.', variant: 'destructive' });
    } finally {
      setUploading(false);
      setEvaluating(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!existingFile || !user) return;
    setDeleting(true);
    try {
      const { error: storageError } = await supabase.storage
        .from('assignments')
        .remove([existingFile.file_path]);
      if (storageError) console.warn('Storage delete warning:', storageError);

      const { error: dbError } = await supabase
        .from('assignments')
        .delete()
        .eq('id', existingFile.id);
      if (dbError) throw dbError;

      toast({ title: 'Envío eliminado', description: 'Puedes subir un nuevo archivo.' });
      onUploadSuccess();
    } catch (err: any) {
      console.error('Delete error:', err);
      toast({ title: 'Error al eliminar', description: err.message || 'Intenta nuevamente.', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // Show evaluating state
  if (evaluating || existingFile?.status === 'evaluating') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/30 animate-pulse">
        <Bot className="w-6 h-6 text-accent flex-shrink-0 animate-bounce" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{existingFile?.file_name || 'Archivo subido'}</p>
          <p className="text-sm text-muted-foreground">Evaluando con IA... esto puede tomar unos segundos</p>
        </div>
        <Loader2 className="w-5 h-5 text-accent animate-spin flex-shrink-0" />
      </div>
    );
  }

  if (existingFile) {
    const isGraded = existingFile.status === 'graded';
    const passed = isGraded && existingFile.grade != null && existingFile.grade >= 7;

    if (isGraded) {
      return (
        <div className={`p-4 rounded-xl border ${passed ? 'bg-success/5 border-success/30' : 'bg-destructive/5 border-destructive/30'}`}>
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className={`w-6 h-6 flex-shrink-0 ${passed ? 'text-success' : 'text-destructive'}`} />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate">{existingFile.file_name}</p>
              <p className={`text-sm font-semibold ${passed ? 'text-success' : 'text-destructive'}`}>
                Calificación: {existingFile.grade}/10 — {passed ? 'Aprobado' : 'Reprobado'}
              </p>
            </div>
          </div>
          {existingFile.feedback && (
            <div className="bg-background rounded-lg p-3 border border-border">
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Feedback del evaluador IA</span>
              </div>
              <p className="text-sm text-foreground">{existingFile.feedback}</p>
            </div>
          )}
          {!passed && (
            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
                Reintentar — Volver a subir
              </Button>
              <span className="text-xs text-muted-foreground">Sube un nuevo archivo para ser evaluado nuevamente</span>
            </div>
          )}
        </div>
      );
    }

    // Submitted but not yet graded (fallback manual review)
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <FileCheck className="w-6 h-6 text-primary flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground truncate">{existingFile.file_name}</p>
          <p className="text-sm text-muted-foreground">Estado: Enviado — Pendiente de evaluación</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={deleting}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
          title="Eliminar envío"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Subiendo archivo...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Upload className="w-10 h-10 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Arrastra tu archivo aquí o haz clic para seleccionar</p>
            <p className="text-sm text-muted-foreground mt-1">Formatos: {acceptedFormats} · Máx: 100MB</p>
          </div>
          <Button variant="outline" onClick={() => inputRef.current?.click()} className="mt-2">
            Seleccionar archivo
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={acceptedFormats}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
};

export default FileUpload;
