import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { StudentApiService } from '../../services/studentApi';
import { Creator } from '../../types/student';

export default function LoginPage() {
  // ✅ CORREÇÃO: Use as funções que existem no AuthContext
  const { login, loginStudent } = useAuth();
  const navigate = useNavigate();
  const { dominio } = useParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [creator, setCreator] = useState<Creator | null>(null);
  const [creatorLoading, setCreatorLoading] = useState(false);
  const [creatorError, setCreatorError] = useState(''); // Estado separado para erro do criador

  console.log('🔍 Domínio capturado:', dominio);

  // Buscar dados do criador quando há domínio personalizado
  useEffect(() => {
    if (dominio) {
      loadCreatorData();
    }
  }, [dominio]);

  const loadCreatorData = async () => {
    if (!dominio) return;

    try {
      setCreatorLoading(true);
      setCreatorError('');
      console.log('🔄 Buscando criador para o domínio:', dominio);
      
      const creatorData = await StudentApiService.getCreatorByDomain(dominio);
      
      if (!creatorData) {
        console.error('❌ Criador não encontrado para o domínio:', dominio);
        setCreatorError('Comunidade não encontrada');
        return;
      }
      
      console.log('✅ Criador encontrado:', creatorData);
      setCreator(creatorData);
    } catch (error) {
      console.error('❌ Erro ao carregar dados do criador:', error);
      setCreatorError('Comunidade não encontrada');
    } finally {
      setCreatorLoading(false);
    }
  };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    console.log('🔐 Iniciando login para:', email, dominio ? `Domínio: ${dominio}` : 'Login genérico');
    
    if (dominio) {
        // Verificar se há erro no carregamento do criador
        if (creatorError) {
          setError('Comunidade não encontrada. Verifique o endereço.');
          setLoading(false);
          return;
        }

        // Se ainda está carregando, aguardar
        if (creatorLoading) {
          setError('Aguarde, carregando dados da comunidade...');
          setLoading(false);
          return;
        }

        // ✅ CORREÇÃO: Use loginStudent para membros de comunidades personalizadas
       const result = await loginStudent(email, password, dominio);
        
    if (result.success && result.redirectUrl) {
        // Use navigate em vez de window.location.href para manter o SPA
        navigate(result.redirectUrl);
      } else if (result.redirectUrl) {
        // Se precisa redirecionar para checkout
        window.location.href = result.redirectUrl;
      }
    } else {
      await login(email, password);
      navigate('/dashboard');
    }
  } catch (error: any) {
    console.error('❌ Erro no login:', error);
    setError(error.message || 'Erro ao fazer login');
  } finally {
    setLoading(false);
  }
};
  // Determinar título e cores baseado no contexto
  const getTitle = () => {
    if (dominio && creator) {
      return creator.nome;
    }
    if (dominio && creatorError) {
      return 'Comunidade não encontrada';
    }
    return 'AcademyHub';
  };

  const getPrimaryColor = () => {
    if (dominio && creator?.branding?.cor_primaria) {
      return creator.branding.cor_primaria;
    }
    return '#65a30d';
  };

  const getSubtitle = () => {
    if (dominio && creator) {
      return 'Entre na sua comunidade';
    }
    if (dominio && creatorError) {
      return 'Verifique o endereço da comunidade';
    }
    return 'Digite suas credenciais de acesso';
  };

  // Se estiver carregando dados do criador
  if (dominio && creatorLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
          <p className="mt-4 text-center text-sm text-gray-600">
            Carregando comunidade...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo dinâmica - só aparece no login personalizado */}
        {dominio && creator?.branding?.appLogo && (
          <div className="flex justify-center mb-6">
            <img
              src={creator.branding.appLogo}
              alt={creator.nome}
              className="w-20 h-20 rounded-xl object-cover shadow-lg"
            />
          </div>
        )}
        
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {getTitle()}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {getSubtitle()}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Mostrar erro específico se comunidade não for encontrada */}
          {dominio && creatorError && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 px-4 py-3 rounded-md text-sm mb-4">
              {creatorError}
            </div>
          )}

          {/* Formulário de Login - só mostrar se não houver erro de comunidade */}
          {(!dominio || creator) && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{
                    backgroundColor: getPrimaryColor(),
                    borderColor: getPrimaryColor(),
                  }}
                  onMouseEnter={(e) => {
                    const color = getPrimaryColor();
                    e.currentTarget.style.backgroundColor = `${color}dd`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = getPrimaryColor();
                  }}
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>
              </div>
            </form>
          )}

          {/* Link de cadastro - só mostrar se não houver erro de comunidade */}
          {(!dominio || creator) && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="font-medium transition-colors"
                  style={{
                    color: getPrimaryColor(),
                  }}
                  onMouseEnter={(e) => {
                    const color = getPrimaryColor();
                    e.currentTarget.style.color = `${color}cc`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = getPrimaryColor();
                  }}
                >
                  Cadastre-se
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}