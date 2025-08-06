import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Home, 
  Users, 
  Scale, 
  Wallet, 
  BarChart3, 
  Settings,
  ArrowLeft,
  Leaf
} from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'rt-management', label: 'Kelola RT', icon: Users },
    { id: 'waste-deposit', label: 'Setor Sampah', icon: Scale },
    { id: 'savings', label: 'Tabungan', icon: Wallet },
    { id: 'reports', label: 'Laporan', icon: BarChart3 },
  ];

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <div className="hidden sm:block">
        <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40">
          {/* Sidebar Header */}
          <div className="h-16 flex items-center px-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="bg-primary p-2 rounded-lg">
                <Leaf className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Bank Sampah RW</h1>
                <p className="text-xs text-muted-foreground">Sistem Tabungan</p>
              </div>
            </div>
          </div>
          
          {/* Sidebar Navigation */}
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 sm:hidden">
        <div className="grid grid-cols-5 gap-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="h-5 w-5 mb-1.5" />
                <span className="text-xs font-medium leading-tight">{item.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};