import React from 'react';
import { Play, FileText, Type, Clock } from 'lucide-react';
import { Content } from '../../types/student';

interface ContentItemProps {
  content: Content;
  onClick: () => void;
}

export default function ContentItem({ content, onClick }: ContentItemProps) {
  const getIcon = () => {
    switch (content.tipo) {
      case 'video':
        return <Play className="h-5 w-5 text-red-500" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'texto':
        return <Type className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (content.tipo) {
      case 'video':
        return 'Vídeo';
      case 'pdf':
        return 'PDF';
      case 'texto':
        return 'Texto';
      default:
        return 'Conteúdo';
    }
  };

  const getTypeBadgeColor = () => {
    switch (content.tipo) {
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'pdf':
        return 'bg-blue-100 text-blue-800';
      case 'texto':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-center space-x-4">
        {/* Thumbnail or Icon */}
        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
          {content.metadata?.thumbnail ? (
            <img
              src={content.metadata.thumbnail}
              alt={content.titulo}
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            getIcon()
          )}
        </div>

        {/* Content Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor()}`}>
              {getIcon()}
              <span className="ml-1">{getTypeLabel()}</span>
            </span>
            {content.metadata?.duracao && (
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3 w-3 mr-1" />
                <span>{content.metadata.duracao}</span>
              </div>
            )}
          </div>
          
          <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">
            {content.titulo}
          </h3>
          
          {content.metadata?.descricao && (
            <p className="text-xs text-gray-600 line-clamp-2">
              {content.metadata.descricao}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}