import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StudentApiService } from '../../services/studentApi';
import { Creator, Content } from '../../types/student';
import ContentItem from '../../components/Student/ContentItem';

export default function ProductDetail() {
  const { dominio, id } = useParams<{ dominio: string; id: string }>();
  const navigate = useNavigate();
  const { user, checkCreatorAccess } = useAuth();
  
  const [creator, setCreator] = useState<Creator | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessAllowed, setAccessAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dominio && id) {
      loadCreatorAndContents();
    }
  }, [dominio, id, user]);

  const loadCreatorAndContents = async () => {
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

      // 3️⃣ BUSCAR CONTEÚDOS DO PRODUTO
      console.log('📦 Buscando conteúdos do produto:', id);
      const contentsData = await StudentApiService.getContentsByProduct(id);
      console.log('✅ Conteúdos encontrados:', contentsData);
      setContents(contentsData);
      
    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do produto');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/${dominio}`);
  };

  const handleContentClick = (content: Content) => {
    navigate(`/${dominio}/conteudo/${content.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-lime-500" />
          <span className="text-gray-600">Carregando produto...</span>
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
            {error || 'Produto não encontrado'}
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">
              Conteúdos do Curso
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {contents.length > 0 ? (
          <div className="space-y-4">
            {contents.map((content, index) => (
              <div key={content.id} className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-lime-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lime-600 font-semibold text-sm">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <ContentItem
                    content={content}
                    onClick={() => handleContentClick(content)}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum conteúdo disponível
            </h3>
            <p className="text-gray-600">
              Os módulos deste curso serão disponibilizados em breve.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}