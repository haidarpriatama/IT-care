import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/utils/AuthContext';
import api from '@/services/api';
import { cn } from '@/lib/utils';
import { ArrowRight, Search, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ stats: {}, recentTickets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-8 text-center text-muted-foreground text-sm">Memuat dashboard...</div>;

  const { stats, recentTickets } = data;

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'open': return 'secondary';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-4">
        {user?.role === 'admin' ? (
          <>
            <StatCard title="Total Tiket" value={stats.total} />
            <StatCard title="Tiket Terbuka" value={stats.open} />
            <StatCard title="Sedang Diproses" value={stats.inProgress} />
            <StatCard title="Selesai" value={stats.resolved} />
          </>
        ) : user?.role === 'teknisi' ? (
          <>
            <StatCard title="Ditugaskan" value={stats.assigned} />
            <StatCard title="Sedang Diproses" value={stats.inProgress} />
            <StatCard title="Selesai" value={stats.resolved} />
            <StatCard title="Total Selesai" value={stats.resolved} /> {/* Filler for 4 columns if needed */}
          </>
        ) : (
          <>
            <StatCard title="Total Tiket Saya" value={stats.total} />
            <StatCard title="Tiket Terbuka" value={stats.open} />
            <StatCard title="Selesai" value={stats.resolved} />
            <div /> {/* Empty placeholder to maintain grid */}
          </>
        )}
      </div>

      {/* Analytics Chart Placeholder */}
      <Card className="border-border shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Aktivitas Tiket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full flex items-end justify-between gap-2 border-b border-l border-border/50 pb-2 px-2 relative">
            {/* Y-axis labels placeholder */}
            <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-[10px] text-muted-foreground py-2 -ml-6">
              <span>100</span>
              <span>50</span>
              <span>0</span>
            </div>
            
            {/* Mock Bars */}
            {[40, 70, 45, 90, 65, 85, 30, 50, 75, 100, 55, 80].map((h, i) => (
              <div key={i} className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-all relative group" style={{ height: `${h}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {h}
                </div>
              </div>
            ))}
          </div>
          {/* X-axis labels placeholder */}
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground px-2">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </CardContent>
      </Card>

      {/* Data Table Section */}
      <Card className="border-border shadow-sm rounded-xl overflow-hidden">
        <Tabs defaultValue="all" className="w-full">
          <CardHeader className="border-b border-border bg-muted/20 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 space-y-0">
            <TabsList className="bg-transparent p-0 h-auto gap-4">
              <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 py-1.5 font-medium text-sm">Semua Tiket</TabsTrigger>
              <TabsTrigger value="open" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 py-1.5 font-medium text-sm">Open</TabsTrigger>
              <TabsTrigger value="in_progress" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 py-1.5 font-medium text-sm">Dalam Proses</TabsTrigger>
              <TabsTrigger value="resolved" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 py-1.5 font-medium text-sm">Selesai</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input type="text" placeholder="Cari..." className="pl-8 h-8 w-[150px] lg:w-[200px] text-xs bg-background" />
              </div>
              <Button size="sm" className="h-8 text-xs" asChild>
                <Link to="/tickets/create">
                  <Plus className="mr-1 h-3.5 w-3.5" /> Tiket
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <TabsContent value="all" className="m-0 border-none p-0 outline-none">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="h-9 py-2 text-xs font-medium">Judul</TableHead>
                      <TableHead className="h-9 py-2 text-xs font-medium">Status</TableHead>
                      <TableHead className="h-9 py-2 text-xs font-medium">Prioritas</TableHead>
                      <TableHead className="h-9 py-2 text-xs font-medium">Kategori</TableHead>
                      {user?.role !== 'karyawan' && <TableHead className="h-9 py-2 text-xs font-medium">Pemohon</TableHead>}
                      {user?.role !== 'teknisi' && <TableHead className="h-9 py-2 text-xs font-medium">Teknisi</TableHead>}
                      <TableHead className="h-9 py-2 text-xs font-medium">Tanggal</TableHead>
                      <TableHead className="h-9 py-2 text-xs font-medium text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(!Array.isArray(recentTickets) || recentTickets.length === 0) ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground text-sm">
                          Belum ada tiket
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentTickets.map(ticket => (
                        <TableRow key={ticket.id} className="border-border">
                          <TableCell className="py-2.5 font-medium max-w-[200px] truncate text-sm text-foreground" title={ticket.title}>{ticket.title}</TableCell>
                          <TableCell className="py-2.5">
                            <Badge variant={getStatusBadgeVariant(ticket.status)} className="uppercase text-[9px] tracking-wider font-semibold">
                              {ticket.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5">
                            <Badge variant="outline" className="capitalize text-[10px] font-normal tracking-wide text-muted-foreground">
                              {ticket.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2.5 text-xs text-muted-foreground">{ticket.category}</TableCell>
                          {user?.role !== 'karyawan' && <TableCell className="py-2.5 text-xs text-foreground">{ticket.requester}</TableCell>}
                          {user?.role !== 'teknisi' && <TableCell className="py-2.5 text-xs text-muted-foreground">{ticket.technician || '-'}</TableCell>}
                          <TableCell className="py-2.5 text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="py-2.5 text-right">
                            <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2 hover:bg-muted">
                              <Link to={`/tickets/${ticket.id}`}>Detail</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            {/* Adding basic empty states for other tabs just for UI completeness */}
            <TabsContent value="open" className="m-0 p-6 text-center text-sm text-muted-foreground">Menampilkan tiket Open (Demo Mode)</TabsContent>
            <TabsContent value="in_progress" className="m-0 p-6 text-center text-sm text-muted-foreground">Menampilkan tiket Dalam Proses (Demo Mode)</TabsContent>
            <TabsContent value="resolved" className="m-0 p-6 text-center text-sm text-muted-foreground">Menampilkan tiket Selesai (Demo Mode)</TabsContent>
          </CardContent>
          <div className="p-3 border-t border-border bg-muted/20 text-center">
            <Link to="/tickets" className="text-xs text-primary hover:underline font-medium inline-flex items-center">
              Lihat Semua Tiket <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

const StatCard = ({ title, value }) => (
  <Card className="shadow-sm border-border rounded-xl">
    <CardHeader className="pb-2 pt-5 px-5">
      <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
    </CardHeader>
    <CardContent className="px-5 pb-5">
      <div className="text-3xl font-bold tracking-tight text-foreground">{value || 0}</div>
    </CardContent>
  </Card>
);

export default Dashboard;
