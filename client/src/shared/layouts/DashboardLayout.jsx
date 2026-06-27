import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, Briefcase, CheckSquare, Settings, LogOut, Sun, Moon } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import NotificationBell from '../components/NotificationBell';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Workspaces', path: '/workspaces', icon: Briefcase },
    { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar - Floating Glassmorphism */}
      <div className="hidden md:flex p-4 pr-0 h-full">
        <aside className="w-64 bg-card/60 backdrop-blur-xl border border-border/50 rounded-2xl flex flex-col shadow-2xl relative z-20">
          <div className="p-6">
            <div className="flex items-center gap-3 text-foreground font-extrabold text-2xl tracking-tight">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center text-lg shadow-lg shadow-primary/25">
                D
              </div>
              DevFlow
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-1.5 mt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold relative overflow-hidden group ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/10 rounded-xl" />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 bg-muted/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                  <Icon className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{item.name}</span>
                </Link>
              )
            })}
          </nav>

          <div className="p-4 mt-auto">
            <div className="bg-background/50 border border-border/50 rounded-xl p-3 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-secondary to-muted border border-border flex items-center justify-center font-bold text-sm shadow-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-bold truncate text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.role || 'Developer'}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground font-semibold rounded-lg transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
        
        {/* Top Navbar */}
        <header className="h-20 flex items-center justify-between px-8 shrink-0 z-50">
          <div className="flex-1 flex items-center gap-4">
            <div className="relative group w-full max-w-md">
              <SearchBar />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:bg-card hover:text-foreground rounded-xl transition-all shadow-sm border border-transparent hover:border-border/50"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <NotificationBell />
            <Link to="/settings" className="p-2 text-muted-foreground hover:bg-card hover:text-foreground rounded-xl transition-all shadow-sm border border-transparent hover:border-border/50">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 z-10 scrollbar-hide">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
