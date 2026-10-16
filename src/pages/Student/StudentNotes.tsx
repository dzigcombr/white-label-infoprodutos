import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Trash2, 
  Calendar,
  Tag,
  Loader2, 
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StudentApiService } from '../../services/studentApi';
import { Creator, Note, Product } from '../../types/student';

export default function StudentNotes() {
  const { dominio } = useParams<{ dominio: string }>();
  const navigate = useNavigate();
  const { user, cachedData } = useAuth();
  
  const [creator, setCreator] = useState<Creator | null>(cachedData.creator);
  const [notes, setNotes] = useState<Note[]>([]);
  const [products, setProducts] = useState<Product[]>(cachedData.products);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState({
    titulo: '',
    texto: '',
    produto_id: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (dominio && user) {
      loadData();
    }
  }, [dominio, user]);

  const loadData = async () => {
    if (!dominio || !user) return;

    try {
      setLoading(true);
      setError(null);

      let creatorData = creator;
      let productsData = products;

      // Use cached data if available and matches domain
      if (!creatorData || creatorData.dominio_personalizado !== dominio) {
        creatorData = await StudentApiService.getCreatorByDomain(dominio);
        if (!creatorData) {
          setError('Comunidade não encontrada');
          setLoading(false);
          return;
        }
        setCreator(creatorData);
      }

      // Get products if not cached
      if (productsData.length === 0) {
        productsData = await StudentApiService.getProductsByCreator(creatorData.id);
        setProducts(productsData);
      }

      // Always fetch fresh notes (they change frequently)
      const notesData = await StudentApiService.getStudentNotes(user.id, creatorData.id);
      setNotes(notesData);

    } catch (err) {
      console.error('Error loading notes data:', err);
      setError('Erro ao carregar anotações');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`/${dominio}`);
  };

  const handleAddNote = async () => {
    if (!newNote.titulo.trim() || !newNote.texto.trim() || !newNote.produto_id) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    if (!user) {
      alert('Usuário não autenticado');
      return;
    }

    setSaving(true);
    try {
      const success = await StudentApiService.addNote(
        user.id,
        newNote.produto_id,
        newNote.titulo.trim(),
        newNote.texto.trim()
      );

      if (success) {
        setShowAddModal(false);
        setNewNote({ titulo: '', texto: '', produto_id: '' });
        await loadData(); // Reload notes
      } else {
        alert('Erro ao salvar anotação');
      }
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Erro ao salvar anotação');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta anotação?')) {
      return;
    }

    if (!user) {
      alert('Usuário não autenticado');
      return;
    }

    try {
      const success = await StudentApiService.deleteNote(noteId, user.id);
      if (success) {
        await loadData(); // Reload notes
      } else {
        alert('Erro ao excluir anotação');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Erro ao excluir anotação');
    }
  };

  // Filter products that the user has access to
  const accessibleProducts = products.filter(product => 
    cachedData.purchases.some(purchase => 
      purchase.produto_id === product.id && 
      (purchase.status === 'ativa' || purchase.status === 'aprovado')
    )
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-lime-500" />
          <span className="text-gray-600">Carregando anotações...</span>
        </div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Erro ao carregar'}
          </h2>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-lime-500 hover:bg-lime-600 text-white rounded-xl transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div 
        className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-40"
        style={creator.branding?.cor_primaria ? {
          backgroundColor: creator.branding.cor_primaria + '15'
        } : {}}
      >
        <div className="flex items-center justify-between">
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
                style={{ color: creator.branding?.cor_primaria || '#1f2937' }}
              >
                Minhas Anotações
              </h1>
              <p className="text-sm text-gray-500">
                {notes.length} anotação{notes.length !== 1 ? 'ões' : ''}
              </p>
            </div>
          </div>
          
          {accessibleProducts.length > 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="p-3 rounded-xl transition-colors hover:scale-105"
              style={{ 
                backgroundColor: creator.branding?.cor_primaria || '#10b981',
                color: 'white'
              }}
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-20">
        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                      {note.titulo}
                    </h3>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                      {note.produto?.nome && (
                        <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                          <Tag className="h-3 w-3" />
                          <span>{note.produto.nome}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(note.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors ml-2"
                    title="Excluir anotação"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {note.texto}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: creator.branding?.cor_primaria ? creator.branding.cor_primaria + '20' : '#f0fdf4' }}
            >
              <FileText 
                className="h-8 w-8" 
                style={{ color: creator.branding?.cor_primaria || '#10b981' }}
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {accessibleProducts.length > 0 ? 'Nenhuma anotação ainda' : 'Nenhum produto disponível'}
            </h3>
            <p className="text-gray-600 mb-6">
              {accessibleProducts.length > 0 
                ? 'Comece criando sua primeira anotação sobre os conteúdos.' 
                : 'Você precisa ter acesso a um produto para criar anotações.'}
            </p>
            {accessibleProducts.length > 0 ? (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 rounded-xl text-white font-medium transition-colors hover:scale-105"
                style={{ 
                  backgroundColor: creator.branding?.cor_primaria || '#10b981'
                }}
              >
                Criar Primeira Anotação
              </button>
            ) : (
              <button
                onClick={handleBack}
                className="px-6 py-3 rounded-xl text-white font-medium transition-colors"
                style={{ 
                  backgroundColor: creator.branding?.cor_primaria || '#10b981'
                }}
              >
                Voltar para Produtos
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Nova Anotação</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Produto *
                </label>
                <select
                  value={newNote.produto_id}
                  onChange={(e) => setNewNote(prev => ({ ...prev, produto_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                >
                  <option value="">Selecione um produto</option>
                  {accessibleProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={newNote.titulo}
                  onChange={(e) => setNewNote(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Título da anotação"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo *
                </label>
                <textarea
                  value={newNote.texto}
                  onChange={(e) => setNewNote(prev => ({ ...prev, texto: e.target.value }))}
                  placeholder="Escreva sua anotação aqui..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewNote({ titulo: '', texto: '', produto_id: '' });
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={saving || !newNote.titulo.trim() || !newNote.texto.trim() || !newNote.produto_id}
                  className="flex-1 px-4 py-3 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  style={{ 
                    backgroundColor: creator.branding?.cor_primaria || '#10b981'
                  }}
                >
                  {saving ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Salvando...
                    </div>
                  ) : (
                    'Salvar Anotação'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}