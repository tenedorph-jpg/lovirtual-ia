import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Upload, FileCheck, Loader2, Trash2, CheckCircle, MessageSquare, Bot, Plus, RefreshCw } from 'lucide-react';

export interface ExistingFile {
  id: string;
  file_name: string;
  file_path: string;
  status: string;
  grade?: number | null;
  feedback?: string | null;
}

interface FileUploadProps {
  moduleId: number;
  acceptedFormats: string;
  onUploadSuccess: (evaluationResult?: EvaluationResult) => void;
  existingFiles: ExistingFile[];
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

const BLOCKED_EXTENSIONS = ['doc'];

const FileUpload: React.FC<FileUploadProps> = ({ moduleId, acceptedFormats, onUploadSuccess, existingFiles }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [evaluatingIds, setEvaluatingIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList) => {
    if (!user) return;

    const files = Array.from(fileList);
    for (const file of files) {
      if (file.size > MAX_SIZE) {
        toast({ title: 'Archivo muy grande', description: `"${file.name}" excede el límite de 100MB.`, variant: 'destructive' });
        continue;
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      if (BLOCKED_EXTENSIONS.includes(ext)) {
        toast({
          title: 'Formato no compatible',
          description: 'Por favor guarda tu documento como .docx o .PDF para que la IA pueda leerlo.',
          variant: 'destructive',
        });
        continue;
      }

      await uploadSingleFile(file);
    }
  };

  const uploadSingleFile = async (file: File) => {
    if (!user) return;
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

      toast({ title: '¡Archivo subido!', description: `Evaluando "${file.name}" con IA...` });
      setUploading(false);

      const assignmentId = insertedData.id;
      setEvaluatingIds(prev => new Set(prev).add(assignmentId));

      try {
        const { data: evalData, error: evalError } = await supabase.functions.invoke('evaluate-assignment', {
          body: { assignmentId },
        });

        if (evalError) throw evalError;

        const result = evalData as EvaluationResult;
        toast({
          title: result.grade >= 7 ? '✅ ¡Aprobado!' : '📝 Evaluado',
          description: `"${file.name}" — Calificación: ${result.grade}/10`,
        });
        onUploadSuccess(result);
      } catch (evalErr: any) {
        console.error('Evaluation error:', evalErr);
        toast({
          title: 'Archivo subido',
          description: 'La evaluación automática no pudo completarse. Un administrador revisará tu entrega.',
        });
        await supabase.from('assignments').update({ status: 'submitted' }).eq('id', assignmentId);
        onUploadSuccess();
      } finally {
        setEvaluatingIds(prev => {
          const next = new Set(prev);
          next.delete(assignmentId);
          return next;
        });
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      toast({ title: 'Error al subir', description: err.message || 'Intenta nuevamente.', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (file: ExistingFile) => {
    if (!user) return;
    setDeletingId(file.id);
    try {
      const { error: storageError } = await supabase.storage
        .from('assignments')
        .remove([file.file_path]);
      if (storageError) console.warn('Storage delete warning:', storageError);

      const { error: dbError } = await supabase
        .from('assignments')
        .delete()
        .eq('id', file.id);
      if (dbError) throw dbError;

      toast({ title: 'Envío eliminado', description: 'Puedes subir un nuevo archivo.' });
      onUploadSuccess();
    } catch (err: any) {
      console.error('Delete error:', err);
      toast({ title: 'Error al eliminar', description: err.message || 'Intenta nuevamente.', variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const renderFileCard = (file: ExistingFile) => {
    const isEvaluating = file.status === 'evaluating' || evaluatingIds.has(file.id);
    const isGraded = file.status === 'graded';
    const passed = isGraded && file.grade != null && file.grade >= 7;
    const isDeleting = deletingId === file.id;

    if (isEvaluating) {
      return (
        <div key={file.id} className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/30 animate-pulse">
          <Bot className="w-5 h-5 text-accent flex-shrink-0 animate-bounce" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground text-sm truncate">{file.file_name}</p>
            <p className="text-xs text-muted-foreground">Evaluando con IA...</p>
          </div>
          <Loader2 className="w-4 h-4 text-accent animate-spin flex-shrink-0" />
        </div>
      );
    }

    if (isGraded) {
      return (
        <div key={file.id} className={`p-4 rounded-xl border ${passed ? 'bg-success/5 border-success/30' : 'bg-destructive/5 border-destructive/30'}`}>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className={`w-5 h-5 flex-shrink-0 ${passed ? 'text-success' : 'text-destructive'}`} />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground text-sm truncate">{file.file_name}</p>
              <p className={`text-xs font-semibold ${passed ? 'text-success' : 'text-destructive'}`}>
                Calificación: {file.grade}/10 — {passed ? 'Aprobado' : 'Reprobado'}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(file)}
              disabled={isDeleting}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 h-8 w-8"
              title="Eliminar y volver a enviar"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </Button>
          </div>
          {file.feedback && (
            <div className="bg-background rounded-lg p-3 border border-border">
              <div className="flex items-center gap-1.5 mb-1">
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">Feedback del evaluador IA</span>
              </div>
              <p className="text-sm text-foreground">{file.feedback}</p>
            </div>
          )}
        </div>
      );
    }

    // Submitted / pending
    return (
      <div key={file.id} className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <FileCheck className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground text-sm truncate">{file.file_name}</p>
          <p className="text-xs text-muted-foreground">Pendiente de evaluación</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDelete(file)}
          disabled={isDeleting}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0 h-8 w-8"
          title="Eliminar envío"
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Existing files list */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          {existingFiles.map(renderFileCard)}
        </div>
      )}

      {/* Upload zone - always visible */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Subiendo archivo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {existingFiles.length > 0 ? (
              <>
                <Plus className="w-8 h-8 text-muted-foreground" />
                <p className="font-medium text-foreground text-sm">Agregar más archivos o volver a enviar</p>
                <p className="text-xs text-muted-foreground">Puedes subir varios archivos de distintos tipos</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="font-medium text-foreground text-sm">Arrastra tus archivos aquí o haz clic para seleccionar</p>
                <p className="text-xs text-muted-foreground">Puedes subir varios archivos · Máx: 100MB cada uno</p>
              </>
            )}
            <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()} className="mt-1 gap-2">
              {existingFiles.length > 0 ? <RefreshCw className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
              {existingFiles.length > 0 ? 'Volver a enviar / Agregar archivo' : 'Seleccionar archivos'}
            </Button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
          }}
        />
      </div>
    </div>
  );
};

export default FileUpload;
