import React, { useState, useEffect } from 'react';
import api from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FolderOpen, Plus, Search, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post('/categories', { name });
      setName('');
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menambah kategori');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kategori ini?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus kategori');
    }
  };

  const filteredCategories = Array.isArray(categories) 
    ? categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Form Card */}
        <Card className="h-fit border-border shadow-sm rounded-xl">
          <CardHeader className="pb-4 border-b border-border bg-muted/20">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <FolderOpen className="h-4 w-4 text-primary" /> Tambah Kategori
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-medium text-foreground">Nama Kategori</label>
                <Input 
                  id="name"
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Misal: Hardware, Software"
                  required 
                  disabled={isSubmitting}
                  className="h-9 text-sm bg-background"
                />
              </div>
              <Button type="submit" className="w-full h-9" disabled={isSubmitting}>
                <Plus className="h-4 w-4 mr-2" /> Simpan
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="lg:col-span-3 border-border shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="p-4 border-b border-border bg-muted/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg font-semibold tracking-tight">Kategori Tiket</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari kategori..."
                    className="pl-9 h-9 w-[180px] lg:w-[250px] bg-background text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="h-9 py-2 text-xs font-medium">Nama Kategori</TableHead>
                    <TableHead className="w-[80px] h-9 py-2 text-xs font-medium text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center text-muted-foreground text-sm">
                        Memuat data kategori...
                      </TableCell>
                    </TableRow>
                  ) : filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="h-24 text-center text-muted-foreground text-sm">
                        Belum ada kategori.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map(c => (
                      <TableRow key={c.id} className="border-border group">
                        <TableCell className="py-2.5 font-medium text-sm text-foreground">{c.name}</TableCell>
                        <TableCell className="py-2.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                                <span className="sr-only">Buka menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleDelete(c.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                Hapus
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
    </div>
  );
};

export default Categories;
