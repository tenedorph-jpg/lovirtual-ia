import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Trophy, AlertTriangle, Users, Clock, BarChart3, Award } from 'lucide-react';
import { kpisPorPerfil } from '@/data/kpiData';

const COLORS = [
  'hsl(200, 99%, 25%)',
  'hsl(197, 99%, 41%)',
  'hsl(160, 84%, 39%)',
  'hsl(38, 92%, 50%)',
];

const tooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  color: 'hsl(var(--foreground))',
};

const KpiSection: React.FC = () => {
  const bestProfile = kpisPorPerfil.puntuacionPromedio[0];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary" />
        Métricas por Perfil / Rol
      </h2>

      {/* Top row: Donut + Best Score KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart - Distribution */}
        <div className="lovirtual-card lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Distribución de Perfiles
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={kpisPorPerfil.distribucion}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="cantidad"
                  nameKey="perfil"
                  label={({ perfil, cantidad }) => `${perfil}: ${cantidad}`}
                >
                  {kpisPorPerfil.distribucion.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Score KPI Card */}
        <div className="lovirtual-card flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-warning/10 mb-4">
            <Trophy className="w-10 h-10 text-warning" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">Mejor Puntuación Promedio</p>
          <p className="text-4xl font-bold text-foreground mb-1">{bestProfile.puntuacion}</p>
          <p className="text-lg font-semibold text-primary">{bestProfile.perfil}</p>
          <div className="mt-4 w-full space-y-2">
            {kpisPorPerfil.puntuacionPromedio.slice(1).map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{p.perfil}</span>
                <span className="font-semibold text-foreground">{p.puntuacion}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Middle row: Horizontal Bars + Stacked Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Horizontal Bar Chart - Average Time */}
        <div className="lovirtual-card">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            Tiempo Promedio por Perfil (Horas)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpisPorPerfil.tiempoPromedioHoras} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  type="category"
                  dataKey="perfil"
                  width={160}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [`${v}h`, 'Tiempo']} />
                <Bar dataKey="horas" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stacked Bar Chart - Completions */}
        <div className="lovirtual-card">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-success" />
            Finalizaciones Correctas vs Erróneas
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpisPorPerfil.estadoFinalizacion}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="perfil"
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="correctas" stackId="a" fill="hsl(var(--success))" name="Correctas" radius={[0, 0, 0, 0]} />
                <Bar dataKey="erroneas" stackId="a" fill="hsl(var(--destructive))" name="Erróneas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Error Rate Table */}
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
            {kpisPorPerfil.tasaErroresRespuestas.map((item, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium text-foreground">{item.perfil}</TableCell>
                <TableCell className="text-right">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                    parseFloat(item.tasaError) >= 15
                      ? 'bg-destructive/10 text-destructive'
                      : parseFloat(item.tasaError) >= 10
                      ? 'bg-warning/10 text-warning'
                      : 'bg-success/10 text-success'
                  }`}>
                    {item.tasaError}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default KpiSection;
