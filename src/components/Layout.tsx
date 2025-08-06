import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Leaf, Settings, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutProps {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Layout = ({ children, activeTab, onTabChange }: LayoutProps) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-accent/30">
      <header className="bg-primary shadow-sm border-b sticky top-0 z-40 sm:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-16">
            <div className="flex items-center space-x-3 sm:hidden">
              <div className="bg-primary-foreground p-2 rounded-lg">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-foreground">Bank Sampah RW</h1>
                <p className="text-sm text-primary-foreground/80">Sistem Tabungan Sampah</p>
              </div>
            </div>
            <div className="hidden sm:block">
              <h2 className="text-lg font-semibold text-primary-foreground">Dashboard</h2>
            </div>
            {/* Settings button for mobile */}
            <div className="flex items-center gap-2 sm:hidden">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => onTabChange?.('settings')}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
            {/* User menu for desktop */}
            <div className="hidden sm:flex items-center gap-3">
              <Badge variant="secondary" className="bg-primary-foreground/10 text-primary-foreground text-xs">
                {user?.role === 'admin' ? 'Admin' : 'Operator'}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="text-primary-foreground hover:bg-primary-foreground/10 gap-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">@{user?.username}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onTabChange?.('settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Pengaturan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 sm:pb-8 sm:ml-64">
        {children}
      </main>
    </div>
  );
};