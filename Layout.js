import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageCircle, Users, Heart, Settings, Shield } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Mon Confident",
    url: createPageUrl("Chat"),
    icon: MessageCircle,
    description: "Chat permanent"
  },
  {
    title: "Créer une Médiation",
    url: createPageUrl("CreateMediation"),
    icon: Users,
    description: "Résoudre un conflit"
  },
  {
    title: "Mes Médiations",
    url: createPageUrl("Mediations"),
    icon: Heart,
    description: "Conflits en cours"
  }
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <style>
        {`
          :root {
            --primary: #8B7355;
            --primary-foreground: #FFFFFF;
            --secondary: #F5F1EB;
            --secondary-foreground: #5D5D5D;
            --background: #FEFCF8;
            --foreground: #3D3D3D;
            --muted: #F0EBE3;
            --muted-foreground: #706B63;
            --accent: #E8DCC6;
            --accent-foreground: #5D5D5D;
            --border: #E0D4C1;
          }
        `}
      </style>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: 'var(--background)' }}>
        <Sidebar className="border-r" style={{ borderColor: 'var(--border)' }}>
          <SidebarHeader className="border-b p-6" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                   style={{ background: 'linear-gradient(135deg, var(--primary), #A68B5B)' }}>
                <Heart className="w-6 h-6" style={{ color: 'var(--primary-foreground)' }} />
              </div>
              <div>
                <h2 className="font-bold text-xl" style={{ color: 'var(--foreground)' }}>Médiateur</h2>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Votre confident bienveillant
                </p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider px-3 py-3"
                                style={{ color: 'var(--muted-foreground)' }}>
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`mb-2 rounded-xl transition-all duration-200 ${
                          location.pathname === item.url 
                            ? 'shadow-sm' 
                            : 'hover:shadow-sm'
                        }`}
                        style={{
                          backgroundColor: location.pathname === item.url ? 'var(--accent)' : 'transparent',
                          color: location.pathname === item.url ? 'var(--accent-foreground)' : 'var(--foreground)'
                        }}
                      >
                        <Link to={item.url} className="flex items-start gap-4 px-4 py-3">
                          <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{item.title}</div>
                            <div className="text-xs opacity-75 truncate">{item.description}</div>
                          </div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-medium uppercase tracking-wider px-3 py-3"
                                style={{ color: 'var(--muted-foreground)' }}>
                À propos
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--muted)' }}>
                  <div className="flex items-start gap-2 text-sm">
                    <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                    <div>
                      <p className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                        Totalement confidentiel
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                        Vos conversations sont chiffrées et ne sont jamais partagées sans votre accord.
                      </p>
                    </div>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t p-4" style={{ borderColor: 'var(--border)' }}>
            <Link to={createPageUrl("Settings")}>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:shadow-sm transition-all duration-200"
                   style={{ backgroundColor: 'var(--muted)' }}>
                <Settings className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>Paramètres</p>
                  <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                    Personnaliser votre expérience
                  </p>
                </div>
              </div>
            </Link>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b px-6 py-4 md:hidden" 
                  style={{ 
                    backgroundColor: 'var(--background)', 
                    borderColor: 'var(--border)' 
                  }}>
            <div className="flex items-center gap-4">
              <SidebarTrigger className="p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>
                Médiateur
              </h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}