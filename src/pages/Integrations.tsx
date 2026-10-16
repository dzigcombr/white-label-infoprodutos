import React, { useState } from 'react';
import { Plus, Settings, ExternalLink, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function Integrations() {
  const [integrations] = useState([
    {
      id: '1',
      name: 'Hotmart',
      description: 'Integração com plataforma de vendas Hotmart',
      status: 'connected',
      icon: '🔥',
      lastSync: '2024-12-20T10:30:00Z',
      config: {
        apiKey: '****-****-****-1234',
        webhook: 'https://api.example.com/webhook/hotmart'
      }
    },
    {
      id: '2',
      name: 'Kiwify',
      description: 'Integração com plataforma de vendas Kiwify',
      status: 'disconnected',
      icon: '🥝',
      lastSync: null,
      config: {
        apiKey: '',
        webhook: ''
      }
    },
    {
      id: '3',
      name: 'Kirvano',
      description: 'Integração com plataforma de vendas Kirvano',
      status: 'error',
      icon: '⚡',
      lastSync: '2024-12-19T15:20:00Z',
      config: {
        apiKey: '****-****-****-5678',
        webhook: 'https://api.example.com/webhook/kirvano'
      }
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'error':
        return 'Erro';
      default:
        return 'Desconectado';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrações</h1>
          <p className="text-gray-600 mt-2">Conecte suas plataformas de venda e automações</p>
        </div>
        <button className="flex items-center space-x-2 bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-xl transition-colors">
          <Plus className="h-5 w-5" />
          <span>Nova Integração</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Conectadas</p>
              <p className="text-2xl font-bold text-gray-900">
                {integrations.filter(i => i.status === 'connected').length}
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
                {integrations.filter(i => i.status === 'error').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Disponíveis</p>
              <p className="text-2xl font-bold text-gray-900">
                {integrations.filter(i => i.status === 'disconnected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{integration.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                    <p className="text-sm text-gray-600">{integration.description}</p>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                  <Settings className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Status</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(integration.status)}
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                      {getStatusText(integration.status)}
                    </span>
                  </div>
                </div>

                {integration.lastSync && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Última Sync</span>
                    <span className="text-sm text-gray-600">
                      {new Date(integration.lastSync).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}

                {integration.config.apiKey && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">API Key</span>
                    <span className="text-sm text-gray-600 font-mono">
                      {integration.config.apiKey}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    integration.status === 'connected'
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-lime-500 text-white hover:bg-lime-600'
                  }`}
                >
                  {integration.status === 'connected' ? 'Desconectar' : 'Conectar'}
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Webhook Configuration */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuração de Webhooks</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Webhook
            </label>
            <div className="flex space-x-3">
              <input
                type="url"
                value="https://api.seuapp.com/webhook"
                readOnly
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-600"
              />
              <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                Copiar
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Use esta URL nas configurações de webhook das suas plataformas de venda
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}