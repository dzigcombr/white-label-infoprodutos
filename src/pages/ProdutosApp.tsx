// pages/ProdutosApp.tsx - VERSÃO CORRIGIDA
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Play, FileText, ExternalLink, Edit2, Trash2, X, ArrowLeft, Upload, Crop } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Content {
  id: string;
  produto_id: string;
  tipo_conteudo: string;
  titulo: string;
  descricao?: string;
  capa_url?: string;
  codigo_embed?: string;
  url_externa?: string;
  criado_em: string;
}

interface Product {
  id: string;
  nome: string;
}

interface ContentFormData {
  tipo_conteudo: string;
  titulo: string;
  descricao: string;
  capa_url: string;
  codigo_embed: string;
  url_externa: string;
}

interface Anexo {
  id: string;
  nome: string;
  url: string;
  tipo: string;
}

export default function ProdutosApp() {
  const { user } = useAuth();
  const { appId, productId } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingCapa, setUploadingCapa] = useState(false);
  const [uploadingAnexos, setUploadingAnexos] = useState(false);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [contentForm, setContentForm] = useState<ContentFormData>({
    tipo_conteudo: 'youtube',
    titulo: '',
    descricao: '',
    capa_url: '',
    codigo_embed: '',
    url_externa: ''
  });

  useEffect(() => {
    if (productId) {
      loadProductData();
      loadContents();
    }
  }, [productId]);

  const loadProductData = async () => {
    try {
      const { data, error } = await supabase
        .from('info_produtos')
        .select('id, nome')
        .eq('id', productId)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
    }
  };

  const loadContents = async () => {
    try {
      const { data, error } = await supabase
        .from('info_conteudos')
        .select('*')
        .eq('produto_id', productId)
        .order('criado_em', { ascending: true });

      if (error) throw error;
      setContents(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading contents:', error);
      setLoading(false);
    }
  };

  const handleCapaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    setUploadingCapa(true);

    try {
      // Mostrar preview e abrir editor de corte
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      alert('Erro ao processar imagem.');
      setUploadingCapa(false);
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!user || !productId) return;

    try {
      const fileExt = 'jpg';
      const fileName = `capa-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${productId}/${fileName}`;

      // Upload para Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('infoproduto')
        .upload(filePath, croppedImageBlob, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('infoproduto')
        .getPublicUrl(filePath);

      // Atualizar formulário com a URL da capa
      setContentForm(prev => ({ ...prev, capa_url: publicUrl }));

      setShowCropModal(false);
      setSelectedImage(null);
    } catch (error) {
      console.error('Erro ao fazer upload da capa:', error);
      alert('Erro ao fazer upload da capa.');
    } finally {
      setUploadingCapa(false);
    }
  };

  const handleAnexosUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user || !productId) return;

    setUploadingAnexos(true);

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `anexo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${user.id}/${productId}/anexos/${fileName}`;

        // Upload para Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('infoproduto')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('infoproduto')
          .getPublicUrl(filePath);

        return {
          id: fileName,
          nome: file.name,
          url: publicUrl,
          tipo: file.type
        };
      });

      const novosAnexos = await Promise.all(uploadPromises);
      setAnexos(prev => [...prev, ...novosAnexos]);
      
      // Limpar input
      event.target.value = '';
    } catch (error) {
      console.error('Erro ao fazer upload dos anexos:', error);
      alert('Erro ao fazer upload dos anexos.');
    } finally {
      setUploadingAnexos(false);
    }
  };

  const removeAnexo = (index: number) => {
    setAnexos(prev => prev.filter((_, i) => i !== index));
  };

  const handleContentSubmit = async () => {
    // Validação básica
    if (!contentForm.titulo.trim()) {
      alert('Título é obrigatório');
      return;
    }

    // Validação específica por tipo de conteúdo
    if (contentForm.tipo_conteudo === 'youtube' || contentForm.tipo_conteudo === 'vimeo') {
      if (!contentForm.url_externa.trim()) {
        alert('URL externa é obrigatória para YouTube e Vimeo');
        return;
      }
    }

    if (contentForm.tipo_conteudo === 'vturb' || contentForm.tipo_conteudo === 'panda') {
      if (!contentForm.codigo_embed.trim()) {
        alert('Código embed é obrigatório para Vturb e Panda');
        return;
      }
    }

    if (contentForm.tipo_conteudo === 'pdf' || contentForm.tipo_conteudo === 'web' || contentForm.tipo_conteudo === 'link') {
      if (!contentForm.url_externa.trim()) {
        alert('URL externa é obrigatória para PDF, páginas web e links externos');
        return;
      }
    }

    setSaving(true);
    try {
      const contentData = {
        produto_id: productId,
        tipo_conteudo: contentForm.tipo_conteudo,
        titulo: contentForm.titulo.trim(),
        descricao: contentForm.descricao.trim() || null,
        capa_url: contentForm.capa_url.trim() || null, // Permite null para evitar erro de constraint
        codigo_embed: contentForm.codigo_embed.trim() || null,
        url_externa: contentForm.url_externa.trim() || null,
      };

      if (editingContent) {
        const { error } = await supabase
          .from('info_conteudos')
          .update(contentData)
          .eq('id', editingContent.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('info_conteudos')
          .insert([contentData]);
        if (error) throw error;
      }

      // Aqui você pode salvar os anexos em outra tabela se necessário
      console.log('Anexos para salvar:', anexos);

      setShowContentModal(false);
      setEditingContent(null);
      setContentForm({
        tipo_conteudo: 'youtube',
        titulo: '',
        descricao: '',
        capa_url: '',
        codigo_embed: '',
        url_externa: ''
      });
      setAnexos([]);
      await loadContents();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Erro ao salvar conteúdo');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContent = async (content: Content) => {
    if (!confirm(`Tem certeza que deseja excluir o conteúdo "${content.titulo}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('info_conteudos')
        .delete()
        .eq('id', content.id);

      if (error) throw error;
      await loadContents();
    } catch (error) {
      console.error('Error deleting content:', error);
      alert('Erro ao excluir conteúdo');
    }
  };

  const openEditContent = (content: Content) => {
    setEditingContent(content);
    setContentForm({
      tipo_conteudo: content.tipo_conteudo,
      titulo: content.titulo,
      descricao: content.descricao || '',
      capa_url: content.capa_url || '',
      codigo_embed: content.codigo_embed || '',
      url_externa: content.url_externa || ''
    });
    setAnexos([]); // Você pode carregar anexos existentes aqui se necessário
    setShowContentModal(true);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube':
      case 'vimeo':
      case 'vturb':
      case 'panda':
        return <Play className="h-4 w-4 text-red-500" />;
      case 'pdf':
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <ExternalLink className="h-4 w-4 text-gray-500" />;
    }
  };

  // Função para determinar quais campos mostrar baseado no tipo de conteúdo
  const shouldShowUrlExterna = () => {
    return ['youtube', 'vimeo', 'pdf', 'web', 'link'].includes(contentForm.tipo_conteudo);
  };

  const shouldShowCodigoEmbed = () => {
    return ['vturb', 'panda'].includes(contentForm.tipo_conteudo);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando conteúdos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/products/${appId}`)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para produtos</span>
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Conteúdos do Produto
              </h1>
              <p className="text-gray-600 mt-2">
                {product ? `Gerenciando conteúdos de: ${product.nome}` : 'Carregando...'}
              </p>
            </div>
            <button
              onClick={() => setShowContentModal(true)}
              className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Adicionar Conteúdo</span>
            </button>
          </div>
        </div>

        {/* Contents List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          {contents.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {contents.map((content) => (
                <div key={content.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                      {content.capa_url ? (
                        <img
                          src={content.capa_url}
                          alt={content.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getContentTypeIcon(content.tipo_conteudo)
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{content.titulo}</h3>
                      {content.descricao && (
                        <p className="text-gray-600 mb-3">{content.descricao}</p>
                      )}
                      <span className="inline-block px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                        {content.tipo_conteudo}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditContent(content)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContent(content)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum conteúdo cadastrado</h3>
              <p className="text-gray-600">Comece adicionando seu primeiro conteúdo.</p>
            </div>
          )}
        </div>

        {/* Content Modal */}
        {showContentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingContent ? 'Editar Conteúdo' : 'Novo Conteúdo'}
                </h2>
                <button
                  onClick={() => {
                    setShowContentModal(false);
                    setEditingContent(null);
                    setContentForm({
                      tipo_conteudo: 'youtube',
                      titulo: '',
                      descricao: '',
                      capa_url: '',
                      codigo_embed: '',
                      url_externa: ''
                    });
                    setAnexos([]);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Conteúdo
                  </label>
                  <select
                    value={contentForm.tipo_conteudo}
                    onChange={(e) => setContentForm(prev => ({ ...prev, tipo_conteudo: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="vturb">Vturb</option>
                    <option value="panda">Panda</option>
                    <option value="pdf">PDF Google Drive</option>
                    <option value="web">Página Web</option>
                    <option value="link">Link Externo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={contentForm.titulo}
                    onChange={(e) => setContentForm(prev => ({ ...prev, titulo: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Introdução ao JavaScript"
                  />
                </div>

                {/* Upload da Capa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capa do Conteúdo
                  </label>
                  <div className="space-y-3">
                    {contentForm.capa_url && (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
                        <img
                          src={contentForm.capa_url}
                          alt="Preview da capa"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setContentForm(prev => ({ ...prev, capa_url: '' }))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    
                    <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                      <Upload className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-600">
                        {uploadingCapa ? 'Fazendo upload...' : 'Selecionar capa do computador'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCapaUpload}
                        className="hidden"
                        disabled={uploadingCapa}
                      />
                    </label>
                    <p className="text-xs text-gray-500">
                      Selecione uma imagem do seu computador para usar como capa
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={contentForm.descricao}
                    onChange={(e) => setContentForm(prev => ({ ...prev, descricao: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descrição do conteúdo..."
                  />
                </div>

                {/* Campo URL Externa para YouTube, Vimeo, PDF, Web e Link */}
                {shouldShowUrlExterna() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {contentForm.tipo_conteudo === 'youtube' || contentForm.tipo_conteudo === 'vimeo' 
                        ? 'URL do Vídeo *' 
                        : 'URL Externa *'
                      }
                    </label>
                    <input
                      type="url"
                      value={contentForm.url_externa}
                      onChange={(e) => setContentForm(prev => ({ ...prev, url_externa: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={
                        contentForm.tipo_conteudo === 'youtube' 
                          ? "https://www.youtube.com/watch?v=..." 
                          : contentForm.tipo_conteudo === 'vimeo'
                          ? "https://vimeo.com/..."
                          : contentForm.tipo_conteudo === 'pdf' 
                          ? "https://drive.google.com/file/d/.../view"
                          : contentForm.tipo_conteudo === 'web'
                          ? "https://exemplo.com/pagina"
                          : "https://exemplo.com/link"
                      }
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {contentForm.tipo_conteudo === 'youtube' && "Cole a URL do vídeo do YouTube"}
                      {contentForm.tipo_conteudo === 'vimeo' && "Cole a URL do vídeo do Vimeo"}
                      {contentForm.tipo_conteudo === 'pdf' && "Link direto do Google Drive ou outro serviço"}
                      {contentForm.tipo_conteudo === 'web' && "URL da página web a ser exibida"}
                      {contentForm.tipo_conteudo === 'link' && "Link externo que será aberto em nova aba"}
                    </p>
                  </div>
                )}

                {/* Campo Código Embed para Vturb e Panda */}
                {shouldShowCodigoEmbed() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Embed *
                    </label>
                    <textarea
                      value={contentForm.codigo_embed}
                      onChange={(e) => setContentForm(prev => ({ ...prev, codigo_embed: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="<iframe src='https://player.vturb.com/...' ...></iframe>"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Cole o código iframe completo do {contentForm.tipo_conteudo === 'vturb' ? 'Vturb' : 'Panda'}
                    </p>
                  </div>
                )}

                {/* Upload de Anexos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anexos
                  </label>
                  <div className="space-y-3">
                    {anexos.length > 0 && (
                      <div className="space-y-2">
                        {anexos.map((anexo, index) => (
                          <div key={anexo.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-700">{anexo.nome}</span>
                            </div>
                            <button
                              onClick={() => removeAnexo(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                      <Upload className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-600">
                        {uploadingAnexos ? 'Fazendo upload...' : 'Adicionar anexos do computador'}
                      </span>
                      <input
                        type="file"
                        multiple
                        onChange={handleAnexosUpload}
                        className="hidden"
                        disabled={uploadingAnexos}
                      />
                    </label>
                    <p className="text-xs text-gray-500">
                      Adicione arquivos complementares (múltiplos arquivos permitidos)
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowContentModal(false);
                      setEditingContent(null);
                      setContentForm({
                        tipo_conteudo: 'youtube',
                        titulo: '',
                        descricao: '',
                        capa_url: '',
                        codigo_embed: '',
                        url_externa: ''
                      });
                      setAnexos([]);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleContentSubmit}
                    disabled={
                      saving || 
                      !contentForm.titulo.trim() ||
                      (shouldShowUrlExterna() && !contentForm.url_externa.trim()) ||
                      (shouldShowCodigoEmbed() && !contentForm.codigo_embed.trim())
                    }
                    className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Salvando...' : (editingContent ? 'Atualizar' : 'Criar Conteúdo')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


    {/* Modal de Corte de Imagem - COM z-index MUITO MAIOR */}
{showCropModal && selectedImage && (
  <ImageCropModal
    image={selectedImage}
    onCropComplete={handleCropComplete}
    onClose={() => {
      setShowCropModal(false);
      setSelectedImage(null);
      setUploadingCapa(false);
    }}
  />
)}
      </div>
    </div>
  );
}

// Componente para corte de imagem (básico) - CORRIGIDO COM z-index MAIOR
// Componente para corte de imagem (básico) - CORRIGIDO COM z-index MAIOR
interface ImageCropModalProps {
  image: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onClose: () => void;
}

function ImageCropModal({ image, onCropComplete, onClose }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropping, setCropping] = useState(false);

  const handleCrop = async () => {
    setCropping(true);
    try {
      // Implementação básica - converte a imagem para blob
      // Em uma implementação real, você usaria uma biblioteca de corte
      const response = await fetch(image);
      const blob = await response.blob();
      
      onCropComplete(blob);
    } catch (error) {
      console.error('Erro ao cortar imagem:', error);
      alert('Erro ao processar imagem.');
    } finally {
      setCropping(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]"> {/* z-index muito maior */}
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Editar Imagem</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Preview da imagem selecionada */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview da Imagem:</h4>
            <div className="relative w-full h-64 bg-white rounded-lg overflow-hidden border">
              <img
                src={image}
                alt="Imagem para cortar"
                className="w-full h-full object-contain"
                style={{
                  transform: `translate(${crop.x}px, ${crop.y}px) scale(${zoom})`,
                  transition: 'transform 0.2s'
                }}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom: {Math.round(zoom * 100)}%
              </label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posição X
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={crop.x}
                  onChange={(e) => setCrop(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posição Y
                </label>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={crop.y}
                  onChange={(e) => setCrop(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrop}
                disabled={cropping}
                className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl disabled:opacity-50 flex items-center justify-center"
              >
                <Crop className="h-4 w-4 mr-2" />
                {cropping ? 'Processando...' : 'Aplicar Corte'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}