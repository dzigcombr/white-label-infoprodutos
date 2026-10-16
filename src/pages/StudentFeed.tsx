import React, { useState } from 'react';
import { Play, FileText, MessageSquare, Bell } from 'lucide-react';
import { mockContents, mockPosts } from '../data/mockData';

export default function StudentFeed() {
  const [feedItems] = useState([
    ...mockContents.map(content => ({ ...content, type: 'content' as const })),
    ...mockPosts.map(post => ({ ...post, type: 'post' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));

  const renderContentItem = (item: any) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-lime-500 to-lime-600 px-6 py-3">
        <div className="flex items-center space-x-2 text-white">
          <Bell className="h-4 w-4" />
          <span className="text-sm font-medium">Novo conteúdo disponível</span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start space-x-4">
          {item.thumbnail && (
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-20 h-20 object-cover rounded-xl"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {item.type === 'video' ? (
                <Play className="h-4 w-4 text-red-500" />
              ) : (
                <FileText className="h-4 w-4 text-blue-500" />
              )}
              <span className={`text-xs px-2 py-1 rounded-full ${
                item.type === 'video' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {item.type?.toUpperCase()}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600">
              Adicionado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <button className="bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-xl transition-colors">
            Assistir
          </button>
        </div>
      </div>
    </div>
  );

  const renderPostItem = (item: any) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <img
            className="h-12 w-12 rounded-full object-cover"
            src={item.author.avatar}
            alt={item.author.name}
          />
          <div>
            <h3 className="font-semibold text-gray-900">{item.author.name}</h3>
            <p className="text-sm text-gray-500">
              {new Date(item.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        
        <p className="text-gray-900 leading-relaxed mb-4">{item.content}</p>
        
        <div className="flex items-center space-x-4 pt-4 border-t border-gray-100">
          <button className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition-colors">
            <span>❤️</span>
            <span className="text-sm">{item.likes}</span>
          </button>
          <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">{item.comments?.length || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Meu Feed</h1>
        <p className="text-gray-600 mt-2">Acompanhe novos conteúdos e atividades da comunidade</p>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {feedItems.map((item, index) => (
          <div key={`${item.type}-${item.id || index}`}>
            {'title' in item ? renderContentItem(item) : renderPostItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}