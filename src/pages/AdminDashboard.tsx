import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Users,
  KeyRound,
  LogOut,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { courseModules } from '@/data/courseModules';

const AdminDashboard: React.FC = () => {
  const { logout, students, generateAccessCode } = useAuth();
  const navigate = useNavigate();
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGenerateCode = () => {
    if (newStudentName.trim() && newStudentEmail.trim()) {
      const code = generateAccessCode(newStudentName.trim(), newStudentEmail.trim());
      setGeneratedCode(code);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const resetDialog = () => {
    setNewStudentName('');
    setNewStudentEmail('');
    setGeneratedCode('');
    setIsDialogOpen(false);
  };

  // Calculate statistics
  const totalStudents = students.length;
  const completedStudents = students.filter(s => s.progress === 100).length;
  const inProgressStudents = totalStudents - completedStudents;
  const avgProgress = totalStudents > 0
    ? Math.round(students.reduce((acc, s) => acc + s.progress, 0) / totalStudents)
    : 0;

  // Module performance data
  const modulePerformanceData = courseModules.map(module => {
    const scoresForModule = students
      .map(s => s.quizScores[module.id])
      .filter(score => score !== undefined);
    const avgScore = scoresForModule.length > 0
      ? Math.round(scoresForModule.reduce((a, b) => a + b, 0) / scoresForModule.length)
      : 0;
    return {
      name: `M${module.id}`,
      fullName: module.title,
      score: avgScore,
    };
  });

  // Time spent data (simulated weekly)
  const timeSpentData = [
    { day: 'Lun', minutos: 45 },
    { day: 'Mar', minutos: 62 },
    { day: 'Mié', minutos: 38 },
    { day: 'Jue', minutos: 55 },
    { day: 'Vie', minutos: 71 },
    { day: 'Sáb', minutos: 28 },
    { day: 'Dom', minutos: 15 },
  ];

  // Pie chart data
  const statusData = [
    { name: 'Completados', value: completedStudents, color: 'hsl(160, 84%, 39%)' },
    { name: 'En Progreso', value: inProgressStudents, color: 'hsl(197, 99%, 41%)' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Estudiantes</p>
                <p className="text-2xl font-bold text-foreground">{totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-success/10">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completados</p>
                <p className="text-2xl font-bold text-foreground">{completedStudents}</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-accent/10">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progreso Promedio</p>
                <p className="text-2xl font-bold text-foreground">{avgProgress}%</p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-warning/10">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalStudents > 0
                    ? Math.round(students.reduce((a, s) => a + s.timeSpentMinutes, 0) / totalStudents)
                    : 0} min
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Access Button */}
        <div className="flex justify-end mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="lovirtual-gradient-bg text-white gap-2">
                <Plus className="w-4 h-4" />
                Crear Nuevo Acceso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-primary" />
                  Generar Código de Acceso
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {!generatedCode ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-foreground">Nombre del Estudiante</label>
                      <Input
                        value={newStudentName}
                        onChange={(e) => setNewStudentName(e.target.value)}
                        placeholder="Ej: María García"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Correo Electrónico</label>
                      <Input
                        type="email"
                        value={newStudentEmail}
                        onChange={(e) => setNewStudentEmail(e.target.value)}
                        placeholder="Ej: maria@empresa.com"
                        className="mt-1"
                      />
                    </div>
                    <Button
                      className="w-full lovirtual-gradient-bg text-white"
                      onClick={handleGenerateCode}
                      disabled={!newStudentName.trim() || !newStudentEmail.trim()}
                    >
                      Generar Código
                    </Button>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="bg-success/10 rounded-lg p-6 mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Código generado para {newStudentName}:</p>
                      <p className="text-2xl font-mono font-bold text-foreground tracking-wider">{generatedCode}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1 gap-2"
                        onClick={handleCopyCode}
                      >
                        {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copiedCode ? 'Copiado!' : 'Copiar'}
                      </Button>
                      <Button className="flex-1" onClick={resetDialog}>
                        Cerrar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Module Performance Chart */}
          <div className="lovirtual-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Rendimiento por Módulo
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modulePerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value}%`, 'Promedio']}
                    labelFormatter={(label) => {
                      const module = modulePerformanceData.find(m => m.name === label);
                      return module?.fullName || label;
                    }}
                  />
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Time Spent Chart */}
          <div className="lovirtual-card">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Tiempo de Permanencia (Semana)
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSpentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value} min`, 'Tiempo']}
                  />
                  <Line
                    type="monotone"
                    dataKey="minutos"
                    stroke="hsl(var(--accent))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Pie Chart */}
          <div className="lovirtual-card lg:col-span-2">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Estado de Estudiantes
            </h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="lovirtual-card">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Lista de Estudiantes
          </h3>
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
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                        {student.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={student.progress} className="w-24 h-2" />
                        <span className="text-sm text-muted-foreground">{student.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-semibold ${
                        student.averageScore >= 80 ? 'text-success' :
                        student.averageScore >= 60 ? 'text-warning' : 'text-destructive'
                      }`}>
                        {student.averageScore || '-'}%
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.lastActive}
                    </TableCell>
                    <TableCell>
                      {student.certificateGenerated ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Generado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                          Pendiente
                        </span>
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
