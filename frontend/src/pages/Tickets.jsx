import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { Plus, Search, SlidersHorizontal, MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/utils/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const { user } = useAuth();

  const fetchTickets = async () => {
    try {
      const statusQuery = status === 'all' ? '' : status;
      const res = await api.get(`/tickets?search=${search}&status=${statusQuery}`);
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [search, status]);

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
      <Card className="border-border shadow-sm rounded-xl overflow-hidden">
        <CardHeader className="p-4 border-b border-border bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold tracking-tight">Data Tiket</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Cari tiket..."
                  className="pl-9 h-9 w-[180px] lg:w-[250px] bg-background text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="w-[140px]">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-9 bg-background text-sm">
                    <div className="flex items-center gap-2">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                      <SelectValue placeholder="Status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {user?.role !== 'teknisi' && (
                <Button size="sm" className="h-9" asChild>
                  <Link to="/tickets/create">
                    <Plus className="h-4 w-4 mr-2" /> Buat Tiket
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[80px] h-9 py-2 text-xs font-medium">ID</TableHead>
                  <TableHead className="h-9 py-2 text-xs font-medium">Judul</TableHead>
                  <TableHead className="h-9 py-2 text-xs font-medium">Status</TableHead>
                  <TableHead className="h-9 py-2 text-xs font-medium">Prioritas</TableHead>
                  <TableHead className="h-9 py-2 text-xs font-medium">Kategori</TableHead>
                  {user?.role !== 'karyawan' && <TableHead className="h-9 py-2 text-xs font-medium">Pemohon</TableHead>}
                  {user?.role !== 'teknisi' && <TableHead className="h-9 py-2 text-xs font-medium">Teknisi</TableHead>}
                  <TableHead className="h-9 py-2 text-xs font-medium">Tanggal</TableHead>
                  <TableHead className="w-[50px] h-9 py-2 text-xs font-medium text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground text-sm">
                      Memuat data tiket...
                    </TableCell>
                  </TableRow>
                ) : (!Array.isArray(tickets) || tickets.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground text-sm">
                      Tidak ada tiket yang ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map(ticket => (
                    <TableRow key={ticket.id} className="border-border group">
                      <TableCell className="py-2.5 text-xs text-muted-foreground">{ticket.ticket_number || `#${ticket.id}`}</TableCell>
                      <TableCell className="py-2.5 font-medium max-w-[250px] truncate text-sm text-foreground" title={ticket.title}>{ticket.title}</TableCell>
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
                      <TableCell className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                              <span className="sr-only">Buka menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/tickets/${ticket.id}`}>Lihat Detail</Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Tickets;
