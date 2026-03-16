import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Download, ClipboardCheck, Filter, FileText, Loader2 } from 'lucide-react';
import { level3Modules } from '@/data/level3Data';
import GradeModal from './GradeModal';

interface AssignmentRow {
  id: string;
  user_id: string;
  module_id: number;
  file_name: string;
  file_path: string;
  status: string;
  grade: number | null;
  feedback: string | null;
  created_at: string;
  student_name: string;
  student_profile: string;
}

const MODULE_TITLES: Record<number, string> = {};
level3Modules.forEach(m => { MODULE_TITLES[m.id] = m.title; });

const AssignmentsPanel: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [selectedAssignment, setSelectedAssignment] = useState<AssignmentRow | null>(null);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const [assignRes, profilesRes] = await Promise.all([
        supabase.from('assignments').select('*').gte('module_id', 201).lte('module_id', 210).order('created_at', { ascending: false }),
        supabase.from('profiles').select('user_id, full_name, lovirtual_role'),
      ]);

      const profileMap = new Map<string, { name: string; role: string }>();
      (profilesRes.data || []).forEach(p => profileMap.set(p.user_id, { name: p.full_name, role: p.lovirtual_role }));

      const rows: AssignmentRow[] = (assignRes.data || []).map(a => {
        const profile = profileMap.get(a.user_id);
        return {
          ...a,
          student_name: profile?.name || 'Desconocido',
          student_profile: profile?.role || '',
        };
      });

      setAssignments(rows);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const filtered = useMemo(() => {
    return assignments.filter(a => {
      const nameMatch = !searchName || a.student_name.toLowerCase().includes(searchName.toLowerCase());
      const statusMatch = statusFilter === 'todos' ||
        (statusFilter === 'submitted' && a.status === 'submitted') ||
        (statusFilter === 'graded' && a.status === 'graded');
      return nameMatch && statusMatch;
    });
  }, [assignments, searchName, statusFilter]);

  const handleDownload = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage.from('assignments').download(filePath);
    if (error || !data) return;
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="lovirtual-card">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        Evaluación de Entregables — Nivel 3
      </h3>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por estudiante..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            className="max-w-xs h-9 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="submitted">Pendientes</SelectItem>
            <SelectItem value="graded">Calificados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estudiante</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>Fecha de Envío</TableHead>
                <TableHead>Archivo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No se encontraron entregables.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium text-foreground">{a.student_name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                      {MODULE_TITLES[a.module_id] || `Módulo ${a.module_id}`}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(a.created_at).toLocaleDateString('es-ES')}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="gap-1 text-primary" onClick={() => handleDownload(a.file_path, a.file_name)}>
                        <Download className="w-4 h-4" />
                        Descargar
                      </Button>
                    </TableCell>
                    <TableCell>
                      {a.status === 'graded' ? (
                        <Badge className="bg-success/15 text-success border-success/20 gap-1">
                          Calificado ({a.grade}/10)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant={a.status === 'graded' ? 'outline' : 'default'} className="gap-1" onClick={() => setSelectedAssignment(a)}>
                        <ClipboardCheck className="w-4 h-4" />
                        {a.status === 'graded' ? 'Ver' : 'Evaluar'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedAssignment && (
        <GradeModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onSaved={() => { setSelectedAssignment(null); fetchAssignments(); }}
        />
      )}
    </div>
  );
};

export default AssignmentsPanel;
