import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  Loader2, 
  AlertCircle, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Users, 
  User, 
  Bell,
  FileText,
  Headphones
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StudentApiService } from '../../services/studentApi';
import { Creator, Product, Purchase } from '../../types/student';
import { supabase } from '../../lib/supabase';

export default function StudentHome() {
  const { dominio } = useParams<{ dominio: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, cachedData, setCachedData } = useAuth();
  
  const [creator, setCreator] = useState<Creator | null>(cachedData.creator);
  const [products, setProducts] = useState<Product[]>(cachedData.products);
  const [purchases, setPurchases] = useState<Purchase[]>(cachedData.purchases);
  const [loading, setLoading] = useState(true);
  const [accessAllowed, setAccessAllowed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // ✅ CORREÇÃO: Função para verificar acesso específico ao produto
  const checkProductAccess = useCallback(async (productId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      console.log('🔍 Verificando acesso ao produto:', productId, 'usuário:', user.id);
      
      const { data: purchase, error } = await supabase
        .from('info_compras')
        .select('*')
        .eq('usuario_id', user.id)
        .eq('produto_id', productId)
        .eq('status', 'ativa')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhuma compra encontrada - não é erro, só não tem acesso
          return false;
        }
        console.error('❌ Erro ao verificar acesso ao produto:', error);
        return false;
      }

      console.log('✅ Compra encontrada para o produto:', !!purchase);
      return !!purchase;
      
    } catch (error) {
      console.error('❌ Erro em checkProductAccess:', error);
      return false;
    }
  }, [user]);

  // ✅ CORREÇÃO: Função para verificar acesso geral ao criador
  const checkCreatorAccess = useCallback(async (userId: string, creatorId: string): Promise<boolean> => {
    try {
      console.log('🔍 Verificando acesso geral ao criador:', creatorId);
      
      const { data: purchases, error } = await supabase
        .from('info_compras')
        .select(`
          *,
          info_produtos!inner(criador_id)
        `)
        .eq('usuario_id', userId)
        .eq('status', 'ativa')
        .eq('info_produtos.criador_id', creatorId);

      if (error) {
        console.error('❌ Erro ao verificar compras:', error);
        return false;
      }

      const hasAccess = !!purchases && purchases.length > 0;
      console.log('✅ Acesso geral permitido:', hasAccess);
      
      return hasAccess;
      
    } catch (error) {
      console.error('❌ Erro em checkCreatorAccess:', error);
      return false;
    }
  }, []);

  // ✅ CORREÇÃO: Estado para controlar quais produtos têm acesso
  const [productsAccess, setProductsAccess] = useState<{[key: string]: boolean}>({});

  const loadCreatorAndProducts = useCallback(async () => {
    if (!dominio) {
      setError('Domínio não especificado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Carregando criador para domínio:', dominio);
      
      // Buscar criador
      const creatorData = await StudentApiService.getCreatorByDomain(dominio);
      
      if (!creatorData) {
        setError('Comunidade não encontrada');
        setLoading(false);
        return;
      }

      console.log('✅ Criador encontrado:', creatorData.id);
      setCreator(creatorData);

      // Buscar produtos do criador
      const productsData = await StudentApiService.getProductsByCreator(creatorData.id);
      setProducts(productsData);
      console.log('✅ Produtos encontrados:', productsData.length);

      // Buscar compras do usuário (se logado) e verificar acesso a cada produto
      let userHasAccess = false;
      const accessMap: {[key: string]: boolean} = {};

      if (user) {
        console.log('👤 Usuário logado, verificando acesso...');
        
        // Verificar acesso geral ao criador
        userHasAccess = await checkCreatorAccess(user.id, creatorData.id);
        console.log('🔐 Acesso geral permitido:', userHasAccess);

        // ✅ CORREÇÃO: Verificar acesso individual para cada produto
        if (userHasAccess) {
          for (const product of productsData) {
            const hasProductAccess = await checkProductAccess(product.id);
            accessMap[product.id] = hasProductAccess;
            console.log(`📦 Produto ${product.nome}: ${hasProductAccess ? 'LIBERADO' : 'BLOQUEADO'}`);
          }
        }

        setProductsAccess(accessMap);
        
        // Buscar compras para cache
        const purchasesData = await StudentApiService.getStudentPurchases(user.id, creatorData.id);
        setPurchases(purchasesData);
        console.log('✅ Compras do usuário:', purchasesData.length);
      } else {
        console.log('👤 Usuário não logado, acesso livre para visualização');
        userHasAccess = true; // Permite visualização sem login
      }

      setAccessAllowed(userHasAccess);

      // Cache dos dados
      setCachedData({
        creator: creatorData,
        products: productsData,
        purchases: user ? await StudentApiService.getStudentPurchases(user.id, creatorData.id) : []
      });

    } catch (err: any) {
      console.error('❌ Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar dados da comunidade');
    } finally {
      setLoading(false);
    }
  }, [dominio, user, setCachedData, checkCreatorAccess, checkProductAccess]);

  useEffect(() => {
    if (dominio) {
      loadCreatorAndProducts();
    }
  }, [dominio, loadCreatorAndProducts]);

  // Efeito para o carousel automático
  useEffect(() => {
    if (creator?.branding && hasActiveBanners()) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prevIndex) => 
          (prevIndex + 1) % getActiveBanners().length
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [creator?.branding]);

  // ✅ CORREÇÃO: Função simplificada para verificar acesso ao produto (usando estado local)
  const hasProductAccess = (productId: string): boolean => {
    if (!user || !accessAllowed) return false;
    return productsAccess[productId] === true;
  };

  // Funções para manipular os banners
  const hasActiveBanners = () => {
    if (!creator?.branding) return false;
    return getActiveBanners().length > 0;
  };

  const getActiveBanners = () => {
    if (!creator?.branding) return [];
    
    const banners = [];
    if (creator.branding.banners) {
      creator.branding.banners.forEach(banner => {
        if (banner.image) banners.push(banner.image);
      });
    }
    
    return banners.filter(banner => banner !== null && banner !== '');
  };

  const nextBanner = () => {
    const activeBanners = getActiveBanners();
    if (activeBanners.length > 1) {
      setCurrentBannerIndex((prevIndex) => 
        (prevIndex + 1) % activeBanners.length
      );
    }
  };

  const prevBanner = () => {
    const activeBanners = getActiveBanners();
    if (activeBanners.length > 1) {
      setCurrentBannerIndex((prevIndex) => 
        prevIndex === 0 ? activeBanners.length - 1 : prevIndex - 1
      );
    }
  };

  const goToBanner = (index: number) => {
    setCurrentBannerIndex(index);
  };

  const handleProductClick = async (product: Product) => {
    if (!user) {
      navigate(`/login/${dominio}`);
      return;
    }

    if (!accessAllowed) {
      alert('Você não tem acesso a esta comunidade. Verifique suas compras.');
      return;
    }

    try {
      const hasAccess = hasProductAccess(product.id);
      
      if (hasAccess) {
        navigate(`/${dominio}/produto/${product.id}`);
      } else {
        // ✅ CORREÇÃO: Verificação em tempo real para garantir que está correto
        const realTimeAccess = await checkProductAccess(product.id);
        
        if (realTimeAccess) {
          // Atualiza o estado se a verificação em tempo real for diferente
          setProductsAccess(prev => ({...prev, [product.id]: true}));
          navigate(`/${dominio}/produto/${product.id}`);
        } else {
          alert('Você não tem acesso a este produto. Entre em contato com o suporte.');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
      alert('Erro ao verificar acesso ao produto');
    }
  };

  const handleSupportClick = () => {
    if (creator?.whatsapp_suporte) {
      const whatsappUrl = `https://wa.me/${creator.whatsapp_suporte.replace(/\D/g, '')}`;
      window.open(whatsappUrl, '_blank');
    } else if (creator?.email_suporte) {
      window.location.href = `mailto:${creator.email_suporte}`;
    }
  };

  const handleNotificationsClick = () => {
    navigate(`/${dominio}/notificacoes`);
  };

  // Aplicar branding dinâmico
  useEffect(() => {
    if (creator?.branding?.cor_primaria) {
      document.documentElement.style.setProperty('--primary-color', creator.branding.cor_primaria);
    }
  }, [creator]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-lime-500" />
          <span className="text-gray-600">Carregando comunidade...</span>
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
            {error || 'Comunidade não encontrada'}
          </h2>
          <p className="text-gray-600 mb-4">
            Verifique se o link está correto e tente novamente.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600"
          >
            Voltar para o início
          </button>
        </div>
      </div>
    );
  }

  if (user && !accessAllowed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso não permitido
          </h2>
          <p className="text-gray-600 mb-4">
            Você não tem acesso a esta comunidade ou sua assinatura pode ter expirado.
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Voltar ao Dashboard
            </button>
            <button 
              onClick={handleSupportClick}
              className="w-full px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600"
            >
              Entrar em contato com suporte
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeBanners = getActiveBanners();
  const isHomePage = location.pathname === `/${dominio}` || location.pathname === `/${dominio}/`;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header com branding */}
      <div 
        className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-40"
        style={creator.branding?.cor_primaria ? {
          backgroundColor: creator.branding.cor_primaria + '15'
        } : {}}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {creator.branding?.logo ? (
              <img
                src={creator.branding.logo}
                alt={creator.nome}
                className="w-10 h-10 rounded-xl object-cover"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: creator.branding?.cor_primaria || '#10b981' }}
              >
                <span className="text-white font-semibold text-lg">
                  {creator.nome.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <h1 
              className="text-xl font-bold"
              style={{ color: creator.branding?.cor_primaria || '#1f2937' }}
            >
              {creator.nome}
            </h1>
          </div>

          <button
            onClick={handleNotificationsClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: creator.branding?.cor_primaria || '#1f2937' }}
          >
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {isHomePage ? (
          <>
            {/* Banner Carousel */}
            {activeBanners.length > 0 && (
              <div className="relative mb-6 rounded-2xl overflow-hidden">
                <div className="relative h-48 md:h-64 lg:h-80">
                  {activeBanners.map((banner, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-500 ${
                        index === currentBannerIndex ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      <img
                        src={banner}
                        alt={`Banner ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {activeBanners.length > 1 && (
                  <>
                    <button
                      onClick={prevBanner}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextBanner}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {activeBanners.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {activeBanners.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToBanner(index)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentBannerIndex 
                            ? 'bg-white' 
                            : 'bg-white bg-opacity-50 hover:bg-opacity-70'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Welcome Message */}
            <div 
              className="rounded-2xl p-6 mb-6 shadow-sm"
              style={{ 
                backgroundColor: creator.branding?.cor_primaria ? creator.branding.cor_primaria + '10' : '#ffffff'
              }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Bem-vindo à {creator.nome}!
              </h2>
              <p className="text-gray-600">
                Explore nossos conteúdos educacionais e comece sua jornada de aprendizado.
              </p>
            </div>

            {/* Products Section */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Nossos Cursos e Produtos
              </h3>
              
              {products.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {products.map((product) => {
                    const userHasAccess = hasProductAccess(product.id);
                    
                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col"
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="relative aspect-video">
                          <img
                            src={product.capa_url || 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=400'}
                            alt={product.nome}
                            className="w-full h-full object-cover"
                          />
                          {!userHasAccess && user && (
                            <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
                              <Lock className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="p-3 flex-1 flex flex-col">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 leading-tight">
                            {product.nome}
                          </h4>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2 flex-1">
                            {product.descricao}
                          </p>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <span className={`text-xs ${
                              userHasAccess ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {userHasAccess ? 'Liberado' : user ? 'Bloqueado' : 'Faça login'}
                            </span>
                            {!userHasAccess && user && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSupportClick();
                                }}
                                className="text-[10px] px-2 py-1 rounded-full"
                                style={{ 
                                  backgroundColor: creator.branding?.cor_primaria || '#10b981',
                                  color: 'white'
                                }}
                              >
                                Adquirir
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                    Os conteúdos serão disponibilizados em breve.
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <Outlet />
        )}
      </div>

      {/* Floating Support Button - SÓ NA PÁGINA INICIAL */}
      {isHomePage && (creator.whatsapp_suporte || creator.email_suporte) && (
        <button
          onClick={handleSupportClick}
          className="fixed bottom-20 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all z-50 hover:scale-110"
          style={{ 
            backgroundColor: creator.branding?.cor_primaria || '#10b981'
          }}
        >
          <Headphones className="h-6 w-6 text-white" />
        </button>
      )}

      {/* Menu Bottom - SEMPRE VISÍVEL */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 py-3">
          <button
            onClick={() => navigate(`/${dominio}`)}
            className={`flex flex-col items-center justify-center p-2 transition-colors ${
              isHomePage ? 'text-lime-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            style={isHomePage && creator.branding?.cor_primaria ? 
              { color: creator.branding.cor_primaria } : {}
            }
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs">Início</span>
          </button>

          <button
            onClick={() => navigate(`/${dominio}/community`)}
            className={`flex flex-col items-center justify-center p-2 transition-colors ${
              location.pathname.includes('community') ? 'text-lime-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            style={location.pathname.includes('community') && creator.branding?.cor_primaria ? 
              { color: creator.branding.cor_primaria } : {}
            }
          >
            <Users className="w-6 h-6 mb-1" />
            <span className="text-xs">Comunidade</span>
          </button>

          <button
            onClick={() => navigate(`/${dominio}/anotacoes`)}
            className={`flex flex-col items-center justify-center p-2 transition-colors ${
              location.pathname.includes('anotacoes') ? 'text-lime-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            style={location.pathname.includes('anotacoes') && creator.branding?.cor_primaria ? 
              { color: creator.branding.cor_primaria } : {}
            }
          >
            <FileText className="w-6 h-6 mb-1" />
            <span className="text-xs">Anotações</span>
          </button>

          <button
            onClick={() => navigate(`/${dominio}/perfil`)}
            className={`flex flex-col items-center justify-center p-2 transition-colors ${
              location.pathname.includes('perfil') ? 'text-lime-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            style={location.pathname.includes('perfil') && creator.branding?.cor_primaria ? 
              { color: creator.branding.cor_primaria } : {}
            }
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </div>

      {/* Se não estiver logado, mostrar mensagem de login - SÓ NA PÁGINA INICIAL */}
      {!user && isHomePage && (
        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Faça login para acessar os conteúdos
            </p>
            <button
              onClick={() => navigate(`/login/${dominio}`)}
              className="px-4 py-2 rounded-lg text-white text-sm font-medium"
              style={{ 
                backgroundColor: creator.branding?.cor_primaria || '#10b981'
              }}
            >
              Fazer Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
}