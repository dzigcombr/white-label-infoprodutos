import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard as Edit, Trash2, Package, Users, Bell, Rss, ExternalLink, Plus, Copy, Check } from 'lucide-react';
import { supabase } from "../lib/supabase";

interface App {
  id: string;
  logo: string;
  name: string;
  description: string;
  accessLink: string;
  createdAt: string;
  dominio_personalizado: string;
  branding: any;
}

export default function MyApps() {
  const [apps, setApps] = useState<App[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Hook interno para buscar apps
  function useAppsDoUsuario(usuarioId: string) {
    const [appsData, setAppsData] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
      async function fetchApps() {
        if (!usuarioId) return;
        setLoadingData(true);

        const { data, error } = await supabase
          .from("info_apps_personalizados")
          .select("id, nome, dominio_personalizado, branding, criado_em")
          .eq("dono_id", usuarioId);

        if (error) {
          console.error("Erro ao buscar apps:", error);
        } else {
          const baseUrl = import.meta.env.VITE_BASE_URL;
          console.log("🔍 Base URL:", baseUrl);
          console.log("📦 Apps encontrados:", data);
          
          const formatted = data.map(app => ({
            ...app,
            link: app.dominio_personalizado ? `${baseUrl}/${app.dominio_personalizado}` : null
          }));
          
          formatted.forEach(app => {
            console.log(`🔗 App "${app.nome}":`, {
              dominio_personalizado: app.dominio_personalizado,
              link: app.link
            });
          });
          
          setAppsData(formatted);
        }
        setLoadingData(false);
      }

      fetchApps();
    }, [usuarioId]);

    return { apps: appsData, loading: loadingData };
  }

  // Obter ID do usuário logado
  useEffect(() => {
    async function getUserId() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    }
    getUserId();
  }, []);

  // Usar o hook interno
  const { apps: appsDoUsuario, loading: loadingApps } = useAppsDoUsuario(userId);

  // Formatando os dados para o componente
  useEffect(() => {
    if (appsDoUsuario.length > 0) {
      const appsFormatados: App[] = appsDoUsuario.map(app => ({
        id: app.id,
        name: app.nome,
        logo: app.branding?.logo || 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=600',
        accessLink: app.link, // ← Já vem com a URL correta
        createdAt: new Date(app.criado_em).toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR'),
        dominio_personalizado: app.dominio_personalizado,
        branding: app.branding
      }));
      setApps(appsFormatados);
      setLoading(false);
    } else if (!loadingApps) {
      setLoading(false);
    }
  }, [appsDoUsuario, loadingApps]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este aplicativo?')) {
      const { error } = await supabase
        .from('info_apps_personalizados')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar app:', error);
        alert('Erro ao deletar aplicativo');
      } else {
        setApps(apps.filter(app => app.id !== id));
      }
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      })
      .catch(err => {
        console.error('Falha ao copiar texto: ', err);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando seus aplicativos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0d0d0d' }}>Meus Aplicativos</h1>
            <p className="mt-1 text-gray-600">
              Gerencie seus aplicativos personalizados
            </p>
          </div>
          <button
            onClick={() => navigate('/app-editor')}
            className="px-5 py-2.5 rounded-lg font-medium flex items-center transition-all hover:shadow-sm"
            style={{ backgroundColor: '#d7fb00', color: '#0d0d0d' }}
          >
            <Plus className="h-5 w-5 mr-2" />
            Criar Aplicativo
          </button>
        </div>

        {/* Grade de Aplicativos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200"
            >
              {/* Imagem grande no topo */}
              <div className="h-48 overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src={app.logo}
                  alt={app.name}
                />
              </div>
              
              <div className="p-5">
                {/* Nome e descrição */}
                <h3 className="font-semibold text-lg text-gray-900">{app.name}</h3>
                <p className="mt-1 text-gray-600">{app.description}</p>
                
                {/* Link de acesso exposto */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Link de acesso:</span>
                    <span className="text-xs text-gray-500">
                      Domínio: {app.dominio_personalizado || 'Não configurado'}
                    </span>
                  </div>
                  
                  {app.accessLink ? (
                    <div className="flex items-center mt-1 p-2 bg-gray-50 rounded-lg">
                      <span className="flex-1 text-sm font-mono text-gray-800 truncate">
                        {app.accessLink}
                      </span>
                      <div className="flex space-x-1 ml-2">
                        <button
                          onClick={() => copyToClipboard(app.accessLink, app.id)}
                          className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                          title="Copiar link"
                        >
                          {copiedId === app.id ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4 text-gray-600" />
                          )}
                        </button>
                        <a
                          href={app.accessLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                          title="Acessar aplicativo"
                        >
                          <ExternalLink className="h-4 w-4 text-gray-600" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center mt-1 p-2 bg-red-50 border border-red-200 rounded-lg">
                      <span className="flex-1 text-sm text-red-600">
                        Domínio personalizado não configurado
                      </span>
                      <button
                        onClick={() => navigate('/app-editor')}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
                      >
                        Configurar
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Botões de ação */}
                <div className="mt-5 grid grid-cols-3 gap-2">
                  <button
                   onClick={() => navigate(`/products/${app.id}`)}
                    className="py-2 rounded-lg text-sm flex flex-col items-center justify-center transition-colors hover:bg-gray-50"
                    style={{ color: '#0d0d0d' }}
                  >
                    <Package className="h-5 w-5 mb-1" />
                    Produtos
                   <button
    onClick={() => navigate('/comunidade')}
    className="py-2 rounded-lg text-sm flex flex-col items-center justify-center transition-colors hover:bg-gray-50"
    style={{ color: '#0d0d0d' }}
  >
    <Users className="h-5 w-5 mb-1" />
    Comunidade
  </button>

                  <button
                    className="py-2 rounded-lg text-sm flex flex-col items-center justify-center transition-colors hover:bg-gray-50"
                    style={{ color: '#0d0d0d' }}
                  >
                    <Bell className="h-5 w-5 mb-1" />
                    Notificações
                  </button>
                  <button
                    className="py-2 rounded-lg text-sm flex flex-col items-center justify-center transition-colors hover:bg-gray-50"
                    style={{ color: '#0d0d0d' }}
                  >
                    <Rss className="h-5 w-5 mb-1" />
                    Avisos
                  </button>
                  <button
                    className="py-2 rounded-lg text-sm flex flex-col items-center justify-center transition-colors hover:bg-gray-50"
                    style={{ color: '#0d0d0d' }}
                    onClick={() => navigate(`/app-editor/${app.id}`)}
                  >
                    <Edit className="h-5 w-5 mb-1" />
                    Editar
                  </button>
                  <button
                    className="py-2 rounded-lg text-sm flex flex-col items-center justify-center transition-colors hover:bg-gray-50 text-red-600"
                    onClick={() => handleDelete(app.id)}
                  >
                    <Trash2 className="h-5 w-5 mb-1" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem quando não há apps */}
        {apps.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum aplicativo criado</h3>
            <p className="mt-2 text-gray-600">
              Comece criando seu primeiro aplicativo personalizado
            </p>
            <button
              onClick={() => navigate('/app-editor')}
              className="mt-4 px-6 py-2.5 rounded-lg font-medium flex items-center transition-all hover:shadow-sm mx-auto"
              style={{ backgroundColor: '#d7fb00', color: '#0d0d0d' }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Criar Primeiro Aplicativo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}