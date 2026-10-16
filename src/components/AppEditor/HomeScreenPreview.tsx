import React from 'react';
import { Home, User, Bell, BookOpen } from 'lucide-react';

interface Banner {
  image: string | null;
  url: string;
}

interface HomeScreenPreviewProps {
  appName: string;
  showProductNames: boolean;
  banners: Banner[];
  primaryColor: string;
}

export default function HomeScreenPreview({ appName, showProductNames, banners, primaryColor }: HomeScreenPreviewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-full">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tela de Home</h3>
        
        {/* Phone Frame */}
        <div className="mx-auto w-64 h-96 bg-gray-900 rounded-3xl p-2">
          <div className="w-full h-full bg-slate-50 rounded-2xl flex flex-col">
            
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-lg font-bold text-gray-900 text-center">
                {appName || 'Meu App'}
              </h1>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              
              {/* Banners */}
              {banners.some(banner => banner.image || banner.url) && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700">Destaques</h3>
                  <div className="space-y-2">
                    {banners.map((banner, index) => (
                      (banner.image || banner.url) && (
                        <div key={index} className="bg-gray-200 rounded-lg h-16 flex items-center justify-center overflow-hidden">
                          {banner.image ? (
                            <img
                              src={banner.image}
                              alt={`Banner ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-gray-500">Banner {index + 1}</span>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Products Section */}
              {showProductNames && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-700">Meus Cursos</h3>
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-lime-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-lime-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-900">Curso JavaScript</p>
                          <p className="text-xs text-gray-500">12 aulas</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-900">React Avançado</p>
                          <p className="text-xs text-gray-500">8 aulas</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="border-t border-gray-200 p-2">
              <div className="flex justify-around">
                <div className="flex flex-col items-center p-2">
                  <Home className="h-4 w-4 text-lime-500" />
                  <span className="text-xs text-lime-500 mt-1">Home</span>
                </div>
                <div className="flex flex-col items-center p-2">
                  <BookOpen className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">Cursos</span>
                </div>
                <div className="flex flex-col items-center p-2">
                  <Bell className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">Avisos</span>
                </div>
                <div className="flex flex-col items-center p-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">Perfil</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}