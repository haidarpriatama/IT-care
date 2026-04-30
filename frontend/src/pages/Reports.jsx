import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, RotateCcw, Filter } from 'lucide-react';

import { cn } from "@/lib/utils";

const Reports = () => {
  const [data, setData] = useState({ tickets: [], summary: {}, categoryStats: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '', status: '', priority: '', category_id: '', date_from: '', date_to: ''
  });

  const fetchReports = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters).toString();
      const res = await api.get(`/reports?${queryParams}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const handleReset = () => {
    setFilters({ search: '', status: '', priority: '', category_id: '', date_from: '', date_to: '' });
    setTimeout(() => fetchReports(), 0);
  };

  const { tickets, summary, categories } = data;

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
      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricSmall title="Total" value={summary.total} />
        <MetricSmall title="Open" value={summary.open} color="text-foreground" />
        <MetricSmall title="Progress" value={summary.in_progress} color="text-amber-600" />
        <MetricSmall title="Resolved" value={summary.resolved} color="text-emerald-600" />
        <MetricSmall title="Rejected" value={summary.rejected} color="text-destructive" />
      </div>

      {/* Filter Toolbar */}
      <Card className="border-border shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-4 bg-muted/20">
          <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[150px] space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">Pencarian</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input 
                  className="h-8 text-xs bg-background pl-8" 
                  placeholder="Cari judul atau ID..." 
                  value={filters.search} 
                  onChange={e => setFilters({...filters, search: e.target.value})} 
                />
              </div>
            </div>
            <div className="w-[110px] space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">Status</label>
              <Select value={filters.status} onValueChange={v => setFilters({...filters, status: v})}>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[130px] space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">Kategori</label>
              <Select value={filters.category_id} onValueChange={v => setFilters({...filters, category_id: v})}>
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Semua" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {Array.isArray(categories) && categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[125px] space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">Dari</label>
              <Input 
                type="date" 
                className="h-8 text-xs bg-background px-2" 
                value={filters.date_from} 
                onChange={e => setFilters({...filters, date_from: e.target.value})} 
              />
            </div>
            <div className="w-[125px] space-y-1">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">Sampai</label>
              <Input 
                type="date" 
                className="h-8 text-xs bg-background px-2" 
                value={filters.date_to} 
                onChange={e => setFilters({...filters, date_to: e.target.value})} 
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="h-8 px-3 text-xs">
                <Filter className="h-3 w-3 mr-1.5" /> Filter
              </Button>
              <Button type="button" variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={handleReset}>
                <RotateCcw className="h-3 w-3 mr-1.5" /> Reset
              </Button>
            </div>
          </form>
        </CardContent>

        {/* Data Table */}
        <div className="p-0 border-t border-border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="h-9 py-2 text-xs font-medium">Tiket</TableHead>
                <TableHead className="h-9 py-2 text-xs font-medium">Status</TableHead>
                <TableHead className="h-9 py-2 text-xs font-medium">Kategori</TableHead>
                <TableHead className="h-9 py-2 text-xs font-medium">Pemohon</TableHead>
                <TableHead className="h-9 py-2 text-xs font-medium">Teknisi</TableHead>
                <TableHead className="h-9 py-2 text-xs font-medium">Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                    Memuat laporan...
                  </TableCell>
                </TableRow>
              ) : (!Array.isArray(tickets) || tickets.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                    Data tidak ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map(t => (
                  <TableRow key={t.id} className="border-border group">
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-muted-foreground w-6">#{t.id}</span>
                        <span className="font-medium text-sm text-foreground truncate max-w-[180px]" title={t.title}>{t.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5">
                      <Badge variant={getStatusBadgeVariant(t.status)} className="uppercase text-[9px] tracking-wider font-semibold">
                        {t.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2.5 text-xs text-muted-foreground">{t.category_name}</TableCell>
                    <TableCell className="py-2.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium">{t.requester_name}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">{t.requester_dept || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2.5 text-xs text-muted-foreground">{t.technician_name || '-'}</TableCell>
                    <TableCell className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

const MetricSmall = ({ title, value, color = "text-foreground" }) => (
  <Card className="border-border shadow-sm rounded-xl">
    <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
      <span className={cn("text-xl font-bold tracking-tight", color)}>{value || 0}</span>
    </CardContent>
  </Card>
);

export default Reports;
