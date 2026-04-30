import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/utils/AuthContext';
import { Trash2, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  
  // Status update states
  const [status, setStatus] = useState('');
  const [technicianId, setTechnicianId] = useState('');

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setData(res.data);
      setStatus(res.data.ticket.status);
      setTechnicianId(res.data.ticket.technician_id ? res.data.ticket.technician_id.toString() : 'unassigned');
    } catch (err) {
      console.error(err);
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleUpdateStatus = async () => {
    try {
      const payload = { status };
      if (user?.role === 'admin') {
        payload.technician_id = technicianId !== 'unassigned' ? technicianId : '';
      }
      // Untuk teknisi backend akan otomatis set ke user.id atau tetap sama.
      await api.put(`/tickets/${id}`, payload);
      fetchTicket();
    } catch (err) {
      console.error(err);
      alert('Gagal update tiket');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    try {
      await api.post(`/tickets/${id}/notes`, { note: noteText });
      setNoteText('');
      fetchTicket();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin memindahkan tiket ini ke trash?')) return;
    try {
      await api.delete(`/tickets/${id}`);
      navigate('/tickets');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus tiket');
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

  if (loading) return <div className="p-8 text-center text-muted-foreground">Memuat detail tiket...</div>;
  if (!data) return <div className="p-8 text-center text-muted-foreground">Ticket tidak ditemukan.</div>;

  const { ticket, notes, logs, technicians } = data;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/tickets"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">#{ticket.id} - {ticket.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">Oleh {ticket.requester_name}</span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-sm text-muted-foreground">{new Date(ticket.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Admin / Karyawan can edit/delete if allowed */}
          {(user?.role === 'admin' || (user?.role === 'karyawan' && ticket.status === 'open')) && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Hapus Tiket
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Detail Informasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs uppercase tracking-wider mb-1 block">Deskripsi Kendala</Label>
                <div className="text-sm p-4 bg-muted/30 rounded-md border border-border whitespace-pre-wrap">
                  {ticket.description}
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div>
                  <Label className="text-muted-foreground text-xs block mb-1">Kategori</Label>
                  <span className="text-sm font-medium">{ticket.category_name}</span>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs block mb-1">Prioritas</Label>
                  <Badge variant="outline" className="capitalize text-[10px] font-normal tracking-wide">
                    {ticket.priority}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs block mb-1">Lokasi</Label>
                  <span className="text-sm font-medium">{ticket.location || '-'}</span>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs block mb-1">Departemen</Label>
                  <span className="text-sm font-medium">{ticket.department || '-'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Catatan & Komunikasi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                {notes.length === 0 ? (
                  <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground text-sm">
                    Belum ada catatan.
                  </div>
                ) : (
                  notes.map(note => (
                    <div key={note.id} className="p-3 bg-muted/50 rounded-md border border-border">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm">{note.author_name}</strong>
                          <Badge variant="outline" className="text-[10px] uppercase font-normal">{note.author_role}</Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleString()}</span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{note.note}</div>
                    </div>
                  ))
                )}
              </div>
              
              <form onSubmit={handleAddNote} className="space-y-3">
                <Label htmlFor="note">Tambahkan Catatan Baru</Label>
                <Textarea 
                  id="note"
                  rows={3}
                  placeholder="Ketik catatan atau pembaruan di sini..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  required
                  className="resize-y"
                />
                <Button type="submit" size="sm" className="w-full sm:w-auto">
                  <Send className="h-4 w-4 mr-2" /> Kirim Catatan
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Status Tiket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-muted-foreground text-xs block mb-2">Status Saat Ini</Label>
                <Badge variant={getStatusBadgeVariant(ticket.status)} className="uppercase text-xs py-1 px-3 tracking-wider">
                  {ticket.status}
                </Badge>
              </div>

              <div>
                <Label className="text-muted-foreground text-xs block mb-2">Teknisi Penanggung Jawab</Label>
                <div className="text-sm font-medium">{ticket.technician_name || 'Belum ditugaskan'}</div>
              </div>
              
              {(user?.role === 'admin' || user?.role === 'teknisi') && (
                <div className="pt-4 border-t border-border space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Ubah Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {user?.role === 'admin' && (
                    <div className="space-y-2">
                      <Label htmlFor="technician">Tugaskan Teknisi</Label>
                      <Select value={technicianId} onValueChange={setTechnicianId}>
                        <SelectTrigger id="technician">
                          <SelectValue placeholder="-- Pilih Teknisi --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">-- Belum Ditugaskan --</SelectItem>
                          {technicians.map(t => (
                            <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  <Button onClick={handleUpdateStatus} className="w-full">
                    Update Tiket
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Log Aktivitas</CardTitle>
            </CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center">Belum ada aktivitas</div>
              ) : (
                <div className="space-y-4">
                  {logs.map(log => (
                    <div key={log.id} className="relative pl-4 border-l-2 border-muted">
                      <div className="absolute w-2 h-2 bg-primary rounded-full -left-[5px] top-1"></div>
                      <p className="text-sm">
                        <span className="font-medium">{log.changed_by_name}</span> mengubah status ke <Badge variant="outline" className="text-[10px] uppercase ml-1">{log.new_status}</Badge>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
