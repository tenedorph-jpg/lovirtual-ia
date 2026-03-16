import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Upload, FileCheck, Loader2, FileWarning } from 'lucide-react';

interface FileUploadProps {
  moduleId: number;
  acceptedFormats: string;
  onUploadSuccess: () => void;
  existingFile?: { file_name: string; status: string } | null;
}

const MAX_SIZE = 50 * 1024 * 1024; // 50MB

const FileUpload: React.FC<FileUploadProps> = ({ moduleId, acceptedFormats, onUploadSuccess, existingFile }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!user) return;

    if (file.size > MAX_SIZE) {
      toast({ title: 'Archivo muy grande', description: 'El límite es 50MB.', variant: 'destructive' });
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = acceptedFormats.split(',').map(f => f.trim().replace('.', ''));
    if (!allowed.includes(ext)) {
      toast({ title: 'Formato no permitido', description: `Formatos aceptados: ${acceptedFormats}`, variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const filePath = `${user.id}/${moduleId}/${Date.now()}_${file.name}`;

      const { error: storageError } = await supabase.storage
        .from('assignments')
        .upload(filePath, file, { upsert: true });

      if (storageError) throw storageError;

      const { error: dbError } = await supabase.from('assignments').insert({
        user_id: user.id,
        module_id: moduleId,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        status: 'submitted',
      });

      if (dbError) throw dbError;

      toast({ title: '¡Entregable enviado!', description: `"${file.name}" subido correctamente.` });
      onUploadSuccess();
    } catch (err: any) {
      console.error('Upload error:', err);
      toast({ title: 'Error al subir', description: err.message || 'Intenta nuevamente.', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  if (existingFile) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20">
        <FileCheck className="w-6 h-6 text-primary flex-shrink-0" />
        <div className="min-w-0">
          <p className="font-medium text-foreground truncate">{existingFile.file_name}</p>
          <p className="text-sm text-muted-foreground capitalize">Estado: {existingFile.status === 'submitted' ? 'Enviado' : existingFile.status === 'graded' ? 'Calificado' : existingFile.status}</p>
        </div>
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
            <p className="text-sm text-muted-foreground mt-1">Formatos: {acceptedFormats} · Máx: 50MB</p>
          </div>
          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
            className="mt-2"
          >
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
