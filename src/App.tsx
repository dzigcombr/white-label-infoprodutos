// App.tsx - Corrija as verificações de papel
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/Auth/LoginPage';
import AppLayout from './components/Layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProdutosApp from './pages/ProdutosApp'; // ← APENAS UMA VEZ
import Contents from './pages/Contents';
import Community from './pages/Community';
import Clients from './pages/Clients';
import Integrations from './pages/Integrations';
import Domains from './pages/Domains';
import StudentFeed from './pages/StudentFeed';
import AppEditor from './pages/AppEditor';
import StudentHome from './pages/Student/StudentHome';
import ProductDetail from './pages/Student/ProductDetail';
import ContentDetail from './pages/Student/ContentDetail';
import StudentNotes from './pages/Student/StudentNotes';
import StudentProfile from './pages/Student/StudentProfile';
import CheckoutPage from './pages/CheckoutPage';
import StudentCommunity from './pages/Student/StudentCommunity';
// REMOVA A LINHA DUPLICADA: import ProdutosApp from './pages/ProdutosApp';

// Função auxiliar para verificar se é criador
const isCreator = (user: any) => {
  return user?.user_metadata?.papel === 'criador' || 
         user?.role === 'creator' ||
         user?.papel === 'criador';
};

// Protected Route Component - VERIFICAÇÃO CORRIGIDA
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }
  
  // Só permite acesso se for criador - VERIFICAÇÃO CORRIGIDA
  if (isCreator(user)) {
    return <AppLayout>{children}</AppLayout>;
  }
  
  // Se for membro ou não autorizado, redireciona para login
  return <Navigate to="/login" replace />;
}

// HomeRedirect Component - VERIFICAÇÃO CORRIGIDA
function HomeRedirect() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-lime-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  // 👨‍💼 CRIADOR vai para o dashboard
  if (isCreator(user)) {
    return <Navigate to="/dashboard" replace />;
  }

  // 👨‍🎓 MEMBRO logado - mostra mensagem
  if (user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Bem-vindo!
          </h2>
          <p className="text-gray-600 mb-4">
            Você é um membro. Acesse através de um domínio personalizado.
          </p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-lime-500 text-white px-6 py-2 rounded-lg hover:bg-lime-600"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  // 🔐 Não logado vai para login
  return <Navigate to="/login" replace />;
}

// Componente vazio para a rota index
function EmptyComponent() {
  return null;
}

// Router Component
function AppRoutes() {
  return (
    <Routes>
      {/* 🔐 ROTAS DE LOGIN */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/:dominio/login" element={<LoginPage />} />
      
      {/* 🎯 ROTAS PÚBLICAS */}
      <Route path="/checkout/:dominio" element={<CheckoutPage />} />
      
      {/* 👨‍🎓 ROTAS DO STUDENT */}
      <Route path="/:dominio" element={<StudentHome />}>
        <Route index element={<EmptyComponent />} />
        <Route path="anotacoes" element={<StudentNotes />} />
        <Route path="perfil" element={<StudentProfile />} />
        <Route path="community" element={<StudentCommunity />} />
        <Route path="produto/:id" element={<ProductDetail />} />
        <Route path="conteudo/:id" element={<ContentDetail />} />
      </Route>
      
      {/* 👨‍💼 ROTAS DE CRIADOR */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/app-editor/:appId?" element={<ProtectedRoute><AppEditor /></ProtectedRoute>} />
      
      {/* ✅ ROTA CORRIGIDA: Products.tsx (lista de produtos) */}
      <Route path="/products/:appId" element={<ProtectedRoute><Products /></ProtectedRoute>} />
      
      {/* ✅ NOVA ROTA: ProdutosApp.tsx (cadastro de conteúdos) */}
      <Route path="/products/:appId/gerenciar/:productId" element={<ProtectedRoute><ProdutosApp /></ProtectedRoute>} />
      
      <Route path="/conteudos" element={<ProtectedRoute><Contents /></ProtectedRoute>} />
      <Route path="/comunidade/:appId" element={<ProtectedRoute><Community /></ProtectedRoute>} />
      <Route path="/clientes" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
      <Route path="/integracoes" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
      <Route path="/dominios" element={<ProtectedRoute><Domains /></ProtectedRoute>} />

      {/* 🔄 ROTA INICIAL */}
      <Route path="/" element={<HomeRedirect />} />
      
      {/* 🚨 ROTA 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Componente Principal
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;