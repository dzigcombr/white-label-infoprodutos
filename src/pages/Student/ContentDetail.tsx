import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StudentApiService } from '../../services/studentApi';
import { Creator, Content } from '../../types/student';
import ContentViewer from '../../components/Student/ContentViewer';

export default function ContentDetail() {
  const { dominio, id } = useParams<{ dominio: string; id: string }>();
  const navigate = useNavigate();
  const { user, checkCreatorAccess } = useAuth();
  
  const [creator, setCreator] = useState<Creator | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessAllowed, setAccessAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dominio && id) {
      loadCreatorAndContent();
    }
  }, [dominio, id, user]);

  const loadCreatorAndContent = async () => {
    if (!dominio || !id) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Buscando criador por domínio:', dominio);

      // 1️⃣ BUSCAR CRIADOR POR DOMÍNIO (rota pública)
      const creatorData = await StudentApiService.getCreatorByDomain(dominio);
      
      if (!creatorData) {
        setError('Comunidade não encontrada');
        return;
      }

      console.log('✅ Criador encontrado:', creatorData);
      setCreator(creatorData);

      // 2️⃣ VERIFICAR ACESSO SE USUÁRIO LOGADO
      if (user) {
        console.log('🔐 Verificando acesso do usuário:', user.id, 'para criador:', creatorData.id);
        const hasAccess = await checkCreatorAccess(user.id, creatorData.id);
        
        if (!hasAccess) {
          setError('Sua conta não tem acesso a esta comunidade');
          setAccessAllowed(false);
          return;
        }
        
        console.log('✅ Acesso permitido');
        setAccessAllowed(true);
      } else {
        // Permitir acesso público (sem usuário logado)
        setAccessAllowed(true);
      }

      // 3️⃣ BUSCAR CONTEÚDO ESPECÍFICO
      console.log('📄 Buscando conteúdo:', id);
      const contentData = await StudentApiService.getContentById(id);
      
      if (!contentData) {
        setError('Conteúdo não encontrado');
        return;
      }

      console.log('✅ Conteúdo encontrado:', contentData);
      setContent(contentData);
      
    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do conteúdo');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (content) {
      navigate(`/${dominio}/produto/${content.produto_id}`);
    } else {
      navigate(`/${dominio}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-lime-500" />
          <span className="text-gray-600">Carregando conteúdo...</span>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Conteúdo não encontrado'}
          </h2>
          <p className="text-gray-600 mb-6">
            Verifique se o link está correto e tente novamente.
          </p>
          <button
            onClick={handleBack}
            className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-3 rounded-xl transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!accessAllowed && user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso não permitido
          </h2>
          <p className="text-gray-600 mb-6">
            Sua conta não tem acesso a esta comunidade.
          </p>
          <button
            onClick={handleBack}
            className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-3 rounded-xl transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Conteúdo não encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            Este conteúdo pode ter sido removido ou não existe.
          </p>
          <button
            onClick={handleBack}
            className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-3 rounded-xl transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }
  return (
    <ContentViewer
      content={content}
      onBack={handleBack}
    />
  );
}