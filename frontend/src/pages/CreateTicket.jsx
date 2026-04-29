import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

const CreateTicket = () => {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    priority: 'medium',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/tickets', formData);
      navigate('/tickets');
    } catch (err) {
      console.error(err);
      alert('Gagal membuat tiket');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/tickets"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Buat Tiket Baru</h2>
          <p className="text-sm text-muted-foreground mt-1">Isi detail kendala IT yang Anda alami.</p>
        </div>
      </div>
      
      <Card className="max-w-2xl border-border shadow-sm">
        <CardHeader>
          <CardTitle>Form Tiket Bantuan</CardTitle>
          <CardDescription>
            Pastikan memberikan deskripsi yang jelas agar teknisi dapat menangani dengan cepat.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Tiket <span className="text-destructive">*</span></Label>
              <Input 
                id="title"
                name="title"
                value={formData.title} 
                onChange={handleChange} 
                placeholder="Misal: Printer Error di Lantai 3"
                required 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="category_id">Kategori <span className="text-destructive">*</span></Label>
                <Select 
                  name="category_id"
                  value={formData.category_id} 
                  onValueChange={(val) => handleSelectChange('category_id', val)}
                  required
                >
                  <SelectTrigger id="category_id">
                    <SelectValue placeholder="-- Pilih Kategori --" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioritas <span className="text-destructive">*</span></Label>
                <Select 
                  name="priority"
                  value={formData.priority} 
                  onValueChange={(val) => handleSelectChange('priority', val)}
                  required
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Pilih Prioritas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Lokasi / Ruangan</Label>
              <Input 
                id="location"
                name="location"
                value={formData.location} 
                onChange={handleChange} 
                placeholder="Misal: Ruang Meeting Lantai 2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Kendala <span className="text-destructive">*</span></Label>
              <Textarea 
                id="description"
                name="description"
                rows={5}
                value={formData.description} 
                onChange={handleChange} 
                placeholder="Jelaskan detail kendala yang dialami secara rinci..."
                required 
                className="resize-y"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-border">
              <Button type="submit" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Kirim Tiket'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/tickets')}>
                Batal
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateTicket;
