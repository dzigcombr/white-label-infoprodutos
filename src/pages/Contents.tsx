import React, { useState } from 'react';
import { Plus, Search, Play, FileText, Edit2, Trash2 } from 'lucide-react';
import { mockContents } from '../data/mockData';

export default function Contents() {
  const [contents] = useState(mockContents);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'video' | 'pdf' | 'text'>('all');

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || content.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Play;
      case 'pdf':
        return FileText;
      default:
        return FileText;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'pdf':
        return 'bg-blue-100 text-blue-800';
      case 'text':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Conteúdos</h1>
          <p className="text-gray-600 mt-2">Gerencie aulas, PDFs e materiais de apoio</p>
        </div>
        <button className="flex items-center space-x-2 bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-xl transition-colors">
          <Plus className="h-5 w-5" />
          <span>Novo Conteúdo</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conteúdos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex space-x-2">
          {['all', 'video', 'pdf', 'text'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filterType === type
                  ? 'bg-lime-500 text-white'
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {type === 'all' ? 'Todos' : type.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Contents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredContents.map((content) => {
          const TypeIcon = getTypeIcon(content.type);
          
          return (
            <div key={content.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              {/* Thumbnail */}
              {content.thumbnail && (
                <div className="aspect-video bg-gray-200 relative">
                  <img
                    src={content.thumbnail}
                    alt={content.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="bg-white bg-opacity-20 rounded-full p-3">
                      <TypeIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{content.title}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(content.type)}`}>
                      <TypeIcon className="h-3 w-3 mr-1" />
                      {content.type}
                    </span>
                  </div>
                  <div className="flex space-x-1 ml-4">
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  Criado em {new Date(content.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredContents.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum conteúdo encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou adicione um novo conteúdo.</p>
        </div>
      )}
    </div>
  );
}