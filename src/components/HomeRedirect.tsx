// components/HomeRedirect.tsx
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function HomeRedirect() {
  const { user } = useAuth();
  const { dominio } = useParams();

  if (user?.user_metadata?.papel === 'criador') {
    return <Navigate to="/dashboard" replace />;
  }
  
  if (user?.user_metadata?.papel === 'membro' && dominio) {
    return <Navigate to={`/aluno/${dominio}/feed`} replace />;
  }
  
  // Se é membro mas não tem domínio, tentar descobrir o domínio
  if (user?.user_metadata?.papel === 'membro') {
    // Você pode buscar o domínio da comunidade do usuário aqui
    return <Navigate to="/aluno/feed" replace />;
  }
  
  return <Navigate to="/login" replace />;
}

export default HomeRedirect;