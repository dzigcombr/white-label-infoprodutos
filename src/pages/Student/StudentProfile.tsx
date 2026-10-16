import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  ShoppingBag,
  CheckCircle,
  XCircle,
  Clock,
  Loader2, 
  AlertCircle,
  Edit3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StudentApiService } from '../../services/studentApi';
import { Creator, Purchase, StudentProfile as StudentProfileType } from '../../types/student';

export default function StudentProfile() {
  const { dominio } = useParams<{ dominio: string }>();
  const navigate = useNavigate();
  const { user, cachedData } = useAuth();
  
  const [creator, setCreator] = useState<Creator | null>(cachedData.creator);
  const [profile, setProfile] = useState<StudentProfileType | null>(null);
  const [purchases, setPurchases] = useState<Purchase[]>(cachedData.purchases);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dominio && user) {
      loadData();
    }
  }, [dominio, user]);

  const loadData = async () => {
    if (!dominio || !user) return;

    try {
      setLoading(true);
      setError(null);

      let creatorData = creator;
      let purchasesData = purchases;

      // Use cached data if available and matches domain
      if (!creatorData || creatorData.dominio_personalizado !== dominio) {
        creatorData = await StudentApiService.getCreatorByDomain(dominio);
        if (!creatorData) {
          setError('Comunidade não encontrada');
          return;
        }
        setCreator(creatorData);
      }

      // Get profile (always fresh as it can change)
      const profileData = await StudentApiService.getStudentProfile(user.id);
      // Use cached purchases if available
      if (purchasesData.length === 0) {
        purchasesData = await StudentApiService.getStudentPurchases(user.id, creatorData.id);
        setPurchases(purchasesData);
      }

      setProfile(profileData);

    } catch (err) {
      console.error('Error loading profile data:', err);
      setError('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/${dominio}`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativa':
      case 'aprovado':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelada':
      case 'cancelado':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pendente':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ativa':
      case 'aprovado':
        return 'Ativo';
      case 'cancelada':
      case 'cancelado':
        return 'Cancelado';
      case 'pendente':
        return 'Pendente';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
      case 'aprovado':
        return 'text-green-600 bg-green-50';
      case 'cancelada':
      case 'cancelado':
        return 'text-red-600 bg-red-50';
      case 'pendente':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-lime-500" />
          <span className="text-gray-600">Carregando perfil...</span>
        </div>
      </div>
    );
  }

  if (error || !creator || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Erro ao carregar perfil'}
          </h2>
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
      <div 
        className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-40"
        style={creator.branding?.cor_primaria ? {
          backgroundColor: creator.branding.cor_primaria + '15'
        } : {}}
      >
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 
              className="text-lg font-semibold text-gray-900"
              style={{ color: creator.branding?.cor_primaria || '#1f2937' }}
            >
              Meu Perfil
            </h1>
            <p className="text-sm text-gray-500">
              Informações pessoais e compras
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20 space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Informações Pessoais
            </h2>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <Edit3 className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                style={{ 
                  backgroundColor: creator.branding?.cor_primaria || '#10b981'
                }}
              >
                {profile.nome?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {profile.nome || 'Usuário'}
                </h3>
                <p className="text-sm text-gray-500 capitalize">
                  {profile.papel}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Email</p>
                  <p className="text-sm text-gray-900">{profile.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Membro desde</p>
                  <p className="text-sm text-gray-900">
                    {new Date(profile.criado_em).toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchases */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Minhas Compras
            </h2>
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-500">
                {purchases.length} compra{purchases.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {purchases.length > 0 ? (
            <div className="space-y-4">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {purchase.produto?.nome || 'Produto'}
                      </h3>
                      {purchase.produto?.descricao && (
                        <p className="text-sm text-gray-600 mb-2">
                          {purchase.produto.descricao}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(purchase.criado_em).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {purchase.transacao_externa_id && (
                          <div>
                            ID: {purchase.transacao_externa_id}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                      {getStatusIcon(purchase.status)}
                      <span>{getStatusText(purchase.status)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma compra ainda
              </h3>
              <p className="text-gray-600">
                Suas compras aparecerão aqui quando você adquirir produtos.
              </p>
            </div>
          )}
        </div>

        {/* Community Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Comunidade
          </h2>
          <div className="flex items-center space-x-4">
            {creator.branding?.logo ? (
              <img
                src={creator.branding.logo}
                alt={creator.nome}
                className="w-12 h-12 rounded-xl object-cover"
              />
            ) : (
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: creator.branding?.cor_primaria || '#10b981' }}
              >
                {creator.nome.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{creator.nome}</h3>
              <p className="text-sm text-gray-500">
                Domínio: {creator.dominio_personalizado}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}