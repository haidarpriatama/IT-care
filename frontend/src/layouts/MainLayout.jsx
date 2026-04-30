import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/utils/AuthContext';
import api from '@/services/api';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Ticket,
  Users,
  FolderOpen,
  FileBarChart,
  Trash2,
  LogOut,
  Bell,
  Menu,
  Plus,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const SidebarNav = ({ user, location, onClickNavItem }) => {
  const NavItem = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to || (location.pathname.startsWith(to) && to !== '/');
    return (
      <Link
        to={to}
        onClick={onClickNavItem}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors mb-1",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
        {children}
      </Link>
    );
  };

  return (
    <div className="flex flex-col w-full">
      <NavItem to="/" icon={LayoutDashboard}>Dashboard</NavItem>
      <NavItem to="/tickets" icon={Ticket}>Tiket</NavItem>
      
      {(user?.role === 'admin' || user?.role === 'teknisi') && (
        <div className="mt-6">
          <div className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            {user?.role === 'admin' ? 'Admin Area' : 'Technician Area'}
          </div>
          <NavItem to="/reports" icon={FileBarChart}>Laporan</NavItem>
          {user?.role === 'admin' && <NavItem to="/users" icon={Users}>Users</NavItem>}
          <NavItem to="/categories" icon={FolderOpen}>Kategori</NavItem>
          {user?.role === 'admin' && <NavItem to="/trash" icon={Trash2}>Trash</NavItem>}
        </div>
      )}
    </div>
  );
};

const MainLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/tickets/api/logs');
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (user) {
      fetchLogs();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Determine page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/tickets')) return 'Tiket';
    if (path.startsWith('/users')) return 'Manajemen Pengguna';
    if (path.startsWith('/categories')) return 'Kategori';
    if (path.startsWith('/reports')) return 'Laporan';
    if (path.startsWith('/trash')) return 'Trash';
    return '';
  };

  return (
    <div className="flex h-screen w-full bg-muted/20 overflow-hidden text-foreground font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[240px] bg-sidebar border-r border-border flex-shrink-0">
        <div className="flex items-center h-14 px-4 border-b border-border">
          <Link to="/" className="flex items-center gap-2 font-bold text-base text-sidebar-foreground">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground text-xs">
              IT
            </div>
            IT Care
          </Link>
        </div>
        
        {/* Primary Action Button */}
        <div className="p-4 pb-2">
          <Button className="w-full justify-start shadow-sm" asChild>
            <Link to="/tickets/create">
              <Plus className="mr-2 h-4 w-4" />
              Buat Tiket
            </Link>
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-2">
          <SidebarNav user={user} location={location} />
        </ScrollArea>

        {/* User Profile Footer */}
        <div className="p-3 mt-auto border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start px-2 py-6 h-auto hover:bg-sidebar-accent">
                <Avatar className="h-8 w-8 rounded-md mr-3">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium rounded-md">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start flex-1 text-left min-w-0">
                  <span className="text-sm font-medium leading-none truncate w-full">{user?.name || 'User'}</span>
                  <span className="text-xs text-sidebar-foreground/60 mt-1 truncate w-full capitalize">{user?.role || ''}</span>
                </div>
                <MoreVertical className="h-4 w-4 text-sidebar-foreground/50 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" sideOffset={8} className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 bg-background">
        <header className="flex items-center justify-between h-14 px-6 border-b border-border flex-shrink-0 bg-background">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden -ml-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] p-0 bg-sidebar border-border flex flex-col">
                <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
                <div className="flex items-center h-14 px-4 border-b border-border">
                  <span className="font-bold text-base text-sidebar-foreground flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground text-xs">
                      IT
                    </div>
                    IT Care
                  </span>
                </div>
                <div className="p-4 pb-2">
                  <Button className="w-full justify-start shadow-sm" onClick={() => setIsMobileMenuOpen(false)} asChild>
                    <Link to="/tickets/create">
                      <Plus className="mr-2 h-4 w-4" /> Buat Tiket
                    </Link>
                  </Button>
                </div>
                <ScrollArea className="flex-1 px-3 py-2">
                  <SidebarNav user={user} location={location} onClickNavItem={() => setIsMobileMenuOpen(false)} />
                </ScrollArea>
                <div className="p-3 mt-auto border-t border-border">
                  <Button variant="ghost" className="w-full justify-start px-2 py-4 h-auto" onClick={handleLogout}>
                    <LogOut className="mr-3 h-4 w-4 text-destructive" />
                    <span className="text-destructive text-sm font-medium">Logout</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
            
            <h1 className="text-lg font-semibold tracking-tight hidden sm:block">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground rounded-full">
                  <Bell className="h-[18px] w-[18px]" />
                  {Array.isArray(logs) && logs.length > 0 && (
                    <span className="absolute top-[8px] right-[8px] h-2 w-2 rounded-full bg-primary" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="font-medium text-sm">Notifikasi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                  {(!Array.isArray(logs) || logs.length === 0) ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">Belum ada aktivitas.</div>
                  ) : (
                    <div className="flex flex-col">
                      {logs.map((log) => (
                        <div key={log.id} className="p-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                          <p className="text-sm font-medium truncate text-foreground">{log.ticket_title}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-muted-foreground text-[11px]">Status berubah</span>
                            <Badge variant="secondary" className="text-[10px] uppercase font-medium">
                              {log.new_status}
                            </Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1.5">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
