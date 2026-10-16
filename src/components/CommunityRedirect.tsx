// components/CommunityRedirect.tsx
import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function CommunityRedirect() {
  const { dominio } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    console.log('🔀 Redirecionando comunidade:', dominio);
  }, [dominio]);

  // Se não está autenticado, redirecionar para login personalizado
  if (!user) {
    return <Navigate to={`/login/${dominio}`} replace />;
  }

  // Se é membro, redirecionar para o feed do aluno
  if (user.user_metadata?.papel === 'membro') {
    return <Navigate to={`/aluno/${dominio}/feed`} replace />;
  }

  // Se é criador, redirecionar para dashboard
  if (user.user_metadata?.papel === 'criador') {
    return <Navigate to="/dashboard" replace />;
  }

  // Fallback
  return <Navigate to="/login" replace />;
}

export default CommunityRedirect;