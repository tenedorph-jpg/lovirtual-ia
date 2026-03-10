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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  Users, LogOut, TrendingUp, Clock, CheckCircle,
  Sparkles, UserPlus, Copy, Check, Loader2, Filter,
  Trophy, AlertTriangle, BookOpen,
} from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Constants } from '@/integrations/supabase/types';
import { cursosData, PROFILE_LABELS, type CourseData } from '@/data/mockAdminData';

const chartTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  color: 'hsl(var(--foreground))',
};

/* ───────── Sub-components ───────── */

const KpiCards: React.FC<{ data: CourseData['kpis'] }> = ({ data }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    {[
      { label: 'Total Inscritos', value: data.inscritos, icon: Users, color: 'primary' },
      { label: 'Finalizados', value: data.finalizados, icon: CheckCircle, color: 'success' },
      { label: 'Tasa de Finalización', value: data.tasa, icon: TrendingUp, color: 'accent' },
      { label: 'Pendientes', value: data.pendientes, icon: Clock, color: 'warning' },
    ].map((kpi) => (
      <div key={kpi.label} className="stat-card">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg bg-${kpi.color}/10`}>
            <kpi.icon className={`w-6 h-6 text-${kpi.color}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const DonutChart: React.FC<{ data: CourseData['distribucion']; total: number }> = ({ data, total }) => (
  <div className="lovirtual-card">
    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
      <Users className="w-5 h-5 text-primary" />
      Distribución de Perfiles
    </h3>
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={105}
            paddingAngle={4}
            dataKey="cantidad"
            nameKey="perfil"
            label={({ perfil, cantidad }) => `${perfil}: ${cantidad}`}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={chartTooltipStyle}
            formatter={(value: number, name: string) => [`Cantidad: ${value}`, name]}
          />
          <Legend />
          <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" fill="hsl(var(--foreground))" fontSize="28" fontWeight="bold">
            {total}
          </text>
          <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" fill="hsl(var(--muted-foreground))" fontSize="12">
            Inscritos
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const TimeBarChart: React.FC<{ data: CourseData['tiempoPromedio'] }> = ({ data }) => (
  <div className="lovirtual-card">
    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
      <Clock className="w-5 h-5 text-accent" />
      Tiempo Promedio de Finalización por Perfil
    </h3>
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
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
          <Tooltip contentStyle={chartTooltipStyle} formatter={(v: number) => [`${v}h`, 'Tiempo promedio']} />
          <Bar dataKey="horas" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const BestScoreCard: React.FC<{ data: CourseData['puntuacionPromedio'] }> = ({ data }) => {
  if (data.length === 0) return null;
  const best = data[0];
  return (
    <div className="lovirtual-card flex flex-col items-center justify-center text-center">
      <div className="p-4 rounded-full bg-warning/10 mb-4">
        <Trophy className="w-10 h-10 text-warning" />
      </div>
      <p className="text-sm text-muted-foreground mb-1">Mejor Puntuación Promedio</p>
      <p className="text-4xl font-bold text-foreground mb-1">{best.puntuacion}</p>
      <p className="text-lg font-semibold text-primary">{best.perfil}</p>
      <div className="mt-4 w-full space-y-2">
        {data.slice(1).map((p, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{p.perfil}</span>
            <span className="font-semibold text-foreground">{p.puntuacion}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ErrorRateTable: React.FC<{ data: CourseData['errores'] }> = ({ data }) => (
  <div className="lovirtual-card">
    <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
      <AlertTriangle className="w-5 h-5 text-destructive" />
      Mayor Índice de Error por Perfil
    </h3>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Perfil</TableHead>
          <TableHead className="text-right">Tasa de Error</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, i) => (
          <TableRow key={i}>
            <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
            <TableCell className="font-medium text-foreground">{item.perfil}</TableCell>
            <TableCell className="text-right">
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                parseFloat(item.tasa) >= 15
                  ? 'bg-destructive/10 text-destructive'
                  : parseFloat(item.tasa) >= 10
                  ? 'bg-warning/10 text-warning'
                  : 'bg-success/10 text-success'
              }`}>
                {item.tasa}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const StudentTable: React.FC<{ estudiantes: CourseData['estudiantes'] }> = ({ estudiantes }) => {
  const [statusFilter, setStatusFilter] = useState('todos');
  const [profileFilter, setProfileFilter] = useState('todos');

  const filtered = useMemo(() => {
    return estudiantes.filter((s) => {
      const statusMatch =
        statusFilter === 'todos' ||
        (statusFilter === 'finalizados' && s.certificado === 'Generado') ||
        (statusFilter === 'pendientes' && s.certificado === 'Pendiente');
      const profileMatch = profileFilter === 'todos' || s.perfil === profileFilter;
      return statusMatch && profileMatch;
    });
  }, [statusFilter, profileFilter, estudiantes]);

  const finCount = estudiantes.filter(s => s.certificado === 'Generado').length;
  const penCount = estudiantes.filter(s => s.certificado === 'Pendiente').length;

  return (
    <div className="lovirtual-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Lista de Estudiantes
        </h3>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={profileFilter} onValueChange={setProfileFilter}>
            <SelectTrigger className="w-[200px] h-9 text-sm">
              <SelectValue placeholder="Filtrar por perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los perfiles</SelectItem>
              <SelectItem value="admin">Administrativo</SelectItem>
              <SelectItem value="contable">Contable</SelectItem>
              <SelectItem value="cm">Community Manager</SelectItem>
              <SelectItem value="diseno">Diseñador Gráfico</SelectItem>
              <SelectItem value="atencion_ventas">Atención al Cliente / Ventas</SelectItem>
              <SelectItem value="admin_bilingue">Administrativo Bilingüe</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-4">
        <TabsList>
          <TabsTrigger value="todos">Todos ({estudiantes.length})</TabsTrigger>
          <TabsTrigger value="finalizados">Finalizados ({finCount})</TabsTrigger>
          <TabsTrigger value="pendientes">Pendientes ({penCount})</TabsTrigger>
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
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No se encontraron estudiantes con los filtros seleccionados.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-medium text-foreground">{s.nombre}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-primary/15 text-primary border-primary/20 hover:bg-primary/20 text-xs">
                      {PROFILE_LABELS[s.perfil] || s.perfil}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={s.progreso} className="w-24 h-2" />
                      <span className="text-sm text-muted-foreground">{s.progreso}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${
                      s.puntuacion === '100%' ? 'text-success' :
                      s.puntuacion === '-%' ? 'text-muted-foreground' : 'text-foreground'
                    }`}>
                      {s.puntuacion}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.actividad}</TableCell>
                  <TableCell>
                    {s.certificado === 'Generado' ? (
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
  );
};

/* ───────── Main Dashboard ───────── */

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activeCourse, setActiveCourse] = useState('nivel1');

  // Create user dialog state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newHierarchy, setNewHierarchy] = useState<'assistant' | 'admin'>('assistant');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createdInfo, setCreatedInfo] = useState<{ email: string; password: string } | null>(null);
  const [copiedPwd, setCopiedPwd] = useState(false);

  const courseData = cursosData[activeCourse];

  const handleLogout = () => { logout(); navigate('/'); };

  const handleCreateUser = async () => {
    if (!newName.trim() || !newEmail.trim() || !newRole) return;
    setCreating(true);
    try {
      const res = await supabase.functions.invoke('create-user', {
        body: { full_name: newName.trim(), email: newEmail.trim(), lovirtual_role: newRole, hierarchy: newHierarchy },
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
    setNewName(''); setNewEmail(''); setNewRole(''); setNewHierarchy('assistant');
    setCreatedInfo(null); setIsDialogOpen(false);
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
        {/* Course Tabs */}
        <Tabs value={activeCourse} onValueChange={setActiveCourse} className="mb-8">
          <TabsList className="grid w-full max-w-lg grid-cols-2 mx-auto">
            <TabsTrigger value="nivel1" className="gap-2 text-sm">
              <BookOpen className="w-4 h-4" />
              Nivel 1: Fundamentos de IA
            </TabsTrigger>
            <TabsTrigger value="nivel2" className="gap-2 text-sm">
              <BookOpen className="w-4 h-4" />
              Nivel 2: Implementación
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* KPI Cards */}
        <KpiCards data={courseData.kpis} />

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
                      <label className="text-sm font-medium text-foreground">Jerarquía</label>
                      <Select value={newHierarchy} onValueChange={(v) => setNewHierarchy(v as 'assistant' | 'admin')}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assistant">Asistente Virtual</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
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
          <DonutChart data={courseData.distribucion} total={courseData.kpis.inscritos} />
          <TimeBarChart data={courseData.tiempoPromedio} />
        </div>

        {/* Best Score + Error Rate */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <BestScoreCard data={courseData.puntuacionPromedio} />
          <ErrorRateTable data={courseData.errores} />
        </div>

        {/* Student Table */}
        <StudentTable estudiantes={courseData.estudiantes} />
      </main>
    </div>
  );
};

export default AdminDashboard;
