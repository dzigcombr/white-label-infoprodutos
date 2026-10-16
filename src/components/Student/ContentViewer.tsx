import React from 'react';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Content } from '../../types/student';

interface ContentViewerProps {
  content: Content;
  onBack: () => void;
}

export default function ContentViewer({ content, onBack }: ContentViewerProps) {
  const renderContent = () => {
    switch (content.tipo) {
      case 'video':
        return (
          <div className="aspect-video bg-black rounded-xl overflow-hidden">
            <iframe
              src={content.url}
              title={content.titulo}
              className="w-full h-full"
              allowFullScreen
              frameBorder="0"
            />
          </div>
        );
      
      case 'pdf':
        return (
          <div className="bg-gray-100 rounded-xl p-6 text-center">
            <div className="mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Documento PDF
              </h3>
              <p className="text-gray-600 mb-6">
                Clique no botão abaixo para abrir o documento em uma nova aba
              </p>
            </div>
            <a
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition-colors"
            >
              <ExternalLink className="h-5 w-5" />
              <span>Abrir PDF</span>
            </a>
          </div>
        );
      
      case 'texto':
        return (
          <div className="bg-white rounded-xl p-6">
            <div 
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: content.url }}
            />
          </div>
        );
      
      default:
        return (
          <div className="bg-gray-100 rounded-xl p-6 text-center">
            <p className="text-gray-600">Tipo de conteúdo não suportado</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {content.titulo}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {renderContent()}
        
        {/* Content Description */}
        {content.metadata?.descricao && (
          <div className="mt-6 bg-white rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Sobre este conteúdo
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {content.metadata.descricao}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}