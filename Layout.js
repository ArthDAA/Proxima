import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl, isWeb } from "@/utils";
import { MessageCircle, Users, Heart, Settings, Shield, Menu } from "lucide-react";

const navigationItems = [
  {
    title: "Mon Confident",
    url: createPageUrl("Chat"),
    icon: MessageCircle,
    description: "Chat personnel"
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

// Composant Sidebar responsive
const Sidebar = ({ isOpen, onToggle, children }) => {
  if (isWeb()) {
    // Version desktop avec sidebar fixe
    return (
      <div className="min-h-screen flex w-full">
        <aside className="w-72 border-r flex flex-col" style={{ borderColor: 'var(--border)' }}>
          {children}
        </aside>
      </div>
    );
  } else {
    // Version mobile avec drawer
    return (
      <>
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onToggle}
          />
        )}
        <aside 
          className={`fixed left-0 top-0 h-full w-72 bg-white z-50 transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {children}
        </aside>
      </>
    );
  }
};

export default function Layout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
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
          
          /* Styles responsive */
          @media (max-width: 768px) {
            .desktop-only { display: none !important; }
          }
          
          @media (min-width: 769px) {
            .mobile-only { display: none !important; }
          }
        `}
      </style>

      {/* Header mobile */}
      <header className="mobile-only border-b px-4 py-3 flex items-center justify-between"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
          Médiateur
        </h1>
        <div className="w-10" /> {/* Spacer pour centrer le titre */}
      </header>

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)}>
          {/* Header Sidebar */}
          <div className="border-b p-6" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" 
                   style={{ background: 'linear-gradient(135deg, var(--primary), #A68B5B)' }}>
                <Heart className="w-6 h-6" style={{ color: 'var(--primary-foreground)' }} />
              </div>
              <div>
                <h2 className="font-bold text-xl" style={{ color: 'var(--foreground)' }}>
                  Médiateur
                </h2>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Votre confident bienveillant
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4">
            <h3 className="text-xs font-medium uppercase tracking-wider px-3 py-3 mb-2"
                style={{ color: 'var(--muted-foreground)' }}>
              Navigation
            </h3>
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.title}>
                  <Link
                    to={item.url}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-start gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                      location.pathname === item.url 
                        ? 'shadow-sm' 
                        : 'hover:shadow-sm'
                    }`}
                    style={{
                      backgroundColor: location.pathname === item.url ? 'var(--accent)' : 'transparent',
                      color: location.pathname === item.url ? 'var(--accent-foreground)' : 'var(--foreground)'
                    }}
                  >
                    <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.title}</div>
                      <div className="text-xs opacity-75 truncate">{item.description}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Section À propos */}
            <div className="mt-8">
              <h3 className="text-xs font-medium uppercase tracking-wider px-3 py-3 mb-2"
                  style={{ color: 'var(--muted-foreground)' }}>
                À propos
              </h3>
              <div className="px-4 py-3 rounded-xl" style={{ backgroundColor: 'var(--muted)' }}>
                <div className="flex items-start gap-2 text-sm">
                  <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
                  <div>
                    <p className="font-medium mb-1" style={{ color: 'var(--foreground)' }}>
                      Totalement confidentiel
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                      Vos conversations sont chiffrées et ne sont jamais partagées.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Footer */}
          <div className="border-t p-4" style={{ borderColor: 'var(--border)' }}>
            <Link to={createPageUrl("Settings")} onClick={() => setSidebarOpen(false)}>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:shadow-sm transition-all duration-200"
                   style={{ backgroundColor: 'var(--muted)' }}>
                <Settings className="w-5 h-5" style={{ color: 'var(--muted-foreground)' }} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    Paramètres
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                    Personnaliser
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </Sidebar>

        {/* Contenu principal */}
        <main className="flex-1 min-h-screen desktop-only">
          {children}
        </main>

        {/* Version mobile du contenu */}
        <main className="flex-1 min-h-screen mobile-only">
          <div className="pb-16"> {/* Padding pour navigation bottom */}
            {children}
          </div>
          
          {/* Navigation bottom pour mobile */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-2"
               style={{ borderColor: 'var(--border)' }}>
            <div className="flex justify-around">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex flex-col items-center py-2 px-3 rounded-lg ${
                    location.pathname === item.url ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs">{item.title.split(' ')[0]}</span>
                </Link>
              ))}
            </div>
          </nav>
        </main>
      </div>
    </div>
  );
}