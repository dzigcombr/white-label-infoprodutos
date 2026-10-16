import React from 'react';
import { BookOpen, Mail, Lock } from 'lucide-react';

interface LoginScreenPreviewProps {
  appName: string;
  appLogo: string | null;
  appType: string;
  primaryColor: string;
}

export default function LoginScreenPreview({ appName, appLogo, appType, primaryColor }: LoginScreenPreviewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 h-full">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tela de Login</h3>
        
        {/* Phone Frame */}
        <div className="mx-auto w-64 h-96 bg-gray-900 rounded-3xl p-2">
          <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 flex flex-col">
            
            {/* Logo and App Name */}
            <div className="text-center mb-8 mt-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-lime-400 to-lime-600 rounded-xl mb-4">
                {appLogo ? (
                  <img
                    src={appLogo}
                    alt={appName || 'Logo'}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <BookOpen className="h-8 w-8 text-white" />
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                {appName || 'Meu App'}
              </h1>
              <p className="text-gray-600 text-sm mt-1">Acesse sua conta</p>
            </div>

            {/* Login Form */}
            <div className="space-y-4 flex-1">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <div className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg bg-white text-sm text-gray-500">
                    seu@email.com
                  </div>
                </div>
              </div>

              {appType === 'email-password' && (
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <div className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg bg-white text-sm text-gray-500">
                      ••••••••
                    </div>
                  </div>
                </div>
              )}

              <button 
                className="w-full text-white py-4 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-md"
                style={{ backgroundColor: primaryColor }}
              >
                {appType === 'email-password' ? 'Entrar' : 'Enviar link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}