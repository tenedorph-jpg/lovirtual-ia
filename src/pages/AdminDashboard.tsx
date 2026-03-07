import React, { useState, useMemo } from 'react';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Users, LogOut, TrendingUp, Clock, CheckCircle,
  Sparkles, UserPlus, Copy, Check, Loader2, Filter,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Constants } from '@/integrations/supabase/types';
import { mockAdminData, PROFILE_LABELS } from '@/data/mockAdminData';

const { metricas, estudiantes } = mockAdminData;

const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  color: 'hsl(var(--foreground))',
};

// Custom label for the center of the donut
const CenterLabel = ({ viewBox }: any) => {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="hsl(var(--foreground))" fontSize="28" fontWeight="bold">
        {metricas.totalInscritos}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">
        Inscritos
      </text>
    </g>
  );
};

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{ email: string; password: string } | null>(null);
  const [copiedPwd, setCopiedPwd] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('todos');
  const [profileFilter, setProfileFilter] = useState('todos');

  const handleLogout = () => { logout(); navigate('/'); };

  const handleCreateUser = async () => {
    if (!newName.trim() || !newEmail.trim() || !newRole) return;
    setCreating(true);
    try {
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

  // Filtered students
  const filteredStudents = useMemo(() => {
    return estudiantes.filter((s) => {
      const statusMatch =
        statusFilter === 'todos' ||
        (statusFilter === 'finalizados' && s.certificado === 'Generado') ||
        (statusFilter === 'pendientes' && s.certificado === 'Pendiente');
      const profileMatch = profileFilter === 'todos' || s.perfil === profileFilter;
      return statusMatch && profileMatch;
    });
  }, [statusFilter, profileFilter]);

  // Unique profiles from students for filter dropdown
  const uniqueProfiles = useMemo(() => {
    const set = new Set(estudiantes.map((s) => s.perfil));
    return Array.from(set);
  }, []);

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
              <div><p className="text-sm text-muted-foreground">Total Inscritos</p><p className="text-2xl font-bold text-foreground">{metricas.totalInscritos}</p></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10"><CheckCircle className="w-6 h-6 text-success" /></div>
              <div><p className="text-sm text-muted-foreground">Finalizados</p><p className="text-2xl font-bold text-foreground">{metricas.totalFinalizados}</p></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-accent/10"><TrendingUp className="w-6 h-6 text-accent" /></div>
              <div><p className="text-sm text-muted-foreground">Tasa de Finalización</p><p className="text-2xl font-bold text-foreground">{Math.round((metricas.totalFinalizados / metricas.totalInscritos) * 100)}%</p></div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning/10"><Clock className="w-6 h-6 text-warning" /></div>
              <div><p className="text-sm text-muted-foreground">Pendientes</p><p className="text-2xl font-bold text-foreground">{metricas.totalInscritos - metricas.totalFinalizados}</p></div>
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
                            <SelectItem key={role} value={role}>{PROFILE_LABELS[role] || role}</SelectItem>
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
          {/* Donut - Distribución de Perfiles */}
          <div className="lovirtual-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Distribución de Perfiles
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metricas.distribucionPerfiles}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="cantidad"
                    nameKey="perfil"
                    label={({ perfil, cantidad }) => `${perfil}: ${cantidad}`}
                  >
                  {metricas.distribucionPerfiles.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(value: number, name: string) => [`Cantidad de usuarios: ${value}`, name]}
                  />
                  <Legend />
                  {/* Center text */}
                  <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" fill="hsl(var(--foreground))" fontSize="28" fontWeight="bold">
                    {metricas.totalInscritos}
                  </text>
                  <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fill="hsl(var(--muted-foreground))" fontSize="12">
                    Inscritos
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart - Tiempo de Finalización */}
          <div className="lovirtual-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Tiempo Promedio de Finalización por Perfil
            </h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metricas.tiempoFinalizacionPromedio}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="perfil"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    interval={0}
                    angle={-10}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    label={{ value: 'Horas', angle: -90, position: 'insideLeft', fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle}
                    formatter={(v: number) => [`${v}h`, 'Tiempo promedio']}
                  />
                  <Bar dataKey="horas" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="lovirtual-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Lista de Estudiantes
            </h3>
            <div className="flex items-center gap-3">
              {/* Profile filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={profileFilter} onValueChange={setProfileFilter}>
                  <SelectTrigger className="w-[180px] h-9 text-sm">
                    <SelectValue placeholder="Filtrar por perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los perfiles</SelectItem>
                    {uniqueProfiles.map((p) => (
                      <SelectItem key={p} value={p}>{PROFILE_LABELS[p] || p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Status tabs */}
          <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-4">
            <TabsList>
              <TabsTrigger value="todos">Todos ({estudiantes.length})</TabsTrigger>
              <TabsTrigger value="finalizados">
                Finalizados ({estudiantes.filter(s => s.certificado === 'Generado').length})
              </TabsTrigger>
              <TabsTrigger value="pendientes">
                Pendientes ({estudiantes.filter(s => s.certificado === 'Pendiente').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Progreso</TableHead>
                  <TableHead>Puntuación</TableHead>
                  <TableHead>Última Actividad</TableHead>
                  <TableHead>Certificado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No se encontraron estudiantes con los filtros seleccionados.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{student.nombre}</p>
                          <p className="text-sm text-muted-foreground">{student.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {PROFILE_LABELS[student.perfil] || student.perfil}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={student.progreso} className="w-24 h-2" />
                          <span className="text-sm text-muted-foreground">{student.progreso}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          student.puntuacion === '100%' ? 'text-success' :
                          student.puntuacion === '-%' ? 'text-muted-foreground' : 'text-foreground'
                        }`}>
                          {student.puntuacion}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{student.actividad}</TableCell>
                      <TableCell>
                        {student.certificado === 'Generado' ? (
                          <Badge className="bg-success/15 text-success border-success/20 hover:bg-success/20 gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Generado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground gap-1">
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
