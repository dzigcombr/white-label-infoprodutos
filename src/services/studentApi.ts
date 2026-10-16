import { supabase } from '../lib/supabase';
import { Creator, Product, Content, Note, Purchase, StudentProfile } from '../types/student';

// Cache for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const CACHE_TTL = {
  CREATOR: 5 * 60 * 1000, // 5 minutes
  PRODUCTS: 10 * 60 * 1000, // 10 minutes
  CONTENT: 5 * 60 * 1000, // 5 minutes
};

function getCacheKey(type: string, ...params: string[]): string {
  return `${type}:${params.join(':')}`;
}

function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, { data, timestamp: Date.now(), ttl });
}

// Função utilitária para verificar acesso do usuário
export async function checkUserAccess(usuarioId: string, dominioPersonalizado: string): Promise<boolean> {
  try {
    console.log('🔍 Verificando acesso do usuário:', usuarioId, 'para domínio:', dominioPersonalizado);
    
    // 1. Buscar criador pelo domínio
    const { data: creator, error: creatorError } = await supabase
      .from('info_apps_personalizados')
      .select('id')
      .eq('dominio_personalizado', dominioPersonalizado)
      .single();

    if (creatorError || !creator) {
      console.error('❌ Criador não encontrado:', creatorError);
      return false;
    }

    console.log('✅ Criador encontrado:', creator.id);

    // 2. Buscar produtos do criador
    const { data: produtos, error: produtosError } = await supabase
      .from('info_produtos')
      .select('id')
      .eq('criador_id', creator.id);

    if (produtosError || !produtos || produtos.length === 0) {
      console.error('❌ Nenhum produto encontrado para o criador:', produtosError);
      return false;
    }

    const produtoIds = produtos.map(p => p.id);
    console.log('📦 Produtos do criador:', produtoIds);

    // 3. Verificar compras aprovadas do usuário para qualquer produto do criador
    const { data: compras, error: comprasError } = await supabase
      .from('info_compras')
      .select('id, produto_id, status')
      .eq('usuario_id', usuarioId)
      .eq('status', 'ativa')
      .in('produto_id', produtoIds);

    if (comprasError) {
      console.error('❌ Erro ao verificar compras:', comprasError);
      return false;
    }

    const hasValidPurchase = compras && compras.length > 0;
    console.log('💳 Compras válidas encontradas:', hasValidPurchase, compras);

    return hasValidPurchase;
  } catch (error) {
    console.error('❌ Erro na verificação de acesso:', error);
    return false;
  }
}

export class StudentApiService {
  // Get creator data by custom domain
  static async getCreatorByDomain(dominio: string): Promise<Creator | null> {
    const cacheKey = getCacheKey('creator', dominio);
    const cached = getFromCache<Creator>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from('info_apps_personalizados')
        .select('*')
        .eq('dominio_personalizado', dominio)
        .single();

      if (error) {
        console.error('Error fetching creator:', error);
        return null;
      }

      if (data) {
        setCache(cacheKey, data, CACHE_TTL.CREATOR);
      }
      return data;
    } catch (error) {
      console.error('Error in getCreatorByDomain:', error);
      return null;
    }
  }

  // Get products by creator ID
  static async getProductsByCreator(criadorId: string): Promise<Product[]> {
    const cacheKey = getCacheKey('products', criadorId);
    const cached = getFromCache<Product[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from('info_produtos')
        .select('*')
        .eq('criador_id', criadorId)
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      if (data) {
        setCache(cacheKey, data, CACHE_TTL.PRODUCTS);
      }
      return data || [];
    } catch (error) {
      console.error('Error in getProductsByCreator:', error);
      return [];
    }
  }

  // Get contents by product ID
  static async getContentsByProduct(produtoId: string): Promise<Content[]> {
    const cacheKey = getCacheKey('contents', produtoId);
    const cached = getFromCache<Content[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from('info_conteudos')
        .select('*')
        .eq('produto_id', produtoId)
        .order('criado_em', { ascending: true });

      if (error) {
        console.error('Error fetching contents:', error);
        return [];
      }

      if (data) {
        setCache(cacheKey, data, CACHE_TTL.CONTENT);
      }
      return data || [];
    } catch (error) {
      console.error('Error in getContentsByProduct:', error);
      return [];
    }
  }

  // Get single content by ID
  static async getContentById(contentId: string): Promise<Content | null> {
    const cacheKey = getCacheKey('content', contentId);
    const cached = getFromCache<Content>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from('info_conteudos')
        .select('*')
        .eq('id', contentId)
        .single();

      if (error) {
        console.error('Error fetching content:', error);
        return null;
      }

      if (data) {
        setCache(cacheKey, data, CACHE_TTL.CONTENT);
      }
      return data;
    } catch (error) {
      console.error('Error in getContentById:', error);
      return null;
    }
  }

  // Get creator products (for filtering notes and purchases)
  static async getCreatorProducts(criadorId: string): Promise<string[]> {
    const cacheKey = getCacheKey('creator-products', criadorId);
    const cached = getFromCache<string[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from('info_produtos')
        .select('id')
        .eq('criador_id', criadorId);

      if (error) {
        console.error('Error fetching creator products:', error);
        return [];
      }

      const productIds = data?.map(p => p.id) || [];
      if (productIds.length > 0) {
        setCache(cacheKey, productIds, CACHE_TTL.PRODUCTS);
      }
      return data?.map(p => p.id) || [];
    } catch (error) {
      console.error('Error in getCreatorProducts:', error);
      return [];
    }
  }

  // Get student notes filtered by creator's products
  static async getStudentNotes(userId: string, creatorId: string): Promise<Note[]> {
    try {
      // First get creator's products
      const productIds = await this.getCreatorProducts(creatorId);
      
      if (productIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('info_anotacoes')
        .select(`
          *,
          produto:produto_id (
            nome
          )
        `)
        .eq('uid_usuario', userId)
        .in('produto_id', productIds)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching student notes:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getStudentNotes:', error);
      return [];
    }
  }

  // Get student purchases filtered by creator's products
  static async getStudentPurchases(userId: string, creatorId: string): Promise<Purchase[]> {
    try {
      // First get creator's products
      const productIds = await this.getCreatorProducts(creatorId);
      
      if (productIds.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('info_compras')
        .select(`
          *,
          produto:produto_id (
            nome,
            descricao
          )
        `)
        .eq('usuario_id', userId)
        .in('produto_id', productIds)
        .order('criado_em', { ascending: false });

      if (error) {
        console.error('Error fetching student purchases:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getStudentPurchases:', error);
      return [];
    }
  }

  // Get student profile
  static async getStudentProfile(userId: string): Promise<StudentProfile | null> {
  try {
    const { data, error } = await supabase
      .from('info_usuarios')
      .select('id, email, nome, papel, criado_em') // ← REMOVER criador_id
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching student profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getStudentProfile:', error);
    return null;
  }
}
  // Add new note
  static async addNote(userId: string, productId: string, titulo: string, texto: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('info_anotacoes')
        .insert([{
          titulo,
          texto,
          produto_id: productId,
          usuario_uid: userId
        }]);

      if (error) {
        console.error('Error adding note:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addNote:', error);
      return false;
    }
  }

  // Delete note
  static async deleteNote(noteId: number, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('info_anotacoes')
        .delete()
        .eq('id', noteId)
        .eq('usuario_uid', userId);

      if (error) {
        console.error('Error deleting note:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteNote:', error);
      return false;
    }
  }
}