import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Users, LogOut, Plus, TrendingUp, Clock, CheckCircle,
  Sparkles, UserPlus, Copy, Check, Loader2,
} from 'lucide-react';
import { courseModules } from '@/data/courseModules';
import ThemeToggle from '@/components/ThemeToggle';
import KpiSection from '@/components/KpiSection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Constants } from '@/integrations/supabase/types';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrativo',
  contable: 'Contable',
  cm: 'Community Manager',
  diseno: 'Diseño',
  atencion_ventas: 'Atención al Cliente / Ventas',
  admin_bilingue: 'Administrativo Bilingüe',
};

const AdminDashboard: React.FC = () => {
  const { logout, students } = useAuth();
  const navigate = useNavigate();
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{ email: string; password: string } | null>(null);
  const [copiedPwd, setCopiedPwd] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleCreateUser = async () => {
    if (!newName.trim() || !newEmail.trim() || !newRole) return;
    setCreating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke('create-user', {
        body: { full_name: newName.trim(), email: newEmail.trim(), lovirtual_role: newRole },
      });
      if (res.error || res.data?.error) {
        toast({ title: 'Error', description: res.data?.error || res.error?.message || 'Error al crear usuario', variant: 'destructive' });
      } else {
        setCreatedInfo({ email: res.data.email, password: res.data.temp_password });
        toast({ title: '¡Usuario creado!', description: `${newName.trim()} fue registrado exitosamente.` });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleCopyPwd = () => {
    if (createdInfo) {
      navigator.clipboard.writeText(createdInfo.password);
      setCopiedPwd(true);
      setTimeout(() => setCopiedPwd(false), 2000);
    }
  };

  const resetDialog = () => {
    setNewName(''); setNewEmail(''); setNewRole('');
    setCreatedInfo(null); setIsDialogOpen(false);
  };

  const totalStudents = students.length;
  const completedStudents = students.filter(s => s.progress === 100).length;
  const inProgressStudents = totalStudents - completedStudents;
  const avgProgress = totalStudents > 0 ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / totalStudents) : 0;

  const modulePerformanceData = courseModules.map(module => {
    const scores = students.map(s => s.quizScores[module.id]).filter(s => s !== undefined);
    const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    return { name: `M${module.id}`, fullName: module.title, score: avg };
  });

  const timeSpentData = [
    { day: 'Lun', minutos: 45 }, { day: 'Mar', minutos: 62 }, { day: 'Mié', minutos: 38 },
    { day: 'Jue', minutos: 55 }, { day: 'Vie', minutos: 71 }, { day: 'Sáb', minutos: 28 }, { day: 'Dom', minutos: 15 },
  ];

  const statusData = [
    { name: 'Completados', value: completedStudents, color: 'hsl(160, 84%, 39%)' },
    { name: 'En Progreso', value: inProgressStudents, color: 'hsl(197, 99%, 41%)' },
  ];

  const chartTooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg lovirtual-gradient-bg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">Panel de Administración</h1>
              <p className="text-sm text-muted-foreground">LoVirtual Academy</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10"><Users className="w-6 h-6 text-primary" /></div>
              <div><p className="text-sm text-muted-foreground">Total Estudiantes</p><p className="text-2xl font-bold text-foreground">{totalStudents}</p></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10"><CheckCircle className="w-6 h-6 text-success" /></div>
              <div><p className="text-sm text-muted-foreground">Completados</p><p className="text-2xl font-bold text-foreground">{completedStudents}</p></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-accent/10"><TrendingUp className="w-6 h-6 text-accent" /></div>
              <div><p className="text-sm text-muted-foreground">Progreso Promedio</p><p className="text-2xl font-bold text-foreground">{avgProgress}%</p></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning/10"><Clock className="w-6 h-6 text-warning" /></div>
              <div><p className="text-sm text-muted-foreground">Tiempo Promedio</p><p className="text-2xl font-bold text-foreground">{totalStudents > 0 ? Math.round(students.reduce((a, s) => a + s.timeSpentMinutes, 0) / totalStudents) : 0} min</p></div>
            </div>
          </div>
        </div>

        {/* Create User Button */}
        <div className="flex justify-end mb-6">
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetDialog(); else setIsDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="lovirtual-gradient-bg text-white gap-2"><UserPlus className="w-4 h-4" />Crear Nuevo Usuario</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><UserPlus className="w-5 h-5 text-primary" />Crear Usuario</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {!createdInfo ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-foreground">Nombre completo</label>
                      <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ej: María García" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Correo Electrónico</label>
                      <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="Ej: maria@empresa.com" className="mt-1" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Rol</label>
                      <Select value={newRole} onValueChange={setNewRole}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Selecciona un rol" />
                        </SelectTrigger>
                        <SelectContent>
                          {Constants.public.Enums.lovirtual_role.filter(r => r !== 'admin').map((role) => (
                            <SelectItem key={role} value={role}>{ROLE_LABELS[role] || role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full lovirtual-gradient-bg text-white gap-2" onClick={handleCreateUser} disabled={!newName.trim() || !newEmail.trim() || !newRole || creating}>
                      {creating ? <><Loader2 className="w-4 h-4 animate-spin" />Creando...</> : 'Crear Usuario'}
                    </Button>
                  </>
                ) : (
                  <div className="text-center space-y-4">
                    <div className="bg-success/10 rounded-lg p-6">
                      <CheckCircle className="w-10 h-10 text-success mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-1">Usuario creado exitosamente</p>
                      <p className="font-medium text-foreground">{createdInfo.email}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-4 text-left">
                      <p className="text-xs text-muted-foreground mb-1">Contraseña temporal:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm font-mono text-foreground bg-background px-2 py-1 rounded">{createdInfo.password}</code>
                        <Button variant="ghost" size="sm" onClick={handleCopyPwd}>
                          {copiedPwd ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button className="w-full" onClick={resetDialog}>Cerrar</Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="lovirtual-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" />Rendimiento por Módulo</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modulePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`${v}%`, 'Promedio']} labelFormatter={(l) => modulePerformanceData.find(m => m.name === l)?.fullName || l} />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lovirtual-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-accent" />Tiempo de Permanencia (Semana)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSpentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`${v} min`, 'Tiempo']} />
                  <Line type="monotone" dataKey="minutos" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lovirtual-card lg:col-span-2">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><CheckCircle className="w-5 h-5 text-success" />Estado de Estudiantes</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* NEW: KPI Section by Profile */}
        <div className="mb-8">
          <KpiSection />
        </div>

        {/* Students Table */}
        <div className="lovirtual-card">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Lista de Estudiantes</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Código Asignado</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Puntuación Promedio</TableHead>
                  <TableHead>Última Actividad</TableHead>
                  <TableHead>Certificado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell><div><p className="font-medium text-foreground">{student.name}</p><p className="text-sm text-muted-foreground">{student.email}</p></div></TableCell>
                    <TableCell><code className="bg-muted px-2 py-1 rounded text-sm font-mono">{student.code}</code></TableCell>
                    <TableCell><div className="flex items-center gap-2"><Progress value={student.progress} className="w-24 h-2" /><span className="text-sm text-muted-foreground">{student.progress}%</span></div></TableCell>
                    <TableCell><span className={`font-semibold ${student.averageScore >= 80 ? 'text-success' : student.averageScore >= 60 ? 'text-warning' : 'text-destructive'}`}>{student.averageScore || '-'}%</span></TableCell>
                    <TableCell className="text-muted-foreground">{student.lastActive}</TableCell>
                    <TableCell>
                      {student.certificateGenerated ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium"><CheckCircle className="w-3 h-3" />Generado</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">Pendiente</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
