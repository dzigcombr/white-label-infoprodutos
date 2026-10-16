import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  ArrowLeft,
  Upload,
  X,
  Crop,
  User,
  Image as ImageIcon,
  Loader2,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Post {
  id: string;
  titulo: string;
  descricao: string;
  foto_url?: string;
  created_at: string;
  usuario_id: string;
  produto_id?: string;
  author: {
    id: string;
    nome: string;
    avatar?: string;
  };
  likes_count: number;
  user_liked: boolean;
  comments: Comment[];
  produto?: {
    nome: string;
  };
}

interface Comment {
  id: string;
  comentario: string;
  created_at: string;
  usuario_id: string;
  author: {
    id: string;
    nome: string;
    avatar?: string;
  };
}

interface Product {
  id: string;
  nome: string;
}

interface PostFormData {
  titulo: string;
  descricao: string;
  foto_url: string;
  produto_id: string;
}

export default function Community() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPostImage, setUploadingPostImage] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{[key: string]: string}>({});
  const [addingComment, setAddingComment] = useState<{[key: string]: boolean}>({});

  const [postForm, setPostForm] = useState<PostFormData>({
    titulo: '',
    descricao: '',
    foto_url: '',
    produto_id: ''
  });

  useEffect(() => {
    if (appId && user) {
      fetchPosts();
      fetchProducts();
    }
  }, [appId, user]);

  const fetchPosts = async () => {
    if (!appId) return;

    try {
      setLoading(true);
      
      // Fetch posts with author info and product info
      const { data: postsData, error: postsError } = await supabase
        .from('info_comunidade_posts')
        .select(`
          *,
          author:usuario_id (
            id,
            nome,
            avatar
          ),
          produto:produto_id (
            nome
          )
        `)
        .eq('criador_id', appId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // For each post, fetch likes count, user liked status, and comments
      const postsWithInteractions = await Promise.all(
        (postsData || []).map(async (post) => {
          // Get likes count
          const { count: likesCount } = await supabase
            .from('info_comunidade_curtidas')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          // Check if current user liked this post
          const { data: userLike } = await supabase
            .from('info_comunidade_curtidas')
            .select('id')
            .eq('post_id', post.id)
            .eq('usuario_id', user?.id)
            .single();

          // Get comments with author info
          const { data: commentsData } = await supabase
            .from('info_comunidade_comentarios')
            .select(`
              *,
              author:usuario_id (
                id,
                nome,
                avatar
              )
            `)
            .eq('post_id', post.id)
            .order('created_at', { ascending: true });

          return {
            ...post,
            likes_count: likesCount || 0,
            user_liked: !!userLike,
            comments: commentsData || []
          };
        })
      );

      setPosts(postsWithInteractions);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!appId) return;

    try {
      const { data, error } = await supabase
        .from('info_produtos')
        .select('id, nome')
        .eq('criador_id', appId)
        .order('nome', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handlePostImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !appId) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    setUploadingPostImage(true);

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
      setUploadingPostImage(false);
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!user || !appId) return;

    try {
      const fileExt = 'jpg';
      const fileName = `post-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${appId}/community-posts/${fileName}`;

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

      setPostForm(prev => ({ ...prev, foto_url: publicUrl }));
      setShowCropModal(false);
      setSelectedImage(null);
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      alert('Erro ao fazer upload da imagem.');
    } finally {
      setUploadingPostImage(false);
    }
  };

  const handleCreatePost = async () => {
    if (!postForm.titulo.trim() || !postForm.descricao.trim()) {
      alert('Título e descrição são obrigatórios');
      return;
    }

    if (!user || !appId) return;

    setSaving(true);
    try {
      const postData = {
        criador_id: appId,
        usuario_id: user.id,
        titulo: postForm.titulo.trim(),
        descricao: postForm.descricao.trim(),
        foto_url: postForm.foto_url.trim() || null,
        produto_id: postForm.produto_id || null
      };

      const { error } = await supabase
        .from('info_comunidade_posts')
        .insert([postData]);

      if (error) throw error;

      setShowCreatePostModal(false);
      setPostForm({
        titulo: '',
        descricao: '',
        foto_url: '',
        produto_id: ''
      });
      await fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Erro ao criar post');
    } finally {
      setSaving(false);
    }
  };

  const handleLikeToggle = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_liked) {
        // Remove like
        await supabase
          .from('info_comunidade_curtidas')
          .delete()
          .eq('post_id', postId)
          .eq('usuario_id', user.id);
      } else {
        // Add like
        await supabase
          .from('info_comunidade_curtidas')
          .insert([{
            post_id: postId,
            usuario_id: user.id
          }]);
      }

      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? {
                ...p,
                user_liked: !p.user_liked,
                likes_count: p.user_liked ? p.likes_count - 1 : p.likes_count + 1
              }
            : p
        )
      );
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async (postId: string) => {
    const commentText = commentInputs[postId]?.trim();
    if (!commentText || !user) return;

    setAddingComment(prev => ({ ...prev, [postId]: true }));

    try {
      const { data, error } = await supabase
        .from('info_comunidade_comentarios')
        .insert([{
          post_id: postId,
          usuario_id: user.id,
          comentario: commentText
        }])
        .select(`
          *,
          author:usuario_id (
            id,
            nome,
            avatar
          )
        `)
        .single();

      if (error) throw error;

      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { ...p, comments: [...p.comments, data] }
            : p
        )
      );

      // Clear comment input
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Erro ao adicionar comentário');
    } finally {
      setAddingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-lime-500" />
          <span className="text-gray-600">Carregando comunidade...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciador de Comunidade</h1>
            <p className="text-gray-600 mt-2">Gerencie posts e interações da comunidade</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreatePostModal(true)}
          className="flex items-center space-x-2 bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-xl transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Criar Post</span>
        </button>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-200">
              {/* Post Header */}
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-lime-400 to-lime-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {post.author?.avatar ? (
                        <img
                          src={post.author.avatar}
                          alt={post.author.nome}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.author?.nome || 'Usuário'}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{new Date(post.created_at).toLocaleDateString('pt-BR', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                        {post.produto && (
                          <>
                            <span>•</span>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {post.produto.nome}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-6 pb-4">
                <h4 className="font-semibold text-gray-900 mb-2">{post.titulo}</h4>
                <p className="text-gray-900 leading-relaxed mb-4">{post.descricao}</p>
                
                {/* Post Image */}
                {post.foto_url && (
                  <div className="mb-4">
                    <img
                      src={post.foto_url}
                      alt="Post image"
                      className="w-full max-h-96 object-cover rounded-xl"
                    />
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div className="px-6 py-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-6">
                    <button 
                      onClick={() => handleLikeToggle(post.id)}
                      className={`flex items-center space-x-2 transition-colors ${
                        post.user_liked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${post.user_liked ? 'fill-current' : ''}`} />
                      <span className="text-sm">{post.likes_count}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors">
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm">{post.comments.length}</span>
                    </button>
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors">
                      <Share2 className="h-5 w-5" />
                      <span className="text-sm">Compartilhar</span>
                    </button>
                  </div>
                </div>

                {/* Comments */}
                {post.comments.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {comment.author?.avatar ? (
                            <img
                              src={comment.author.avatar}
                              alt={comment.author.nome}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <p className="font-medium text-gray-900 text-sm">{comment.author?.nome || 'Usuário'}</p>
                            <p className="text-gray-700 text-sm mt-1">{comment.comentario}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 ml-3">
                            {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-lime-400 to-lime-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                      placeholder="Escreva um comentário..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(post.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      disabled={!commentInputs[post.id]?.trim() || addingComment[post.id]}
                      className="px-4 py-2 bg-lime-500 hover:bg-lime-600 disabled:opacity-50 text-white rounded-xl transition-colors flex items-center"
                    >
                      {addingComment[post.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum post ainda</h3>
            <p className="text-gray-600 mb-6">Comece criando o primeiro post da comunidade.</p>
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="bg-lime-500 hover:bg-lime-600 text-white px-6 py-3 rounded-xl transition-colors"
            >
              Criar Primeiro Post
            </button>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Criar Novo Post</h2>
              <button
                onClick={() => {
                  setShowCreatePostModal(false);
                  setPostForm({
                    titulo: '',
                    descricao: '',
                    foto_url: '',
                    produto_id: ''
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Post *
                </label>
                <input
                  type="text"
                  value={postForm.titulo}
                  onChange={(e) => setPostForm(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                  placeholder="Ex: Nova aula disponível!"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo do Post *
                </label>
                <textarea
                  value={postForm.descricao}
                  onChange={(e) => setPostForm(prev => ({ ...prev, descricao: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                  placeholder="Escreva o conteúdo do post..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Produto Relacionado
                </label>
                <select
                  value={postForm.produto_id}
                  onChange={(e) => setPostForm(prev => ({ ...prev, produto_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                >
                  <option value="">Selecione um produto (opcional)</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.nome}
                    </option>
                  ))}
                </select>
              </div>

              {/* Upload da Imagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Post
                </label>
                <div className="space-y-3">
                  {postForm.foto_url && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img
                        src={postForm.foto_url}
                        alt="Preview da imagem"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setPostForm(prev => ({ ...prev, foto_url: '' }))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  
                  <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-lime-500 transition-colors">
                    <ImageIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-600">
                      {uploadingPostImage ? 'Fazendo upload...' : 'Selecionar imagem do computador'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePostImageUpload}
                      className="hidden"
                      disabled={uploadingPostImage}
                    />
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreatePostModal(false);
                    setPostForm({
                      titulo: '',
                      descricao: '',
                      foto_url: '',
                      produto_id: ''
                    });
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={saving || !postForm.titulo.trim() || !postForm.descricao.trim()}
                  className="flex-1 px-4 py-3 bg-lime-500 hover:bg-lime-600 text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  {saving ? 'Criando...' : 'Criar Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Crop Modal */}
      {showCropModal && selectedImage && (
        <ImageCropModal
          image={selectedImage}
          onCropComplete={handleCropComplete}
          onClose={() => {
            setShowCropModal(false);
            setSelectedImage(null);
            setUploadingPostImage(false);
          }}
        />
      )}
    </div>
  );
}

// Image Crop Modal Component
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