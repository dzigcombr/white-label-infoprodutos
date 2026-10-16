import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentCommunity() {
  const { dominio } = useParams<{ dominio: string }>();
  const navigate = useNavigate();
  const { cachedData } = useAuth();
  
  const creator = cachedData.creator;

  const handleBack = () => {
    navigate(`/${dominio}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-40"
        style={creator?.branding?.cor_primaria ? {
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
              style={{ color: creator?.branding?.cor_primaria || '#1f2937' }}
            >
              Comunidade
            </h1>
            <p className="text-sm text-gray-500">
              Conecte-se com outros alunos
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Comunidade em Desenvolvimento
          </h3>
          <p className="text-gray-600">
            Em breve você poderá interagir com outros alunos da comunidade!
          </p>
        </div>
      </div>
    </div>
  );
}