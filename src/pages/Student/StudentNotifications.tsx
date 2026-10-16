// src/pages/Student/StudentNotifications.tsx
import React from 'react';
import { Bell, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function StudentNotifications() {
  const navigate = useNavigate();
  const { dominio } = useParams();
  const { cachedData } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate(`/${dominio}`)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Bell className="w-6 h-6" style={{ color: cachedData.creator?.branding?.cor_primaria }} />
          <h1 className="text-xl font-bold">Notificações</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-gray-600 text-center">
            Nenhuma notificação no momento
          </p>
        </div>
      </div>
    </div>
  );
}