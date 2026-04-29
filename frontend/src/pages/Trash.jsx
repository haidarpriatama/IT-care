import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { RotateCcw, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Trash = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTrash = async () => {
    try {
      const res = await api.get('/tickets/trash/all');
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  const handleRestore = async (id) => {
    try {
      await api.post(`/tickets/${id}/restore`);
      fetchTrash();
    } catch (err) {
      alert('Gagal memulihkan tiket');
    }
  };

  const handleHardDelete = async (id) => {
    if (!window.confirm('Hapus permanen tiket ini? Tidak dapat dikembalikan.')) return;
    try {
      await api.delete(`/tickets/${id}/hard`);
      fetchTrash();
    } catch (err) {
      alert('Gagal menghapus permanen');
    }
  };

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
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Trash Tiket</h2>
        <p className="text-sm text-muted-foreground mt-1">Tiket yang telah dihapus sementara dapat dipulihkan atau dihapus secara permanen.</p>
      </div>
      
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Daftar Tiket Terhapus</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Judul</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Pemohon</TableHead>
                  <TableHead>Dihapus Pada</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Memuat data trash...
                    </TableCell>
                  </TableRow>
                ) : tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Trash kosong.
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map(t => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium max-w-[200px] truncate" title={t.title}>{t.title}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(t.status)} className="uppercase text-[10px] tracking-wider">
                          {t.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{t.category}</TableCell>
                      <TableCell>{t.requester}</TableCell>
                      <TableCell className="text-muted-foreground whitespace-nowrap">{new Date(t.deleted_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button variant="outline" size="sm" className="mr-2" onClick={() => handleRestore(t.id)}>
                          <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Restore
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleHardDelete(t.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Hard Delete
                        </Button>
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

export default Trash;
