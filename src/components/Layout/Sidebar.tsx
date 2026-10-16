// components/Layout/Sidebar.tsx - CORRIGIDO
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Smartphone, 
  Users, 
  FileText,
  MessageSquare,
  Code2,
  Globe,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Apenas navegação do criador - REMOVIDO "Produtos" do menu principal
const creatorNavigation = [
  { name: 'Aplicativos', href: '/dashboard', icon: Smartphone },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Conteúdos', href: '/conteudos', icon: FileText },
  { name: 'Comunidade', href: '/comunidade', icon: MessageSquare },
  { name: 'Integrações', href: '/integracoes', icon: Code2 },
  { name: 'Domínios', href: '/dominios', icon: Globe },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  // Verifica se o usuário é criador, se não for, não mostra o sidebar
  if (user?.user_metadata?.papel !== 'criador' && user?.role !== 'creator') {
    return null; // Não renderiza o sidebar se não for criador
  }

  return (
    <div className="flex h-screen flex-col bg-white border-r border-gray-200 w-64">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-lime-400 to-lime-600 rounded-lg flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">AppManager</span>
        </div>
      </div>

      {/* Navigation - APENAS PARA CRIADOR */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {creatorNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || 
                          location.pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-lime-50 text-lime-700 border border-lime-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`mr-3 h-5 w-5 transition-colors ${
                isActive ? 'text-lime-600' : 'text-gray-400 group-hover:text-gray-600'
              }`} />
              {item.name}
              {isActive && (
                <ChevronRight className="ml-auto h-4 w-4 text-lime-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-lime-600 rounded-full flex items-center justify-center text-white font-semibold">
            {user?.email?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email || 'Criador'}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              Criador
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}