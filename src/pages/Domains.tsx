import React, { useState } from 'react';
import { Plus, Globe, ExternalLink, CheckCircle, Clock, XCircle, Copy } from 'lucide-react';

export default function Domains() {
  const [domains] = useState([
    {
      id: '1',
      domain: 'minhacomunidade.com',
      status: 'active',
      createdAt: '2024-01-15T10:00:00Z',
      sslStatus: 'valid',
      appName: 'Minha Comunidade',
      visits: 1250
    },
    {
      id: '2',
      domain: 'cursosavancados.app',
      status: 'pending',
      createdAt: '2024-12-18T14:30:00Z',
      sslStatus: 'pending',
      appName: 'Cursos Avançados',
      visits: 0
    },
    {
      id: '3',
      domain: 'escolaonline.net',
      status: 'error',
      createdAt: '2024-11-20T09:15:00Z',
      sslStatus: 'error',
      appName: 'Escola Online',
      visits: 850
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomain, setNewDomain] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'pending':
        return 'Pendente';
      case 'error':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Domínios</h1>
          <p className="text-gray-600 mt-2">Gerencie seus domínios personalizados</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Adicionar Domínio</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-gray-900">
                {domains.filter(d => d.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {domains.filter(d => d.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Com Erro</p>
              <p className="text-2xl font-bold text-gray-900">
                {domains.filter(d => d.status === 'error').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Globe className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{domains.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Domains List */}
      <div className="space-y-4">
        {domains.map((domain) => (
          <div key={domain.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-600 rounded-xl flex items-center justify-center">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{domain.domain}</h3>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(domain.status)}
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(domain.status)}`}>
                        {getStatusText(domain.status)}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{domain.appName}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Criado em {new Date(domain.createdAt).toLocaleDateString('pt-BR')}</span>
                    <span>•</span>
                    <span>{domain.visits.toLocaleString()} visitas</span>
                    <span>•</span>
                    <span>SSL: {domain.sslStatus === 'valid' ? 'Válido' : 'Pendente'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => copyToClipboard(`https://${domain.domain}`)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Copiar URL"
                >
                  <Copy className="h-4 w-4" />
                </button>
                {domain.status === 'active' && (
                  <a
                    href={`https://${domain.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Visitar site"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  Configurar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DNS Configuration Help */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Configuração de DNS</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <p>Para configurar seu domínio personalizado, adicione os seguintes registros DNS:</p>
          <div className="bg-white rounded-lg p-4 font-mono text-xs">
            <div className="grid grid-cols-3 gap-4 mb-2 font-semibold">
              <span>Tipo</span>
              <span>Nome</span>
              <span>Valor</span>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-1">
              <span>CNAME</span>
              <span>www</span>
              <span>app.seudominio.com</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <span>A</span>
              <span>@</span>
              <span>192.168.1.1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Adicionar Domínio</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domínio
                </label>
                <input
                  type="text"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  placeholder="exemplo.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Digite apenas o domínio, sem http:// ou www
                </p>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewDomain('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    // Here you would add the domain
                    setShowAddModal(false);
                    setNewDomain('');
                  }}
                  className="flex-1 px-4 py-3 bg-lime-500 hover:bg-lime-600 text-white rounded-xl transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}