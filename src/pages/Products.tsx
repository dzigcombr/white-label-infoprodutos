// pages/Products.tsx - VERSÃO FINAL CORRIGIDA
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Play, FileText, X, Upload, Crop, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: string;
  nome: string;
  tipo_liberacao: string;
  tipo_oferta: string;
  produto_id_externo: string;
  criador_id: string;
  capa_url?: string;
  url_pg_vendas?: string;
  criado_em: string;
}

interface AppInfo {
  id: string;
  nome: string;
  dominio_personalizado: string;
}

export default function Products() {
  const { appId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [uploadingCapa, setUploadingCapa] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [productForm, setProductForm] = useState({
    nome: '',
    tipo_liberacao: 'imediata',
    tipo_oferta: 'principal',
    produto_id_externo: '',
    capa_url: '',
    url_pg_vendas: ''
  });

  useEffect(() => {
    if (appId && user) {
      loadAppInfo();
      loadProducts();
    }
  }, [appId, user]);

  const loadAppInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('info_apps_personalizados')
        .select('id, nome, dominio_personalizado')
        .eq('id', appId)
        .single();

      if (error) throw error;
      setAppInfo(data);
    } catch (error) {
      console.error('Erro ao carregar informações do app:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('info_produtos')
        .select('*')
        .eq('criador_id', appId)
        .order('criado_em', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCapaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !appId) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    setUploadingCapa(true);

    try {
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
    if (!user || !appId) return;

    try {
      const fileExt = 'jpg';
      const fileName = `capa-produto-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${appId}/produtos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('infoproduto')
        .upload(filePath, croppedImageBlob, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('infoproduto')
        .getPublicUrl(filePath);

      setProductForm(prev => ({ ...prev, capa_url: publicUrl }));
      setShowCropModal(false);
      setSelectedImage(null);
    } catch (error) {
      console.error('Erro ao fazer upload da capa:', error);
      alert('Erro ao fazer upload da capa.');
    } finally {
      setUploadingCapa(false);
    }
  };

  const handleProductSubmit = async () => {
    if (!user || !appId || !productForm.nome.trim() || !productForm.produto_id_externo.trim()) {
      alert('Nome do produto e ID externo são obrigatórios');
      return;
    }

    if (productForm.tipo_oferta === 'upsell_downsell' && !productForm.url_pg_vendas.trim()) {
      alert('URL da página de vendas é obrigatória para Upsell/Downsell');
      return;
    }

    setSaving(true);
    try {
      const productData = {
        nome: productForm.nome.trim(),
        tipo_liberacao: productForm.tipo_liberacao,
        tipo_oferta: productForm.tipo_oferta,
        produto_id_externo: productForm.produto_id_externo.trim(),
        capa_url: productForm.capa_url.trim() || null,
        url_pg_vendas: productForm.url_pg_vendas.trim() || null,
        criador_id: appId
      };

      const { error } = await supabase
        .from('info_produtos')
        .insert([productData]);

      if (error) throw error;

      setShowProductModal(false);
      setProductForm({
        nome: '',
        tipo_liberacao: 'imediata',
        tipo_oferta: 'principal',
        produto_id_externo: '',
        capa_url: '',
        url_pg_vendas: ''
      });
      await loadProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  };

  const handleGerenciarConteudos = (productId: string) => {
    navigate(`/products/${appId}/gerenciar/${productId}`);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${product.nome}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('info_produtos')
        .delete()
        .eq('id', product.id);

      if (error) throw error;
      await loadProducts();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      alert('Erro ao excluir produto');
    }
  };

  const getOfferTypeLabel = (type: string) => {
    switch (type) {
      case 'principal': return 'Produto Principal';
      case 'bonus': return 'Bônus';
      case 'order_bump': return 'Order Bump';
      case 'upsell_downsell': return 'Upsell/Downsell';
      default: return type;
    }
  };

  const getReleaseTypeLabel = (type: string) => {
    switch (type) {
      case 'imediata': return 'Liberação Imediata';
      case 'dias_apos': return 'Dias após a compra';
      case 'data_exata': return 'Data Exata';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
       {/* Header com botão de voltar */}
<div className="mb-6">
  <button
    onClick={() => navigate('/dashboard')} // ✅ CORREÇÃO: voltar para dashboard
    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
  >
    <ArrowLeft className="h-4 w-4" />
    <span>Voltar para Dashboard</span> {/* ✅ CORREÇÃO: texto atualizado */}
  </button>
  
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Produtos do App
      </h1>
      <p className="text-gray-600 mt-2">
        {appInfo ? `Gerenciando produtos de: ${appInfo.nome}` : 'Carregando...'}
      </p>
      {appInfo && (
        <p className="text-sm text-gray-500 mt-1">
          Domínio: {appInfo.dominio_personalizado}
        </p>
      )}
    </div>
    <button 
      onClick={() => setShowProductModal(true)}
      className="flex items-center space-x-2 bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-xl transition-colors"
    >
      <Plus className="h-5 w-5" />
      <span>Novo Produto</span>
    </button>
  </div>
</div>
        {/* Lista de Produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-lime-100 to-lime-200 rounded-xl flex items-center justify-center overflow-hidden">
                  {product.capa_url ? (
                    <img 
                      src={product.capa_url} 
                      alt={product.nome}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="h-8 w-8 text-lime-600" />
                  )}
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleGerenciarConteudos(product.id)}
                    className="p-2 text-lime-600 hover:bg-lime-50 rounded-lg transition-colors"
                    title="Gerenciar conteúdos"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir produto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">{product.nome}</h3>
              
              <div className="space-y-2 mb-3">
                <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {getOfferTypeLabel(product.tipo_oferta)}
                </span>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                  {getReleaseTypeLabel(product.tipo_liberacao)}
                </span>
              </div>

              <div className="mb-3">
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  ID Externo: {product.produto_id_externo}
                </span>
              </div>

              {product.url_pg_vendas && (
                <div className="mb-3">
                  <a 
                    href={product.url_pg_vendas} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 truncate block"
                  >
                    Página de vendas →
                  </a>
                </div>
              )}

              <button
                onClick={() => handleGerenciarConteudos(product.id)}
                className="w-full mt-2 flex items-center justify-center space-x-2 bg-lime-50 hover:bg-lime-100 text-lime-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Play className="h-4 w-4" />
                <span className="text-sm font-medium">Gerenciar Conteúdos</span>
              </button>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto cadastrado</h3>
            <p className="text-gray-600">Comece criando seu primeiro produto para este app.</p>
          </div>
        )}

        {/* Modal de Novo Produto - CORRIGIDO */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Novo Produto</h2>
                <button
                  onClick={() => {
                    setShowProductModal(false);
                    setProductForm({
                      nome: '',
                      tipo_liberacao: 'imediata',
                      tipo_oferta: 'principal',
                      produto_id_externo: '',
                      capa_url: '',
                      url_pg_vendas: ''
                    });
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      value={productForm.nome}
                      onChange={(e) => setProductForm(prev => ({ ...prev, nome: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      placeholder="Ex: Curso JavaScript Avançado"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Externo do Produto *
                    </label>
                    <input
                      type="text"
                      value={productForm.produto_id_externo}
                      onChange={(e) => setProductForm(prev => ({ ...prev, produto_id_externo: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      placeholder="Ex: PROD123 (identificador na plataforma)"
                    />
                    <p className="text-xs text-gray-500 mt-1">Identificador único do produto na sua plataforma</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Liberação
                      </label>
                      <select
                        value={productForm.tipo_liberacao}
                        onChange={(e) => setProductForm(prev => ({ ...prev, tipo_liberacao: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      >
                        <option value="imediata">Liberação Imediata</option>
                        <option value="dias_apos">Dias após a compra</option>
                        <option value="data_exata">Data Exata</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Oferta
                      </label>
                      <select
                        value={productForm.tipo_oferta}
                        onChange={(e) => setProductForm(prev => ({ ...prev, tipo_oferta: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      >
                        <option value="principal">Produto Principal</option>
                        <option value="bonus">Bônus</option>
                        <option value="order_bump">Order Bump</option>
                        <option value="upsell_downsell">Upsell/Downsell</option>
                      </select>
                    </div>
                  </div>

                  {/* Upload da Capa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capa do Produto
                    </label>
                    <div className="space-y-3">
                      {productForm.capa_url && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Preview da Capa:</h4>
                          <div className="relative w-32 h-32 rounded-lg overflow-hidden border mx-auto">
                            <img
                              src={productForm.capa_url}
                              alt="Preview da capa"
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => setProductForm(prev => ({ ...prev, capa_url: '' }))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-lime-500 transition-colors">
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
                        Selecione uma imagem do seu computador para usar como capa do produto
                      </p>
                    </div>
                  </div>

                  {/* URL da Página de Vendas - Apenas para Upsell/Downsell */}
                  {productForm.tipo_oferta === 'upsell_downsell' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL da Página de Vendas *
                      </label>
                      <input
                        type="url"
                        value={productForm.url_pg_vendas}
                        onChange={(e) => setProductForm(prev => ({ ...prev, url_pg_vendas: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                        placeholder="https://exemplo.com/vendas"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        URL da página de vendas para Upsell/Downsell
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowProductModal(false);
                      setProductForm({
                        nome: '',
                        tipo_liberacao: 'imediata',
                        tipo_oferta: 'principal',
                        produto_id_externo: '',
                        capa_url: '',
                        url_pg_vendas: ''
                      });
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleProductSubmit}
                    disabled={
                      saving || 
                      !productForm.nome.trim() || 
                      !productForm.produto_id_externo.trim() ||
                      (productForm.tipo_oferta === 'upsell_downsell' && !productForm.url_pg_vendas.trim())
                    }
                    className="flex-1 px-4 py-3 bg-lime-500 hover:bg-lime-600 text-white rounded-xl transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Salvando...' : 'Criar Produto'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Corte de Imagem */}
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

// Componente para corte de imagem
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">Editar Imagem</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-6">
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
                className="flex-1 px-4 py-3 bg-lime-500 hover:bg-lime-600 text-white rounded-xl disabled:opacity-50 flex items-center justify-center"
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